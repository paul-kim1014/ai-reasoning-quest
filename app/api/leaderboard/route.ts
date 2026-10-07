import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { profiles } from "../../../db/schema";

export async function GET() {
  try {
    const rows = await getDb().select({ handle: profiles.handle, character: profiles.character, xp: profiles.xp, streak: profiles.streak }).from(profiles).orderBy(desc(profiles.xp)).limit(20);
    return Response.json({ rows: rows.map((r, i) => ({ ...r, rank: i + 1, level: Math.floor(r.xp / 500) + 1 })) });
  } catch { return Response.json({ rows: [] }); }
}
