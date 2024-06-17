export let buildCodemodSlug = (name: string) =>
	name
		.replaceAll('@', '')
		.split(/[\/ ,.-]/)
		.join('-');
