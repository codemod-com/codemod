import { env } from "@/env";
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

	const firstname = formData.get("name")?.toString() || "no name provided";
	const email = formData.get("email")?.toString() || "no email provided";
	const message = formData.get("message")?.toString() || "no message provided";
	const job_title =
		formData.get("job_title")?.toString() || "no job title provided";
	try {
		const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${ env.HUBSPOT_PORTAL_ID }`;

		const fields = [
			{
				name: "firstname",
				value: firstname,
			},
			{
				name: "email",
				value: email,
			},
			{
				name: "message",
				value: message,
			},
			{
				name: "job_title",
				value: job_title,
			},
		].filter((field) => field.value !== undefined);

		const submitedAt = Date.now();

		const submitForm = (id: string) => {
			return fetch(`${ endpoint }/${ id }`, {
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

		const hubspotRes = await (await submitForm(env.HUBSPOT_JOB_FORM_ID)).json();

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
