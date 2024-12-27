import GradientBlob from "@/components/shared/GradientBlob";
import GradientBorderBox from "@/components/shared/GradientBorderBox";
import { RichText } from "@/components/shared/RichText";
import { SanityImage } from "@/components/shared/SanityImage";
import Section from "@/components/shared/Section";
import type { TestiomonialsProps } from "@/types";
import { cx } from "cva";

export default function SectionExample(props: TestiomonialsProps) {
  function generateBorderExtensions(
    index: number,
    view: "desktop" | "mobile" = "desktop",
  ) {
    if (view === "mobile") {
      return {
        tl: index === 1 || (index - 1) % 3 === 0,
        tr: index === 1 || (index - 1) % 3 === 0,
        bl: index === 3,
        br: index === 3,
      };
    }
    return {
      tl: index === 1 || (index - 1) % 3 === 0,
      tr: index % 3 === 0,
      bl: index === 1 || (index - 1) % 3 === 0,
      br: index % 3 === 0,
    };
  }

  const getSides = (index: number) => {
    return {
      right: true,
      left: index === 1,
      bottom: true,
      top: true,
    };
  };

  const getMobileSides = (index: number) => {
    return {
      right: true,
      left: true,
      bottom: index === 3,
      top: true,
    };
  };

  return (
    <Section className="relative w-full px-6 py-[80px]">
      <div className="flex h-full w-full flex-col gap-2xl">
        <div className="flex w-full flex-col items-center gap-s">
          <h2 className="l-heading text-balance text-center">{props.title}</h2>
          <div className="body-l max-w-[617px] text-center">
            <RichText value={props.paragraph} />
          </div>
        </div>

        <div
          className={cx(
            "grid w-full gap-4",
            props.items.length === 1
              ? "grid-cols-1"
              : "grid-cols-1 lg:grid-cols-3",
          )}
        >
          {props.items.map((item, index) => {
            return (
              <div
                key={item.name}
                className="z-20 col-span-1 min-h-[320px] w-full bg-primary-dark/30 lg:min-h-[500px] dark:bg-primary-light/30"
              >
                <GradientBorderBox
                  className={cx("hidden h-full max-w-full lg:block")}
                  extend={{
                    orientation: "vertical",
                    corners: generateBorderExtensions(index + 1),
                  }}
                  sides={getSides(index + 1)}
                  dots={generateBorderExtensions(index + 1)}
                >
                  <div className="px-8 pb-8 pt-[60px] lg:px-10 lg:py-[116px]">
                    <div className="flex h-[268px] flex-col justify-start">
                      <div className="mb-[40px] h-[40px]">
                        <SanityImage
                          maxWidth={400}
                          image={item?.companyLogoLight}
                          elProps={{
                            alt: item?.companyLogoLight?.alt,
                            className: "h-full object-contain dark:hidden",
                          }}
                        />
                        <SanityImage
                          maxWidth={400}
                          image={item?.companyLogoDark}
                          elProps={{
                            alt: item?.companyLogoDark?.alt,
                            className:
                              "h-full object-contain hidden dark:block",
                          }}
                        />
                      </div>

                      <div className="body-l font-medium">
                        <RichText value={item?.quote} />
                      </div>

                      <div className="mt-auto flex items-center gap-s">
                        <SanityImage
                          maxWidth={400}
                          image={item?.image}
                          elProps={{
                            alt: item?.image?.alt,
                            className:
                              "h-[44px] w-[44px] object-cover rounded-[4px]",
                          }}
                        />

                        <div className="py-[2px]">
                          <h3 className="body-s-medium font-medium text-primary-light dark:text-primary-dark">
                            {item.name}
                          </h3>
                          <span className="body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
                            {item?.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GradientBorderBox>
                <GradientBorderBox
                  className={cx("h-full max-w-full lg:hidden")}
                  extend={{
                    orientation: "vertical",
                    corners: generateBorderExtensions(index + 1),
                  }}
                  sides={getMobileSides(index + 1)}
                  dots={generateBorderExtensions(index + 1, "mobile")}
                >
                  <div className="px-8 pb-8 pt-[60px] lg:px-10 lg:py-[116px]">
                    <div className="flex h-[268px] flex-col justify-start">
                      <div className="mb-[40px] h-[40px]">
                        <SanityImage
                          maxWidth={400}
                          image={item?.companyLogoLight}
                          elProps={{
                            alt: item?.companyLogoLight?.alt,
                            className: "h-full object-contain dark:hidden",
                          }}
                        />
                        <SanityImage
                          maxWidth={400}
                          image={item?.companyLogoDark}
                          elProps={{
                            alt: item?.companyLogoDark?.alt,
                            className:
                              "h-full object-contain hidden dark:block",
                          }}
                        />
                      </div>

                      <div className="body-l font-medium">
                        <RichText value={item?.quote} />
                      </div>

                      <div className="mt-auto flex items-center gap-s">
                        <SanityImage
                          maxWidth={400}
                          image={item?.image}
                          elProps={{
                            alt: item?.image?.alt,
                            className:
                              "h-[44px] w-[44px] object-cover rounded-[4px]",
                          }}
                        />

                        <div className="py-[2px]">
                          <h3 className="body-s-medium font-medium text-primary-light dark:text-primary-dark">
                            {item.name}
                          </h3>
                          <span className="body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
                            {item?.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GradientBorderBox>
              </div>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full">
        <div className="pointer-events-none relative h-full w-full">
          <GradientBlob style="ellipse" />
        </div>
      </div>
    </Section>
  );
}
