import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { completions, profiles } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { DAILY_XP, dailyQuestions, todayInSeoul } from "../../daily-quest";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  let body: { day?: string; answers?: number[] };
  try { body = await request.json(); } catch { return Response.json({ error: "잘못된 요청입니다." }, { status: 400 }); }
  const day = todayInSeoul();
  const questions = dailyQuestions(day);
  if (body.day !== day || !Array.isArray(body.answers) || body.answers.length !== 3 || body.answers.some(answer => !Number.isInteger(answer) || answer < 0 || answer > 3)) {
    return Response.json({ error: "오늘의 세 문제를 다시 풀어 주세요." }, { status: 400 });
  }
  const score = questions.filter((question, index) => question.answer === body.answers![index]).length;
  try {
    const db = getDb();
    const existingProfile = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
    if (!existingProfile.length) return Response.json({ error: "먼저 캐릭터를 만들어 주세요." }, { status: 409 });
    const xp = score * DAILY_XP;
    const inserted = await db.insert(completions).values({ userId: user.userId, questId: `daily-${day}`, xpAwarded: xp }).onConflictDoNothing().returning({ id: completions.id });
    if (inserted.length && xp) await db.update(profiles).set({ xp: sql`${profiles.xp} + ${xp}`, updatedAt: new Date().toISOString() }).where(eq(profiles.userId, user.userId));
    return Response.json({ awarded: inserted.length ? xp : 0, alreadyCompleted: !inserted.length, score });
  } catch { return Response.json({ error: "오늘의 기록을 저장하지 못했습니다." }, { status: 503 }); }
}
