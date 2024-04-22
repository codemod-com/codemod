Generates a static metadata object based on meta tags managed by `next/head`.

The codemod checks all the child components used in a page file and extracts all the meta tags defined within the `<Head>` component. Such tags are then moved to the very page file alongside the dependencies of the tags.

## Example:

### Before:

```jsx
// a page file
import Meta from '../../components/a.tsx';
	export default function Page() {
		return <Meta />;
}

// component file
import Head from 'next/head';
import NestedComponent from '../components/b.tsx';
export default function Meta() {
	return (<>
	<Head>
		<title>title</title>
	</Head>
	<NestedComponent />
	</>)
}

// nested component file
import Head from 'next/head';

export default function NestedComponent() {
	return <Head>
	<meta name="description" content="description" />
	</Head>
}

export default NestedComponent;
```

### After:

```jsx
// page file
import { Metadata } from 'next';
import Meta from '../../components/a.tsx';
export const metadata: Metadata = {
	title: `title`,
	description: 'description',
};
export default function Page() {
	return <Meta />;
}
```
