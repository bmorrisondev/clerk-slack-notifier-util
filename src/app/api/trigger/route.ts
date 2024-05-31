import { NextResponse } from "next/server"
import { scanForUpdates } from "./main"

export const maxDuration = 300
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await scanForUpdates()
  return NextResponse.json({
    status: "ok"
  })
}