import { NextResponse } from "next/server";

import { deleteAccountAndData } from "../profile-service";

export async function DELETE() {
  try {
    await deleteAccountAndData();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
