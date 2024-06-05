const steps = [
  {
    element: "codemod",
    description:
      "<p>This section is dedicated to codemods.</p><p>Codemods are tools used to automate code modifications and refactorings. They allow developers to make large-scale changes across a codebase quickly and consistently.</p><p> Here, you can see an example codemod script that transforms code from a 'Before' state to an 'After' state using jscodeshift.</p><p> You can modify the codemod's code here.</p>",
  },
  {
    element: "before-and-after-panels",
    description:
      "<p>These panels display the code before and after applying a codemod. The 'Before' panel shows the original code, while the 'After' panel displays the expected output after transformation.</p><p> This visual comparison helps users understand the changes made by the codemod, ensuring the modifications meet the desired outcome.</p>",
  },
  {
    element: "assistant",
    description:
      "<p>The assistant section is available for logged users only and provides support and guidance throughout the codemod creation and execution process.</p> <p>It leverages AI to help users generate codemod scripts, troubleshoot issues, and refine their code transformations. This assistant is an invaluable resource for both novice and experienced developers looking to optimize their coding workflow. In the 'Debug' tab the codemods errors are listed and output of the console (<code>console.log</code> in codemod editor can be used)</p>",
  },
  {
    element: "actions",
    description:
      "The actions area includes tools and options to create and fix codemods. These actions operate independently from the prompt.",
  },
  {
    element: "prompt-builders",
    description:
      "The prompt builders assist users in crafting precise and effective prompts for generating codemods. These builders provide aliases and templates to streamline the prompt creation process, making it easier for users to specify their desired code transformations accurately.",
  },
  {
    element: "output-panel",
    description:
      "The output panel dynamically reflects changes made in the 'Before' or codemod editor. As users edit the code or the codemod script, the output panel updates in real-time to show the transformed code. This immediate feedback loop helps users quickly identify and correct any issues in their codemod logic.",
  },
  {
    name: "Feedback",
    description:
      "Any feedback? Create an issue in our GitHub repo - <a style='color: blue' href='https://github.com/codemod-com/codemod/'>https://github.com/codemod-com/codemod/</a> ",
  },
];

export const getIntroJsOptions = () => ({
  steps: steps.map(({ description: intro, element, name: title }) =>
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
