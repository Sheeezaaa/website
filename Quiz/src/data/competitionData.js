export const COMPETITION_DETAILS = {
  title: "BATTLE OF BRAINS",
  subtitle: "University Quiz Competition 2026",
  tagline: "Challenge Your Knowledge, Test Your Intelligence, and Compete to Become the Ultimate Champion!",
  edition: "COMSATS University Islamabad Annual Championship",
  organizer: "Department of Computer Science & Information Technology",
  university: "COMSATS University Islamabad",
  campusBadge: "NOVEMBER 20, 2026 • COMSATS UNIVERSITY ISLAMABAD",
  defaultEventDate: "2026-11-20T09:00:00",
  venue: "Main University Auditorium & CS Computing Complex",
  eligibility: "Open to All Enrolled Students (Individual Participation)",
  participationMode: "Individual / Solo Competitor",
  entryFee: "Free Registration (Sponsored by CS Society)",
  reportingTime: "08:50 AM (10 Minutes Prior to Start)",
};

export const HIGHLIGHT_STATS = [
  { value: "07", label: "Core CS Subjects", detail: "Foundational to advanced computing domains" },
  { value: "04", label: "Intense Rounds", detail: "Screening to the 1-on-1 buzzer finale" },
  { value: "Solo", label: "Individual Competitor", detail: "Test your personal intellectual prowess" },
  { value: "100%", label: "Fair Play & Live Buzzer", detail: "Automated timers & millisecond buzzer telemetry" },
];

export const COMPETITION_SUBJECTS = [
  {
    id: "pf",
    code: "CS-101",
    name: "Programming Fundamentals",
    icon: "Terminal",
    description: "Core syntax, structured logic, control flow, functions, memory pointers, dynamic arrays, and basic problem decomposition.",
    topics: ["Variables & Operators", "Control Structures & Loops", "Pointers & Memory Allocation", "Functions & Recursion"],
    difficulty: "Core Foundational",
    color: "from-blue-500/20 to-indigo-600/20",
    accent: "text-blue-400",
  },
  {
    id: "oop",
    code: "CS-201",
    name: "Object Oriented Programming",
    icon: "Boxes",
    description: "Encapsulation, inheritance hierarchies, runtime polymorphism, abstract classes, operator overloading, and design patterns.",
    topics: ["Classes & Objects", "Inheritance & Polymorphism", "Abstraction & Interfaces", "Templates & Solid Principles"],
    difficulty: "Intermediate",
    color: "from-cyan-500/20 to-blue-600/20",
    accent: "text-cyan-400",
  },
  {
    id: "dsa",
    code: "CS-202",
    name: "Data Structures & Algorithms",
    icon: "Binary",
    description: "Linear and non-linear data structures, trees, graphs, dynamic programming, greedy algorithms, and asymptotic complexity analysis.",
    topics: ["Trees, AVL & Graphs", "Sorting & Searching", "Dynamic Programming", "Big-O Asymptotic Analysis"],
    difficulty: "Advanced",
    color: "from-emerald-500/20 to-teal-600/20",
    accent: "text-emerald-400",
  },
  {
    id: "dbms",
    code: "CS-301",
    name: "Database Systems",
    icon: "Database",
    description: "Relational algebra, advanced SQL queries, normal forms (1NF through BCNF), indexing, transaction management, and ACID compliance.",
    topics: ["Relational Model & SQL", "Normalization (1NF–BCNF)", "Transactions & Concurrency", "Indexing & Query Optimization"],
    difficulty: "Intermediate",
    color: "from-indigo-500/20 to-blue-600/20",
    accent: "text-indigo-400",
  },
  {
    id: "cn",
    code: "CS-302",
    name: "Computer Networks",
    icon: "Network",
    description: "Layered architecture (OSI & TCP/IP), subnetting, switching, routing protocols (OSPF/BGP), transport protocols, and cybersecurity foundations.",
    topics: ["OSI & TCP/IP Layers", "IP Addressing & Subnetting", "Routing & Switching", "Network Security Protocols"],
    difficulty: "Intermediate",
    color: "from-violet-500/20 to-purple-600/20",
    accent: "text-violet-400",
  },
  {
    id: "se",
    code: "CS-303",
    name: "Software Engineering",
    icon: "GitBranch",
    description: "Software lifecycle models, Agile/Scrum methodologies, architectural styles, requirement engineering, unit testing, and CI/CD pipelines.",
    topics: ["SDLC & Agile Frameworks", "Design Patterns & Architecture", "Software Testing & QA", "CI/CD & Version Control"],
    difficulty: "Applied Systems",
    color: "from-rose-500/20 to-pink-600/20",
    accent: "text-rose-400",
  },
  {
    id: "os",
    code: "CS-401",
    name: "Operating Systems",
    icon: "Cpu",
    description: "Process synchronization, CPU scheduling algorithms, memory virtualization, paging, deadlock prevention, and distributed file systems.",
    topics: ["Processes, Threads & Concurrency", "CPU Scheduling & Deadlocks", "Virtual Memory & Paging", "File Systems & I/O Subsystems"],
    difficulty: "Advanced Systems",
    color: "from-amber-500/20 to-orange-600/20",
    accent: "text-amber-400",
  },
];

export const COMPETITION_ROUNDS = [
  {
    roundNumber: 1,
    title: "MCQ SCREENING ROUND",
    stageBadge: "Stage 01 • Preliminary Screening",
    timeLimit: "30 seconds per question",
    questionsCount: "5 MCQs per participant",
    markingScheme: "+1 point for correct answer",
    negativeMarking: "No negative marking (0 pts)",
    strictRule: "Answers will NOT be accepted after the 30-second timer expires.",
    qualification: "Top 80% of all participants qualify for Round 2.",
    status: "Qualifying Stage",
    icon: "CheckCircle2",
    highlights: [
      "5 questions per candidate covering all 7 subjects",
      "Strict 30-second countdown timer per question",
      "Top 80% participants advance forward",
    ],
  },
  {
    roundNumber: 2,
    title: "MCQ SCREENING ROUND (ADVANCED)",
    stageBadge: "Stage 02 • Knockout Screening",
    timeLimit: "45 seconds per question",
    questionsCount: "5 MCQs per participant",
    markingScheme: "+1 point for correct answer",
    negativeMarking: "No negative marking (0 pts)",
    strictRule: "Answers will NOT be accepted after the 45-second timer expires.",
    qualification: "Top 4 participants qualify for Round 3 (Semi-Finals).",
    status: "Quarter-Final Stage",
    icon: "Layers",
    highlights: [
      "5 advanced analytical problem-solving MCQs",
      "Extended 45-second analytical time window",
      "Only the TOP 4 participants advance to Round 3",
    ],
  },
  {
    roundNumber: 3,
    title: "RAPID FIRE ROUND",
    stageBadge: "Stage 03 • Semi-Final Showdown",
    timeLimit: "3 minutes per participant (3s per question)",
    questionsCount: "Continuous rapid-stream questions",
    markingScheme: "+1 point for correct answer",
    negativeMarking: "No negative marking (0 pts)",
    strictRule: "Each question must be answered within 3 seconds. After 3 seconds, the question is skipped automatically. Skipped or unanswered questions will NOT be repeated.",
    qualification: "Top 2 participants proceed to the Grand Final.",
    status: "Semi-Final Stage",
    icon: "Zap",
    highlights: [
      "Total 3-minute participant clock",
      "Lightning 3-second answer window per question",
      "No repeats for skipped questions",
      "Top 2 high-scoring candidates advance to Grand Finale",
    ],
  },
  {
    roundNumber: 4,
    title: "BUZZER ROUND (GRAND FINAL)",
    stageBadge: "Stage 04 • The Ultimate Championship",
    timeLimit: "10 seconds to answer once buzzed",
    questionsCount: "Grand final 1-on-1 decider series",
    markingScheme: "+1 point for correct answer",
    negativeMarking: "-0.5 points deduction for wrong answer",
    strictRule: "Participants must press the buzzer after the question starts. The first buzzer gets the chance to answer. If a participant buzzes but cannot answer within 10 seconds, the turn passes. Premature or unnecessary buzzer pressing results in a warning or point deduction.",
    qualification: "The participant with the highest score is crowned CHAMPION!",
    status: "Grand Finale",
    icon: "Trophy",
    highlights: [
      "1-on-1 First-to-buzz priority lock",
      "+1 point for correct, -0.5 points penalty for incorrect",
      "10-second answer limit after buzz",
      "Warning / point deduction for premature or spam buzzing",
    ],
  },
];

export const RULES_AND_REGULATIONS = {
  generalRules: [
    {
      title: "Individual Participation Only",
      description: "Each participant competes as an individual (solo competitor). Group entries, pairs, or team collaborations are strictly not allowed.",
      icon: "User",
    },
    {
      title: "Mandatory Student Identification",
      description: "All participants must carry their original, valid University Student ID cards. Verification will take place at the reception registration desk.",
      icon: "IdCard",
    },
    {
      title: "Prohibited Electronic Devices",
      description: "Mobile phones, smartwatches, programmable calculators, Bluetooth devices, and external notes are strictly prohibited inside the competition arena.",
      icon: "PhoneOff",
    },
    {
      title: "Anti-Cheating & Integrity",
      description: "Cheating, prompting from the audience, unauthorized side discussions, or unfair means will lead to immediate and irreversible disqualification.",
      icon: "ShieldAlert",
    },
    {
      title: "Finality of Organizer Decisions",
      description: "The official jury and panel of judges' decisions regarding points, timing, buzzer logs, and disputes are final and binding on all participants.",
      icon: "Gavel",
    },
    {
      title: "Punctuality & Reporting",
      description: "Participants must report to the competition venue at least 10 minutes before the scheduled start time. Late arrivals forfeit their slot without exception.",
      icon: "Clock",
    },
  ],
  tieBreakerRules: [
    {
      title: "Standard Tie-Breaker (2 Extra Questions)",
      description: "If two or more participants finish with equal scores in any qualifying round, 2 additional tie-breaker questions will be asked from each tied candidate.",
      step: "Phase 1",
    },
    {
      title: "Decisive Sudden-Death Buzzer",
      description: "If participants remain tied after 2 additional questions, one decisive sudden-death buzzer question will be posed. The first candidate to buzz and answer correctly wins immediately.",
      step: "Phase 2",
    },
    {
      title: "Buzzer Penalty in Sudden-Death",
      description: "If the first participant buzzes and answers incorrectly during sudden-death, the opposing tied candidate is automatically awarded the qualification slot.",
      step: "Critical Clause",
    },
  ],
  disqualificationRules: [
    {
      reason: "Using Phones or External Help",
      severity: "Immediate Disqualification & University Disciplinary Notification",
      description: "Any participant found consulting a phone, wearable smart tech, internet search, or audience member will be disqualified instantly.",
    },
    {
      reason: "Misbehaving with Judges or Organizers",
      severity: "Immediate Disqualification & Event Ban",
      description: "Disrespectful conduct, aggressive arguments with referees, or inappropriate language towards fellow participants will result in immediate eviction.",
    },
    {
      reason: "Pressing the Buzzer Repeatedly without Reason",
      severity: "Official Warning, Followed by Point Deductions & Disqualification",
      description: "Frivolous, premature, or spam buzzer clicks intended to distract opponents or game the hardware will incur -1 point and potential disqualification.",
    },
    {
      reason: "Intentionally Delaying the Rounds",
      severity: "Forfeit of Current Round Turn",
      description: "Unreasonable stalls, refusal to answer within designated clock ticks, or disruptive stalling tactics will result in turn forfeiture.",
    },
  ],
};

export const FAQ_LIST = [
  {
    q: "Can students from any department participate?",
    a: "Yes! The competition is open to all undergraduate university students from CS, SE, IT, AI, Cyber Security, Data Science, and Engineering departments who hold a valid Student ID."
  },
  {
    q: "Is there any registration fee for the competition?",
    a: "No, participation in Battle of Brains is 100% free, fully sponsored by the Department of Computer Science & Student Affairs."
  },
  {
    q: "Can I participate as part of a team?",
    a: "No, this edition of Battle of Brains is exclusively an individual (solo competitor) quiz championship."
  },
  {
    q: "What hardware will be provided for the Buzzer Final?",
    a: "The final stage features official digital micro-controller buzzer pads connected to real-time millisecond latency display screens in the auditorium."
  },
];
