import { Globe } from "./Globe";
import { NumberTicker } from "./NumberTicker";
import TextTransitions from "./TextTransitions";

const CobeSection = () => {
  return (
    <div className="px-6 lg:px-[80px] relative w-full py-[80px]">
      <div className="grid items-center gap-4 md:grid-cols-2">
        <div className="space-y-5 text-black dark:text-white">
          <TextTransitions />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <p className="mb-2 body-l uppercase opacity-50">
                MAXIMIZE CONTROL
              </p>
              <p className="whitespace-pre-wrap s-heading tracking-tighter text-black md:text-4xl dark:text-white">
                <NumberTicker value={95} suffix="%" />
              </p>
              <p className="body-s-medium">Reduction in Vendor Dependency</p>
            </div>
            <div className="col-span-1">
              <p className="mb-2 body-l uppercase opacity-50">
                DRIVE EFFICIENCY
              </p>
              <p className="whitespace-pre-wrap s-heading tracking-tighter text-black md:text-4xl dark:text-white">
                <NumberTicker value={30} suffix="%" />
              </p>
              <p className="body-s-medium">Faster Operational Processes</p>
            </div>
          </div>
          <p className="body-l max-w-2xl">
            Internalizing key processes can reduce external vendor reliance by
            up to 95%, giving businesses complete control over their operations.
            Additionally, companies can experience up to 30% faster workflows,
            ensuring scalable growth and significant cost savings over time.
          </p>
        </div>
        <Globe className="" />
      </div>
    </div>
  );
};

export default CobeSection;
