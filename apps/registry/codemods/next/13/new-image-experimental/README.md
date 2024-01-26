# New Image Experimental

## Description

This codemod **dangerously** migrates the usages of the `Image` component from the `next/legacy/image` module to the `next/image` module.
This is achieved by adding inline styles and removing unused props.

Please note this codemod is experimental and only covers static usage (such as `<Image src={img} layout="responsive" />`) but not dynamic usage (such as `<Image {...props} />`).

Functionality:

-   Removes `layout` prop and adds `style`
-   Removes `objectFit` prop and adds `style`
-   Removes `objectPosition` prop and adds `style`
-   Removes `lazyBoundary` prop
-   Removes `lazyRoot` prop
-   Changes next.config.js `loader` to "custom", removes `path`, and sets `loaderFile` to a new file.

## Examples

### Before: intrinsic

```jsx
import Image from 'next/image';
import img from '../img.png';

function Page() {
	return <Image src={img} />;
}
```

### After: intrinsic

```jsx
import Image from 'next/image';
import img from '../img.png';

const css = { maxWidth: '100%', height: 'auto' };
function Page() {
	return <Image src={img} style={css} />;
}
```

### Before: responsive

```jsx
import Image from 'next/image';
import img from '../img.png';

function Page() {
	return <Image src={img} layout="responsive" />;
}
```

### After: responsive

```jsx
import Image from 'next/image';
import img from '../img.png';

const css = { width: '100%', height: 'auto' };
function Page() {
	return <Image src={img} sizes="100vw" style={css} />;
}
```

### Before: fill

```jsx
import Image from 'next/image';
import img from '../img.png';

function Page() {
	return <Image src={img} layout="fill" />;
}
```

### After: fill

```jsx
import Image from 'next/image';
import img from '../img.png';

function Page() {
	return <Image src={img} sizes="100vw" fill />;
}
```

### Before: fixed

```jsx
import Image from 'next/image';
import img from '../img.png';

function Page() {
	return <Image src={img} layout="fixed" />;
}
```

### After: fixed

```jsx
import Image from 'next/image';
import img from '../img.png';

function Page() {
	return <Image src={img} />;
}
```

## Applicability Criteria

Next.js version higher or equal to 13.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~5 minutes per occurrence

### Owner

[Vercel](https://github.com/vercel)

### Links for more info

-   https://nextjs.org/docs/pages/building-your-application/upgrading/codemods#next-image-experimental
