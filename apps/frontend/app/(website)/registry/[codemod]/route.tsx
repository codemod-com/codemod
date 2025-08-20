import { loadCodemod } from "@/data/codemod/loaders";
import type { AutomationResponse } from "@/types/object.types";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { codemod: string } },
) {
  const { codemod } = params;

  try {
    const initialAutomationData = await loadCodemod(
      codemod,
      {
        next: {
          tags: [`codemod-${codemod}`],
        },
      },
      true,
    );

    const name = (initialAutomationData as AutomationResponse).name;

    if (!name) {
      return NextResponse.redirect(`https://app.codemod.com/registry`, {
        status: 301,
      });
    }

    return NextResponse.redirect(`https://app.codemod.com/registry/${name}`, {
      status: 301,
    });
  } catch (error) {
    console.log(error);
  }
}
