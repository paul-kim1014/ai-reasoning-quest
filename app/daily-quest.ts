import { quests } from "./quest-data";

export const DAILY_XP = 20;

export function todayInSeoul(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: string) => parts.find(part => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function dailyQuestions(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return [];
  const [year, month, date] = day.split("-").map(Number);
  const serial = Math.floor(Date.UTC(year, month - 1, date) / 86400000);
  if (!Number.isFinite(serial) || new Date(serial * 86400000).toISOString().slice(0, 10) !== day) return [];
  const start = ((serial * 13) % quests.length + quests.length) % quests.length;
  return [0, 17, 34].map(offset => quests[(start + offset) % quests.length]);
}
