import { RichText } from "@/components/shared/RichText";
import TableOfContents from "@/components/shared/TableOfContents";
import type { TextPagePayload } from "@/types";
import getBlocksToc from "@/utils/getBlocksToc";
import { getParagraphId } from "@/utils/ids";
import type { PortableTextReactComponents } from "@portabletext/react";

let textPagePtComponents: Partial<PortableTextReactComponents> = {};

export default function TextPageContent(props: TextPagePayload) {
  let toc = getBlocksToc(props.body);
  let hasToc = !!toc?.length;

  return (
    <div className="flex w-full flex-col lg:flex-row">
      {hasToc ? (
        <aside className="flex flex-col lg:w-1/3 lg:min-w-[300px] lg:max-w-[400px]">
          <TableOfContents outlines={toc} title={props?.tocTitle} />
        </aside>
      ) : null}
      <div className="mt-10 w-full space-y-5 break-words lg:ml-20 lg:mt-0 lg:w-2/3">
        {props.body ? (
          <RichText
            scrollBelowHeader
            value={props.body}
            fieldName="body"
            usage="textPage"
          />
        ) : null}
      </div>
    </div>
  );
}
