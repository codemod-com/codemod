import { client } from "@/data/sanity/client";
import { groq } from "next-sanity";
import BlogRoute, { generateMetadata } from "../../page";

export { generateMetadata };
export default BlogRoute;

export async function generateStaticParams() {
  let tags = await client.fetch(groq`*[_type == "blog.tag"]`);

  let paths = tags.map((tag: any) => ({
    tag: tag.slug?.current,
  }));

  return paths;
}
