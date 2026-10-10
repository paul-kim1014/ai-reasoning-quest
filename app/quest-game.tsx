"use client";

import { BarChart3, BrainCircuit, Check, ChevronRight, Database, Flame, HeartPulse, Home, LockKeyhole, LogOut, Map, Medal, Menu, Play, ScrollText, ShieldCheck, Sparkles, Swords, Trophy, UserRound, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CharacterId = "strategist" | "analyst" | "engineer" | "guardian";
type User = { displayName: string; email: string } | null;
type Profile = { handle: string; character: CharacterId; avatar: string; xp: number; streak: number };
type BoardRow = Profile & { rank: number; level: number; isNpc?: boolean };

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
  { id: 1, title: "사고의 숲", weeks: "1–8주", icon: BrainCircuit, color: "#7c9cff", topics: "논리 · 확률 · 문제 구조화", status: "current" },
  { id: 2, title: "데이터 광산", weeks: "9–20주", icon: Database, color: "#ba7cff", topics: "Excel · SQL · Python", status: "next" },
  { id: 3, title: "AI 공방", weeks: "21–30주", icon: Sparkles, color: "#5de4dc", topics: "프롬프트 · 리서치 · 자동화", status: "locked" },
  { id: 4, title: "시스템 성채", weeks: "31–40주", icon: ShieldCheck, color: "#ffbe55", topics: "알고리즘 · DB · API", status: "locked" },
  { id: 5, title: "추론의 정상", weeks: "41–52주", icon: Trophy, color: "#ff7597", topics: "베이즈 · 인과 · 최적화", status: "locked" },
];

const quests = [
  { id: "q1", world: 1, week: 1, title: "모호한 문제를 쪼개라", skill: "문제 구조화", minutes: 18, xp: 80, difficulty: "입문", prompt: "병원 대기시간이 길다는 문제를 가장 먼저 어떻게 바꾸면 좋을까요?", choices: ["직원에게 더 빨리 일하라고 한다", "접수·검사·진료·수납 단계별 대기시간을 나눈다", "새 시스템을 바로 구매한다"], answer: 1, choiceFeedback: ["속도를 재촉하는 것만으로는 어느 단계가 지연되는지 알 수 없습니다. 먼저 병목을 측정해야 개선 행동을 정확히 정할 수 있습니다.", "대기 과정을 단계별로 나누면 각 구간의 시간을 측정하고 가장 큰 병목을 찾을 수 있습니다.", "원인을 확인하기 전에 시스템을 구매하면 비용만 늘고 문제가 남을 수 있습니다. 필요한 기능은 병목을 확인한 뒤 결정하는 편이 안전합니다."], feedback: "정답은 대기 과정을 단계별로 나누는 것입니다. 다른 선택지는 원인을 확인하기 전에 사람을 재촉하거나 도구를 구매하지만, 정답은 측정 가능한 단위로 문제를 바꿔 실제 병목을 검증할 수 있게 합니다." },
  { id: "q2", world: 1, week: 2, title: "좋은 가설의 조건", skill: "가설 → 검증", minutes: 22, xp: 90, difficulty: "입문", prompt: "검증 가능한 가설은 어느 것일까요?", choices: ["환자는 늘 불편하다", "월요일 오전의 접수 인력 부족이 평균 대기시간을 15분 이상 늘린다", "병원은 더 좋아져야 한다"], answer: 1, choiceFeedback: ["‘늘 불편하다’는 대상과 측정 기준이 없어 사실 여부를 확인하기 어렵습니다. 관찰할 시간과 수치가 포함되어야 합니다.", "시간·원인·측정값이 구체적이어서 데이터로 지지하거나 반박할 수 있는 가설입니다.", "바람직한 목표이지만 검증할 원인과 수치가 없습니다. 무엇이 얼마나 바뀌어야 하는지 구체화해야 합니다."], feedback: "정답은 월요일 오전 접수 인력과 평균 대기시간을 연결한 문장입니다. 다른 선택지는 느낌이나 희망을 말하지만, 정답은 대상·시간·원인·수치를 명시해 데이터로 검증할 수 있습니다." },
  { id: "q3", world: 1, week: 3, title: "확률로 판단 업데이트", skill: "베이지안 사고", minutes: 25, xp: 110, difficulty: "보통", prompt: "새 증거가 들어왔을 때 합리적인 태도는?", choices: ["기존 결론을 고수한다", "증거의 신뢰도만큼 기존 믿음을 업데이트한다", "항상 최신 정보만 믿는다"], answer: 1, choiceFeedback: ["기존 결론을 고정하면 유용한 새 증거를 반영할 수 없습니다. 판단은 증거가 쌓일 때 수정 가능해야 합니다.", "새 증거의 신뢰도와 기존 정보의 강도를 함께 고려해 믿음의 크기를 조정하는 태도입니다.", "최신이라는 이유만으로 정보가 더 정확한 것은 아닙니다. 출처와 증거의 신뢰도를 평가한 뒤 반영해야 합니다."], feedback: "정답은 증거의 신뢰도만큼 기존 믿음을 업데이트하는 것입니다. 기존 결론만 고수하거나 최신 정보만 따르는 극단과 달리, 정답은 이전 정보와 새 증거의 강도를 함께 반영합니다." },
  { id: "q4", world: 2, week: 9, title: "첫 SQL 보상 상자", skill: "SELECT · WHERE", minutes: 30, xp: 130, difficulty: "보통", prompt: "응급실 환자 중 대기시간이 60분 이상인 행을 고르는 핵심 절은?", choices: ["ORDER BY", "WHERE", "GROUP BY"], answer: 1, choiceFeedback: ["ORDER BY는 선택된 결과의 정렬 순서를 정합니다. 특정 조건의 행을 거르는 기능은 아닙니다.", "WHERE는 행이 결과에 포함될 조건을 지정합니다. 따라서 대기시간이 60분 이상인 환자만 선택할 수 있습니다.", "GROUP BY는 같은 값을 가진 행을 묶어 집계할 때 사용합니다. 조건에 맞는 행을 먼저 고르는 역할은 WHERE가 담당합니다."], feedback: "정답은 WHERE입니다. ORDER BY는 결과를 정렬하고 GROUP BY는 행을 묶지만, WHERE만이 대기시간 60분 이상이라는 조건으로 필요한 행을 걸러냅니다." },
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
  const [activeQuest, setActiveQuest] = useState<(typeof quests)[number] | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [handle, setHandle] = useState("");
  const [character, setCharacter] = useState<CharacterId>("strategist");
  const [avatar, setAvatar] = useState("female-strategist");
  const [tab, setTab] = useState<"map" | "quests" | "rank">("map");
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(r => r.ok ? r.json() : null).then(data => { if (data?.profile) { setProfile(data.profile); setAvatar(data.profile.avatar ?? "female-strategist"); setCharacter(data.profile.character); } else if (user) setShowSetup(true); }).catch(() => undefined);
    fetch("/api/leaderboard").then(r => r.ok ? r.json() : null).then(data => {
      const merged = [...(data?.rows ?? []), ...npcRows].sort((a, b) => b.xp - a.xp).map((row, index) => ({ ...row, rank: index + 1, level: getLevel(row.xp) }));
      setLeaderboard(merged);
      if (data?.me) setMyRank({ ...data.me, rank: merged.filter(row => row.xp > data.me.xp).length + 1, level: getLevel(data.me.xp) });
    }).catch(() => undefined);
  }, [user]);

  const visibleBoard = useMemo(() => leaderboard.filter(row => filter === "all" || row.character === filter).slice(0, 7), [leaderboard, filter]);
  const level = getLevel(profile?.xp ?? 0);
  const nextQuest = quests.find(q => !completed.includes(q.id)) ?? quests[0];
  const currentStage = completed.length >= 3 ? "데이터 광산" : "사고의 숲";

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

  const begin = () => profile ? setActiveQuest(nextQuest) : user ? setShowSetup(true) : location.assign(signInPath);
  const goTo = (id: string, nextTab?: "map" | "quests" | "rank") => { if (nextTab) setTab(nextTab); setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return <main className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => goTo("home", "map")} aria-label="홈으로"><span className="brand-mark"><Swords size={20}/></span><span>AI QUEST</span><b>ACADEMY</b></button>
      <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="주 메뉴">
        {([['map','월드맵','map'],['quests','퀘스트','quests'],['rank','랭킹','rank']] as const).map(([id,label,target]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => goTo(target, id)}>{label}</button>)}
      </nav>
      <div className="top-actions"><div className="status-hud" aria-label="현재 학습 상태"><span><small>LEVEL</small><strong>{level}</strong></span><span><small>XP</small><strong>{(profile?.xp ?? 0).toLocaleString()}</strong></span><span><small>STAGE</small><strong>{currentStage}</strong></span></div>{user ? <a className="ghost-button" href={signOutPath} title="로그아웃"><LogOut size={18}/><span>로그아웃</span></a> : <a className="login-button" href={signInPath} target="_top"><UserRound size={17}/> 로그인</a>}<button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴"><Menu/></button></div>
    </header>

    <section className="hero-panel" id="home">
      <div className="hero-copy"><div className="eyebrow"><span/> SEASON 01 · 52주 성장 원정대</div><h1>생각을 무기로,<br/><em>데이터를 마법으로.</em></h1><p>병원 경영 현장의 문제를 풀며 논리·통계·SQL·Python·AI를 차례로 정복하세요. 매주 작은 승리가 실력과 레벨을 함께 키웁니다.</p><div className="hero-actions"><button className="primary-button" onClick={begin}><Play size={18} fill="currentColor"/> {profile ? "오늘의 퀘스트" : "모험 시작하기"}</button><button className="secondary-button" onClick={() => goTo("map", "map")}>커리큘럼 보기 <ChevronRight size={18}/></button></div><div className="hero-trust"><ShieldCheck size={16}/> 평일 1시간 + 주말 3시간 · 업무 사례 중심 · 주차별 체크포인트</div></div>
      <div className="party-art" aria-label="전략가, 분석술사, AI 공학자, 운영 수호자 캐릭터 파티"><img src="/quest-party.png" alt="네 명의 AI 학습 RPG 캐릭터"/><div className="party-badge"><span>현재 모험가</span><strong>{profile?.handle ?? "캐릭터를 선택하세요"}</strong></div></div>
    </section>

    <span className="section-anchor" id="profile"/>
    <section className="dashboard-grid">
      <article className="progress-card"><div className="card-heading"><div><span className="section-kicker">MY PROGRESS</span><h2>{profile ? `${profile.handle}의 성장 기록` : "당신의 모험 기록"}</h2></div><Flame className="flame"/></div><div className="progress-body"><div className="level-orb"><span>LV</span><strong>{level}</strong><small>{characters.find(c => c.id === profile?.character)?.name ?? "새싹 모험가"}</small></div><div className="xp-area"><div className="xp-label"><strong>{profile?.xp ?? 0} XP</strong><span>다음 레벨까지 {500 - ((profile?.xp ?? 0) % 500)} XP</span></div><div className="xp-track"><span style={{ width: `${getLevelProgress(profile?.xp ?? 0)}%` }}/></div><div className="stat-row"><span><Flame size={17}/>연속 학습 <b>{profile?.streak ?? 0}일</b></span><span><Check size={17}/>완료 퀘스트 <b>{completed.length}개</b></span></div></div></div></article>
      <article className="daily-card"><div className="daily-icon"><BrainCircuit/></div><div><span className="section-kicker">TODAY&apos;S QUEST</span><h2>{nextQuest.title}</h2><p>{nextQuest.skill} · 약 {nextQuest.minutes}분</p></div><button onClick={() => profile ? setActiveQuest(nextQuest) : setShowSetup(true)} aria-label="오늘의 퀘스트 시작"><ChevronRight/></button></article>
    </section>

    <section className="content-section" id="map"><div className="section-title"><div><span className="section-kicker">YEAR-LONG CAMPAIGN</span><h2>5개 월드, 52주 성장 지도</h2><p>기초 사고부터 고급 의사결정까지, 앞 단계가 다음 능력을 열어줍니다.</p></div><span className="season-progress">시즌 진행도 <b>{completed.length}%</b></span></div><div className="world-map">{worlds.map((world,index) => { const Icon=world.icon; return <div className={`world ${world.status}`} key={world.id}><div className="world-node" style={{"--world":world.color} as React.CSSProperties}>{world.status === "locked" ? <LockKeyhole/> : <Icon/>}</div>{index < worlds.length-1 && <span className="world-line"/>}<small>{world.weeks}</small><h3>{world.title}</h3><p>{world.topics}</p></div>})}</div></section>

    <section className="two-column"><div className="quest-list-panel" id="quests"><div className="section-title compact"><div><span className="section-kicker">ACTIVE MISSIONS</span><h2>이번 챕터 퀘스트</h2></div><button onClick={() => goTo("quests", "quests")}>전체 보기</button></div><div className="quest-list">{quests.slice(0,3).map((quest,i) => <button className="quest-row" key={quest.id} onClick={() => profile ? setActiveQuest(quest) : setShowSetup(true)}><span className={`quest-number ${completed.includes(quest.id) ? "done" : ""}`}>{completed.includes(quest.id) ? <Check/> : i+1}</span><span className="quest-main"><b>{quest.title}</b><small>{quest.skill} · {quest.minutes}분</small></span><span className="difficulty">{quest.difficulty}</span><strong className="xp-reward">+{quest.xp} XP</strong><ChevronRight size={18}/></button>)}</div></div>
      <div className="ranking-panel" id="rank"><div className="section-title compact"><div><span className="section-kicker">HALL OF FAME</span><h2>캐릭터 랭킹</h2></div><Medal/></div><div className="rank-filters"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>전체</button>{characters.map(c => <button key={c.id} className={filter === c.id ? "active" : ""} onClick={() => setFilter(c.id)} title={c.name}><c.icon size={16}/></button>)}</div><div className="rank-list">{visibleBoard.map(row => { const C=characters.find(c => c.id===row.character)!; return <div className="rank-row" key={`${row.handle}-${row.rank}`}><b className={`rank rank-${row.rank}`}>{row.rank}</b><span className="rank-avatar"><img src={avatarPath(row.avatar)} alt=""/></span><span><strong>{row.handle}</strong><small>{C.name} · Lv.{row.level}</small></span><em>{row.xp.toLocaleString()} XP</em></div>})}</div><div className="my-rank-card">{myRank ? <><b>{myRank.rank}위</b><img src={avatarPath(myRank.avatar)} alt="내 캐릭터"/><span><small>MY RANK</small><strong>{myRank.handle}</strong><em>{characters.find(c => c.id === myRank.character)?.name} · Lv.{myRank.level}</em></span><strong>{myRank.xp.toLocaleString()} XP</strong></> : <p>{user ? "캐릭터를 만들면 내 순위가 표시됩니다." : "로그인하면 내 순위를 확인할 수 있습니다."}</p>}</div></div>
    </section>

    <footer><span><Swords size={17}/> AI QUEST ACADEMY</span><p>Domain Knowledge × Logical Thinking × Data × AI</p></footer>

    <nav className="bottom-nav" aria-label="빠른 이동">
      <button onClick={() => goTo("home", "map")}><Home/><span>홈</span></button>
      <button className={tab === "map" ? "active" : ""} onClick={() => goTo("map", "map")}><Map/><span>월드맵</span></button>
      <button className={tab === "quests" ? "active" : ""} onClick={() => goTo("quests", "quests")}><ScrollText/><span>퀘스트</span></button>
      <button className={tab === "rank" ? "active" : ""} onClick={() => goTo("rank", "rank")}><Trophy/><span>랭킹</span></button>
      <button onClick={() => goTo("profile")}><UserRound/><span>내 성장</span></button>
    </nav>

    {showSetup && <div className="modal-backdrop"><div className="setup-modal avatar-setup"><button className="close-button" onClick={() => setShowSetup(false)} aria-label="닫기"><X/></button><span className="section-kicker">CREATE YOUR HERO</span><h2>나의 캐릭터를 선택하세요</h2><p>얼굴과 직업을 함께 고르세요. 직업마다 특정 퀘스트에서 10% 보너스 XP를 얻습니다.</p><label className="field-label">모험가 이름<input value={handle} onChange={e => setHandle(e.target.value)} maxLength={14} placeholder="예: 데이터용사" autoFocus/></label><div className="avatar-grid">{avatars.map(item => { const C=characters.find(c => c.id === item.character)!; return <button key={item.id} className={avatar===item.id ? "selected" : ""} onClick={() => { setAvatar(item.id); setCharacter(item.character); }} style={{"--char":C.color} as React.CSSProperties}><span className="avatar-image"><img src={item.image} alt={`${item.name} ${C.name} 캐릭터`}/><em>{item.gender}</em></span><b>{item.name}</b><strong>{C.name}</strong><small>{C.role}</small></button>})}</div><button className="primary-button full" onClick={saveProfile}><Sparkles size={18}/> 이 캐릭터로 시작</button>{!user && <p className="auth-note"><LockKeyhole size={14}/> 저장과 랭킹 참여는 로그인 후 이용할 수 있습니다.</p>}</div></div>}

    {activeQuest && <div className="modal-backdrop"><div className="quest-modal"><button className="close-button" onClick={() => {setActiveQuest(null);setAnswer(null);setShowExplanation(false)}} aria-label="닫기"><X/></button><div className="quest-modal-top"><span>WEEK {activeQuest.week}</span><em>+{activeQuest.xp} XP</em></div><h2>{activeQuest.title}</h2><p className="lesson-note"><b>핵심 원리</b> 큰 문제는 관찰 가능한 단위로 나누고, 각 단계에 측정값을 붙인 뒤 가장 큰 병목부터 검증합니다.</p><h3>{activeQuest.prompt}</h3><div className="answers">{activeQuest.choices.map((choice,i) => <button key={choice} onClick={() => { setAnswer(i); if (i === activeQuest.answer) setShowExplanation(true); }} className={answer===i ? (i===activeQuest.answer ? "correct":"wrong") : ""}><span>{i+1}</span>{choice}{answer===i && i===activeQuest.answer && <Check/>}</button>)}</div>{answer!==null && answer!==activeQuest.answer && <div className="feedback lesson-feedback"><b>이 선택지에서 기억할 점</b>{activeQuest.choiceFeedback[answer]}</div>}<button className="primary-button full" disabled={answer!==activeQuest.answer || completed.includes(activeQuest.id)} onClick={() => setShowExplanation(true)}>{completed.includes(activeQuest.id) ? "완료한 퀘스트":"정답 비교 해설 보기"}</button></div></div>}
    {activeQuest && showExplanation && answer===activeQuest.answer && <div className="modal-backdrop result-backdrop"><div className="answer-explanation-modal" role="dialog" aria-modal="true" aria-labelledby="answer-title"><button className="close-button" onClick={() => setShowExplanation(false)} aria-label="해설 닫기"><X/></button><span className="result-badge"><Check/> 정답입니다</span><h2 id="answer-title">선택지를 비교해 볼까요?</h2><p className="answer-summary">{activeQuest.feedback}</p><div className="choice-comparison">{activeQuest.choices.map((choice,i) => <div key={choice} className={i===activeQuest.answer ? "comparison-row correct-choice":"comparison-row"}><span>{i===activeQuest.answer ? <Check/> : i+1}</span><div><b>{choice}</b><p>{activeQuest.choiceFeedback[i]}</p></div></div>)}</div><button className="primary-button full" onClick={finishQuest}><Sparkles size={18}/> 설명 확인하고 퀘스트 완료</button></div></div>}
    {notice && <button className="toast" onClick={() => setNotice("")}>{notice}<X size={15}/></button>}
  </main>;
}
