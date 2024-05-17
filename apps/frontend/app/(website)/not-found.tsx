import { NotFound } from "@/components/templates/notFound/NotFound";
import { NotFoundPreview } from "@/components/templates/notFound/NotFoundPreview";
import { loadNotFound } from "@/data/sanity/loadQuery";
import { draftMode } from "next/headers";

export default async function FourOhFour() {
  let data = await loadNotFound("en");

  return draftMode().isEnabled ? (
    <NotFoundPreview initial={data} />
  ) : (
    <NotFound data={data.data!} />
  );
}
