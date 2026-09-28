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

export interface MindseraCustomMindLens {
  id: string;
  key: string;
  name: string; // e.g. "Marcus Aurelius", "Carl Jung", "Charlie Munger", "Simone de Beauvoir", "Andrew Huberman"
  title: string; // e.g. "Stoic Emperor Lens", "Shadow Integration Lens"
  description: string;
  tone: string;
  systemDirective: string;
  coreQuestionFocus: string;
  isCustom?: boolean;
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
  customLenses?: MindseraCustomMindLens[];
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
  // Sobriety & Addiction Treatment Snapshot
  recoverySnapshot?: {
    daysSober?: number;
    cravingLevel?: number; // 0 to 10
    haltTriggers?: ('Hungry' | 'Angry' | 'Lonely' | 'Tired')[];
    urgeSurfed?: boolean;
    reframedThought?: string;
    supportContactReached?: boolean;
  };
  // Mindsera Reconciliation Layer
  mindseraLinkedEntryId?: string;
  mindseraMindsComments?: MindseraMindsComment[];
  appliedFramework?: string;
  mindsaraThemesReferenced?: string[];
  mindseraThemesReferenced?: string[];
  sentimentAnalysis?: {
    valence: 'Positive' | 'Challenging' | 'Cathartic Growth' | 'Neutral';
    score: number;
    emotionTags: string[];
    themeTags: string[];
  };
}

// ==========================================
// SOBRIETY & ALCOHOL ADDICTION TREATMENT DATA
// ==========================================
export type RecoveryTreatmentApproach =
  | 'SMART Recovery'
  | 'CBT Relapse Prevention'
  | '12-Step / AA'
  | 'Harm Reduction'
  | 'Mindful Sobriety (This Naked Mind)';

export interface HealthMilestoneProgress {
  days: number;
  title: string;
  scientificImpact: string;
  achieved: boolean;
}

export interface UrgeSurfingRecord {
  id: string;
  timestamp: string;
  trigger: string;
  peakCravingLevel: number; // 1-10
  surfingDurationSeconds: number;
  somaticFocusUsed: string;
  outcome: 'Rode the wave successfully' | 'Urge faded with somatic reset' | 'Sought support';
}

export interface CustomEmergencyContact {
  id: string;
  name: string;
  relationship: string; // e.g. "Sponsor", "Partner", "Therapist", "Close Friend", "Brother"
  phoneOrHandle: string;
  preferredMethod: 'call' | 'text' | 'whatsapp' | 'signal';
  notes: string; // e.g. "Available after 6 PM, knows about my recovery goals"
  isPrimaryUrgeContact?: boolean;
}

export interface RelapseCycleStageData {
  stage: 1 | 2 | 3;
  name: 'Emotional Relapse' | 'Mental Relapse' | 'Physical Relapse';
  subtitle: string;
  coreCharacteristics: string[];
  historicalTriggersDetected: {
    triggerName: string;
    frequencyCount: number;
    correlatedEmotion: string;
    biometricMarker: string;
    sampleJournalQuote: string;
  }[];
  warningSignsFromData: string[];
  clinicalInterventions: {
    title: string;
    type: 'somatic' | 'cognitive' | 'social' | 'environmental';
    actionText: string;
  }[];
}

export interface RelapseCycleAnalysis {
  overallRiskLevel: 'Low' | 'Moderate' | 'Elevated' | 'Acute';
  currentActiveStage: 1 | 2 | 3 | null;
  autonomicStressCorrelation: string;
  sleepDebtCorrelation: string;
  stages: RelapseCycleStageData[];
}

export interface SobrietyRecoveryContext {
  enabled: boolean;
  sobrietyStartDate: string; // YYYY-MM-DD
  currentStreakDays: number;
  treatmentApproach: RecoveryTreatmentApproach;
  currentCravingLevel: number; // 0 to 10
  haltState: {
    hungry: boolean;
    angry: boolean;
    lonely: boolean;
    tired: boolean;
  };
  triggersIdentified: string[];
  copingToolbox: string[];
  alcoholAvoidedUnits: number; // Standard drinks (e.g. 14g pure alcohol)
  moneySavedEstimated: number; // In dollars
  healthMilestones: HealthMilestoneProgress[];
  urgeSurfingHistory: UrgeSurfingRecord[];
  emergencySupportContacts: {
    name: string;
    phoneOrUrl: string;
    role: string;
  }[];
  customSupportContacts?: CustomEmergencyContact[];
  lastCheckInTimestamp: string;
}

// ==========================================
// ACTION SUGGESTIONS ENGINE (LIFE DOMAINS, THERAPEUTIC & EXPLORATION)
// ==========================================
export type ActionDomain =
  | 'Productivity & Work'
  | 'Finances & Life Admin'
  | 'School & Skill Growth'
  | 'Relationships & Social'
  | 'Therapeutic & Somatic'
  | 'Journaling & Reflection';

export interface ActionSuggestion {
  id: string;
  title: string;
  domain: ActionDomain;
  priority: 'High' | 'Medium' | 'Routine';
  description: string;
  dataRationale: string;
  concreteSteps: string[];
  journalPrompt?: string;
  exerciseType?: 'breathing' | 'cbt_reframe' | 'vagal_reset' | 'grounding';
  timeEstimate: string;
  completed?: boolean;
}

// ==========================================
// PERSONAL ANALYSIS & TRAIT GROWTH ENGINE
// ==========================================
export type PersonalAnalysisPeriod = '7d' | '30d' | 'all';

export interface PersonalityTraitInsight {
  traitName: string;
  category: 'strength' | 'weakness' | 'emerging_quality';
  dimension: 'Conscientiousness' | 'Emotional Depth' | 'Distress Tolerance' | 'Cognitive Agility' | 'Self-Compassion';
  score: number; // 0 to 100
  trend: 'increasing' | 'stable' | 'fluctuating';
  description: string;
  journalEvidenceQuotes: {
    date: string;
    quote: string;
    emotion: string;
  }[];
  biometricCorrelations: string;
  actionableRecommendation: string;
}

export interface PersonalAnalysisReport {
  period: PersonalAnalysisPeriod;
  periodLabel: string;
  archetypeTitle: string;
  archetypeSubtitle: string;
  executiveSummary: string;
  strengths: PersonalityTraitInsight[];
  weaknesses: PersonalityTraitInsight[];
  emergingQualities: PersonalityTraitInsight[];
  psychologicalEvolutionNarrative: string;
  growthMetrics: {
    emotionalGranularityScore: number; // 0-100
    resilienceCapacityScore: number; // 0-100
    vulnerabilityOpennessScore: number; // 0-100
    somaticAwarenessScore: number; // 0-100
  };
}

export interface GeneratedPrompt {
  id: string;
  category:
    | 'Deep Reflection'
    | 'Somatic & Grounding'
    | 'Cognitive Shift'
    | 'Creative & Forward'
    | 'Sobriety & Relapse Prevention';
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

// ==========================================
// EXPANDED THIRD-PARTY INTEGRATIONS & SYNC ENGINE
// ==========================================
export type IntegrationCategory =
  | 'Wearables & Biometrics'
  | 'Mental Health & Cognition'
  | 'Productivity & Sprints'
  | 'Lifestyle & Habits'
  | 'Custom APIs';

export interface ThirdPartyIntegration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  iconName: string;
  connected: boolean;
  accountIdentifier: string; // e.g. "k.rzendzian@welltory.id", "k.rzendzian@samsung.com"
  verifiedOwnerEmail: string; // e.g. "k.rzendzian@gmail.com"
  authType: 'OAuth 2.0 PKCE' | 'Bearer Token' | 'Direct MCP' | 'Apple HealthKit Local' | 'API Key';
  syncStatus: 'synced' | 'syncing' | 'idle' | 'warning' | 'disconnected';
  lastSyncTimestamp: string;
  syncFrequency: 'realtime' | '15m' | 'hourly' | 'manual';
  dataIngestedSummary: string;
  permissions: string[];
  deviceHardware?: string;
  rawTelemetrySample?: Record<string, string | number | boolean | object>;
}

// ==========================================
// DAILY INTENTION & ACTION LINKING
// ==========================================
export type IntentionCategory =
  | 'Somatic'
  | 'Boundary'
  | 'Sobriety'
  | 'Productivity'
  | 'Connection'
  | 'Mindfulness';

export interface DailyIntention {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  category: IntentionCategory;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

// ==========================================
// CALL MODE & LIVE VOICE JOURNALING
// ==========================================
export interface CallModeMessage {
  id: string;
  role: 'user' | 'assistant';
  speakerName: string;
  text: string;
  timestamp: string;
}

export interface CallModeFinalizedSummary {
  journalTitle: string;
  primaryEmotion: string;
  secondaryEmotion: string;
  intensity: number;
  somaticSensations: string[];
  fullJournalText: string;
  keyBreakthrough: string;
  compassionateInsight: string;
  recommendedNextMicroAction: string;
}


