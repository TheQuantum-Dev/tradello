import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function DELETE() {
  try {
    await prisma.trade.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to clear trades" }, { status: 500 });
  }
}