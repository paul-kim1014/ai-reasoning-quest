import { desc, eq, gt, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { profiles } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select({ handle: profiles.handle, character: profiles.character, avatar: profiles.avatar, xp: profiles.xp, streak: profiles.streak }).from(profiles).orderBy(desc(profiles.xp)).limit(20);
    const user = await getChatGPTUser();
    let me = null;
    if (user) {
      const mine = (await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1))[0];
      if (mine) {
        const above = await db.select({ count: sql<number>`count(*)` }).from(profiles).where(gt(profiles.xp, mine.xp));
        me = { handle: mine.handle, character: mine.character, avatar: mine.avatar, xp: mine.xp, streak: mine.streak, rank: Number(above[0]?.count ?? 0) + 1, level: Math.floor(mine.xp / 500) + 1 };
      }
    }
    return Response.json({ rows: rows.map((r, i) => ({ ...r, rank: i + 1, level: Math.floor(r.xp / 500) + 1 })), me });
  } catch { return Response.json({ rows: [], me: null }); }
}
