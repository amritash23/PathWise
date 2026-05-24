import type { Difficulty, McqQuestion } from "../models/TestAttempt";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function qid(skill: string, difficulty: Difficulty, slug: string) {
  return `${skill}:${difficulty}:${slug}`.toLowerCase().replace(/\s+/g, "-");
}

const BANK: McqQuestion[] = [
  {
    id: qid("JavaScript", "beginner", "closure"),
    skill: "JavaScript",
    difficulty: "beginner",
    prompt: "What is a closure in JavaScript?",
    options: [
      "A function bundled with its lexical environment",
      "A loop that closes over variables automatically",
      "A class that encapsulates data",
      "A JSON object stored in memory"
    ],
    correctIndex: 0,
    explain: "Closures allow a function to access variables from an outer scope even after the outer function has returned."
  },
  {
    id: qid("React", "beginner", "state-props"),
    skill: "React",
    difficulty: "beginner",
    prompt: "Which statement best describes props in React?",
    options: ["Mutable component data", "Read-only inputs passed to components", "Global state storage", "DOM attributes only"],
    correctIndex: 1
  },
  {
    id: qid("SQL", "beginner", "where-vs-having"),
    skill: "SQL",
    difficulty: "beginner",
    prompt: "What is the main difference between WHERE and HAVING?",
    options: [
      "WHERE filters rows before grouping; HAVING filters groups after aggregation",
      "HAVING filters rows before grouping; WHERE filters groups after aggregation",
      "They are identical",
      "WHERE is for JOINs only"
    ],
    correctIndex: 0
  },
  {
    id: qid("Python", "beginner", "list-vs-tuple"),
    skill: "Python",
    difficulty: "beginner",
    prompt: "What is a key difference between lists and tuples in Python?",
    options: ["Tuples are mutable", "Lists are immutable", "Tuples are immutable", "Lists cannot contain mixed types"],
    correctIndex: 2
  },
  {
    id: qid("Docker", "intermediate", "image-vs-container"),
    skill: "Docker",
    difficulty: "intermediate",
    prompt: "What is the best description of a Docker image?",
    options: [
      "A running instance of an application",
      "A read-only template used to create containers",
      "A volume for persistent storage",
      "A network namespace"
    ],
    correctIndex: 1
  },
  {
    id: qid("Node.js", "intermediate", "event-loop"),
    skill: "Node.js",
    difficulty: "intermediate",
    prompt: "What does the Node.js event loop primarily handle?",
    options: [
      "Compiling TypeScript",
      "Scheduling and executing async callbacks/non-blocking I/O",
      "Rendering UI components",
      "Encrypting environment variables"
    ],
    correctIndex: 1
  },
  {
    id: qid("Cybersecurity", "advanced", "least-privilege"),
    skill: "Cybersecurity",
    difficulty: "advanced",
    prompt: "Which principle reduces blast radius by limiting access permissions?",
    options: ["Fail-open", "Least privilege", "Security by obscurity", "Over-provisioning"],
    correctIndex: 1
  }
];

function buildTemplateQuestion(skill: string, difficulty: Difficulty, idx: number): McqQuestion {
  const base = {
    beginner: {
      prompt: `In ${skill}, which option is the best practice for beginners?`,
      options: ["Skip fundamentals and jump to frameworks", "Practice fundamentals and build small projects", "Avoid debugging", "Never read documentation"],
      correctIndex: 1
    },
    intermediate: {
      prompt: `For intermediate ${skill}, what improves reliability the most?`,
      options: ["No tests and fast shipping", "Observability + tests + clear interfaces", "Hardcoding configs", "Ignoring edge cases"],
      correctIndex: 1
    },
    advanced: {
      prompt: `At an advanced level in ${skill}, what is the most important trade-off to manage?`,
      options: ["Only performance", "Performance vs maintainability vs security", "Only UI design", "Only cost"],
      correctIndex: 1
    }
  }[difficulty];

  return {
    id: qid(skill, difficulty, `template-${idx}`),
    skill,
    difficulty,
    prompt: base.prompt,
    options: base.options,
    correctIndex: base.correctIndex,
    explain: "Template question used when a dedicated bank question is unavailable."
  };
}

export function generateMcqTest(input: { skills: string[]; difficulty: Difficulty; count: number }) {
  const skills = input.skills.length ? input.skills : ["Problem Solving", "Communication", "Basics"];
  const difficulty = input.difficulty;
  const count = Math.max(10, input.count);

  const picked: McqQuestion[] = [];
  const seen = new Set<string>();

  const bankFor = (skill: string) => BANK.filter((q) => q.skill.toLowerCase() === skill.toLowerCase() && q.difficulty === difficulty);

  const roundRobinSkills = shuffle(skills);

  let templateIdx = 0;
  while (picked.length < count) {
    const skill = roundRobinSkills[picked.length % roundRobinSkills.length];
    const candidates = shuffle(bankFor(skill));
    let q = candidates.find((c) => !seen.has(c.id));
    if (!q) q = buildTemplateQuestion(skill, difficulty, templateIdx++);
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    picked.push(q);
  }

  return picked.slice(0, count);
}

