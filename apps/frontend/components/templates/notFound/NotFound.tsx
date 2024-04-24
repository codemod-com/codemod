import PageCta from "@/components/templates/ModularPage/PageCta";
import type { NotFoundPayload } from "@/types";
import { NotFoundHero } from "./NotFoundHero";
export function NotFound({ data }: { data?: NotFoundPayload }) {
	return (
		<>
			<NotFoundHero data={data} />
			{data?.footerCta && <PageCta {...data.footerCta} />}
		</>
	);
}
