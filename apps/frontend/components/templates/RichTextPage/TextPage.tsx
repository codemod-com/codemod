import type { TextPagePayload } from "@/types";

import Section from "@/components/shared/Section";
import TextPageContent from "./TextPageContent";
import TextPageHero from "./TextPageHero";

export interface TextPageProps {
  data: TextPagePayload | null;
}

export default function TextPage({ data }: TextPageProps) {
  return (
    <>
      {data?.title && <TextPageHero {...data} />}
      <Section className="relative w-full py-10 lg:py-20">
        {data?.body && <TextPageContent {...data} />}
      </Section>
    </>
  );
}
