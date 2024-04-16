# Codemod website

Project created with [Sanity](https://www.sanity.io/docs) and [Next.js](https://nextjs.org/docs)

### Getting started

1. Install dependencies

```
npm i
```

2. Link project to Vercel

```
vercel link
```

3. Pull `env` variables

```
vercel env pull .env
```

4. Run locally

```
npm run dev
```

### Singletons

Singletons are schema types that can only have 1 document if they are not localizeable and 1 document per locale if they are localizeable.
Examples of common singletons: homepage, settings, header navigation, footer.

#### Creating singleton documents

1. Make sure you have the schema for it defined
2. Add it to the `singletons` object in `config.ts`. The key should be the schema `_type` and value is the document data, including the locale.
3. Run `npm run singletons`

The script has a confirmaton prompt and will only create singleton documents if they don't exist already.

#### Deleting singleton documents

This can be done from the studio

#### Replacing singleton documents

Delete it from the studio and run the `singletons` script again.
