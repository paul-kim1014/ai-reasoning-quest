import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { profiles } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

const allowed = new Set(["strategist", "analyst", "engineer", "guardian"]);

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ profile: null }, { status: 401 });
  try {
    const rows = await getDb().select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
    return Response.json({ profile: rows[0] ? { handle: rows[0].handle, character: rows[0].character, xp: rows[0].xp, streak: rows[0].streak } : null });
  } catch { return Response.json({ profile: null, error: "프로필을 불러오지 못했습니다." }, { status: 503 }); }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json() as { handle?: string; character?: string };
  const handle = body.handle?.trim().slice(0, 14) ?? "";
  const character = body.character ?? "";
  if (handle.length < 2 || !allowed.has(character)) return Response.json({ error: "올바른 캐릭터 정보를 입력해 주세요." }, { status: 400 });
  try {
    await getDb().insert(profiles).values({ userId: user.userId, handle, character }).onConflictDoUpdate({ target: profiles.userId, set: { handle, character, updatedAt: new Date().toISOString() } });
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "프로필을 저장하지 못했습니다." }, { status: 503 }); }
}
