import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Quest Academy · 52주 성장 원정대",
  description: "사고력, 데이터, AI를 RPG 퀘스트로 배우는 52주 학습 아카데미",
  other: {
    "codex-preview": "development",
  },
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
