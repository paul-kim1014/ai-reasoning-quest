import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { completions, profiles } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

const allowed = new Set(["strategist", "analyst", "engineer", "guardian"]);
const allowedAvatars = new Set(["female-strategist", "female-guardian", "female-analyst", "female-engineer", "male-strategist", "male-analyst", "male-guardian", "male-engineer"]);

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ profile: null }, { status: 401 });
  try {
    const db = getDb();
    const rows = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
    const done = await db.select({ questId: completions.questId }).from(completions).where(eq(completions.userId, user.userId));
    const legacyMap: Record<string, string> = { q1: "d01", q2: "d04", q3: "d08", q4: "d17" };
    const completionIds = [...new Set(done.map(row => legacyMap[row.questId] ?? row.questId))];
    return Response.json({ profile: rows[0] ? { handle: rows[0].handle, character: rows[0].character, avatar: rows[0].avatar, xp: rows[0].xp, streak: rows[0].streak, rating: rows[0].rating, wins: rows[0].wins, losses: rows[0].losses } : null, completions: completionIds });
  } catch { return Response.json({ profile: null, error: "프로필을 불러오지 못했습니다." }, { status: 503 }); }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json() as { handle?: string; character?: string; avatar?: string };
  const handle = body.handle?.trim().slice(0, 14) ?? "";
  const character = body.character ?? "";
  const avatar = body.avatar ?? "female-strategist";
  if (handle.length < 2 || !allowed.has(character) || !allowedAvatars.has(avatar)) return Response.json({ error: "올바른 캐릭터 정보를 입력해 주세요." }, { status: 400 });
  try {
    await getDb().insert(profiles).values({ userId: user.userId, handle, character, avatar }).onConflictDoUpdate({ target: profiles.userId, set: { handle, character, avatar, updatedAt: new Date().toISOString() } });
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "프로필을 저장하지 못했습니다." }, { status: 503 }); }
}
