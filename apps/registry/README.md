<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/images/codemod-registry-hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/images/codemod-registry-hero-light.svg">
  <img alt="Codemod Registry Header" src="./assets/images/codemod-registry-hero-light.svg">
</picture>

# Codemod Registry

Codemod Registry is an open-source, single-stop repository for codemods and code automation recipes. Codemod Registry brings an ever-growing variety of helpful codemods all in one place.

Codemods available in Codemod Registry are automatically integrated into [Codemod.com's platform](https://docs.codemod.com/docs/intro) and all developers who have Codemod.com's CLI or IDE extension can then discover, share, and run those codemods with a single click.

Currently, Codemod.com's platform supports `jscodeshift`, `ts-morph`, and Uber's Piranha codemod engines. If you would like to see a specific codemod engine supported, please [leave us a feature request](https://feedback.codemod.com/feature-requests-and-bugs).

If there is a codemod you would like to see available in Codemod Registry, please consider opening a PR to add the codemod. Learn [more about contributing here](#contributing).

## Why use Codemod Registry

Adding or using codemods in Codemod Registry allows for:

🔗 Automatic integration with the Codemod.com [CLI](https://docs.codemod.com/docs/cli/quickstart) and [VSCode extension](https://marketplace.visualstudio.com/items?itemName=codemod.codemod-vscode-extension).

:octocat: Ensuring codemods are reviewed and improved by [a community of codemod experts](https://join.slack.com/t/codemod-com/shared_invite/zt-1tvxm6ct0-mLZld_78yguDYOSM7DM7Cw).

🌍 Making codemods more accessible to many developers around the world.

## Supported frameworks & libraries

-   [Go](/codemods/Go)
-   [Java](/codemods/Java)
-   [Ant Design v5](/codemods/antd/5/)
-   [Bull to BullMQ](/codemods/bull/bullmq/)
-   [Ember.js v5](/codemods/ember/5)
-   [i18n](/codemods/i18n)
-   [Immutable.js](/codemods/immutable)
-   [Jest to Vitest](/codemods/jest/vitest/)
-   [Mocha to Vitest](/codemods/mocha/vitest/)
-   [MSW v2](/codemods/msw/2/)
-   [MUI v5](/codemods/mui/5/)
-   [Netlify SDK v0.8.1](/codemods/netlify-sdk/0.8.1/)
-   [Netlify SDK v0.8.4](/codemods/netlify-sdk/0.8.4/)
-   [Netlify SDK v0.8.5](/codemods/netlify-sdk/0.8.5/)
-   [Next.js i18next](/codemods/next-i18next)
-   [Next.js v13](/codemods/next/13/)
-   [Next.js v14](/codemods/next/14/)
-   [React Redux](/codemods/react-redux)
-   [React Router v4](/codemods/react-router/4/)
-   [React Router v6](/codemods/react-router/6/)
-   [React](/codemods/react)
-   [RedwoodJS v4](/codemods/redwoodjs/core/4/)

## Running codemods in the registry

All codemods in the registry are automatically distributed to Codemod.com's CLI and IDE extension.

To run any codemod in the registry, you can:

-   [Run codemod using Codemod VSCode extension](https://docs.codemod.com/docs/vs-code-extension/advanced-usage#dry-running-codemods).
-   [Run codemod using Codemod CLI](https://docs.codemod.com/docs/cli/quickstart).

## Contributing

Codemod Registry is an open-source, community-first, and community-powered project made for developers, by developers.

If you would like to contribute to the Codemod Registry, please [follow our contribution guide](https://docs.codemod.com/docs/codemod-registry/publishing-codemods). Please note that once you create a pull request, you will be asked to sign our Contributor License Agreement.

If you are a codemod builder and/or interested in codemods, please [join our community](https://codemod.com/community)!

If you are not a codemod developer, but you would like to have the community contribute on developing a codemod you’re interested in, then feel free to [request a codemod here](https://feedback.codemod.com/codemod-requests).
