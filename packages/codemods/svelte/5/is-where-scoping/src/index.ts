import type {
    API,
    ArrowFunctionExpression,
    FileInfo,
    Options,
} from 'jscodeshift';

export default function transform(
    file: FileInfo,
    api: API,
    options?: Options,
): string | undefined {
    const j = api.jscodeshift;
    const source = file.source;

    // Regular expression to find content inside <style> tags
    const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gm;

    // Function to perform the transformation logic
    function transformCss(css) {
        // Helper function to add :global(...) inside :is(...) or :where(...) selectors
        const addGlobalInside = (selector) => {
            return selector.replace(
                /:is\(([^)]+)\)|:where\(([^)]+)\)/g,
                (match, p1, p2) => {
                    const innerSelector = p1 || p2; // Capture inside of :is(...) or :where(...)
                    return match.replace(
                        innerSelector,
                        `:global(${innerSelector})`,
                    );
                },
            );
        };

        // Regular expression to match Tailwind @apply directives
        const applyDirectiveRegex = /([^{]*?)\s*\{\s*@apply\s+([^;]+);?\s*}/g;

        // Transform :is(...) and :where(...) selectors by adding :global inside
        let transformedCss = css.replace(
            /:is\([^)]*\)|:where\([^)]*\)/g,
            (match) => addGlobalInside(match),
        );

        // Transform Tailwind @apply directives by adding :global to the selector only if it does not already contain :global
        transformedCss = transformedCss.replace(
            applyDirectiveRegex,
            (match, selector, content) => {
                const trimmedSelector = selector.trim();

                // Check if the selector is already wrapped in :global or contains :is(...) or :where(...)
                if (
                    !trimmedSelector.includes(':global') &&
                    !/(:is\([^)]*\)|:where\([^)]*\))/.test(trimmedSelector)
                ) {
                    return `${trimmedSelector} :global {\n  @apply ${content.trim()};\n}`;
                }

                return match; // Return the original match if already globalized or contains :is(...) or :where(...)
            },
        );

        return transformedCss;
    }

    // Handle CSS inside <style> tags and directly in CSS files
    if (file.path.endsWith('.svelte')) {
        // Process CSS inside <style> tags
        const transformedSource = source.replace(
            styleTagRegex,
            (match, styleContent) => {
                // Transform the extracted CSS content from <style> tags
                const transformedStyleContent = transformCss(styleContent);
                // Replace the original <style> content with the transformed content
                return `<style>\n${transformedStyleContent}\n</style>`;
            },
        );

        return transformedSource;
    } else {
        // Process CSS directly
        return transformCss(source);
    }
}
