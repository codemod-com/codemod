import type { TwitterEmbedBlock } from "@/types/object.types";
import { getTweetId } from "@/utils/ids";
import React from "react";
import { Tweet } from "react-tweet";

export let TwitterEmbed = (props: TwitterEmbedBlock) => {
  let tweetID = getTweetId(props.url || "");
  return tweetID ? <Tweet id={tweetID} /> : null;
};

export default function TwitterEmbedBlock(props: TwitterEmbedBlock) {
  return (
    <div className="my-10 flex w-full justify-center">
      <TwitterEmbed {...props} />
    </div>
  );
}
