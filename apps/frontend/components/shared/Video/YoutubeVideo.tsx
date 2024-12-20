import { useTranslation } from "react-i18next";
import type { YoutubeVideoBlock } from "@/types/object.types";
import getYouTubeID from "get-youtube-id";

export default function YoutubeVideo(props: YoutubeVideoBlock) {
const { t } = useTranslation("../components/shared/Video");

  const youtubeId = getYouTubeID(props.youtubeUrl || "");
  if (!youtubeId) return null;
  return (
    <iframe
      src={`https://www.youtube.com/embed/${youtubeId}`}
      title={t('youtube-video-player')}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="h-full w-full"
    />
  );
}
