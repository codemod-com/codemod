import PageCta from "@/components/templates/ModularPage/PageCta";
import type { ContactPagePayload } from "@/types";
import ContactPageUI from "./ContactPageUI";

export interface ContactPageProps {
	data: ContactPagePayload | null;
}

export default async function ContactPage({ data }: { data: any }) {
	return (
		<>
			<ContactPageUI data={data} />
			{data?.cta && <PageCta {...data.cta} />}
		</>
	);
}
