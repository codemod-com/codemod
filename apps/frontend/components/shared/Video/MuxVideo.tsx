"use client";

import { vercelStegaSplit } from "@vercel/stega";
import { cx } from "cva";
import React, { useEffect, useRef, useState } from "react";
import useInView from "../../../hooks/useInView";
import Icon from "../Icon";

export type MuxVideoProps = Omit<VideoProps, "mp4Url" | "webmUrl"> & {
  video?: {
    playbackId?: string;
    resolution?: string;
  };
};

export default function MuxVideo({ video, ...videoProps }: MuxVideoProps) {
  const { playbackId, resolution } = video ?? {};

  if (!playbackId || !resolution) {
    return null;
  }

  const mp4Url = vercelStegaSplit(
    `https://stream.mux.com/${playbackId}/${
      resolution === "SD" ? "medium" : "high"
    }.mp4`,
  ).cleaned as string;

  const webmUrl = vercelStegaSplit(
    `https://stream.mux.com/${playbackId}/${
      resolution === "SD" ? "medium" : "high"
    }.webm`,
  ).cleaned as string;

  return (
    <Video
      poster={
        vercelStegaSplit(
          `https://image.mux.com/${playbackId}/thumbnail.webp?fit_mode=smartcrop&time=0`,
        ).cleaned as string
      }
      src={mp4Url}
      webmUrl={webmUrl}
      mp4Url={mp4Url}
      {...videoProps}
    />
  );
}

type VideoProps = React.DetailedHTMLProps<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
> & {
  mp4Url: string;
  webmUrl: string;
  loading?: "lazy" | "eager";
  hasControls?: boolean;
  playOnView?: boolean;
  replay?: boolean;
};

function Video({
  mp4Url,
  webmUrl,
  loading,
  hasControls,
  playOnView,
  replay,
  ...props
}: VideoProps) {
  const [appeared, setAppeared] = React.useState(false);
  const { ref, inView } = useInView();
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (inView) {
      setAppeared(true);
    }
  }, [inView]);

  useEffect(() => {
    if (appeared && playOnView && video.current) {
      video.current.play();
    }
  }, [video, playOnView, appeared]);

  useEffect(() => {
    if (replay && video.current) {
      video.current.pause();
      video.current.currentTime = 0;
      video.current.play();
    }
  }, [replay, video]);

  if (!props.autoPlay) {
    delete props.autoPlay;
  }

  return (
    <>
      <div ref={ref as any} className={cx("group relative", props.className)}>
        <video {...props} playsInline ref={video} muted controls={false}>
          <source src={mp4Url} type="video/mp4" />
          <source src={webmUrl} type="video/webm" />
        </video>

        {hasControls ? <Controls video={video} /> : null}
      </div>
    </>
  );
}

const Controls = ({ video }: { video: React.RefObject<HTMLVideoElement> }) => {
  const [isPaused, setIsPaused] = useState(
    !video.current?.autoplay || !!video.current?.paused,
  );

  useEffect(() => {
    if (isPaused) {
      video.current?.pause();
    } else {
      video.current?.play();
    }
  }, [isPaused, video]);

  return (
    <>
      <div
        className={cx(
          "absolute bottom-12 right-4 z-10 flex items-center gap-2 text-black opacity-100 transition dark:text-black",
        )}
      >
        <div className="flex items-center gap-2">
          <button
            className="z-30 rounded-full border border-white bg-background-dark p-[6px] text-white dark:border-background-dark dark:bg-white dark:text-primary-light"
            onClick={() => {
              setIsPaused((cur) => !cur);
            }}
          >
            <Icon name={isPaused ? "play" : "pause"} />
          </button>

          <button
            onClick={() => {
              video.current?.load();
              video.current?.play();
              setIsPaused(false);
            }}
            className="z-30 rounded-full border border-white bg-background-dark p-[6px] text-white dark:border-background-dark dark:bg-white dark:text-primary-light"
          >
            <div className="ease-in-out hover:rotate-[360deg] hover:transition-transform hover:duration-500">
              <Icon name="refresh" />
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
