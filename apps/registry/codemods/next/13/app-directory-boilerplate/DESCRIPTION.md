# App Directory Boilerplate

## Description

The first step to migrate your pages to the `app` directory is to provide a new file structure, respected by the App router.

This is attempted by this codemod, which reads the contents of your `pages` directory and creates the placeholder files.

The placeholder files define the basic layout and page structure.

The boilerplate includes the following:

-   placeholder `page.tsx` and `layout.tsx` files which define a UI unique to a route.
-   the placeholder `app/layout.tsx` file which replaces `pages/_app.tsx` and `pages/_document.tsx` files.
-   the placeholder `error.tsx` file which replaces `pages/_error.tsx` files.
-   the placeholder `not-found.tsx` file which replaces `pages/404.tsx` files.

If the codemod detects that a `getStaticProps` function is not used, it will be removed. Otherwise, it will remove the `export` keyword from the function definition.

## Example

If you have the following directory:

```
  pages
  ├── _app.tsx
  ├── _document.tsx
  ├── _error.tsx
  ├── 404.tsx
  ├── a.tsx
  └── b
        └── c.tsx

```

The codemod will generate the following corresponding directory:

```
  app
  ├── page.tsx
  ├── layout.tsx
  ├── error.tsx
  ├── not-found.tsx
  ├── a
        └── page.tsx
  └── b
        └── c
              └── page.tsx
```

## Applicability Criteria

Next.js version is greater or equal to 13.4.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

ts-morph

### Estimated Time Saving

~5 minutes per occurrence

### Owner

[Codemod.com](https://github.com/codemod-com)

### Links for more info

-   https://nextjs.org/docs/pages/building-your-application/upgrading/app-router-migration
