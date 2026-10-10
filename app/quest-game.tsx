"use client";

import { BarChart3, BrainCircuit, Check, ChevronRight, Database, Flame, HeartPulse, Home, LockKeyhole, LogOut, Map, Medal, Menu, Play, ScrollText, ShieldCheck, Sparkles, Swords, Trophy, UserRound, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { quests, type Quest } from "./quest-data";

type CharacterId = "strategist" | "analyst" | "engineer" | "guardian";
type User = { displayName: string; email: string } | null;
type Profile = { handle: string; character: CharacterId; avatar: string; xp: number; streak: number; rating?: number; wins?: number; losses?: number };
type BoardRow = Profile & { rank: number; level: number; isNpc?: boolean };
type BattleRecord = { id: number; opponentHandle: string; result: "win" | "loss"; ratingDelta: number; tactic: string; createdAt: string };

const characters = [
  { id: "strategist" as const, name: "전략가", role: "문제 구조화", icon: BrainCircuit, color: "#7c9cff", perk: "논리 퀘스트 XP +10%" },
  { id: "analyst" as const, name: "분석술사", role: "통계 · SQL", icon: BarChart3, color: "#ba7cff", perk: "데이터 퀘스트 XP +10%" },
  { id: "engineer" as const, name: "AI 공학자", role: "Python · AI", icon: Zap, color: "#5de4dc", perk: "실습 퀘스트 XP +10%" },
  { id: "guardian" as const, name: "운영 수호자", role: "병원 경영 적용", icon: HeartPulse, color: "#ffbe55", perk: "프로젝트 XP +10%" },
];

const avatars = [
  { id: "female-strategist", name: "서린", gender: "여성", character: "strategist" as const, image: "/avatars/female-strategist.png" },
  { id: "female-guardian", name: "리아", gender: "여성", character: "guardian" as const, image: "/avatars/female-guardian.png" },
  { id: "female-analyst", name: "수안", gender: "여성", character: "analyst" as const, image: "/avatars/female-analyst.png" },
  { id: "female-engineer", name: "카엘", gender: "여성", character: "engineer" as const, image: "/avatars/female-engineer.png" },
  { id: "male-strategist", name: "시온", gender: "남성", character: "strategist" as const, image: "/avatars/male-strategist.png" },
  { id: "male-analyst", name: "온유", gender: "남성", character: "analyst" as const, image: "/avatars/male-analyst.png" },
  { id: "male-guardian", name: "건우", gender: "남성", character: "guardian" as const, image: "/avatars/male-guardian.png" },
  { id: "male-engineer", name: "지한", gender: "남성", character: "engineer" as const, image: "/avatars/male-engineer.png" },
];

const avatarPath = (id?: string) => avatars.find(item => item.id === id)?.image ?? avatars[0].image;

const worlds = [
  { id: 1, title: "사고의 숲", weeks: "1–2주", icon: BrainCircuit, color: "#7c9cff", topics: "문제 구조화 · 확률 · 편향" },
  { id: 2, title: "데이터 광산", weeks: "3–4주", icon: Database, color: "#ba7cff", topics: "데이터 품질 · 통계 · SQL" },
  { id: 3, title: "AI 공방", weeks: "5–6주", icon: Sparkles, color: "#5de4dc", topics: "프롬프트 · 검증 · 자동화" },
  { id: 4, title: "시스템 성채", weeks: "7–8주", icon: ShieldCheck, color: "#ffbe55", topics: "알고리즘 · DB · API · 보안" },
  { id: 5, title: "추론의 정상", weeks: "9–10주", icon: Trophy, color: "#ff7597", topics: "인과 · 실험 · 최적화" },
];

const npcRows: BoardRow[] = [
  { rank: 1, handle: "논리기사", character: "strategist", avatar: "male-strategist", xp: 4860, streak: 19, level: 10, isNpc: true },
  { rank: 2, handle: "데이터별", character: "analyst", avatar: "female-analyst", xp: 4210, streak: 14, level: 9, isNpc: true },
  { rank: 3, handle: "AI연금술사", character: "engineer", avatar: "female-engineer", xp: 3790, streak: 11, level: 8, isNpc: true },
  { rank: 4, handle: "병목추적자", character: "guardian", avatar: "male-guardian", xp: 3150, streak: 9, level: 7, isNpc: true },
  { rank: 5, handle: "가설탐험가", character: "strategist", avatar: "female-strategist", xp: 2640, streak: 7, level: 6, isNpc: true },
];

const getLevel = (xp: number) => Math.floor(xp / 500) + 1;
const getLevelProgress = (xp: number) => (xp % 500) / 5;

export default function QuestGame({ user, signInPath, signOutPath }: { user: User; signInPath: string; signOutPath: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leaderboard, setLeaderboard] = useState<BoardRow[]>(npcRows);
  const [myRank, setMyRank] = useState<BoardRow | null>(null);
  const [filter, setFilter] = useState<"all" | CharacterId>("all");
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [handle, setHandle] = useState("");
  const [character, setCharacter] = useState<CharacterId>("strategist");
  const [avatar, setAvatar] = useState("female-strategist");
  const [tab, setTab] = useState<"map" | "quests" | "rank" | "battle">("map");
  const [selectedWorld, setSelectedWorld] = useState(1);
  const [battleOpponents, setBattleOpponents] = useState<BoardRow[]>([]);
  const [battleLog, setBattleLog] = useState<BattleRecord[]>([]);
  const [battleResult, setBattleResult] = useState<{ result: "win" | "loss"; opponent: string; delta: number; opponentTactic: string } | null>(null);
  const [battling, setBattling] = useState(false);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(r => r.ok ? r.json() : null).then(data => { if (data?.profile) { setProfile(data.profile); setCompleted(data.completions ?? []); setAvatar(data.profile.avatar ?? "female-strategist"); setCharacter(data.profile.character); } else if (user) setShowSetup(true); }).catch(() => undefined);
    fetch("/api/leaderboard").then(r => r.ok ? r.json() : null).then(data => {
      const merged = [...(data?.rows ?? []), ...npcRows].sort((a, b) => b.xp - a.xp).map((row, index) => ({ ...row, rank: index + 1, level: getLevel(row.xp) }));
      setLeaderboard(merged);
      if (data?.me) setMyRank({ ...data.me, rank: merged.filter(row => row.xp > data.me.xp).length + 1, level: getLevel(data.me.xp) });
    }).catch(() => undefined);
    if (user) fetch("/api/battle").then(r => r.ok ? r.json() : null).then(data => { if (data) { setBattleOpponents(data.opponents ?? []); setBattleLog(data.battles ?? []); } }).catch(() => undefined);
  }, [user]);

  const visibleBoard = useMemo(() => leaderboard.filter(row => filter === "all" || row.character === filter).slice(0, 7), [leaderboard, filter]);
  const level = getLevel(profile?.xp ?? 0);
  const unlockedWorlds = useMemo(() => {
    const unlocked = [1];
    for (let world = 2; world <= 5; world++) {
      const previousDone = quests.filter(q => q.world === world - 1).every(q => completed.includes(q.id));
      if (previousDone && unlocked.includes(world - 1)) unlocked.push(world);
    }
    return unlocked;
  }, [completed]);
  const nextQuest = quests.find(q => unlockedWorlds.includes(q.world) && !completed.includes(q.id)) ?? quests[quests.length - 1];
  const currentStage = worlds.find(w => w.id === nextQuest.world)?.title ?? worlds[0].title;
  const selectedWorldQuests = quests.filter(q => q.world === selectedWorld);
  const progressPercent = Math.round((completed.length / quests.length) * 100);

  async function saveProfile() {
    if (!handle.trim()) return setNotice("모험가 이름을 입력해 주세요.");
    const draft = { handle: handle.trim().slice(0, 14), character, avatar, xp: profile?.xp ?? 0, streak: profile?.streak ?? 1 };
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
    setShowExplanation(false); setActiveQuest(null); setAnswer(null);
  }

  async function startBattle(opponent: BoardRow, tactic: "strike" | "guard" | "insight") {
    if (!user) return location.assign(signInPath);
    if (!profile || battling) return;
    setBattling(true);
    const response = await fetch("/api/battle", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ opponentHandle: opponent.handle, tactic }) }).catch(() => null);
    const data = response?.ok ? await response.json() : null;
    setBattling(false);
    if (!data) return setNotice("대전을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    setBattleResult({ result: data.result, opponent: opponent.handle, delta: data.ratingDelta, opponentTactic: data.opponentTactic });
    setProfile(p => p ? { ...p, rating: data.rating, wins: data.wins, losses: data.losses } : p);
    const refreshed = await fetch("/api/battle").then(r => r.ok ? r.json() : null).catch(() => null);
    if (refreshed) { setBattleOpponents(refreshed.opponents ?? []); setBattleLog(refreshed.battles ?? []); }
  }

  const begin = () => profile ? setActiveQuest(nextQuest) : user ? setShowSetup(true) : location.assign(signInPath);
  const goTo = (id: string, nextTab?: "map" | "quests" | "rank" | "battle") => { if (nextTab) setTab(nextTab); setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return <main className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => goTo("home", "map")} aria-label="홈으로"><span className="brand-mark"><Swords size={20}/></span><span>AI QUEST</span><b>ACADEMY</b></button>
      <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="주 메뉴">
        {([['map','월드맵','map'],['quests','일자별 학습','quests'],['battle','배틀넷','battle'],['rank','랭킹','rank']] as const).map(([id,label,target]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => goTo(target, id)}>{label}</button>)}
      </nav>
      <div className="top-actions"><div className="status-hud" aria-label="현재 학습 상태"><span><small>LEVEL</small><strong>{level}</strong></span><span><small>XP</small><strong>{(profile?.xp ?? 0).toLocaleString()}</strong></span><span><small>STAGE</small><strong>{currentStage}</strong></span></div>{user ? <a className="ghost-button" href={signOutPath} title="로그아웃"><LogOut size={18}/><span>로그아웃</span></a> : <a className="login-button" href={signInPath} target="_top"><UserRound size={17}/> 로그인</a>}<button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴"><Menu/></button></div>
    </header>

    <section className="hero-panel" id="home">
      <div className="hero-copy"><div className="eyebrow"><span/> SEASON 01 · 10주 집중 성장 원정대</div><h1>생각을 무기로,<br/><em>데이터를 마법으로.</em></h1><p>5개 월드와 50일 퀘스트로 논리·데이터·AI·시스템·의사결정을 정복하세요. 월드의 퀘스트를 모두 끝내면 날짜와 관계없이 다음 단계가 즉시 열립니다.</p><div className="hero-actions"><button className="primary-button" onClick={begin}><Play size={18} fill="currentColor"/> {profile ? "다음 퀘스트" : "모험 시작하기"}</button><button className="secondary-button" onClick={() => goTo("quests", "quests")}>일자별 과정 보기 <ChevronRight size={18}/></button></div><div className="hero-trust"><ShieldCheck size={16}/> 주 5일 · 하루 18~30분 · 10주 완주 · 완료 즉시 다음 월드 개방</div></div>
      <div className="party-art" aria-label="전략가, 분석술사, AI 공학자, 운영 수호자 캐릭터 파티"><img src="/quest-party.png" alt="네 명의 AI 학습 RPG 캐릭터"/><div className="party-badge"><span>현재 모험가</span><strong>{profile?.handle ?? "캐릭터를 선택하세요"}</strong></div></div>
    </section>

    <span className="section-anchor" id="profile"/>
    <section className="dashboard-grid">
      <article className="progress-card"><div className="card-heading"><div><span className="section-kicker">MY PROGRESS</span><h2>{profile ? `${profile.handle}의 성장 기록` : "당신의 모험 기록"}</h2></div><Flame className="flame"/></div><div className="progress-body"><div className="level-orb"><span>LV</span><strong>{level}</strong><small>{characters.find(c => c.id === profile?.character)?.name ?? "새싹 모험가"}</small></div><div className="xp-area"><div className="xp-label"><strong>{profile?.xp ?? 0} XP</strong><span>다음 레벨까지 {500 - ((profile?.xp ?? 0) % 500)} XP</span></div><div className="xp-track"><span style={{ width: `${getLevelProgress(profile?.xp ?? 0)}%` }}/></div><div className="stat-row"><span><Flame size={17}/>연속 학습 <b>{profile?.streak ?? 0}일</b></span><span><Check size={17}/>완료 퀘스트 <b>{completed.length}개</b></span></div></div></div></article>
      <article className="daily-card"><div className="daily-icon"><BrainCircuit/></div><div><span className="section-kicker">TODAY&apos;S QUEST</span><h2>{nextQuest.title}</h2><p>{nextQuest.skill} · 약 {nextQuest.minutes}분</p></div><button onClick={() => profile ? setActiveQuest(nextQuest) : setShowSetup(true)} aria-label="오늘의 퀘스트 시작"><ChevronRight/></button></article>
    </section>

    <section className="content-section" id="map"><div className="section-title"><div><span className="section-kicker">10-WEEK CAMPAIGN</span><h2>5개 월드, 50일 성장 지도</h2><p>각 월드의 10개 퀘스트를 완료하면 날짜를 기다리지 않고 다음 월드가 바로 열립니다.</p></div><span className="season-progress">전체 진행도 <b>{progressPercent}%</b></span></div><div className="world-map">{worlds.map((world,index) => { const Icon=world.icon; const unlocked=unlockedWorlds.includes(world.id); const done=quests.filter(q=>q.world===world.id).filter(q=>completed.includes(q.id)).length; return <button className={`world ${unlocked ? selectedWorld===world.id ? "current":"open" : "locked"}`} key={world.id} disabled={!unlocked} onClick={() => { setSelectedWorld(world.id); goTo("quests","quests"); }}><div className="world-node" style={{"--world":world.color} as React.CSSProperties}>{unlocked ? <Icon/> : <LockKeyhole/>}</div>{index < worlds.length-1 && <span className="world-line"/>}<small>{world.weeks} · {done}/10 완료</small><h3>{world.title}</h3><p>{world.topics}</p></button>})}</div></section>

    <section className="curriculum-panel" id="quests"><div className="section-title"><div><span className="section-kicker">DAILY QUEST PLAN</span><h2>{worlds.find(w=>w.id===selectedWorld)?.title} · 일자별 학습</h2><p>주 5일 분량입니다. 열린 월드에서는 원하는 날짜의 퀘스트를 바로 선택할 수 있습니다.</p></div><span className="season-progress">{selectedWorldQuests.filter(q=>completed.includes(q.id)).length}/10 완료</span></div><div className="week-grid">{[...new Set(selectedWorldQuests.map(q=>q.week))].map(week => <article className="week-card" key={week}><div className="week-heading"><span>WEEK {week}</span><b>{selectedWorldQuests.filter(q=>q.week===week && completed.includes(q.id)).length}/5</b></div><div className="day-list">{selectedWorldQuests.filter(q=>q.week===week).map(quest => <button key={quest.id} className={completed.includes(quest.id) ? "day-quest done":"day-quest"} onClick={() => profile ? setActiveQuest(quest) : setShowSetup(true)}><span>{completed.includes(quest.id) ? <Check/> : `DAY ${quest.day}`}</span><div><b>{quest.title}</b><small>{quest.skill} · {quest.minutes}분 · +{quest.xp} XP</small></div><ChevronRight/></button>)}</div></article>)}</div></section>

    <section className="two-column battle-rank-row"><div className="battle-panel" id="battle"><div className="section-title compact"><div><span className="section-kicker">BATTLE NET</span><h2>모험가 배틀넷</h2></div><Swords/></div><div className="battle-stats"><span><small>RATING</small><b>{profile?.rating ?? 1000}</b></span><span><small>WIN</small><b>{profile?.wins ?? 0}</b></span><span><small>LOSS</small><b>{profile?.losses ?? 0}</b></span></div><p className="battle-guide">상대 캐릭터를 선택하고 전술을 고르세요. 강공은 통찰에, 통찰은 방어에, 방어는 강공에 유리합니다.</p><div className="opponent-list">{battleOpponents.length ? battleOpponents.slice(0,4).map(opponent => <article className="opponent-card" key={opponent.handle}><img src={avatarPath(opponent.avatar)} alt={`${opponent.handle} 캐릭터`}/><div><b>{opponent.handle}</b><small>{characters.find(c=>c.id===opponent.character)?.name} · Lv.{opponent.level} · R {opponent.rating ?? 1000}</small><div className="tactic-buttons"><button disabled={battling} onClick={()=>startBattle(opponent,"strike")}>강공</button><button disabled={battling} onClick={()=>startBattle(opponent,"guard")}>방어</button><button disabled={battling} onClick={()=>startBattle(opponent,"insight")}>통찰</button></div></div></article>) : <div className="battle-empty">{user ? "아직 도전할 다른 모험가가 없습니다. 새로운 모험가가 가입하면 이곳에 나타납니다." : "로그인하고 캐릭터를 만들면 다른 모험가와 대전할 수 있습니다."}</div>}</div>{battleLog.length>0 && <div className="battle-log"><b>최근 대전</b>{battleLog.slice(0,4).map(item=><span key={item.id}><em className={item.result}>{item.result==="win"?"승리":"패배"}</em>{item.opponentHandle}<small>{item.ratingDelta>0?"+":""}{item.ratingDelta}</small></span>)}</div>}</div>
      <div className="ranking-panel" id="rank"><div className="section-title compact"><div><span className="section-kicker">HALL OF FAME</span><h2>캐릭터 랭킹</h2></div><Medal/></div><div className="rank-filters"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>전체</button>{characters.map(c => <button key={c.id} className={filter === c.id ? "active" : ""} onClick={() => setFilter(c.id)} title={c.name}><c.icon size={16}/></button>)}</div><div className="rank-list">{visibleBoard.map(row => { const C=characters.find(c => c.id===row.character)!; return <div className="rank-row" key={`${row.handle}-${row.rank}`}><b className={`rank rank-${row.rank}`}>{row.rank}</b><span className="rank-avatar"><img src={avatarPath(row.avatar)} alt=""/></span><span><strong>{row.handle}</strong><small>{C.name} · Lv.{row.level}</small></span><em>{row.xp.toLocaleString()} XP</em></div>})}</div><div className="my-rank-card">{myRank ? <><b>{myRank.rank}위</b><img src={avatarPath(myRank.avatar)} alt="내 캐릭터"/><span><small>MY RANK</small><strong>{myRank.handle}</strong><em>{characters.find(c => c.id === myRank.character)?.name} · Lv.{myRank.level}</em></span><strong>{myRank.xp.toLocaleString()} XP</strong></> : <p>{user ? "캐릭터를 만들면 내 순위가 표시됩니다." : "로그인하면 내 순위를 확인할 수 있습니다."}</p>}</div></div>
    </section>

    <footer><span><Swords size={17}/> AI QUEST ACADEMY</span><p>Domain Knowledge × Logical Thinking × Data × AI</p></footer>

    <nav className="bottom-nav" aria-label="빠른 이동">
      <button onClick={() => goTo("home", "map")}><Home/><span>홈</span></button>
      <button className={tab === "map" ? "active" : ""} onClick={() => goTo("map", "map")}><Map/><span>월드맵</span></button>
      <button className={tab === "quests" ? "active" : ""} onClick={() => goTo("quests", "quests")}><ScrollText/><span>퀘스트</span></button>
      <button className={tab === "battle" ? "active" : ""} onClick={() => goTo("battle", "battle")}><Swords/><span>배틀넷</span></button>
      <button className={tab === "rank" ? "active" : ""} onClick={() => goTo("rank", "rank")}><Trophy/><span>랭킹</span></button>
      <button onClick={() => goTo("profile")}><UserRound/><span>내 성장</span></button>
    </nav>

    {showSetup && <div className="modal-backdrop"><div className="setup-modal avatar-setup"><button className="close-button" onClick={() => setShowSetup(false)} aria-label="닫기"><X/></button><span className="section-kicker">CREATE YOUR HERO</span><h2>나의 캐릭터를 선택하세요</h2><p>얼굴과 직업을 함께 고르세요. 직업마다 특정 퀘스트에서 10% 보너스 XP를 얻습니다.</p><label className="field-label">모험가 이름<input value={handle} onChange={e => setHandle(e.target.value)} maxLength={14} placeholder="예: 데이터용사" autoFocus/></label><div className="avatar-grid">{avatars.map(item => { const C=characters.find(c => c.id === item.character)!; return <button key={item.id} className={avatar===item.id ? "selected" : ""} onClick={() => { setAvatar(item.id); setCharacter(item.character); }} style={{"--char":C.color} as React.CSSProperties}><span className="avatar-image"><img src={item.image} alt={`${item.name} ${C.name} 캐릭터`}/><em>{item.gender}</em></span><b>{item.name}</b><strong>{C.name}</strong><small>{C.role}</small></button>})}</div><button className="primary-button full" onClick={saveProfile}><Sparkles size={18}/> 이 캐릭터로 시작</button>{!user && <p className="auth-note"><LockKeyhole size={14}/> 저장과 랭킹 참여는 로그인 후 이용할 수 있습니다.</p>}</div></div>}

    {battleResult && <div className="modal-backdrop result-backdrop"><div className={`battle-result-modal ${battleResult.result}`}><button className="close-button" onClick={()=>setBattleResult(null)} aria-label="대전 결과 닫기"><X/></button><span className="section-kicker">BATTLE RESULT</span><Swords className="battle-result-icon"/><h2>{battleResult.result==="win"?"승리했습니다!":"다음 승리를 준비하세요"}</h2><p><b>{battleResult.opponent}</b>의 전술은 <strong>{battleResult.opponentTactic}</strong>이었습니다.</p><div className="rating-change">레이팅 {battleResult.delta>0?"+":""}{battleResult.delta}</div><button className="primary-button full" onClick={()=>setBattleResult(null)}>배틀넷으로 돌아가기</button></div></div>}

    {activeQuest && <div className="modal-backdrop"><div className="quest-modal"><button className="close-button" onClick={() => {setActiveQuest(null);setAnswer(null);setShowExplanation(false)}} aria-label="닫기"><X/></button><div className="quest-modal-top"><span>WEEK {activeQuest.week} · DAY {activeQuest.day}</span><em>+{activeQuest.xp} XP</em></div><h2>{activeQuest.title}</h2><p className="lesson-note"><b>오늘의 핵심</b>{activeQuest.lesson}</p><h3>{activeQuest.prompt}</h3><div className="answers">{activeQuest.choices.map((choice,i) => <button key={choice} onClick={() => { setAnswer(i); if (i === activeQuest.answer) setShowExplanation(true); }} className={answer===i ? (i===activeQuest.answer ? "correct":"wrong") : ""}><span>{i+1}</span>{choice}{answer===i && i===activeQuest.answer && <Check/>}</button>)}</div>{answer!==null && answer!==activeQuest.answer && <div className="feedback lesson-feedback"><b>이 선택지에서 기억할 점</b>{activeQuest.choiceFeedback[answer]}</div>}<button className="primary-button full" disabled={answer!==activeQuest.answer || completed.includes(activeQuest.id)} onClick={() => setShowExplanation(true)}>{completed.includes(activeQuest.id) ? "완료한 퀘스트":"정답 비교 해설 보기"}</button></div></div>}
    {activeQuest && showExplanation && answer===activeQuest.answer && <div className="modal-backdrop result-backdrop"><div className="answer-explanation-modal" role="dialog" aria-modal="true" aria-labelledby="answer-title"><button className="close-button" onClick={() => setShowExplanation(false)} aria-label="해설 닫기"><X/></button><span className="result-badge"><Check/> 정답입니다</span><h2 id="answer-title">선택지를 비교해 볼까요?</h2><p className="answer-summary">{activeQuest.feedback}</p><div className="choice-comparison">{activeQuest.choices.map((choice,i) => <div key={choice} className={i===activeQuest.answer ? "comparison-row correct-choice":"comparison-row"}><span>{i===activeQuest.answer ? <Check/> : i+1}</span><div><b>{choice}</b><p>{activeQuest.choiceFeedback[i]}</p></div></div>)}</div><button className="primary-button full" onClick={finishQuest}><Sparkles size={18}/> 설명 확인하고 퀘스트 완료</button></div></div>}
    {notice && <button className="toast" onClick={() => setNotice("")}>{notice}<X size={15}/></button>}
  </main>;
}
