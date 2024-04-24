import "@/sanity/lib/custom.css";
import schemas from "@/sanity/schemas";
import { codeInput } from "@sanity/code-input";
import { table } from "@sanity/table";
import { visionTool } from "@sanity/vision";
import { pages } from "@tinloof/sanity-studio";
import { defineConfig } from "sanity";
import { media, mediaAssetSource } from "sanity-plugin-media";
import { muxInput } from "sanity-plugin-mux-input";
import { structureTool } from "sanity/structure";

import StudioLogo from "@/components/shared/StudioLogo";
import config from "@/config";

export default defineConfig({
	basePath: config.sanity.studioUrl,
	projectId: config.sanity.projectId,
	dataset: config.sanity.dataset,
	title: config.siteName,
	icon: StudioLogo,
	schema: {
		types: schemas,
	},
	plugins: [
		table(),
		pages({
			previewUrl: {
				draftMode: {
					enable: "/api/draft",
				},
			},
			creatablePages: [
				{ title: "Page", type: "page" },
				{ title: "Text Page", type: "textPage" },
				{ title: "Blog Article", type: "blog.article" },
				{ title: "Customer Story", type: "blog.customerStory" },
				{ title: "Job Listing", type: "job" },
			],
		}),
		structureTool({
			name: "structure",
			title: "Structure",
			structure: (S) =>
				S.list()
					.title("Structure")
					.items([
						S.documentTypeListItem("settings").child(() =>
							S.document().schemaType("settings"),
						),
						S.documentTypeListItem("navigation").child(() =>
							S.document().schemaType("navigation"),
						),
						S.documentTypeListItem("footer").child(() =>
							S.document()
								.title("Footer")
								.schemaType("footer")
								.id("fd86940a-d4f9-4232-bcf6-662d3cc4e29e"),
						),
						S.documentTypeListItem("globalLabels").child(() =>
							S.document().schemaType("globalLabels"),
						),
						S.divider(),
						S.documentTypeListItem("page").child(
							S.documentList().title("Pages").filter("defined(pathname)"),
						),
						S.listItem()
							.title("Blog")
							.child(
								S.list()
									.id("blog")
									.items([
										S.documentTypeListItem("blogIndex").child(() =>
											S.document()
												.title("Index")
												.schemaType("blogIndex")
												.id("2de85a5a-a4b0-4bf8-adce-d1b55e0f82da"),
										),
										S.documentTypeListItem("blog.article").title("Articles"),
										S.documentTypeListItem("blog.customerStory").title(
											"Customer Stories",
										),
										S.documentTypeListItem("blog.tag")
											.title("Tags")
											.child(
												S.documentList()
													.title("Blog Tags")
													.filter('_type == "blog.tag"'),
											),
										S.documentTypeListItem("articleCta")
											.title("Article CTAs")
											.child(
												S.document()
													.title("Article CTA")
													.schemaType("articleCta")
													.id("39c94a16-c62e-4f03-8e21-e7e334d7be49"),
											),
										S.documentTypeListItem("blog.author")
											.title("Authors")
											.child(
												S.documentList()
													.title("Blog Authors")
													.filter('_type == "blog.author"'),
											),
									]),
							),

						S.documentTypeListItem("filterIconDictionary").child(() =>
							S.document().schemaType("filterIconDictionary"),
						),
					]),
		}),
		media(),
		codeInput(),
		visionTool({ defaultApiVersion: config.sanity.apiVersion }),
		muxInput({ mp4_support: "standard" }),
	],
	tools: (tools) => {
		return tools.map((t) => {
			if (t.title === "Media") {
				return { ...t, title: "Images" };
			}

			return t;
		});
	},
	form: {
		file: {
			assetSources: () => [mediaAssetSource],
		},
		image: {
			assetSources: () => [mediaAssetSource],
		},
	},
});
