import Step from "@/components/templates/i18nPage/Preview/Step";

const TaskCard = ({ step }: { step: number }) => {
  const stateMapping = [
    {
      state: "Analyze",
      tense: "Analyzing",
      passed: "Analyzed",
      description: () => (
        <>
          Found <b>1,034</b> hardcoded strings, Saved <b>4 weeks</b> of
          engineering time.
        </>
      ),
    },
    {
      state: "Transform",
      tense: "Transforming",
      passed: "Transformed",
      description: () => (
        <>
          I18n-ized <b>1,034</b> strings, Saved <b>8 weeks</b> of engineering
          time.
        </>
      ),
    },
    {
      state: "Translate",
      tense: "Translating",
      passed: "Translated",
      description: () => <>Work with one of our translation partners.</>,
    },
  ];

  return (
    <div className="flex h-full flex-col justify-end bg-gradient-to-b from-white from-40% to-[#E8FFA6] p-5 shadow-lg dark:from-background-dark dark:to-[#556527] dark:text-white">
      <div className="mb-4">
        <h2 className="xs-heading opacity-50 mt-4">Task #{step + 1}</h2>
        <p className="mt-2 m-heading font-semibold">
          {stateMapping[step]?.tense || "Finished!"}
        </p>
        <p className="mt-2 text-sm opacity-75">
          {stateMapping[step]?.description() ||
            "Work with one of our translation partners."}
        </p>
      </div>

      <div className="relative hidden rounded-xl bg-white p-4 shadow-lg md:block dark:bg-background-dark">
        <ul className="relative space-y-4 m-0">
          {stateMapping.map((item, index) => (
            <li key={index} className="flex flex-col gap-4">
              <Step
                step={index}
                title={
                  index < step
                    ? item.passed // Completed step
                    : index === step
                      ? item.tense // Current active step
                      : item.state // Upcoming step
                }
                currentStep={step}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-sm">
        <span className="text-black dark:text-white">
          Automated with <span className="font-semibold">Codemod AI</span>
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
