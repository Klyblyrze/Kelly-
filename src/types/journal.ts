export type EmotionLevel = 'primary' | 'secondary' | 'tertiary';

export interface EmotionNode {
  id: string;
  name: string;
  parentId?: string;
  level: EmotionLevel;
  color: string;
  lightColor: string;
  description: string;
  somaticClues: string[];
  defaultPrompts: string[];
  children?: EmotionNode[];
}

export interface EmotionSelection {
  primary: string;
  secondary?: string;
  tertiary?: string;
  fullPath: string[];
  node: EmotionNode;
}

// ==========================================
// WELLTORY INTEGRATION (https://app.welltory.com/dashboard/)
// ==========================================
export interface WelltoryDayRecord {
  date: string;
  hrvScore: number; // RMSSD (ms)
  stressScore: number; // 0-100%
  energyScore: number; // 0-100%
  recoveryStatus: 'Low' | 'Moderate' | 'Optimal';
  autonomicBalance: string; // e.g. "Sympathetic Dominant", "Vagal Recovery"
  amMeasurementHrv?: number;
  pmMeasurementHrv?: number;
}

export interface WelltoryBiometrics {
  enabled: boolean;
  dashboardUrl: string; // https://app.welltory.com/dashboard/
  hrvScore: number; // e.g. 58 ms (RMSSD)
  stressScore: number; // 0-100%
  energyScore: number; // 0-100%
  sleepQuality: number; // 0-100%
  recoveryStatus: 'Low' | 'Moderate' | 'Optimal';
  autonomicBalance: string;
  vascularStatus: string;
  historicalDays: WelltoryDayRecord[];
  lastSyncTimestamp: string;
}

// ==========================================
// MINDSERA INTEGRATION (https://beta.mindsera.com/)
// Minds Comments, Custom Frameworks & Templates
// ==========================================
export type MindseraPersona =
  | 'stoic'
  | 'psychologist'
  | 'challenger'
  | 'strategist'
  | 'neuroscientist';

export interface MindseraFramework {
  id: string;
  name: string;
  category: 'Stoicism' | 'Psychology & Somatic' | 'Critical Thinking' | 'Decision Making' | 'Neuroscience';
  description: string;
  promptTemplate: string;
  defaultPersona: MindseraPersona;
  steps: string[];
}

export interface MindseraMindsComment {
  id: string;
  persona: MindseraPersona;
  personaTitle: string; // e.g., "Marcus Aurelius (Stoic)", "Carl Rogers (Psychologist)", "Socratic Inquirer (Challenger)"
  frameworkName?: string;
  frameworkId?: string;
  commentText: string;
  actionableInquiry: string;
  coreDichotomyOrInsight?: string;
  timestamp: string;
}

export interface MindseraSyncedEntry {
  id: string;
  title: string;
  date: string;
  time: string;
  content: string;
  frameworkUsed?: string;
  mindsComments: MindseraMindsComment[];
  tags: string[];
  cognitiveBiasesDetected: string[];
  linkedMoodEntryId?: string;
  syncStatus: 'synced' | 'local_only' | 'pending';
}

export interface MindseraContext {
  enabled: boolean;
  betaUrl: string; // https://beta.mindsera.com/
  recurringThemes: string[];
  recentKeyTakeaways: string[];
  cognitiveBiasesNoted: string[];
  totalSyncedEntries: number;
  activePersona: MindseraPersona;
  activeFrameworkId: string;
  customFrameworks: MindseraFramework[];
  syncedEntries: MindseraSyncedEntry[];
  lastSyncTimestamp: string;
}

// Backward compatibility alias for previous Mindsara naming
export type MindsaraContext = MindseraContext;

// ==========================================
// TICKTICK INTEGRATION (https://mcp.ticktick.com)
// Model Context Protocol (MCP) Task & Sprint Intelligence
// ==========================================
export interface TickTickDayRecord {
  date: string;
  completedTasks: number;
  pendingHighPriorityTasks: number;
  sprintPressure: 'Low' | 'Moderate' | 'High' | 'Crunch';
  p1Count: number;
  p2Count: number;
  topTaskCompleted?: string;
}

export interface TaskProjectData {
  enabled: boolean;
  mcpEndpointUrl: string; // https://mcp.ticktick.com
  activeProjects: string[];
  completedTasksToday: number;
  pendingHighPriorityTasks: number;
  currentSprintPressure: 'Low' | 'Moderate' | 'High' | 'Crunch';
  upcomingDeadlines: string[];
  priorityDistribution: { p1: number; p2: number; p3: number; p4: number };
  historicalDays: TickTickDayRecord[];
  lastSyncTimestamp: string;
}

export type TickTickData = TaskProjectData;

// ==========================================
// SAMSUNG HEALTH INTEGRATION
// ==========================================
export interface SamsungHealthDayRecord {
  date: string;
  sleepHours: number;
  sleepQuality: number;
  deepSleepPercentage: number;
  dailySteps: number;
  restingHeartRate: number;
}

export interface SamsungHealthData {
  enabled: boolean;
  sleepHours: number; // e.g. 7.2 hrs
  sleepQuality: number; // 0-100% (e.g. 82%)
  deepSleepPercentage: number; // e.g. 19%
  dailySteps: number; // e.g. 8450
  activeMinutes: number; // e.g. 42 mins
  restingHeartRate: number; // e.g. 61 bpm
  bloodOxygenSpO2: number; // e.g. 98%
  respiratoryRate: number; // e.g. 14 breaths/min
  historicalDays: SamsungHealthDayRecord[];
  lastSyncTimestamp: string;
}

// ==========================================
// AI CO-WORK & AMBIENT INTELLIGENCE
// ==========================================
export interface AiCoWorkData {
  enabled: boolean;
  scheduledPromptCadence: string;
  recentCoWorkFocus: string[];
  cognitiveLoadScore: number; // 0-100%
  lastSyncTimestamp: string;
}

export interface GeminiSparkData {
  enabled: boolean;
  ambientTriggerEnabled: boolean;
  recentSparks: string[];
  lastSparkTimestamp: string;
}

// ==========================================
// JOURNAL ENTRY & DATA RECONCILIATION
// ==========================================
export interface MoodEntry {
  id: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  primaryEmotion: string;
  secondaryEmotion?: string;
  tertiaryEmotion?: string;
  emotionColor: string;
  intensity: number; // 1 to 10
  promptUsed?: string;
  journalText: string;
  somaticSensations: string[];
  tags: string[];
  aiReflection?: string;
  biometricsSnapshot?: {
    hrvScore?: number;
    stressScore?: number;
    energyScore?: number;
    sleepHours?: number;
    sleepQuality?: number;
    dailySteps?: number;
    restingHeartRate?: number;
    respiratoryRate?: number;
  };
  projectContextSnapshot?: {
    sprintPressure?: 'Low' | 'Moderate' | 'High' | 'Crunch';
    pendingTasks?: number;
    activeProject?: string;
  };
  // Mindsera Reconciliation Layer
  mindseraLinkedEntryId?: string;
  mindseraMindsComments?: MindseraMindsComment[];
  appliedFramework?: string;
  mindsaraThemesReferenced?: string[];
  mindseraThemesReferenced?: string[];
}

export interface GeneratedPrompt {
  id: string;
  category: 'Deep Reflection' | 'Somatic & Grounding' | 'Cognitive Shift' | 'Creative & Forward';
  prompt: string;
  rationale?: string;
}

export interface PatternInsight {
  id: string;
  title: string;
  timeframe: string;
  observation: string;
  patternType: 'trigger' | 'rhythm' | 'shift' | 'resilience';
  suggestedPrompts: string[];
  dominantEmotions: { name: string; percentage: number; color: string }[];
}

export interface MoodForecastDay {
  dayLabel: string;
  dateStr: string;
  predictedValence: string;
  predictedIntensity: number;
  riskFactors: string[];
  protectiveFactors: string[];
  somaticRecommendation: string;
}

export interface MoodForecast {
  projectedHorizon: string;
  forecastSummary: string;
  resilienceBufferScore: number; // 0 - 100%
  days: MoodForecastDay[];
  preemptiveJournalPrompt: string;
  preemptivePromptRationale: string;
}

export interface HistoryFilterState {
  searchQuery: string;
  selectedEmotions: string[];
  dateRangePreset: 'all' | '7d' | '30d' | 'this_month' | 'last_3m' | 'custom';
  fromDate: string;
  toDate: string;
  minIntensity: number;
  maxIntensity: number;
  selectedSomatic: string[];
  hasReflectionOnly: boolean;
}
