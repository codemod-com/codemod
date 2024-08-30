import type {
  API,
  ArrowFunctionExpression,
  FileInfo,
  Options,
} from "jscodeshift";

export default function transform(
    file: FileInfo,
    api: API,
    options?: Options,
  ): string | undefined {
    let jsonData;
    try {
        jsonData = JSON.parse(file.source);
    } catch (e) {
        throw new Error('Invalid JSON input.');
    }

    // Mapping of old transform names to new transform names
    const transformMapping = {
        'name/cti/camel': 'name/camel',
        'name/cti/constant': 'name/constant',
        'name/cti/kebab': 'name/kebab',
        'name/cti/snake': 'name/snake',
        'name/cti/human': 'name/human',
        'font/objC/literal': null,
        'font/swift/literal': null,
        'font/flutter/literal': null,
        'content/icon': 'html/icon',
    };

    // Helper function to update the transforms array
    const updateTransforms = (transforms) => {
        if (!Array.isArray(transforms)) {
            return []; // Return an empty array if transforms is not an array
        }
        return transforms
            .map((transform) => transformMapping[transform] || null) // Map old transforms to new ones, or null for removals
            .filter((transform) => transform !== null); // Remove null values
    };

    // Update the transforms if they exist
    if (jsonData.platforms && typeof jsonData.platforms === 'object') {
        for (const platformKey in jsonData.platforms) {
            const platform = jsonData.platforms[platformKey];
            if (platform.transforms && Array.isArray(platform.transforms)) {
                platform.transforms = updateTransforms(platform.transforms);
            }
        }
    }

    // Return the modified JSON as a string with proper formatting
    return JSON.stringify(jsonData, null, 2);
}
