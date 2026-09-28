import {
  MoodEntry,
  WelltoryBiometrics,
  WelltoryDayRecord,
  MindseraContext,
  MindseraFramework,
  MindseraSyncedEntry,
  MindseraMindsComment,
  MindsaraContext,
  SamsungHealthData,
  SamsungHealthDayRecord,
  TaskProjectData,
  TickTickDayRecord,
  AiCoWorkData,
  GeminiSparkData,
} from '../types/journal';

// ============================================================================
// MINDSERA CUSTOM FRAMEWORKS (https://beta.mindsera.com/)
// ============================================================================
export const MINDSERA_FRAMEWORKS: MindseraFramework[] = [
  {
    id: 'dichotomy_of_control',
    name: 'Dichotomy of Control',
    category: 'Stoicism',
    description:
      'Dissect the current crisis into what is within your voluntary control versus what is external, actively detaching your peace from outside outcomes.',
    defaultPersona: 'stoic',
    promptTemplate:
      'Identify what part of this scenario is solely up to your choices and character, and consciously release what belongs to external chance.',
    steps: [
      'Inventory external circumstances, decisions of others, and timeline pressures.',
      'Isolate what is 100% within your immediate volition (your reactions, principles, effort).',
      'Actively declare acceptance (Amor Fati) of external factors.',
      'Commit to a single virtuous, dignified micro-action right now.',
    ],
  },
  {
    id: 'cognitive_restructuring',
    name: 'Cognitive Restructuring (CBT / ABCDE)',
    category: 'Psychology & Somatic',
    description:
      'Map the Activating Event to the Automatic Belief, evaluate somatic distortions (catastrophizing, black-and-white thinking), and build an adaptive outlook.',
    defaultPersona: 'psychologist',
    promptTemplate:
      'What unexamined belief did your mind construct about this event, and what kinder, more balanced truth does the objective evidence support?',
    steps: [
      'A - Activating Event (Objective trigger without interpretation).',
      'B - Belief (The immediate thought: "I am failing", "They do not respect me").',
      'C - Consequence (Somatic contraction: tight chest, anxiety 7/10).',
      'D - Dispute (Is this 100% true? What counter-evidence exists?).',
      'E - Effective New Belief (A grounded, compassionate reappraisal).',
    ],
  },
  {
    id: 'socratic_inversion',
    name: 'Socratic Inversion',
    category: 'Critical Thinking',
    description:
      'Invert your objective: Instead of asking how to succeed or stay calm, ask "What behaviors and thought patterns would guarantee burnout and regret?" Then eliminate them.',
    defaultPersona: 'challenger',
    promptTemplate:
      'If you intentionally wanted to make this emotional spiral worse and guarantee failure in your sprint, what would you do? Are you secretly doing that now?',
    steps: [
      'State your desired state: peace of mind and clean task execution.',
      'Invert: How could I guarantee complete cognitive exhaustion by tomorrow night?',
      'Audit: Check current behaviors against the inverted list (e.g., checking email in bed, skipping meals).',
      'Sever the friction points with immediate boundary guardrails.',
    ],
  },
  {
    id: 'first_principles',
    name: 'First-Principles Leverage',
    category: 'Decision Making',
    description:
      'Deconstruct complex project anxiety down to irreducible foundational facts, cutting away artificial social urgency and deadline drama.',
    defaultPersona: 'strategist',
    promptTemplate:
      'Strip away the assumptions and perceived expectations. What is the fundamental bottleneck here, and what is the single highest-leverage lever?',
    steps: [
      'State the overwhelming problem in plain, unvarnished words.',
      'Strip away assumptions: Who said this must be done this way? What if it was deleted?',
      'Identify the physical constraint (hours, energy, API latency, team bandwidth).',
      'Design the leanest, most elegant 80/20 path forward.',
    ],
  },
  {
    id: 'autonomic_reset',
    name: 'Autonomic Nervous System Reset',
    category: 'Neuroscience',
    description:
      'Map physical somatic signals to your autonomic state (Sympathetic Flight/Fight vs. Dorsal Shutdown vs. Ventral Vagal Safety) and deploy neuro-somatic regulation.',
    defaultPersona: 'neuroscientist',
    promptTemplate:
      'What autonomic state is currently driving your thoughts? What somatic signal (sigh, gaze softening, jaw release) can signal safety to your brainstem?',
    steps: [
      'Identify current autonomic signature (elevated heart rate, clenched teeth, shallow breath = sympathetic).',
      'Notice how the brain manufactures narratives to justify the physiological arousal.',
      'Deploy 3 physiological sighs (double inhale through nose, long audible exhale).',
      'Re-check resting heart rate and re-evaluate the emotional narrative from safety.',
    ],
  },
];

// Generate realistic date strings relative to today
function getOffsetDate(daysAgo: number, timeStr = '14:30'): { timestamp: string; date: string; time: string } {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const [hours, minutes] = timeStr.split(':').map(Number);
  d.setHours(hours, minutes, 0, 0);
  const iso = d.toISOString();
  const date = iso.split('T')[0];
  return { timestamp: iso, date, time: timeStr };
}

// ============================================================================
// HISTORICAL TELEMETRY (30-DAY CHRONOLOGICAL STREAM)
// ============================================================================
export const HISTORICAL_WELLTORY_DAYS: WelltoryDayRecord[] = Array.from({ length: 30 }, (_, idx) => {
  const { date } = getOffsetDate(idx);
  // Introduce realistic cyclical recovery waves (higher HRV weekends, dips mid-week sprint)
  const isWeekend = idx % 7 === 1 || idx % 7 === 2;
  const isMidweek = idx % 7 === 4 || idx % 7 === 5;
  const baseHrv = isWeekend ? 76 : isMidweek ? 48 : 62;
  const jitter = ((idx * 7) % 11) - 5;
  const hrv = Math.max(40, Math.min(88, baseHrv + jitter));
  const stress = Math.max(20, Math.min(85, Math.round(105 - hrv * 0.9 + ((idx * 3) % 9))));
  const energy = Math.max(30, Math.min(90, Math.round(hrv * 0.8 + ((idx * 5) % 12))));
  const recovery: 'Low' | 'Moderate' | 'Optimal' = hrv >= 70 ? 'Optimal' : hrv >= 54 ? 'Moderate' : 'Low';
  const autonomicBalance =
    hrv >= 68
      ? 'Vagal Parasympathetic Tone Dominant'
      : stress >= 65
      ? 'Sympathetic High Arousal (Fight/Flight)'
      : 'Normative Autonomic Homeostasis';

  return {
    date,
    hrvScore: hrv,
    stressScore: stress,
    energyScore: energy,
    recoveryStatus: recovery,
    autonomicBalance,
    amMeasurementHrv: hrv - 3,
    pmMeasurementHrv: hrv + 2,
  };
});

export const HISTORICAL_TICKTICK_DAYS: TickTickDayRecord[] = Array.from({ length: 30 }, (_, idx) => {
  const { date } = getOffsetDate(idx);
  const isMidweek = idx % 7 === 4 || idx % 7 === 5;
  const sprint: 'Low' | 'Moderate' | 'High' | 'Crunch' = isMidweek ? (idx % 2 === 0 ? 'Crunch' : 'High') : idx % 7 <= 2 ? 'Low' : 'Moderate';
  const completed = sprint === 'Crunch' ? 12 : sprint === 'High' ? 9 : sprint === 'Moderate' ? 6 : 4;
  const pending = sprint === 'Crunch' ? 5 : sprint === 'High' ? 4 : 2;

  const sampleTasks = [
    'Refactor auth middleware and token refreshing',
    'Review Q3 KPI dashboards with engineering leads',
    'Draft client proposal presentation deck',
    'Configure telemetry alert thresholds in Grafana',
    'Complete deep work session on vector search schema',
    'Conduct candidate technical interview round',
    'Review pull request for Feelings Wheel biometric overlays',
    'Organize weekly retrospective action items',
  ];

  return {
    date,
    completedTasks: completed,
    pendingHighPriorityTasks: pending,
    sprintPressure: sprint,
    p1Count: sprint === 'Crunch' ? 3 : sprint === 'High' ? 2 : 1,
    p2Count: sprint === 'Crunch' ? 4 : sprint === 'High' ? 3 : 2,
    topTaskCompleted: sampleTasks[idx % sampleTasks.length],
  };
});

export const HISTORICAL_SAMSUNG_HEALTH_DAYS: SamsungHealthDayRecord[] = Array.from({ length: 30 }, (_, idx) => {
  const { date } = getOffsetDate(idx);
  const isWeekend = idx % 7 === 1 || idx % 7 === 2;
  const sleepHrs = Number((isWeekend ? 8.1 - (idx % 3) * 0.3 : 6.4 + ((idx * 2) % 5) * 0.3).toFixed(1));
  const sleepQual = Math.round(sleepHrs * 11 + ((idx * 4) % 10));
  const deepSleep = Math.round(14 + ((idx * 3) % 9));
  const steps = isWeekend ? 11200 + ((idx * 300) % 2500) : 7400 + ((idx * 450) % 3200);
  const restingHr = Math.round(72 - (sleepHrs - 6.5) * 4);

  return {
    date,
    sleepHours: Math.min(9.0, Math.max(5.5, sleepHrs)),
    sleepQuality: Math.min(95, Math.max(55, sleepQual)),
    deepSleepPercentage: deepSleep,
    dailySteps: steps,
    restingHeartRate: Math.max(54, Math.min(76, restingHr)),
  };
});

// ============================================================================
// MINDSERA SYNCED HISTORICAL ENTRIES & MINDS COMMENTS
// ============================================================================
export const SEED_MINDSERA_ENTRIES: MindseraSyncedEntry[] = [
  {
    id: 'mindsera-1',
    title: 'Deconstructing Launch Urgency & Somatic Tightness',
    ...getOffsetDate(0, '15:45'),
    content:
      'Inbox flooded with four urgent bug alerts right before product deployment. Sensed immediate constriction in breathing. Attempted to triage everything simultaneously before stepping back to apply the Stoic Dichotomy of Control.',
    frameworkUsed: 'Dichotomy of Control',
    tags: ['Work', 'Sprints', 'Stoicism', 'Boundaries'],
    cognitiveBiasesDetected: ['Catastrophizing', 'Urgency Fallacy'],
    linkedMoodEntryId: 'entry-1',
    syncStatus: 'synced',
    mindsComments: [
      {
        id: 'mc-1',
        persona: 'stoic',
        personaTitle: 'Marcus Aurelius (Stoic Lens)',
        frameworkName: 'Dichotomy of Control',
        commentText:
          'You confuse the movement of the storm with the ship. The bug reports and team demands belong entirely to fortune; only your composure and integrity belong to you. When you demand that circumstances hurry to your satisfaction, you invite distress.',
        actionableInquiry:
          'If you were stripped of all external validation for today’s release, what choice remains purely honorable?',
        coreDichotomyOrInsight:
          'External: bug severity, client expectations. Internal: clarity of prioritization, courteous communication.',
        timestamp: getOffsetDate(0, '15:48').timestamp,
      },
      {
        id: 'mc-2',
        persona: 'psychologist',
        personaTitle: 'Carl Rogers (Psychological Lens)',
        frameworkName: 'Cognitive Restructuring',
        commentText:
          'Notice how tender your fear is: you want to do high-integrity work, and your body is sounding an alarm to protect your reputation. Acknowledge this protective instinct without letting it hijack your executive prefrontal cortex.',
        actionableInquiry:
          'Can you place one hand on your chest and grant yourself permission to solve one single bug at a time?',
        timestamp: getOffsetDate(0, '15:50').timestamp,
      },
      {
        id: 'mc-3',
        persona: 'challenger',
        personaTitle: 'Socratic Inquirer (Challenger Lens)',
        frameworkName: 'Socratic Inversion',
        commentText:
          'Who declared that all four issues are catastrophic? Are you answering true emergencies, or are you operating under an unexamined habit of treating every notification as an existential crisis?',
        actionableInquiry:
          'What is the worst realistic consequence if bugs 3 and 4 wait until 10:00 AM tomorrow?',
        timestamp: getOffsetDate(0, '15:52').timestamp,
      },
    ],
  },
  {
    id: 'mindsera-2',
    title: 'Evening Nature Solitude & Parasympathetic Rebound',
    ...getOffsetDate(1, '20:30'),
    content:
      'Took a 45-minute evening walk through the park with no headphones. Sunset illuminated the trees in deep amber. Completely unplugged from quarterly strategy.',
    frameworkUsed: 'Autonomic Nervous System Reset',
    tags: ['Nature', 'Restoration', 'Vagal Tone'],
    cognitiveBiasesDetected: [],
    linkedMoodEntryId: 'entry-2',
    syncStatus: 'synced',
    mindsComments: [
      {
        id: 'mc-4',
        persona: 'neuroscientist',
        personaTitle: 'Andrew Huberman (Neuroscience Lens)',
        frameworkName: 'Autonomic Nervous System Reset',
        commentText:
          'Panoramic visual gaze during your outdoor walk activated the brainstem’s ocular divergence mechanisms, directly down-regulating sympathetic arousal and up-regulating acetylcholine.',
        actionableInquiry:
          'How can you intentionally protect this evening low-lux sensory window as a non-negotiable biological anchor?',
        timestamp: getOffsetDate(1, '20:35').timestamp,
      },
      {
        id: 'mc-5',
        persona: 'stoic',
        personaTitle: 'Seneca (Stoic Lens)',
        frameworkName: 'Dichotomy of Control',
        commentText:
          'To be everywhere is to be nowhere. By giving your soul a true Sabbath from external ambition, you discovered that peace does not require a completed empire, only a quiet mind.',
        actionableInquiry:
          'What worldly pursuit seemed immense this morning that now appears small under the evening stars?',
        timestamp: getOffsetDate(1, '20:38').timestamp,
      },
    ],
  },
  {
    id: 'mindsera-3',
    title: 'Irritability in Team Meeting as a Physiological Signal',
    ...getOffsetDate(2, '12:05'),
    content:
      'Annoyance flared when meeting started 20 minutes late. Almost launched into a sharp critique, but realized I only had 5 hours of sleep and no morning nutrition.',
    frameworkUsed: 'Cognitive Restructuring (ABCDE)',
    tags: ['Meetings', 'Self-Awareness', 'Sleep'],
    cognitiveBiasesDetected: ['Fundamental Attribution Error', 'Affect Heuristic'],
    linkedMoodEntryId: 'entry-3',
    syncStatus: 'synced',
    mindsComments: [
      {
        id: 'mc-6',
        persona: 'psychologist',
        personaTitle: 'Albert Ellis (CBT Lens)',
        frameworkName: 'Cognitive Restructuring',
        commentText:
          'A classic example of the Affect Heuristic: biological depletion (5 hrs sleep) lowered your threshold for perceived threat. You skillfully disrupted the Fundamental Attribution Error before attributing moral failure to the team lead.',
        actionableInquiry:
          'What boundary around sleep must become an unbreakable commitment rather than an optional luxury?',
        timestamp: getOffsetDate(2, '12:10').timestamp,
      },
      {
        id: 'mc-7',
        persona: 'challenger',
        personaTitle: 'Charlie Munger (Challenger Lens)',
        frameworkName: 'Socratic Inversion',
        commentText:
          'If you want a dysfunctional organization, make critical leadership decisions on sleep deficits and low blood sugar. You dodged a self-inflicted wound today. Now institutionalize the fix.',
        actionableInquiry:
          'Why do you allow late-night screen time when the following afternoon cost is this consistently expensive?',
        timestamp: getOffsetDate(2, '12:12').timestamp,
      },
    ],
  },
  {
    id: 'mindsera-4',
    title: 'Deep Architecture Breakthrough with First Principles',
    ...getOffsetDate(5, '16:00'),
    content:
      'Spent 3 hours stripping out unnecessary abstractions in our distributed caching design. Realized we were solving a problem we do not yet have.',
    frameworkUsed: 'First-Principles Leverage',
    tags: ['Architecture', 'Strategy', 'Deep Work'],
    cognitiveBiasesDetected: ['Complexity Bias'],
    linkedMoodEntryId: 'entry-6',
    syncStatus: 'synced',
    mindsComments: [
      {
        id: 'mc-8',
        persona: 'strategist',
        personaTitle: 'First-Principles Strategist',
        frameworkName: 'First-Principles Leverage',
        commentText:
          'Simplicity is prerequisite for reliability. Rejecting premature optimization is an intellectual triumph that saves months of future maintenance debt.',
        actionableInquiry:
          'What other area of your personal workflow is suffering from unnecessary complexity masquerading as thoroughness?',
        timestamp: getOffsetDate(5, '16:15').timestamp,
      },
      {
        id: 'mc-9',
        persona: 'challenger',
        personaTitle: 'Charlie Munger (Challenger Lens)',
        frameworkName: 'Socratic Inversion',
        commentText:
          'Invert, always invert. Instead of designing for hypothetical millions of concurrent users, eliminate the bugs causing actual churn right now.',
        actionableInquiry:
          'If you had to delete 50% of the planned roadmap today, what actually essential 20% remains?',
        timestamp: getOffsetDate(5, '16:20').timestamp,
      },
    ],
  },
  {
    id: 'mindsera-5',
    title: 'Executive Pre-Mortem & Catastrophic Projection Dispute',
    ...getOffsetDate(6, '14:30'),
    content:
      'Felt apprehension about quarterly board review. Anticipated harsh critique regarding delay in infrastructure migration. Wrote down worst-case scenario and applied Socratic Inversion.',
    frameworkUsed: 'Socratic Inversion',
    tags: ['Strategy', 'Executive', 'Inversion'],
    cognitiveBiasesDetected: ['Catastrophizing', 'Imposter Phenomenon'],
    linkedMoodEntryId: 'entry-7',
    syncStatus: 'synced',
    mindsComments: [
      {
        id: 'mc-10',
        persona: 'challenger',
        personaTitle: 'Socratic Inquirer (Challenger Lens)',
        frameworkName: 'Socratic Inversion',
        commentText:
          'What if the board is not looking to punish you, but seeking your candid technical assessment? By treating inquiry as hostility, you prepare for combat instead of collaboration.',
        actionableInquiry:
          'What would a calm, totally unthreatened engineering leader say in that room tomorrow?',
        coreDichotomyOrInsight: 'Hostile projection vs. objective partnership.',
        timestamp: getOffsetDate(6, '14:35').timestamp,
      },
      {
        id: 'mc-11',
        persona: 'stoic',
        personaTitle: 'Epictetus (Stoic Lens)',
        frameworkName: 'Dichotomy of Control',
        commentText:
          'Man is not worried by real problems so much as by his imagined anxieties about real problems. Present the unadorned truth; the judgment of others is not your property.',
        actionableInquiry:
          'Can you separate your technical duty from the desire to be praised?',
        timestamp: getOffsetDate(6, '14:38').timestamp,
      },
    ],
  },
  {
    id: 'mindsera-6',
    title: 'Mid-Sprint Autonomic Decompression & Sensory Reset',
    ...getOffsetDate(12, '18:15'),
    content:
      'Midway through the 2-week sprint. HRV dropped to 44ms due to late nights. Stepped outside for 30 minutes of low-light horizon gazing without phone. Felt chest thaw.',
    frameworkUsed: 'Autonomic Nervous System Reset',
    tags: ['Physiology', 'Autonomic', 'HRV Recovery'],
    cognitiveBiasesDetected: ['All-or-Nothing Thinking'],
    syncStatus: 'synced',
    mindsComments: [
      {
        id: 'mc-12',
        persona: 'neuroscientist',
        personaTitle: 'Andrew Huberman (Neuroscience Lens)',
        frameworkName: 'Autonomic Nervous System Reset',
        commentText:
          'The physiological sigh is the fastest autonomous tool to reduce autonomic arousal in real time. Your 44ms HRV was an urgent cry for vagal up-regulation.',
        actionableInquiry:
          'Will you schedule a mandatory 15-minute sensory break at 2:00 PM tomorrow before your heart rate spikes?',
        coreDichotomyOrInsight: 'Nervous system allostasis precedes cognitive executive function.',
        timestamp: getOffsetDate(12, '18:20').timestamp,
      },
      {
        id: 'mc-13',
        persona: 'psychologist',
        personaTitle: 'Carl Rogers (Psychological Lens)',
        frameworkName: 'Cognitive Restructuring',
        commentText:
          'You are treating rest as something you have to earn after total depletion. Rest is the biological soil from which your insight grows.',
        actionableInquiry:
          'Can you accept that fatigue is human and not a moral deficiency?',
        timestamp: getOffsetDate(12, '18:22').timestamp,
      },
    ],
  },
  {
    id: 'mindsera-7',
    title: 'Dissecting Social Comparison & Focus Allocation',
    ...getOffsetDate(20, '10:00'),
    content:
      'Observed competitors launching an adjacent AI feature. Initial flash of urgency to copy them immediately. Stepped back to evaluate through Stoic and First-Principles lenses.',
    frameworkUsed: 'Dichotomy of Control',
    tags: ['Competition', 'Focus', 'Stoicism'],
    cognitiveBiasesDetected: ['Bandwagon Effect', 'Urgency Fallacy'],
    syncStatus: 'synced',
    mindsComments: [
      {
        id: 'mc-14',
        persona: 'stoic',
        personaTitle: 'Marcus Aurelius (Stoic Lens)',
        frameworkName: 'Dichotomy of Control',
        commentText:
          'How much time he gains who does not look to see what his neighbor says or does or thinks, but only at what he does himself, to make it just and holy.',
        actionableInquiry:
          'What is the single core product truth that only your team understands?',
        coreDichotomyOrInsight: 'External noise vs. internal vision.',
        timestamp: getOffsetDate(20, '10:08').timestamp,
      },
    ],
  },
];

// ============================================================================
// INITIAL INTEGRATION STATES
// ============================================================================
export const INITIAL_WELLTORY_BIOMETRICS: WelltoryBiometrics = {
  enabled: true,
  dashboardUrl: 'https://app.welltory.com/dashboard/',
  hrvScore: 62, // RMSSD in ms
  stressScore: 68, // 68% high stress
  energyScore: 48, // 48% energy
  sleepQuality: 74,
  recoveryStatus: 'Moderate',
  autonomicBalance: 'Sympathetic Activation (Stress Index 68%)',
  vascularStatus: 'Pulse Wave Velocity Normal (6.8 m/s)',
  historicalDays: HISTORICAL_WELLTORY_DAYS,
  lastSyncTimestamp: new Date().toISOString(),
};

export const INITIAL_MINDSERA_CONTEXT: MindseraContext = {
  enabled: true,
  betaUrl: 'https://beta.mindsera.com/',
  recurringThemes: [
    'Boundary setting with demanding team sprint deadlines',
    'Perfectionism and unmasking complexity bias in system architecture',
    'Somatic recovery during morning quiet hours & nature walks',
    'Decoupling self-worth from daily task output volume',
  ],
  recentKeyTakeaways: [
    'Noticing that high cognitive fatigue masquerades as interpersonal irritability.',
    'Stoic Dichotomy of Control instantly diffuses perceived timeline emergencies.',
    'Evening sensory down-regulation (low-lux nature walks) reliably restores HRV by 18+ ms.',
  ],
  cognitiveBiasesNoted: [
    'Catastrophizing sprint deadline timelines',
    'All-or-nothing productivity metrics',
    'Affect heuristic during sleep-deprived afternoons',
  ],
  totalSyncedEntries: 24,
  activePersona: 'stoic',
  activeFrameworkId: 'dichotomy_of_control',
  customFrameworks: MINDSERA_FRAMEWORKS,
  syncedEntries: SEED_MINDSERA_ENTRIES,
  lastSyncTimestamp: new Date().toISOString(),
};

// Backward-compatible alias
export const INITIAL_MINDSARA_CONTEXT: MindsaraContext = INITIAL_MINDSERA_CONTEXT;

export const INITIAL_SAMSUNG_HEALTH: SamsungHealthData = {
  enabled: true,
  sleepHours: 7.2,
  sleepQuality: 82,
  deepSleepPercentage: 19,
  dailySteps: 8450,
  activeMinutes: 45,
  restingHeartRate: 61,
  bloodOxygenSpO2: 98,
  respiratoryRate: 14,
  historicalDays: HISTORICAL_SAMSUNG_HEALTH_DAYS,
  lastSyncTimestamp: new Date().toISOString(),
};

export const INITIAL_TASK_PROJECTS: TaskProjectData = {
  enabled: true,
  mcpEndpointUrl: 'https://mcp.ticktick.com',
  activeProjects: [
    'Product Launch v2.0 Architecture',
    'Quarterly Strategy Review & Budget',
    'Personal Writing & Somatic Habit',
  ],
  completedTasksToday: 7,
  pendingHighPriorityTasks: 4,
  currentSprintPressure: 'High',
  upcomingDeadlines: [
    'Frontend release candidate (Due Thursday)',
    'User feedback synthesis (Due Friday)',
  ],
  priorityDistribution: { p1: 3, p2: 5, p3: 8, p4: 4 },
  historicalDays: HISTORICAL_TICKTICK_DAYS,
  lastSyncTimestamp: new Date().toISOString(),
};

export const INITIAL_AI_COWORK: AiCoWorkData = {
  enabled: true,
  scheduledPromptCadence: 'Daily 8:30 AM Executive Intention & 6:00 PM Wind-down',
  recentCoWorkFocus: [
    'Deconstructing complex system dependencies with Claude',
    'Scheduled ChatGPT reflective journaling prompts on resilience',
  ],
  cognitiveLoadScore: 72,
  lastSyncTimestamp: new Date().toISOString(),
};

export const INITIAL_GEMINI_SPARK: GeminiSparkData = {
  enabled: true,
  ambientTriggerEnabled: true,
  recentSparks: [
    'Detected prolonged sitting during deep coding: suggested a 2-min thoracic rotation.',
    'Identified sudden uptick in evening energy: prompted a creative exploration.',
  ],
  lastSparkTimestamp: new Date().toISOString(),
};

// ============================================================================
// SEED MOOD ENTRIES (FEELINGS WHEEL & RECONCILED DATA)
// ============================================================================
export const SEED_MOOD_ENTRIES: MoodEntry[] = [
  {
    id: 'entry-1',
    ...getOffsetDate(0, '15:20'),
    primaryEmotion: 'Fearful',
    secondaryEmotion: 'Anxious',
    tertiaryEmotion: 'Overwhelmed',
    emotionColor: '#8B5CF6',
    intensity: 7,
    promptUsed: 'What are 3 things you can ruthlessly drop or postpone for the next 24 hours to regain agency?',
    journalText: 'Felt my chest tighten as four different high-priority requests piled into my inbox at once. My instinct was to rush through all of them, but writing this helped me realize I only have control over two. I delegated the analytics review and pushed the slide deck presentation to Tuesday.',
    somaticSensations: ['Chest tightness', 'Shallow breathing', 'Buzzing restless energy'],
    tags: ['Work', 'Deadlines', 'Somatic', 'Product Launch'],
    aiReflection: 'Notice how your immediate somatic response (chest tightness) was tied directly to perceived uncontrollability. Setting boundaries today preserved mental bandwidth.',
    biometricsSnapshot: { hrvScore: 54, stressScore: 78, energyScore: 42, sleepHours: 6.1, sleepQuality: 62, dailySteps: 4100, restingHeartRate: 74 },
    projectContextSnapshot: { sprintPressure: 'High', pendingTasks: 4, activeProject: 'Product Launch v2.0 Architecture' },
    mindseraLinkedEntryId: 'mindsera-1',
    appliedFramework: 'Dichotomy of Control',
    mindseraMindsComments: [
      {
        id: 'mc-1',
        persona: 'stoic',
        personaTitle: 'Marcus Aurelius (Stoic Lens)',
        frameworkName: 'Dichotomy of Control',
        commentText: 'The bug reports belong to fortune; only your composure and integrity belong to you.',
        actionableInquiry: 'What single task can you execute with total stillness right now?',
        timestamp: getOffsetDate(0, '15:48').timestamp,
      },
      {
        id: 'mc-2',
        persona: 'psychologist',
        personaTitle: 'Carl Rogers (Psychological Lens)',
        frameworkName: 'Cognitive Restructuring',
        commentText: 'Acknowledge the physical fear response with warmth—it is trying to keep you safe.',
        actionableInquiry: 'Can you place one hand on your chest and breathe into the tightness?',
        timestamp: getOffsetDate(0, '15:50').timestamp,
      },
    ],
  },
  {
    id: 'entry-2',
    ...getOffsetDate(1, '20:15'),
    primaryEmotion: 'Joyful',
    secondaryEmotion: 'Content',
    tertiaryEmotion: 'Peaceful',
    emotionColor: '#F59E0B',
    intensity: 8,
    promptUsed: 'What internal permission slip did you give yourself to arrive at this peace?',
    journalText: 'Took a 45-minute evening walk through the park with no headphones. The sunset lit up the trees in copper and gold. I gave myself permission to not think about next quarter’s strategy. Cooked a simple soup and ate in quiet contentment.',
    somaticSensations: ['Relaxed shoulders', 'Deep easy breathing', 'Grounded feet'],
    tags: ['Nature', 'Evening Walk', 'Self-Care'],
    aiReflection: 'The intentional sensory immersion during your walk directly nourished your parasympathetic nervous system, reflecting optimal restorative recovery.',
    biometricsSnapshot: { hrvScore: 78, stressScore: 28, energyScore: 72, sleepHours: 7.8, sleepQuality: 88, dailySteps: 11200, restingHeartRate: 58 },
    projectContextSnapshot: { sprintPressure: 'Moderate', pendingTasks: 1 },
    mindseraLinkedEntryId: 'mindsera-2',
    appliedFramework: 'Autonomic Nervous System Reset',
    mindseraMindsComments: [
      {
        id: 'mc-4',
        persona: 'neuroscientist',
        personaTitle: 'Andrew Huberman (Neuroscience Lens)',
        frameworkName: 'Autonomic Nervous System Reset',
        commentText: 'Panoramic visual gaze during your walk activated ocular divergence, restoring autonomic tone.',
        actionableInquiry: 'How can you protect this evening sensory routine permanently?',
        timestamp: getOffsetDate(1, '20:35').timestamp,
      },
    ],
  },
  {
    id: 'entry-3',
    ...getOffsetDate(2, '11:45'),
    primaryEmotion: 'Angry',
    secondaryEmotion: 'Frustrated',
    tertiaryEmotion: 'Annoyed',
    emotionColor: '#EF4444',
    intensity: 6,
    promptUsed: 'Is this annoyance about the small trigger itself, or is your stress tank already full?',
    journalText: 'The meeting was delayed 20 minutes with zero warning, and people kept speaking over each other. At first I blamed the project lead, but reading the prompt made me realize I slept poorly last night and hadn’t eaten breakfast. My baseline irritation was pre-loaded.',
    somaticSensations: ['Clenched jaw / teeth', 'Chest tightness'],
    tags: ['Meetings', 'Communication', 'Awareness', 'Team'],
    aiReflection: 'Great cognitive reappraisal! Recognizing physiological vulnerabilities (sleep deficit) prevents projecting internal tension onto external hiccups.',
    biometricsSnapshot: { hrvScore: 48, stressScore: 74, energyScore: 36, sleepHours: 5.6, sleepQuality: 54, dailySteps: 3400, restingHeartRate: 72 },
    projectContextSnapshot: { sprintPressure: 'High', pendingTasks: 5, activeProject: 'Product Launch v2.0 Architecture' },
    mindseraLinkedEntryId: 'mindsera-3',
    appliedFramework: 'Cognitive Restructuring (ABCDE)',
    mindseraMindsComments: [
      {
        id: 'mc-6',
        persona: 'psychologist',
        personaTitle: 'Albert Ellis (CBT Lens)',
        frameworkName: 'Cognitive Restructuring',
        commentText: 'You caught the Affect Heuristic before projecting fatigue onto your colleagues.',
        actionableInquiry: 'What boundary around sleep must become an unbreakable commitment?',
        timestamp: getOffsetDate(2, '12:10').timestamp,
      },
    ],
  },
  {
    id: 'entry-4',
    ...getOffsetDate(3, '09:10'),
    primaryEmotion: 'Powerful',
    secondaryEmotion: 'Confident',
    tertiaryEmotion: 'Focused',
    emotionColor: '#10B981',
    intensity: 9,
    promptUsed: 'What specific strength in your character is operating right now?',
    journalText: 'Woke up early and finished the core algorithm draft before opening Slack. Entering flow state early creates an incredible buffer of peace throughout the day. Clear thinking feels effortless when circadian rhythm is honored.',
    somaticSensations: ['Warm chest', 'Deep steady breathing', 'Clear head'],
    tags: ['Deep Work', 'Circadian', 'Productivity'],
    aiReflection: 'Protecting morning cognitive bandwidth before external inputs arrive produces sustained neurochemical focus without adrenaline spikes.',
    biometricsSnapshot: { hrvScore: 74, stressScore: 34, energyScore: 82, sleepHours: 7.6, sleepQuality: 86, dailySteps: 6200, restingHeartRate: 59 },
    projectContextSnapshot: { sprintPressure: 'Moderate', pendingTasks: 2 },
  },
  {
    id: 'entry-5',
    ...getOffsetDate(4, '18:40'),
    primaryEmotion: 'Sad',
    secondaryEmotion: 'Lonely',
    tertiaryEmotion: 'Disconnected',
    emotionColor: '#3B82F6',
    intensity: 6,
    promptUsed: 'What unmet connection need is your sadness pointing toward?',
    journalText: 'Realized I haven’t had a genuine, unhurried conversation with a friend in over two weeks because of this sprint. Remote work and deadline pressure create a bubble. Reached out to Alex to schedule dinner this weekend.',
    somaticSensations: ['Heavy eyelids', 'Lump in throat', 'Hollow stomach'],
    tags: ['Connection', 'Friendship', 'Vulnerability'],
    aiReflection: 'Loneliness is an adaptive social signal reminding you that humans cannot thrive on transactional task completion alone.',
    biometricsSnapshot: { hrvScore: 56, stressScore: 62, energyScore: 50, sleepHours: 6.8, sleepQuality: 70, dailySteps: 5100, restingHeartRate: 67 },
    projectContextSnapshot: { sprintPressure: 'High', pendingTasks: 4 },
  },
  {
    id: 'entry-6',
    ...getOffsetDate(5, '16:15'),
    primaryEmotion: 'Peaceful',
    secondaryEmotion: 'Content',
    tertiaryEmotion: 'Satisfied',
    emotionColor: '#14B8A6',
    intensity: 8,
    promptUsed: 'Where can you step back and appreciate the distance you have traveled?',
    journalText: 'Deleted 800 lines of redundant code in our caching service. Realized we were over-engineering out of anxiety rather than actual performance metrics. The architecture is now elegant, fast, and simple.',
    somaticSensations: ['Relaxed neck', 'Deep easy breathing'],
    tags: ['Architecture', 'First Principles', 'Simplicity'],
    aiReflection: 'The wisdom to remove complexity rather than add to it is the hallmark of mature engineering and psychological mastery.',
    biometricsSnapshot: { hrvScore: 72, stressScore: 38, energyScore: 76, sleepHours: 7.4, sleepQuality: 84, dailySteps: 8900, restingHeartRate: 60 },
    projectContextSnapshot: { sprintPressure: 'Moderate', pendingTasks: 2 },
    mindseraLinkedEntryId: 'mindsera-4',
    appliedFramework: 'First-Principles Leverage',
    mindseraMindsComments: [
      {
        id: 'mc-8',
        persona: 'strategist',
        personaTitle: 'First-Principles Strategist',
        frameworkName: 'First-Principles Leverage',
        commentText: 'Simplicity is prerequisite for reliability. Rejecting premature optimization is an intellectual triumph that saves months of future maintenance debt.',
        actionableInquiry: 'What other area of your personal workflow is suffering from unnecessary complexity masquerading as thoroughness?',
        timestamp: getOffsetDate(5, '16:15').timestamp,
      },
    ],
  },
  {
    id: 'entry-7',
    ...getOffsetDate(6, '14:00'),
    primaryEmotion: 'Fearful',
    secondaryEmotion: 'Anxious',
    tertiaryEmotion: 'Apprehensive',
    emotionColor: '#8B5CF6',
    intensity: 6,
    promptUsed: 'What is the catastrophe you are anticipating, and what evidence contradicts it?',
    journalText: 'Anticipating tomorrow’s executive presentation. Stomach had slight butterflies. Wrote down the worst-case scenario: what if they ask a question I can’t answer? The realistic response is simply: "I don’t know yet, but I will investigate and follow up by 3 PM."',
    somaticSensations: ['Stomach flutter', 'Cold hands'],
    tags: ['Presentation', 'Anxiety', 'Pre-mortem'],
    aiReflection: 'Pre-mortem cognitive rehearsal defangs the catastrophic imagination, transforming vague dread into procedural readiness.',
    biometricsSnapshot: { hrvScore: 58, stressScore: 66, energyScore: 54, sleepHours: 6.5, sleepQuality: 68, dailySteps: 6400, restingHeartRate: 69 },
    projectContextSnapshot: { sprintPressure: 'High', pendingTasks: 3 },
    mindseraLinkedEntryId: 'mindsera-5',
    appliedFramework: 'Socratic Inversion',
    mindseraMindsComments: [
      {
        id: 'mc-10',
        persona: 'challenger',
        personaTitle: 'Socratic Inquirer (Challenger Lens)',
        frameworkName: 'Socratic Inversion',
        commentText: 'What if the board is not looking to punish you, but seeking your candid technical assessment? By treating inquiry as hostility, you prepare for combat instead of collaboration.',
        actionableInquiry: 'What would a calm, totally unthreatened engineering leader say in that room tomorrow?',
        coreDichotomyOrInsight: 'Hostile projection vs. objective partnership.',
        timestamp: getOffsetDate(6, '14:35').timestamp,
      },
    ],
  },
  {
    id: 'entry-8',
    ...getOffsetDate(10, '17:30'),
    primaryEmotion: 'Sad',
    secondaryEmotion: 'Vulnerable',
    tertiaryEmotion: 'Fragile',
    emotionColor: '#6366F1',
    intensity: 7,
    promptUsed: 'What part of your inner child or human vulnerability is asking to be acknowledged right now?',
    journalText: 'Felt an unexpected wave of exhaustion after pushing through back-to-back client deployments. I keep wanting to prove that I can carry everything without asking for help. Admitted to my partner that I was running on empty.',
    somaticSensations: ['Heavy chest', 'Fatigue in limbs', 'Watery eyes'],
    tags: ['Vulnerability', 'Burnout Prevention', 'Self-Compassion'],
    aiReflection: 'Allowing yourself to feel fragile without immediately rushing to perform resilience is the ultimate strength.',
    biometricsSnapshot: { hrvScore: 49, stressScore: 71, energyScore: 38, sleepHours: 5.8, sleepQuality: 58, dailySteps: 4800, restingHeartRate: 71 },
    projectContextSnapshot: { sprintPressure: 'High', pendingTasks: 4 },
    appliedFramework: 'Cognitive Restructuring (CBT / ABCDE)',
    mindseraMindsComments: [
      {
        id: 'mc-15',
        persona: 'psychologist',
        personaTitle: 'Carl Rogers (Psychological Lens)',
        frameworkName: 'Cognitive Restructuring',
        commentText: 'The curious paradox is that when I accept myself just as I am, then I can change. Acknowledge that needing rest is an honorable human reality, not a systemic failure.',
        actionableInquiry: 'What would happen if you ceased trying to be superhuman for just 48 hours?',
        coreDichotomyOrInsight: 'Self-acceptance vs. compulsive over-functioning.',
        timestamp: getOffsetDate(10, '17:38').timestamp,
      },
    ],
  },
  {
    id: 'entry-9',
    ...getOffsetDate(14, '11:15'),
    primaryEmotion: 'Surprised',
    secondaryEmotion: 'Moved',
    tertiaryEmotion: 'Grateful',
    emotionColor: '#EC4899',
    intensity: 8,
    promptUsed: 'What unexpected gift or kindness appeared in your day unbidden?',
    journalText: 'A junior engineer on the team sent a heartfelt note thanking me for mentoring them through their first major PR merge. It caught me off guard and reminded me why teaching and nurturing matters more than raw code velocity.',
    somaticSensations: ['Warm chest', 'Relaxed jaw', 'Tears of gratitude'],
    tags: ['Mentorship', 'Gratitude', 'Team', 'Connection'],
    aiReflection: 'Relational connection and generative mentorship directly buffer occupational cynicism and restore allostatic vitality.',
    biometricsSnapshot: { hrvScore: 77, stressScore: 31, energyScore: 79, sleepHours: 7.7, sleepQuality: 87, dailySteps: 7600, restingHeartRate: 58 },
    projectContextSnapshot: { sprintPressure: 'Moderate', pendingTasks: 2 },
    appliedFramework: 'Dichotomy of Control',
    mindseraMindsComments: [
      {
        id: 'mc-16',
        persona: 'stoic',
        personaTitle: 'Seneca (Stoic Lens)',
        frameworkName: 'Dichotomy of Control',
        commentText: 'Wherever there is a human being, there is an opportunity for a kindness. True prosperity is not measuring what you have extracted from the world, but the clarity of goodwill you leave behind.',
        actionableInquiry: 'How can you weave intentional mentorship into your daily rhythm as a non-negotiable anchor?',
        coreDichotomyOrInsight: 'Relational legacy vs. transactional productivity.',
        timestamp: getOffsetDate(14, '11:22').timestamp,
      },
    ],
  },
  {
    id: 'entry-10',
    ...getOffsetDate(21, '19:45'),
    primaryEmotion: 'Powerful',
    secondaryEmotion: 'Courageous',
    tertiaryEmotion: 'Determined',
    emotionColor: '#10B981',
    intensity: 9,
    promptUsed: 'What boundary did you firmly uphold today in the face of pressure?',
    journalText: 'Pushed back against an unrealistic scope change requested at 4:30 PM on a Friday. Explained the trade-offs cleanly without anger or apology. The stakeholder respected the transparency and agreed to push to the following sprint.',
    somaticSensations: ['Tall spine', 'Grounded feet', 'Even steady breath'],
    tags: ['Boundaries', 'Courage', 'Leadership'],
    aiReflection: 'Upholding boundaries with calm clarity demonstrates executive maturity, protecting team equilibrium from reactionary urgency.',
    biometricsSnapshot: { hrvScore: 71, stressScore: 39, energyScore: 74, sleepHours: 7.3, sleepQuality: 82, dailySteps: 9100, restingHeartRate: 61 },
    projectContextSnapshot: { sprintPressure: 'Moderate', pendingTasks: 1 },
    appliedFramework: 'First-Principles Leverage',
    mindseraMindsComments: [
      {
        id: 'mc-17',
        persona: 'challenger',
        personaTitle: 'Socratic Inquirer (Challenger Lens)',
        frameworkName: 'Socratic Inversion',
        commentText: 'You proved that saying "No" to scope creep is actually saying "Yes" to shipping reliable, defect-free software. Notice how fear of disappointing others was your only obstacle.',
        actionableInquiry: 'What other artificial obligation are you tolerating that deserves a respectful, decisive "No"?',
        coreDichotomyOrInsight: 'Courageous boundary vs. appeasement debt.',
        timestamp: getOffsetDate(21, '19:52').timestamp,
      },
    ],
  },
  {
    id: 'entry-11',
    ...getOffsetDate(28, '08:30'),
    primaryEmotion: 'Disgusted',
    secondaryEmotion: 'Averse',
    tertiaryEmotion: 'Overwhelmed',
    emotionColor: '#84CC16',
    intensity: 7,
    promptUsed: 'What unhealthy dynamic or habit has reached its expiration date in your life?',
    journalText: 'Caught myself checking email at 6:15 AM before even getting out of bed, feeling instant knot in stomach. Realized this compulsive habit poisons the first hour of my day with external demands.',
    somaticSensations: ['Knot in stomach', 'Tense shoulders', 'Dry mouth'],
    tags: ['Digital Detox', 'Habits', 'Morning Routine'],
    aiReflection: 'Physical repulsion toward a toxic micro-habit is the catalyst for enduring environmental redesign.',
    biometricsSnapshot: { hrvScore: 52, stressScore: 69, energyScore: 46, sleepHours: 6.2, sleepQuality: 64, dailySteps: 5300, restingHeartRate: 70 },
    projectContextSnapshot: { sprintPressure: 'High', pendingTasks: 5 },
    appliedFramework: 'Autonomic Nervous System Reset',
    mindseraMindsComments: [
      {
        id: 'mc-18',
        persona: 'neuroscientist',
        personaTitle: 'Andrew Huberman (Neuroscience Lens)',
        frameworkName: 'Autonomic Nervous System Reset',
        commentText: 'Viewing blue light notifications within 15 minutes of waking triggers an unnatural spike in cortisol prior to circadian adenosine clearance, pre-loading your autonomic tone with sympathetic alarm.',
        actionableInquiry: 'Will you charge your phone outside the bedroom tonight to physically prevent morning dopaminergic hijacking?',
        coreDichotomyOrInsight: 'Circadian biology vs. device reflex.',
        timestamp: getOffsetDate(28, '08:35').timestamp,
      },
    ],
  },
];

// ============================================================================
// LOCAL STORAGE PERSISTENCE HELPERS
// ============================================================================
const STORAGE_KEYS = {
  MOOD_ENTRIES: 'feelings_wheel_entries_v2',
  WELLTORY: 'feelings_wheel_welltory_v2',
  MINDSERA: 'feelings_wheel_mindsera_v2',
  MINDSARA_LEGACY: 'feelings_wheel_mindsara_v1',
  SAMSUNG_HEALTH: 'feelings_wheel_samsung_health_v2',
  TASK_PROJECTS: 'feelings_wheel_task_projects_v2',
  AI_COWORK: 'feelings_wheel_ai_cowork_v2',
  GEMINI_SPARK: 'feelings_wheel_gemini_spark_v2',
};

export function loadStoredEntries(): MoodEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOOD_ENTRIES);
    if (!raw) return SEED_MOOD_ENTRIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_MOOD_ENTRIES;
  } catch {
    return SEED_MOOD_ENTRIES;
  }
}

export function saveStoredEntries(entries: MoodEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MOOD_ENTRIES, JSON.stringify(entries));
  } catch (err) {
    console.warn('Notice saving entries', err);
  }
}

export function loadStoredWelltory(): WelltoryBiometrics {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WELLTORY);
    if (!raw) return INITIAL_WELLTORY_BIOMETRICS;
    return { ...INITIAL_WELLTORY_BIOMETRICS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_WELLTORY_BIOMETRICS;
  }
}

export function saveStoredWelltory(data: WelltoryBiometrics): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WELLTORY, JSON.stringify(data));
  } catch (err) {
    console.warn('Notice saving Welltory data', err);
  }
}

export function loadStoredMindsera(): MindseraContext {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MINDSERA) || localStorage.getItem(STORAGE_KEYS.MINDSARA_LEGACY);
    if (!raw) return INITIAL_MINDSERA_CONTEXT;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_MINDSERA_CONTEXT, ...parsed, customFrameworks: MINDSERA_FRAMEWORKS };
  } catch {
    return INITIAL_MINDSERA_CONTEXT;
  }
}

export function saveStoredMindsera(data: MindseraContext): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MINDSERA, JSON.stringify(data));
  } catch (err) {
    console.warn('Notice saving Mindsera data', err);
  }
}

// Aliases for backward-compatibility with prior components
export const loadStoredMindsara = loadStoredMindsera;
export const saveStoredMindsara = saveStoredMindsera;

export function loadStoredSamsungHealth(): SamsungHealthData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAMSUNG_HEALTH);
    if (!raw) return INITIAL_SAMSUNG_HEALTH;
    return { ...INITIAL_SAMSUNG_HEALTH, ...JSON.parse(raw) };
  } catch {
    return INITIAL_SAMSUNG_HEALTH;
  }
}

export function saveStoredSamsungHealth(data: SamsungHealthData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAMSUNG_HEALTH, JSON.stringify(data));
  } catch (err) {
    console.warn('Notice saving Samsung Health data', err);
  }
}

export function loadStoredTasks(): TaskProjectData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASK_PROJECTS);
    if (!raw) return INITIAL_TASK_PROJECTS;
    return { ...INITIAL_TASK_PROJECTS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_TASK_PROJECTS;
  }
}

export function saveStoredTasks(data: TaskProjectData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASK_PROJECTS, JSON.stringify(data));
  } catch (err) {
    console.warn('Notice saving Task data', err);
  }
}

export function loadStoredAiCoWork(): AiCoWorkData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_COWORK);
    if (!raw) return INITIAL_AI_COWORK;
    return { ...INITIAL_AI_COWORK, ...JSON.parse(raw) };
  } catch {
    return INITIAL_AI_COWORK;
  }
}

export function saveStoredAiCoWork(data: AiCoWorkData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AI_COWORK, JSON.stringify(data));
  } catch (err) {
    console.warn('Notice saving AI Co-Work data', err);
  }
}

export function loadStoredGeminiSpark(): GeminiSparkData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GEMINI_SPARK);
    if (!raw) return INITIAL_GEMINI_SPARK;
    return { ...INITIAL_GEMINI_SPARK, ...JSON.parse(raw) };
  } catch {
    return INITIAL_GEMINI_SPARK;
  }
}

export function saveStoredGeminiSpark(data: GeminiSparkData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GEMINI_SPARK, JSON.stringify(data));
  } catch (err) {
    console.warn('Notice saving Gemini Spark data', err);
  }
}
