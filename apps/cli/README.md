# Codemod's CLI

Codemod platform gives you multiple ways to discover, run & share supported codemods and code automation recipes.

![Running Codemod CLI](https://raw.githubusercontent.com/codemod-com/website/main/theme/assets/images/hero-video.gif)

## Installation

    npm i codemod

## Global installation (recommended)

    npm i -g codemod

## Usage

### Running a codemod

    codemod [framework/version/codemod-name]

#### Example (running Next.js app router receipe codemod)

    codemod next/13/app-router-recipe

### List available codemods

The `list` command can be used to list all codemods available in the [Codemod Registry](https://github.com/codemod-com/codemod-registry).

    codemod list

### Sync registry

The `syncRegistry` command can be used to sync local codemods with the public [Codemod Registry](https://github.com/codemod-com/codemod-registry).

    codemod syncRegistry

### Generate codemod from file diff

The `learn` command can be used to send the diff of the latest edited file to the Codemod Studio and have it automatically build an explainable and debuggable codemod.

After running this command, if any git diff exists, `codemod` will use the diff as before/after snippets in the [Codemod Studio](https://codemod.studio).

    codemod learn

### Options

-   [`--include` or `-i`](https://docs.codemod.com/docs/cli/advanced-usage#--include)
-   [`--exclude` or `-e`](https://docs.codemod.com/docs/cli/advanced-usage#--exclude)
-   [`--target` or `-t`](https://docs.codemod.com/docs/cli/advanced-usage#--target)
-   [`--source` or `-s`](https://docs.codemod.com/docs/cli/advanced-usage#--source)
-   [`--engine`](https://docs.codemod.com/docs/cli/advanced-usage#--engine)
-   [`--limit` or `-n`](https://docs.codemod.com/docs/cli/advanced-usage#--limit)
-   [`--raw` or `-r`](https://docs.codemod.com/docs/cli/advanced-usage#--raw)
-   [`--no-cache`](https://docs.codemod.com/docs/cli/advanced-usage#--no-cache)
-   [`--json` or `-j`](https://docs.codemod.com/docs/cli/advanced-usage#--json)
-   [`--threads` or `-n`](https://docs.codemod.com/docs/cli/advanced-usage#--threads)
-   [`--dry` or `-d`](https://docs.codemod.com/docs/cli/advanced-usage#--dry)
-   [`--telemetryDisable`](https://docs.codemod.com/docs/cli/advanced-usage#--telemetrydisable)

## Contribution

We'd love for you to contribute to the [Codemod Engine](https://github.com/codemod-com/codemod-engine-node) and the [Codemod Registry](https://github.com/codemod-com/codemod-registry). Please note that once you create a pull request, you will be asked to sign our [Contributor License Agreement](https://cla-assistant.io/codemod-com/codemod-registry).

We're always excited to support codemods for more frameworks and libraries. Contributing allows us to make codemods more accessible to more framework builders, developers, and more.

## Telemetry 🔭

We collect anonymous usage data to improve our product. Collected data cannot be linked to individual users. We do not store personal data/code.

For more details and samples of collected data see our [telemetry compliance considerations](https://docs.codemod.com/docs/about/telemetry-compliance) doc.
