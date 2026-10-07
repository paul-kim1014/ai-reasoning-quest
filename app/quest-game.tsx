"use client";

import { BarChart3, BrainCircuit, Check, ChevronRight, Database, Flame, HeartPulse, LockKeyhole, LogOut, Medal, Menu, Play, ShieldCheck, Sparkles, Swords, Trophy, UserRound, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CharacterId = "strategist" | "analyst" | "engineer" | "guardian";
type User = { displayName: string; email: string } | null;
type Profile = { handle: string; character: CharacterId; xp: number; streak: number };
type BoardRow = Profile & { rank: number; level: number; isNpc?: boolean };

const characters = [
  { id: "strategist" as const, name: "전략가", role: "문제 구조화", icon: BrainCircuit, color: "#7c9cff", perk: "논리 퀘스트 XP +10%" },
  { id: "analyst" as const, name: "분석술사", role: "통계 · SQL", icon: BarChart3, color: "#ba7cff", perk: "데이터 퀘스트 XP +10%" },
  { id: "engineer" as const, name: "AI 공학자", role: "Python · AI", icon: Zap, color: "#5de4dc", perk: "실습 퀘스트 XP +10%" },
  { id: "guardian" as const, name: "운영 수호자", role: "병원 경영 적용", icon: HeartPulse, color: "#ffbe55", perk: "프로젝트 XP +10%" },
];

const worlds = [
  { id: 1, title: "사고의 숲", weeks: "1–8주", icon: BrainCircuit, color: "#7c9cff", topics: "논리 · 확률 · 문제 구조화", status: "current" },
  { id: 2, title: "데이터 광산", weeks: "9–20주", icon: Database, color: "#ba7cff", topics: "Excel · SQL · Python", status: "next" },
  { id: 3, title: "AI 공방", weeks: "21–30주", icon: Sparkles, color: "#5de4dc", topics: "프롬프트 · 리서치 · 자동화", status: "locked" },
  { id: 4, title: "시스템 성채", weeks: "31–40주", icon: ShieldCheck, color: "#ffbe55", topics: "알고리즘 · DB · API", status: "locked" },
  { id: 5, title: "추론의 정상", weeks: "41–52주", icon: Trophy, color: "#ff7597", topics: "베이즈 · 인과 · 최적화", status: "locked" },
];

const quests = [
  { id: "q1", world: 1, week: 1, title: "모호한 문제를 쪼개라", skill: "문제 구조화", minutes: 18, xp: 80, difficulty: "입문", prompt: "병원 대기시간이 길다는 문제를 가장 먼저 어떻게 바꾸면 좋을까요?", choices: ["직원에게 더 빨리 일하라고 한다", "접수·검사·진료·수납 단계별 대기시간을 나눈다", "새 시스템을 바로 구매한다"], answer: 1, feedback: "좋아요. 큰 문제를 측정 가능한 단계로 나누면 병목을 검증할 수 있습니다." },
  { id: "q2", world: 1, week: 2, title: "좋은 가설의 조건", skill: "가설 → 검증", minutes: 22, xp: 90, difficulty: "입문", prompt: "검증 가능한 가설은 어느 것일까요?", choices: ["환자는 늘 불편하다", "월요일 오전의 접수 인력 부족이 평균 대기시간을 15분 이상 늘린다", "병원은 더 좋아져야 한다"], answer: 1, feedback: "정확합니다. 대상·시간·원인·측정값이 있어야 데이터로 반박하거나 지지할 수 있습니다." },
  { id: "q3", world: 1, week: 3, title: "확률로 판단 업데이트", skill: "베이지안 사고", minutes: 25, xp: 110, difficulty: "보통", prompt: "새 증거가 들어왔을 때 합리적인 태도는?", choices: ["기존 결론을 고수한다", "증거의 신뢰도만큼 기존 믿음을 업데이트한다", "항상 최신 정보만 믿는다"], answer: 1, feedback: "핵심을 잡았습니다. 새 정보가 얼마나 믿을 만한지에 따라 판단의 이동 폭이 달라집니다." },
  { id: "q4", world: 2, week: 9, title: "첫 SQL 보상 상자", skill: "SELECT · WHERE", minutes: 30, xp: 130, difficulty: "보통", prompt: "응급실 환자 중 대기시간이 60분 이상인 행을 고르는 핵심 절은?", choices: ["ORDER BY", "WHERE", "GROUP BY"], answer: 1, feedback: "맞습니다. WHERE는 분석할 행의 조건을 정합니다." },
];

const npcRows: BoardRow[] = [
  { rank: 1, handle: "논리기사", character: "strategist", xp: 4860, streak: 19, level: 9, isNpc: true },
  { rank: 2, handle: "데이터별", character: "analyst", xp: 4210, streak: 14, level: 8, isNpc: true },
  { rank: 3, handle: "AI연금술사", character: "engineer", xp: 3790, streak: 11, level: 8, isNpc: true },
  { rank: 4, handle: "병목추적자", character: "guardian", xp: 3150, streak: 9, level: 7, isNpc: true },
  { rank: 5, handle: "가설탐험가", character: "strategist", xp: 2640, streak: 7, level: 6, isNpc: true },
];

const getLevel = (xp: number) => Math.floor(xp / 500) + 1;
const getLevelProgress = (xp: number) => (xp % 500) / 5;

export default function QuestGame({ user, signInPath, signOutPath }: { user: User; signInPath: string; signOutPath: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leaderboard, setLeaderboard] = useState<BoardRow[]>(npcRows);
  const [filter, setFilter] = useState<"all" | CharacterId>("all");
  const [activeQuest, setActiveQuest] = useState<(typeof quests)[number] | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [handle, setHandle] = useState("");
  const [character, setCharacter] = useState<CharacterId>("strategist");
  const [tab, setTab] = useState<"map" | "quests" | "rank">("map");
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(r => r.ok ? r.json() : null).then(data => { if (data?.profile) setProfile(data.profile); else if (user) setShowSetup(true); }).catch(() => undefined);
    fetch("/api/leaderboard").then(r => r.ok ? r.json() : null).then(data => { if (data?.rows?.length) setLeaderboard([...data.rows, ...npcRows].sort((a, b) => b.xp - a.xp).map((r, i) => ({ ...r, rank: i + 1 }))); }).catch(() => undefined);
  }, [user]);

  const visibleBoard = useMemo(() => leaderboard.filter(row => filter === "all" || row.character === filter).slice(0, 7), [leaderboard, filter]);
  const level = getLevel(profile?.xp ?? 0);
  const nextQuest = quests.find(q => !completed.includes(q.id)) ?? quests[0];

  async function saveProfile() {
    if (!handle.trim()) return setNotice("모험가 이름을 입력해 주세요.");
    const draft = { handle: handle.trim().slice(0, 14), character, xp: profile?.xp ?? 0, streak: profile?.streak ?? 1 };
    setProfile(draft); setShowSetup(false);
    const response = await fetch("/api/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) }).catch(() => null);
    setNotice(response?.ok ? "캐릭터가 생성되었습니다! 첫 퀘스트를 시작하세요." : "체험 모드로 시작했습니다. 로그인하면 기기 간 동기화됩니다.");
  }

  async function finishQuest() {
    if (!activeQuest || answer !== activeQuest.answer || completed.includes(activeQuest.id)) return;
    const bonus = profile?.character === "strategist" && activeQuest.world === 1 ? Math.round(activeQuest.xp * .1) : 0;
    const gained = activeQuest.xp + bonus;
    setCompleted([...completed, activeQuest.id]); setProfile(p => p ? { ...p, xp: p.xp + gained, streak: Math.max(1, p.streak) } : p);
    await fetch("/api/complete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ questId: activeQuest.id, xp: gained }) }).catch(() => null);
    setNotice(`퀘스트 완료! +${gained} XP`);
  }

  const begin = () => profile ? setActiveQuest(nextQuest) : user ? setShowSetup(true) : location.assign(signInPath);

  return <main className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setTab("map")} aria-label="홈으로"><span className="brand-mark"><Swords size={20}/></span><span>AI QUEST</span><b>ACADEMY</b></button>
      <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="주 메뉴">
        {([['map','월드맵'],['quests','퀘스트'],['rank','랭킹']] as const).map(([id,label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => { setTab(id); setMenuOpen(false); }}>{label}</button>)}
      </nav>
      <div className="top-actions">{profile && <div className="mini-xp"><Zap size={15}/> Lv.{level} <span>{profile.xp.toLocaleString()} XP</span></div>}{user ? <a className="ghost-button" href={signOutPath} title="로그아웃"><LogOut size={18}/><span>로그아웃</span></a> : <a className="login-button" href={signInPath} target="_top"><UserRound size={17}/> 로그인</a>}<button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴"><Menu/></button></div>
    </header>

    <section className="hero-panel">
      <div className="hero-copy"><div className="eyebrow"><span/> SEASON 01 · 52주 성장 원정대</div><h1>생각을 무기로,<br/><em>데이터를 마법으로.</em></h1><p>병원 경영 현장의 문제를 풀며 논리·통계·SQL·Python·AI를 차례로 정복하세요. 매주 작은 승리가 실력과 레벨을 함께 키웁니다.</p><div className="hero-actions"><button className="primary-button" onClick={begin}><Play size={18} fill="currentColor"/> {profile ? "오늘의 퀘스트" : "모험 시작하기"}</button><button className="secondary-button" onClick={() => setTab("map")}>커리큘럼 보기 <ChevronRight size={18}/></button></div><div className="hero-trust"><ShieldCheck size={16}/> 평일 1시간 + 주말 3시간 · 업무 사례 중심 · 주차별 체크포인트</div></div>
      <div className="party-art" aria-label="전략가, 분석술사, AI 공학자, 운영 수호자 캐릭터 파티"><img src="/quest-party.png" alt="네 명의 AI 학습 RPG 캐릭터"/><div className="party-badge"><span>현재 모험가</span><strong>{profile?.handle ?? "캐릭터를 선택하세요"}</strong></div></div>
    </section>

    <section className="dashboard-grid">
      <article className="progress-card"><div className="card-heading"><div><span className="section-kicker">MY PROGRESS</span><h2>{profile ? `${profile.handle}의 성장 기록` : "당신의 모험 기록"}</h2></div><Flame className="flame"/></div><div className="progress-body"><div className="level-orb"><span>LV</span><strong>{level}</strong><small>{characters.find(c => c.id === profile?.character)?.name ?? "새싹 모험가"}</small></div><div className="xp-area"><div className="xp-label"><strong>{profile?.xp ?? 0} XP</strong><span>다음 레벨까지 {500 - ((profile?.xp ?? 0) % 500)} XP</span></div><div className="xp-track"><span style={{ width: `${getLevelProgress(profile?.xp ?? 0)}%` }}/></div><div className="stat-row"><span><Flame size={17}/>연속 학습 <b>{profile?.streak ?? 0}일</b></span><span><Check size={17}/>완료 퀘스트 <b>{completed.length}개</b></span></div></div></div></article>
      <article className="daily-card"><div className="daily-icon"><BrainCircuit/></div><div><span className="section-kicker">TODAY&apos;S QUEST</span><h2>{nextQuest.title}</h2><p>{nextQuest.skill} · 약 {nextQuest.minutes}분</p></div><button onClick={() => profile ? setActiveQuest(nextQuest) : setShowSetup(true)} aria-label="오늘의 퀘스트 시작"><ChevronRight/></button></article>
    </section>

    <section className="content-section"><div className="section-title"><div><span className="section-kicker">YEAR-LONG CAMPAIGN</span><h2>5개 월드, 52주 성장 지도</h2><p>기초 사고부터 고급 의사결정까지, 앞 단계가 다음 능력을 열어줍니다.</p></div><span className="season-progress">시즌 진행도 <b>{completed.length}%</b></span></div><div className="world-map">{worlds.map((world,index) => { const Icon=world.icon; return <div className={`world ${world.status}`} key={world.id}><div className="world-node" style={{"--world":world.color} as React.CSSProperties}>{world.status === "locked" ? <LockKeyhole/> : <Icon/>}</div>{index < worlds.length-1 && <span className="world-line"/>}<small>{world.weeks}</small><h3>{world.title}</h3><p>{world.topics}</p></div>})}</div></section>

    <section className="two-column"><div className="quest-list-panel"><div className="section-title compact"><div><span className="section-kicker">ACTIVE MISSIONS</span><h2>이번 챕터 퀘스트</h2></div><button onClick={() => setTab("quests")}>전체 보기</button></div><div className="quest-list">{quests.slice(0,3).map((quest,i) => <button className="quest-row" key={quest.id} onClick={() => profile ? setActiveQuest(quest) : setShowSetup(true)}><span className={`quest-number ${completed.includes(quest.id) ? "done" : ""}`}>{completed.includes(quest.id) ? <Check/> : i+1}</span><span className="quest-main"><b>{quest.title}</b><small>{quest.skill} · {quest.minutes}분</small></span><span className="difficulty">{quest.difficulty}</span><strong className="xp-reward">+{quest.xp} XP</strong><ChevronRight size={18}/></button>)}</div></div>
      <div className="ranking-panel"><div className="section-title compact"><div><span className="section-kicker">HALL OF FAME</span><h2>캐릭터 랭킹</h2></div><Medal/></div><div className="rank-filters"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>전체</button>{characters.map(c => <button key={c.id} className={filter === c.id ? "active" : ""} onClick={() => setFilter(c.id)} title={c.name}><c.icon size={16}/></button>)}</div><div className="rank-list">{visibleBoard.map(row => { const C=characters.find(c => c.id===row.character)!; return <div className="rank-row" key={`${row.handle}-${row.rank}`}><b className={`rank rank-${row.rank}`}>{row.rank}</b><span className="rank-avatar" style={{color:C.color}}><C.icon/></span><span><strong>{row.handle}</strong><small>{C.name} · Lv.{row.level}</small></span><em>{row.xp.toLocaleString()} XP</em></div>})}</div></div>
    </section>

    <footer><span><Swords size={17}/> AI QUEST ACADEMY</span><p>Domain Knowledge × Logical Thinking × Data × AI</p></footer>

    {showSetup && <div className="modal-backdrop"><div className="setup-modal"><button className="close-button" onClick={() => setShowSetup(false)} aria-label="닫기"><X/></button><span className="section-kicker">CREATE YOUR HERO</span><h2>첫 캐릭터를 선택하세요</h2><p>직업마다 특정 퀘스트에서 10% 보너스 경험치를 얻습니다.</p><label className="field-label">모험가 이름<input value={handle} onChange={e => setHandle(e.target.value)} maxLength={14} placeholder="예: 데이터용사" autoFocus/></label><div className="character-grid">{characters.map(c => { const Icon=c.icon; return <button key={c.id} className={character===c.id ? "selected" : ""} onClick={() => setCharacter(c.id)} style={{"--char":c.color} as React.CSSProperties}><Icon/><b>{c.name}</b><span>{c.role}</span><small>{c.perk}</small></button>})}</div><button className="primary-button full" onClick={saveProfile}><Sparkles size={18}/> 이 캐릭터로 시작</button>{!user && <p className="auth-note"><LockKeyhole size={14}/> 저장과 랭킹 참여는 로그인 후 이용할 수 있습니다.</p>}</div></div>}

    {activeQuest && <div className="modal-backdrop"><div className="quest-modal"><button className="close-button" onClick={() => {setActiveQuest(null);setAnswer(null)}} aria-label="닫기"><X/></button><div className="quest-modal-top"><span>WEEK {activeQuest.week}</span><em>+{activeQuest.xp} XP</em></div><h2>{activeQuest.title}</h2><p className="lesson-note"><b>핵심 원리</b> 큰 문제는 관찰 가능한 단위로 나누고, 각 단계에 측정값을 붙인 뒤 가장 큰 병목부터 검증합니다.</p><h3>{activeQuest.prompt}</h3><div className="answers">{activeQuest.choices.map((choice,i) => <button key={choice} onClick={() => setAnswer(i)} className={answer===i ? (i===activeQuest.answer ? "correct":"wrong") : ""}><span>{i+1}</span>{choice}{answer===i && i===activeQuest.answer && <Check/>}</button>)}</div>{answer!==null && <div className={answer===activeQuest.answer ? "feedback good":"feedback"}>{answer===activeQuest.answer ? activeQuest.feedback : "조금 아쉽네요. 문제를 측정 가능한 단계로 나누는 선택지를 다시 살펴보세요."}</div>}<button className="primary-button full" disabled={answer!==activeQuest.answer || completed.includes(activeQuest.id)} onClick={finishQuest}>{completed.includes(activeQuest.id) ? "완료한 퀘스트":"퀘스트 완료하고 XP 받기"}</button></div></div>}
    {notice && <button className="toast" onClick={() => setNotice("")}>{notice}<X size={15}/></button>}
  </main>;
}
