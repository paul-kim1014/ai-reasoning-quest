"use client";

import { Check, ChevronRight, Copy, Share2, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DAILY_XP, dailyQuestions, todayInSeoul } from "./daily-quest";

type SavedAttempt = { day: string; answers: number[]; step: number };

export default function DailyChallenge({ open, onClose, signedIn, profileReady, signInPath, onAward }: {
  open: boolean;
  onClose: () => void;
  signedIn: boolean;
  profileReady: boolean;
  signInPath: string;
  onAward: (xp: number) => void;
}) {
  const [day, setDay] = useState("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const attempted = useRef("");

  useEffect(() => {
    const currentDay = todayInSeoul();
    setDay(currentDay);
    try {
      const attempt = JSON.parse(localStorage.getItem("aiquest-daily") ?? "null") as SavedAttempt | null;
      if (attempt?.day === currentDay && Array.isArray(attempt.answers) && attempt.answers.every(answer => Number.isInteger(answer) && answer >= 0 && answer <= 3) && Number.isInteger(attempt.step) && attempt.step >= 0 && attempt.step <= 3) {
        setAnswers(attempt.answers.slice(0, 3));
        setStep(attempt.step);
      }
    } catch { /* A blocked or old browser store must not block guest play. */ }
  }, []);

  useEffect(() => {
    if (!open || !day || todayInSeoul() === day) return;
    setDay(todayInSeoul()); setAnswers([]); setStep(0); setSaved(false); setMessage(""); attempted.current = "";
  }, [day, open]);

  const questions = day ? dailyQuestions(day) : [];
  const finished = step === 3 && answers.length === 3 && questions.length === 3;
  const score = questions.filter((question, index) => question.answer === answers[index]).length;

  useEffect(() => {
    if (!finished || !signedIn || !profileReady || saved || attempted.current === day) return;
    attempted.current = day;
    setSaving(true);
    fetch("/api/daily", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ day, answers }) })
      .then(async response => { const data = await response.json() as { error?: string; awarded?: number; alreadyCompleted?: boolean }; if (!response.ok) throw new Error(data.error ?? "저장 실패"); return data; })
      .then(data => { setSaved(true); if (data.awarded) onAward(data.awarded); setMessage(data.alreadyCompleted ? "오늘의 XP는 이미 저장되었습니다." : `오늘의 기록 저장 완료 · +${data.awarded ?? 0} XP`); })
      .catch(error => { attempted.current = ""; setMessage(error instanceof Error ? error.message : "기록을 저장하지 못했습니다."); })
      .finally(() => setSaving(false));
  }, [answers, day, finished, onAward, profileReady, saved, signedIn]);

  function select(choice: number) {
    if (!questions[step] || answers[step] !== undefined) return;
    const next = [...answers.slice(0, step), choice];
    setAnswers(next);
    try { localStorage.setItem("aiquest-daily", JSON.stringify({ day, answers: next, step })); } catch { /* Play stays available. */ }
  }

  function advance() {
    const next = Math.min(step + 1, 3);
    setStep(next);
    try { localStorage.setItem("aiquest-daily", JSON.stringify({ day, answers, step: next })); } catch { /* Play stays available. */ }
  }

  const shareUrl = typeof window === "undefined" ? "" : `${window.location.origin}/?ref=share&day=${day}`;
  const pattern = questions.map((question, index) => question.answer === answers[index] ? "🟩" : "⬜").join("");
  const shareText = `AI Quest 1분 도전 · ${day}\n${pattern} ${score}/3\n오늘 같은 문제에 도전해 보세요!\n${shareUrl}`;

  async function copyResult() {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(shareText);
      else {
        const field = document.createElement("textarea"); field.value = shareText; document.body.appendChild(field); field.select();
        if (!document.execCommand("copy")) throw new Error("copy failed"); field.remove();
      }
      setMessage("결과와 링크를 복사했습니다.");
    } catch { setMessage("복사할 수 없습니다. 브라우저의 공유 기능을 이용해 주세요."); }
  }

  async function shareResult() {
    if (!navigator.share) return copyResult();
    try { await navigator.share({ title: "AI Quest 1분 도전", text: shareText, url: shareUrl }); }
    catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; await copyResult(); }
  }

  if (!open) return null;
  return <div className="modal-backdrop daily-backdrop"><div className="daily-modal" role="dialog" aria-modal="true" aria-labelledby="daily-title">
    <button className="close-button" onClick={onClose} aria-label="데일리 챌린지 닫기"><X/></button>
    <span className="section-kicker">ONE-MINUTE DAILY CHALLENGE · {day}</span>
    <h2 id="daily-title">{finished ? "오늘의 1분 도전 완료!" : "오늘의 1분 도전"}</h2>
    {!finished && questions[step] && <><div className="daily-progress"><span>{step + 1} / 3</span><div>{[0, 1, 2].map(index => <i key={index} className={index <= step ? "active" : ""}/>)}</div></div><p className="daily-prompt">{questions[step].prompt}</p><div className="daily-options">{questions[step].choices.map((choice, index) => <button key={index} className={answers[step] === index ? index === questions[step].answer ? "correct" : "wrong" : ""} disabled={answers[step] !== undefined} onClick={() => select(index)}><span>{index + 1}</span>{choice}</button>)}</div>{answers[step] !== undefined && <><div className="daily-feedback"><b>{answers[step] === questions[step].answer ? "정답입니다!" : `정답: ${questions[step].choices[questions[step].answer]}`}</b><p>{questions[step].choiceFeedback[answers[step]]}</p><small>쉬운 예시 · {questions[step].choiceExamples[answers[step]]}</small></div><button className="primary-button full" onClick={advance}>{step === 2 ? "결과 보기" : "다음 문제"}<ChevronRight size={18}/></button></>}</>}
    {finished && <><div className="daily-result"><div aria-label={`${score}문제 정답`}>{pattern}</div><strong>{score} / 3</strong><p>{signedIn ? profileReady ? `정답당 ${DAILY_XP} XP · 하루 한 번 지급` : "캐릭터를 만들면 XP를 저장할 수 있어요." : "로그인하면 오늘의 XP를 저장할 수 있어요."}</p></div>{message && <p className="daily-message" role="status">{message}</p>}{saving && <p className="daily-message" role="status">기록을 저장하는 중…</p>}<div className="daily-share"><button className="primary-button" onClick={shareResult}><Share2 size={17}/> 결과 공유</button><button className="secondary-button" onClick={copyResult}><Copy size={17}/> 링크 복사</button></div>{!signedIn && <a className="daily-login" href={signInPath} target="_top"><Sparkles size={16}/> 로그인하고 오늘의 XP 저장</a>}{signedIn && profileReady && !saved && !saving && <button className="daily-login" onClick={() => { attempted.current = ""; setMessage(""); setSaved(false); }}>저장 다시 시도</button>}</>}
  </div></div>;
}
