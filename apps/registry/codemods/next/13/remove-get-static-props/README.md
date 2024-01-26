# Migrate Data Fetching Methods

## Description

The following data fetching methods are no longer available in the `app` directory:

-   `getStaticPaths`,
-   `getServerSideProps`,
-   `getStaticProps`.

The codemod migrates the data fetching functions into the supported in the `app` directory:

-   `getStaticPaths` -> `generateStaticParams`
-   `getServerSideProps` -> `getData`
-   `getStaticProps` -> `getData` (used in the component)

If the `getStaticPaths` function has only one expression in the return statement, it will be inlined within the `nextData` function, otherwise it will remain unchanged.

When migrating the `getServerSideProps` functions, the codemod assumes that only the `params` property of the first argument is used.

It additionally adds types for aforementioned `params` and page props.

It will also add the `revalidate` and `dynamicParams` route segment properties.

## Example

### Before

```jsx
import PostLayout from '@/components/post-layout';

export async function getStaticPaths() {
	return {
		paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
		fallback: 'blocking',
	};
}

export async function getStaticProps({ params }) {
	const res = await fetch(`https://.../posts/${params.id}`);
	const post = await res.json();

	return { props: { post } };
}

export default function Post({ post }) {
	return <PostLayout post={post} />;
}
```

### After

```jsx
import { notFound, redirect } from 'next/navigation';
import PostLayout from '@/components/post-layout';

type Params = {
	[key: string]: string | string[] | undefined,
};

type PageProps = {
	params: Params,
};

export async function getStaticPaths() {
	return {
		paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
		fallback: 'blocking',
	};
}

export async function generateStaticParams() {
	return (await getStaticPaths({})).paths;
}

export async function getStaticProps({ params }) {
	const res = await fetch(`https://.../posts/${params.id}`);
	const post = await res.json();

	return { props: { post } };
}

async function getData({ params }: { params: Params }) {
	const result = await getStaticProps({ params });

	if ('redirect' in result) {
		redirect(result.redirect.destination);
	}

	if ('notFound' in result) {
		notFound();
	}

	return 'props' in result ? result.props : {};
}

export default async function Post({ params }: PageProps) {
	const { post } = await getData({ params });

	return <PostLayout post={post} />;
}

export const dynamicParams = true;
```

## Applicability Criteria

Next.js version is greater or equal to 13.4.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~2 minutes per occurrence

### Owner

Intuita

### Links for more info

-   https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration#static-site-generation-getstaticprops
