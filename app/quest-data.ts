import questData from "./quests.data.json";

export type Quest = {
  id: string;
  world: number;
  week: number;
  day: number;
  dayInWeek: number;
  title: string;
  skill: string;
  lesson: string;
  minutes: number;
  xp: number;
  difficulty: string;
  prompt: string;
  choices: string[];
  answer: number;
  choiceFeedback: string[];
  choiceExamples: string[];
  feedback: string;
};

type QuestContent = Pick<
  Quest,
  | "title"
  | "skill"
  | "lesson"
  | "prompt"
  | "choices"
  | "answer"
  | "choiceFeedback"
  | "choiceExamples"
  | "feedback"
>;

const questContent = questData as QuestContent[];

export const quests: Quest[] = questContent.map((quest, index) => {
  const day = index + 1;
  const world = Math.ceil(day / 10);
  const week = Math.ceil(day / 5);

  return {
    ...quest,
    id: `d${String(day).padStart(2, "0")}`,
    world,
    week,
    day,
    dayInWeek: ((day - 1) % 5) + 1,
    minutes: 18 + ((day - 1) % 5) * 3,
    xp: 60 + (world - 1) * 10 + ((day - 1) % 5) * 5,
    difficulty: world < 2 ? "입문" : world < 4 ? "보통" : "심화",
  };
});
