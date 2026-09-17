---
title: "The Ghost in the Toolchain: Debugging the Rails, Bun, and Yarn Berry Collision"
description: "How a collision between Rails 8's cssbundling-rails, Vite+'s Bun shim, and Yarn Berry PnP silently broke my dev server—and how I permanently solved it."
pubDate: 2026-09-16
heroImage: "/blog-placeholder-3.jpg"
---

You initialize a fresh Rails 8 application with modern tooling: Propshaft for
asset management, esbuild for JavaScript, Tailwind CSS for styling, and
Plutonium as your rapid application framework:

```bash
rails new myapp -a propshaft -j esbuild -c tailwind \
  -m https://radioactive-labs.github.io/plutonium-core/templates/plutonium.rb
```

The installer runs without critical errors. You `cd` into your new project, type
`bin/dev` to launch Foreman, and hit an immediate wall:

```text
21:40:44 web.1  | started with pid 75948
21:40:44 js.1   | started with pid 75949
21:40:44 css.1  | started with pid 75950
21:40:44 css.1  | $ postcss ./app/assets/stylesheets/application.tailwind.css -o ./app/assets/builds/application.css --watch
21:40:44 css.1  | /bin/bash: postcss: command not found
21:40:44 css.1  | error: script "build:css" exited with code 127
21:40:44 system | sending SIGTERM to all processes
```

Exit code `127`: `postcss: command not found`. Foreman shuts down every process
in the process group, terminating the server instantly.

If you check `package.json`, `postcss` and `postcss-cli` are listed right there
in your dependencies. So why can't the shell find the binary?

Here is the deep dive into what actually happened behind the scenes, how three
different tools collided to cause it, and how to permanently guard against it.

---

## The Autopsy: What Happened Behind the Scenes?

Inspecting the complete installer log (`jbi.log`) revealed a fascinating,
multi-act chain reaction between **`jsbundling-rails`**,
**`cssbundling-rails`**, **Vite+**, and **Plutonium**.

### Act 1: `jsbundling-rails` chooses Yarn

When Rails sets up JavaScript (`-j esbuild`), it invokes
`yarn add --dev esbuild`.

Because Yarn Berry (v4) was installed on the machine, Yarn initialized
`yarn.lock` and defaulted to **Plug'n'Play (PnP)** mode, storing dependencies in
virtual caches rather than a traditional `node_modules/` folder.

### Act 2: `cssbundling-rails` spots Bun and hijacks the CSS toolchain

Next, Rails ran `rails css:install:tailwind`. The `cssbundling-rails` gem
contains package-manager detection logic:

> _If `bun` exists in your system `$PATH`, use Bun._

Because Bun was installed on the system, `cssbundling-rails` greedily executed:

```bash
bun add tailwindcss@latest @tailwindcss/cli@latest
```

Bun saw Yarn 4's lockfile, balked with:

```text
UnsupportedYarnLockfileVersion: failed to migrate lockfile: 'yarn.lock'
warn: Ignoring lockfile
```

It created its own `bun.lock`, installed packages into a standard
`node_modules/` folder, and wrote the following line to `Procfile.dev`:

```foreman
css: bun run build:css --watch
```

### Act 3: Plutonium arrives and wipes `node_modules`

Finally, Plutonium's application template took over to install its UI toolkit
(`pu:core:assets`). Plutonium's installer explicitly calls `yarn add`:

```bash
yarn add @radioactive-labs/plutonium postcss postcss-cli ...
```

Because Yarn was operating in **Plug'n'Play (PnP)** mode, it inspected the
project root, detected the `node_modules/` folder that Bun had just created, and
printed this subtle warning:

```text
➤ YN0031: │ One or more node_modules have been detected and will be removed.
```

**Yarn Berry deleted `node_modules/`.** All packages were linked into Yarn's
internal `.pnp.cjs` store.

Plutonium then updated `package.json`'s `build:css` script to invoke `postcss`:

```json
"scripts": {
  "build:css": "postcss ./app/assets/stylesheets/application.tailwind.css -o ./app/assets/builds/application.css"
}
```

Plutonium assumed Yarn would run the watcher, but **`Procfile.dev` was still
pointing to Bun** (`css: bun run build:css --watch`) from Act 2.

### Act 4: The Runtime Crash

When `bin/dev` ran:

1. Foreman spawned `bun run build:css --watch`.
2. Bun opened `/bin/bash` to execute the `postcss` script.
3. Bun looked for `./node_modules/.bin/postcss` (which Yarn PnP had deleted) or
   global `$PATH`.
4. `/bin/bash` aborted with `postcss: command not found` (code 127).

---

## The Plot Twist: Why Naive `$PATH` Filtering Failed

The obvious fix seemed simple: write a shell wrapper to strip `bun` from `$PATH`
when running `rails new`:

```zsh
# Naive attempt
rails-new() {
  env PATH="$(echo "$PATH" | tr ':' '\n' | grep -v 'bun' | tr '\n' ':')" rails new "$@"
}
```

Yet, running `rails new` **still invoked Bun**!

Checking `which bun` revealed the culprit:

```bash
$ which bun
/Users/waptik/.vite-plus/bin/bun
```

On this system, Bun was installed as part of **Vite+** (`vp`). Vite+ installs
shims for all package managers (`node`, `npm`, `pnpm`, `yarn`, and `bun`) into a
single directory: `~/.vite-plus/bin`.

Because the folder name is `.vite-plus/bin` (and does **not** contain the string
`"bun"`), `grep -v 'bun'` left `.vite-plus/bin` completely untouched! Rails saw
Bun right where it had always been.

Worse, you can't simply strip `.vite-plus/bin` from `$PATH` because that
directory is also where your `node` and `yarn` shims live.

---

## The Solution: A Two-Pronged Permanent Guardrail

To permanently resolve this without uninstalling Bun or breaking other projects,
we need to solve two distinct problems:

1. **Hide Bun during `rails new`** without removing Vite+'s `node` and `yarn`.
2. **Prevent Yarn Berry from defaulting to PnP** in Rails apps.

### Part 1: The Shadow Bin Wrapper

Instead of trying to filter directory names, we dynamically create a temporary
shadow directory that symlinks everything from `~/.vite-plus/bin` **except**
`bun`.

Add this function to your dotfiles (e.g.,
`~/.dotfiles/functions/strip-bun-for-rails-new.zsh` or `~/.zshrc`):

```zsh
rails() {
  if [[ "$1" == "new" ]]; then
    # 1. Create temporary shadow bin folder
    local shadow_bin="/tmp/rails-new-bin-$$"
    mkdir -p "$shadow_bin"

    # 2. Symlink everything from ~/.vite-plus/bin EXCEPT bun
    for shim in "$HOME/.vite-plus/bin"/*; do
      local name="${shim:t}"
      [[ "$name" != "bun" ]] && ln -s "$shim" "$shadow_bin/$name"
    done

    # 3. Swap ~/.vite-plus/bin with shadow_bin AND strip any standalone bun dirs
    local clean_path="$shadow_bin:$(echo "$PATH" | tr ':' '\n' | grep -v '\.vite-plus/bin' | grep -v 'bun' | tr '\n' ':')"

    print -P "%F{yellow}⚡ [rails-new-interceptor]%f %F{cyan}Intercepting 'rails new'%f — %F{red}Bun hidden%f, %F{green}Yarn/Node preserved%f."

    # 4. Run rails new with clean PATH
    env PATH="$clean_path" command rails "$@"
    local exit_code=$?

    # 5. Clean up temporary directory
    rm -rf "$shadow_bin"
    return $exit_code
  else
    command rails "$@"
  fi
}
```

#### Why wrapping `rails()` is better than a custom command:

- **Zero mental friction**: You don't have to remember to type `rails-new`.
  Standard `rails new` commands from docs and templates work automatically.
- **Selective**: The `if [[ "$1" == "new" ]]` check ensures all other daily
  commands (`rails s`, `rails c`, `rails test`) execute with 0ms overhead.

### Part 2: Disabling Yarn PnP Globally for Rails

PostCSS and Plutonium dynamically load dependencies from gem directories (e.g.,
`${plutoniumGemPath}/postcss-gem-import.js`), which requires a standard
`node_modules/` folder.

Add this export to your shell configuration (`~/.zshrc`):

```zsh
export YARN_NODE_LINKER="node-modules"
```

Or configure it in your global `~/.yarnrc.yml`:

```yaml
nodeLinker: node-modules
```

This instructs Yarn 4 Berry to always generate traditional `node_modules` across
all projects, preventing PnP cache collisions and directory deletions.

---

## Verifying the Fix

With the wrapper and `YARN_NODE_LINKER` loaded:

```bash
source ~/.zshrc
rails new myapp -a propshaft -j esbuild -c tailwind \
  -m https://radioactive-labs.github.io/plutonium-core/templates/plutonium.rb
```

You will see the interceptor banner fire:

```text
⚡ [rails-new-interceptor] Intercepting 'rails new' — Bun hidden, Yarn/Node preserved.
```

During installation:

- `cssbundling-rails` checks for Bun, finds nothing, and cleanly defaults to
  Yarn.
- Both `esbuild` and `tailwindcss` are registered under Yarn.
- `Procfile.dev` receives `css: yarn build:css --watch`.
- Yarn 4 populates `node_modules/.bin/postcss`.

`cd myapp && bin/dev` now boots up on the very first try with all three workers
(`web`, `js`, `css`) compiling cleanly!

---

## Key Takeaways

1. **Be wary of greedy installers**: Gems like `cssbundling-rails` make
   assumptions based on system-wide binaries rather than project context.
2. **Unified toolchains hide shims in plain sight**: Modern tools like Vite+
   consolidate runtimes into single directories, making naive `$PATH` string
   matching ineffective.
3. **PnP and Rails asset pipelines don't mix well**: If using Yarn Berry with
   Rails (especially with PostCSS plugins loading files across Ruby gem
   boundaries), stick with `nodeLinker: node-modules`.
