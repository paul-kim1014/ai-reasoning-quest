import { desc, eq, ne, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { battles, profiles } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

const tactics = ["strike", "guard", "insight"] as const;
const names: Record<string, string> = { strike: "강공", guard: "방어", insight: "통찰" };
const beats: Record<string, string> = { strike: "insight", insight: "guard", guard: "strike" };

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ opponents: [], battles: [] }, { status: 401 });
  try {
    const db = getDb();
    const opponents = await db.select({ handle: profiles.handle, character: profiles.character, avatar: profiles.avatar, xp: profiles.xp, streak: profiles.streak, rating: profiles.rating, wins: profiles.wins, losses: profiles.losses }).from(profiles).where(ne(profiles.userId, user.userId)).orderBy(desc(profiles.rating)).limit(12);
    const recent = await db.select().from(battles).where(eq(battles.userId, user.userId)).orderBy(desc(battles.id)).limit(10);
    return Response.json({ opponents: opponents.map((row, index) => ({ ...row, rank: index + 1, level: Math.floor(row.xp / 500) + 1 })), battles: recent });
  } catch { return Response.json({ opponents: [], battles: [] }); }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json() as { opponentHandle?: string; tactic?: string };
  if (!body.opponentHandle || !body.tactic || !tactics.includes(body.tactic as typeof tactics[number])) return Response.json({ error: "대전 정보를 확인해 주세요." }, { status: 400 });
  try {
    const db = getDb();
    const me = (await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1))[0];
    const opponent = (await db.select().from(profiles).where(eq(profiles.handle, body.opponentHandle)).limit(1))[0];
    if (!me || !opponent || opponent.userId === user.userId) return Response.json({ error: "대전 상대를 찾을 수 없습니다." }, { status: 404 });
    const opponentTactic = tactics[Math.floor(Math.random() * tactics.length)];
    const tacticEdge = beats[body.tactic] === opponentTactic ? 0.16 : beats[opponentTactic] === body.tactic ? -0.16 : 0;
    const ratingEdge = Math.max(-0.15, Math.min(0.15, (me.rating - opponent.rating) / 1200));
    const levelEdge = Math.max(-0.08, Math.min(0.08, (me.xp - opponent.xp) / 12000));
    const win = Math.random() < Math.max(0.2, Math.min(0.8, 0.5 + tacticEdge + ratingEdge + levelEdge));
    const ratingDelta = win ? 18 : -12;
    const rating = Math.max(100, me.rating + ratingDelta);
    await db.update(profiles).set({ rating, wins: sql`${profiles.wins} + ${win ? 1 : 0}`, losses: sql`${profiles.losses} + ${win ? 0 : 1}`, updatedAt: new Date().toISOString() }).where(eq(profiles.userId, user.userId));
    await db.insert(battles).values({ userId: user.userId, opponentHandle: opponent.handle, result: win ? "win" : "loss", ratingDelta, tactic: body.tactic });
    return Response.json({ result: win ? "win" : "loss", ratingDelta, rating, wins: me.wins + (win ? 1 : 0), losses: me.losses + (win ? 0 : 1), opponentTactic: names[opponentTactic] });
  } catch { return Response.json({ error: "대전 결과를 저장하지 못했습니다." }, { status: 503 }); }
}
