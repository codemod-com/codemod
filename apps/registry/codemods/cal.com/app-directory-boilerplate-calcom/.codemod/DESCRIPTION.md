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