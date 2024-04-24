import type { YoutubeVideoBlock } from "@/types/object.types";
import getYouTubeID from "get-youtube-id";

export default function YoutubeVideo(props: YoutubeVideoBlock) {
	const youtubeId = getYouTubeID(props.youtubeUrl || "");
	if (!youtubeId) return null;
	return (
		<iframe
			src={`https://www.youtube.com/embed/${youtubeId}`}
			title="YouTube video player"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
			className="h-full w-full"
		/>
	);
}
