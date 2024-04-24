import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
/**
 * Handles form submissions from Form.tsx by ensuring it isn't spam and sending the data to the coresponding Notion database.
 *
 * Refer to useFormSubmission.tsx for how this is called.
 */
export async function POST(req: NextRequest) {
	const _headers = headers();

	const formData = await req.formData();
	const email = formData.get("email")?.toString() || "no email provided";

	try {
		const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${process.env.HUBSPOT_PORTAL_ID}`;

		const fields = [
			{
				name: "email",
				value: email,
			},
		].filter((field) => field.value !== undefined);

		const submitedAt = Date.now();

		const submitForm = (id: string) => {
			return fetch(`${endpoint}/${id}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},

				body: JSON.stringify({
					submitedAt,
					fields,
					skipValidation: true,
					context: {
						pageUri: _headers.get("referer"),
						ipAddress: req.ip,
					},
				}),
			});
		};

		const hubspotRes = await (
			await submitForm(process.env.HUBSPOT_NEWSLETTER_FORM_ID!)
		).json();

		if (!hubspotRes?.inlineMessage) {
			throw new Error(JSON.stringify(hubspotRes));
		}

		return NextResponse.json(hubspotRes, {
			status: 200,
		});
	} catch (error) {
		return NextResponse.json({}, { status: 500 });
	}
}
