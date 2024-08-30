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
    const j = api.jscodeshift;

    // Parse the file content as JSON
    let jsonData;
    try {
        jsonData = JSON.parse(file.source);
    } catch (e) {
        throw new Error('Invalid JSON input.');
    }

    // List of properties to move into the "options" object
    const propertiesToMove = [
        'className',
        'packageName',
        'type',
        'mapName',
        'name',
        'resourceType',
        'resourceMap',
    ];

    // Traverse platforms -> files
    for (const platformKey in jsonData.platforms) {
        const platform = jsonData.platforms[platformKey];
        if (platform.files) {
            platform.files = platform.files.map((file) => {
                // Collect properties to move
                const options = {};
                propertiesToMove.forEach((prop) => {
                    if (file.hasOwnProperty(prop)) {
                        options[prop] = file[prop];
                        delete file[prop];
                    }
                });

                // Add options property if there are any properties to move
                if (Object.keys(options).length > 0) {
                    file.options = options;
                }

                return file;
            });
        }
    }

    // Return the modified JSON as a string
    return JSON.stringify(jsonData, null, 2); // Pretty-print with 2-space indentation
}
