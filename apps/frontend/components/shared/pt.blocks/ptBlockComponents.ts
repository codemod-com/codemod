import CodeSnippetBlock from "./CodeSnippet";
import Collapsible from "./Collapsible";
import ImageBlock from "./Image";
import QuoteBlock from "./Quote";
import Table from "./Table";
import TwitterEmbedBlock from "./TwitterEmbed";
import VideoBlock from "./Video";

export let ptBlockComponents: Record<string, React.ComponentType<any>> = {
  muxVideoWithCaption: VideoBlock,
  youtubeVideo: VideoBlock,
  imageBlock: ImageBlock,
  twitterEmbed: TwitterEmbedBlock,
  codeSnippet: CodeSnippetBlock,
  quoteBlock: QuoteBlock,
  ptTable: Table,
  collapsible: Collapsible,
};
