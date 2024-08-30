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

    // Traverse through the object to find the "log" property
    const traverseAndUpdateLogProperty = (obj) => {
        if (obj.log && typeof obj.log === 'string') {
            obj.log = {
                warnings: obj.log,
                verbosity: 'default',
            };
        }

        // Recursively check nested objects
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                traverseAndUpdateLogProperty(obj[key]);
            }
        }
    };

    traverseAndUpdateLogProperty(jsonData);

    // Return the modified JSON as a string with proper formatting
    return JSON.stringify(jsonData, null, 2);
}
