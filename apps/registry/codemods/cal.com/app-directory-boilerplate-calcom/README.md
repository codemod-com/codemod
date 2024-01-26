# App Directory Boilerplate for Cal.com

## Description

The first step to migrate your pages to the `app` directory is to provide a new file structure, respected by the App router.

This is attempted by this codemod, which reads the contents of your `pages` directory and creates the placeholder files.

The placeholder files define the basic layout and page structure.

The boilerplate includes the following:

-   placeholder `page.tsx` and `layout.tsx` files which define a UI unique to a route.

If the codemod detects that a `getStaticProps` function is not used, it will be removed. Otherwise, it will remove the `export` keyword from the function definition.

## Example

If you have the following directory:

```
  pages
  ├── a.tsx
  └── b
        └── c.tsx

```

The codemod will generate the following corresponding directory:

```
  app
  ├── a
        └── page.tsx
        └── layout.tsx
  └── b
        └── c
              └── page.tsx
              └── layout.tsx
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

~3 minutes per occurrence

### Owner

[Intuita](https://github.com/codemod-com)

### Links for more info

-   https://nextjs.org/docs/pages/building-your-application/upgrading/app-router-migration
