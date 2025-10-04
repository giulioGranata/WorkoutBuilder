import { NextResponse } from "next/server";

import { buildExportPayload } from "../profile-service";

export async function GET() {
  try {
    const payload = await buildExportPayload();
    const body = JSON.stringify(payload, null, 2);
    const fileName = `workout-builder-export-${new Date().toISOString()}.json`;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
