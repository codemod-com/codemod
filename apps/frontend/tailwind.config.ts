import website from "./tailwind.config.website"
import studio from "./tailwind.config.studio"

function isObject(item: unknown) {
	return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target: any, ...sources: any[]) {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				mergeDeep(target[key], source[key]);
			} else if (Array.isArray(source[key])) {
				if (!target[key]) target[key] = [];
				target[key] = Array.isArray(target[key])
					? [...new Set([...target[key], ...source[key]])] // Removes duplicates when merging arrays
					: [...new Set([target[key], ...source[key]])]; // Combines and removes duplicates if mixed types
			} else {
				if (Array.isArray(target[key])) {
					target[key] = [...new Set([...target[key], source[key]])]; // Adds the primitive to array and removes duplicates
				} else if (target[key] && source[key] !== target[key]) {
					target[key] = [target[key], source[key]]; // Creates an array from two different primitives
				} else {
					Object.assign(target, { [key]: source[key] }); // Default behavior
				}
			}
		}
	}

	return mergeDeep(target, ...sources);
}


export default mergeDeep(studio, website)