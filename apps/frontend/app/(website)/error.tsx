"use client"; // Error components must be Client Components

import { NotFoundHero } from "@/components/templates/notFound/NotFoundHero";

export default function Error({
	                              error,
	                              reset,
                              }: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div>
			<NotFoundHero
				data={ {
					_id: "error",
					title: "An error occured",
					_type: "notFoundPayload",
					heroCta: {
						label: "Go Home",
						link: "/",
					},
					description: "Try refreshing the page or return to the homepage.",
				} }
			/>
		</div>
	);
}
