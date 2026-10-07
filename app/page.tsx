import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "./chatgpt-auth";
import QuestGame from "./quest-game";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  return <QuestGame user={user ? { displayName: user.displayName, email: user.email } : null} signInPath={chatGPTSignInPath("/")} signOutPath={chatGPTSignOutPath("/")} />;
}
