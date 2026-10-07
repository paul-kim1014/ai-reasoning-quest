import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { completions, profiles } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

const rewards: Record<string, number> = { q1: 80, q2: 90, q3: 110, q4: 130 };

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json() as { questId?: string; xp?: number };
  const base = body.questId ? rewards[body.questId] : undefined;
  if (!body.questId || !base) return Response.json({ error: "알 수 없는 퀘스트입니다." }, { status: 400 });
  const xp = Math.min(Math.max(Number(body.xp) || base, base), Math.ceil(base * 1.1));
  try {
    const db = getDb();
    const inserted = await db.insert(completions).values({ userId: user.userId, questId: body.questId, xpAwarded: xp }).onConflictDoNothing().returning({ id: completions.id });
    if (inserted.length) await db.update(profiles).set({ xp: sql`${profiles.xp} + ${xp}`, updatedAt: new Date().toISOString() }).where(eq(profiles.userId, user.userId));
    return Response.json({ awarded: inserted.length ? xp : 0 });
  } catch { return Response.json({ error: "진행 상황을 저장하지 못했습니다." }, { status: 503 }); }
}
