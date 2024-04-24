import type { MuxVideoBlock, YoutubeVideoBlock } from "@/types/object.types";

import { vercelStegaCleanAll } from "@sanity/client/stega";
import MuxVideo from "./MuxVideo";
import YoutubeVideo from "./YoutubeVideo";

export function isYoutubeVideoBlock(obj: any): obj is YoutubeVideoBlock {
  return obj && obj._type === "youtubeVideo";
}

type VideoBlock = MuxVideoBlock | YoutubeVideoBlock;

export default function Video(props: VideoBlock) {
  if (isYoutubeVideoBlock(props)) return <YoutubeVideo {...props} />;

  return (
    <>
      {props.darkVideo?.asset && (
        <MuxVideo
          className="hidden dark:block"
          autoPlay={props.autoPlay}
          hasControls={props.hasControls}
          video={vercelStegaCleanAll(props.darkVideo?.asset)}
          loop={props.loop}
        />
      )}
      {props.video?.asset && (
        <MuxVideo
          className="dark:hidden"
          autoPlay={props.autoPlay}
          hasControls={props.hasControls}
          video={vercelStegaCleanAll(props.video?.asset)}
          loop={props.loop}
        />
      )}
    </>
  );
}
