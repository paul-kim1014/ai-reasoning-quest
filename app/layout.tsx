import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-reasoning-quest.paul-kim.chatgpt.site"),
  title: "AI Quest Academy · 10주 성장 원정대",
  description: "1분 데일리 챌린지와 50일 RPG 퀘스트로 논리·데이터·AI 사고력을 키워 보세요.",
  openGraph: {
    title: "AI Quest Academy · 오늘의 1분 도전",
    description: "매일 같은 3문제에 도전하고, 10주 성장 원정대를 함께 시작하세요.",
    url: "/",
    siteName: "AI Quest Academy",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AI Quest Academy 1분 데일리 챌린지" }],
  },
  twitter: { card: "summary_large_image", title: "AI Quest Academy · 오늘의 1분 도전", images: ["/og-image.png"] },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
