import { isServer } from "@studio/config";

const steps = [
  {
    element: "codemod",
    description:
      "<p>This section is dedicated to codemods.</p><p>Codemods are tools used to automate code modifications and refactorings. They allow developers to make large-scale changes across a codebase quickly and consistently.</p><p>The codemod editor allows you to see and modify the codemod you are building.</p>",
  },
  {
    element: "before-and-after-panels",
    description:
      "<p>This is your input, in the form of before/after test fixtures and comments describing the transformation logic.</p>",
  },
  {
    element: "assistant",
    description:
      "<p>The AI assistant provides support and guidance throughout the codemod creation and execution process by generating codemod scripts, troubleshooting issues, and incrementally refining code transformations.</p><p>The 'Debug' tab lists the codemod workflow and potential errors.</p>",
  },
  {
    element: "actions",
    description:
      "<p>The actions area includes tools and options to create and fix codemods. These actions operate independently from the prompt</p><p>When you click 'Build a codemod', the AI helper will use the before/after code snippets to generate a codemod.</p>",
  },
  {
    element: "prompt-builders",
    description:
      "The prompt builders assist users in crafting precise and effective prompts for generating codemods. These builders provide aliases and templates to streamline the prompt creation process, making it easier for users to specify their desired code transformations accurately.",
  },
  {
    element: "output-panel",
    description:
      "<p>The output panel shows how the codemod in the editor affects the 'Before' code snippet in real-time.</p><p>A correct output should be identical to the 'After' code snippet, without introducing false positives or negatives. This immediate feedback loop helps users quickly identify and correct any issues in their codemod logic.</p>",
  },
  {
    name: "Feedback",
    description:
      "Any feedback? <a style='color: blue' href='https://github.com/codemod-com/codemod/'>Create an issue in our GitHub repo</a>",
  },
];

export const getIntroJsOptions = () => ({
  steps: isServer
    ? []
    : steps.map(({ description: intro, element, name: title }) =>
        title
          ? {
              title,
              intro,
            }
          : element
            ? {
                intro,
                element: document.getElementsByClassName(element)[0],
              }
            : {},
      ),
});
