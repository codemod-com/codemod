![Codemod](https://raw.githubusercontent.com/codemod-com/codemod/main/apps/docs/images/misc/codemod-billboard.png)

<p align="center">
  <br />
  <a href="https://github.com/codemod-com/codemod">GitHub</a>
  ·
  <a href="https://docs.codemod.com">Documentation</a>
  .
  <a href="https://codemod.com/community">Community</a>
</p>

The Codemod platform helps you create, distribute, and deploy codemods in codebases of any size.

The AI-powered, community-led codemods enable you to automate framework upgrades, large refactoring, and boilerplate programming with unparalleled speed and developer experience.

## Global installation (recommended)

    npm i -g codemod

## Usage & Documentation

For details on how to use the Codemod platform, check out our [documentation](https://docs.codemod.com).

## Quickstart

### List available codemods

The `list` command can be used to list all codemods available in the [Codemod Registry](https://codemod.com/registry).

    codemod list

### Running a codemod

    codemod [codemod-name]

#### Example

    codemod next/13/app-router-recipe

### Create codemod with AI

The `learn` command can be used to send the diff of the latest edited file to the Codemod Studio and have it automatically build an explainable and debuggable codemod.

    codemod learn

After running this command, if any git diff exists, `codemod` will use the diff as before/after snippets in the [Codemod Studio](https://codemod.com/studio).

## Community

The Codemod community can be found on [Slack](https://codemod.com/community), where you can ask questions, share your feedback, and contribute to the community.

Our [Code of Conduct](https://github.com/codemod-com/codemod/blob/main/CODE_OF_CONDUCT.md) applies to all Codemod community channels.

## Telemetry

We collect anonymous usage data to improve our product. Collected data cannot be linked to individual users. We do not store personal data/code.

For more details and samples of collected data see our [telemetry compliance considerations](https://go.codemod.com/telemetry) doc.
