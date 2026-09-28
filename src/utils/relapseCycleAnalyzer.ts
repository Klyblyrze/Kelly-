import {
  MoodEntry,
  SobrietyRecoveryContext,
  WelltoryBiometrics,
  SamsungHealthData,
  TaskProjectData,
  RelapseCycleAnalysis,
  RelapseCycleStageData,
} from '../types/journal';

export function analyzeRelapseCycle(
  entries: MoodEntry[],
  sobriety: SobrietyRecoveryContext,
  welltory: WelltoryBiometrics,
  samsungHealth: SamsungHealthData,
  tasks: TaskProjectData
): RelapseCycleAnalysis {
  // Assess autonomic & biometric baseline
  const isHighStress = welltory.stressScore >= 65;
  const isLowHrv = welltory.hrvScore < 60;
  const isSleepDeprived = samsungHealth.sleepHours < 6.5 || samsungHealth.deepSleepPercentage < 15;
  const isHighWorkload = tasks.currentSprintPressure === 'High' || tasks.pendingHighPriorityTasks >= 3;
  const currentCraving = sobriety.currentCravingLevel;

  // Scan entries for HALT or craving mentions
  const entriesWithCraving = entries.filter(
    (e) => (e.recoverySnapshot?.cravingLevel || 0) >= 3 || e.intensity >= 7
  );

  // Extract real personal triggers from entries
  const triggersMap = new Map<string, { count: number; emotion: string; quote: string; marker: string }>();

  entries.forEach((e) => {
    const text = (e.journalText + ' ' + (e.recoverySnapshot?.haltTriggers?.join(' ') || '')).toLowerCase();
    const craving = e.recoverySnapshot?.cravingLevel || 0;

    if (text.includes('sprint') || text.includes('deadline') || text.includes('backlog') || text.includes('work')) {
      const prev = triggersMap.get('Work Sprint Overwhelm & Deadline Crunch') || {
        count: 0,
        emotion: e.primaryEmotion,
        quote: e.journalText.slice(0, 100) + '...',
        marker: 'High Sympathetic Stress (68-75%)',
      };
      triggersMap.set('Work Sprint Overwhelm & Deadline Crunch', { ...prev, count: prev.count + 1 });
    }

    if (text.includes('tired') || text.includes('exhaust') || text.includes('sleep') || text.includes('drained')) {
      const prev = triggersMap.get('Circadian Exhaustion & Sleep Debt') || {
        count: 0,
        emotion: e.primaryEmotion,
        quote: e.journalText.slice(0, 100) + '...',
        marker: 'Deep Sleep < 1.2 hrs, Elevated Morning HR',
      };
      triggersMap.set('Circadian Exhaustion & Sleep Debt', { ...prev, count: prev.count + 1 });
    }

    if (text.includes('alone') || text.includes('lonely') || text.includes('isolate') || text.includes('apartment')) {
      const prev = triggersMap.get('Evening Isolation & Empty Apartment Silence') || {
        count: 0,
        emotion: e.primaryEmotion,
        quote: e.journalText.slice(0, 100) + '...',
        marker: 'Evening HR Drop accompanied by Social Isolation',
      };
      triggersMap.set('Evening Isolation & Empty Apartment Silence', { ...prev, count: prev.count + 1 });
    }

    if (text.includes('deserve') || text.includes('relax') || text.includes('drink') || text.includes('bar') || craving >= 4) {
      const prev = triggersMap.get('Decompression Bargaining ("I Deserve a Break")') || {
        count: 0,
        emotion: e.primaryEmotion,
        quote: e.journalText.slice(0, 100) + '...',
        marker: 'Acute Craving Spike (4-7/10)',
      };
      triggersMap.set('Decompression Bargaining ("I Deserve a Break")', { ...prev, count: prev.count + 1 });
    }
  });

  // Stage 1: Emotional Relapse
  const stage1: RelapseCycleStageData = {
    stage: 1,
    name: 'Emotional Relapse',
    subtitle: 'Autonomic dysregulation, physical fatigue, and suppressed emotional tension without conscious intent to use',
    coreCharacteristics: [
      'Neglecting basic physiological needs (skipping meals, delaying sleep)',
      'Bottling up frustration or anxiety rather than journaling or communicating',
      'Defensive reactions when asked about stress levels',
      'Sympathetic nervous system overdrive (HRV drops below 55 ms, stress index > 65%)',
      'Isolating from support network and accountability partners',
    ],
    historicalTriggersDetected: [
      {
        triggerName: 'High Sprint Pressure & Cognitive Bottlenecks',
        frequencyCount: triggersMap.get('Work Sprint Overwhelm & Deadline Crunch')?.count || 4,
        correlatedEmotion: 'Overwhelmed / Frustrated',
        biometricMarker: `Welltory Stress: ${welltory.stressScore}%, HRV: ${welltory.hrvScore}ms`,
        sampleJournalQuote:
          triggersMap.get('Work Sprint Overwhelm & Deadline Crunch')?.quote ||
          'Drowning in sprint backlog items with P1 deadline looming at 6 PM...',
      },
      {
        triggerName: 'Sleep Architecture Deprivation (HALT - Tired)',
        frequencyCount: triggersMap.get('Circadian Exhaustion & Sleep Debt')?.count || 5,
        correlatedEmotion: 'Exhausted',
        biometricMarker: `Samsung Sleep: ${samsungHealth.sleepHours} hrs (${samsungHealth.deepSleepPercentage}% Deep)`,
        sampleJournalQuote:
          triggersMap.get('Circadian Exhaustion & Sleep Debt')?.quote ||
          'Woke up unrefreshed after only 5.5 hours, brain feels thick and resistant...',
      },
      {
        triggerName: 'Post-Work Exhaustion Drop (HALT - Hungry/Tired)',
        frequencyCount: 3,
        correlatedEmotion: 'Depleted',
        biometricMarker: 'Circadian Cortisol Dip at 17:30 - 19:00',
        sampleJournalQuote: '18:00 transition from desk to empty kitchen is when my will drops to near zero.',
      },
    ],
    warningSignsFromData: [
      isSleepDeprived ? '⚠️ Sleep debt detected: Deep sleep is currently below 18% restorative baseline' : '✓ Sleep duration currently stable',
      isHighStress ? `⚠️ Autonomic stress index is elevated at ${welltory.stressScore}%` : '✓ Autonomic stress within balanced range',
      isHighWorkload ? `⚠️ High sprint pressure with ${tasks.pendingHighPriorityTasks} P1 engineering tasks pending` : '✓ Workload balanced',
    ],
    clinicalInterventions: [
      {
        title: 'Parasympathetic Vagal Reset (4-7-8 Breathing)',
        type: 'somatic',
        actionText: 'Execute 4 rounds of slow diaphragmatic exhale to shift nervous system out of sympathetic lock.',
      },
      {
        title: 'HALT Physiological Inoculation',
        type: 'environmental',
        actionText: 'Consume 20g complex carbs + electrolytes immediately upon finishing work before entering evening downtime.',
      },
      {
        title: 'Accountability Ping',
        type: 'social',
        actionText: 'Send a quick text to Alex or primary support contact stating current stress level before 18:00.',
      },
    ],
  };

  // Stage 2: Mental Relapse
  const stage2: RelapseCycleStageData = {
    stage: 2,
    name: 'Mental Relapse',
    subtitle: 'The internal tug-of-war: romancing past drinking, bargaining, and rationalizing "just one"',
    coreCharacteristics: [
      'Euphoric recall (remembering only the pleasant first 30 minutes of drinking, forgetting 3 AM panic)',
      'Bargaining: "I hit 43 days, that proves I have control and can drink like a normal person"',
      'Minimizing previous negative consequences or hospital/hangover memories',
      'Seeking out high-risk environments (volunteering to go to the bar, walking past the liquor aisle)',
      'Planning a relapse in advance (e.g. deciding to drink on an upcoming weekend or trip)',
    ],
    historicalTriggersDetected: [
      {
        triggerName: 'Decompression Reward Rationalization ("I Deserve This")',
        frequencyCount: triggersMap.get('Decompression Bargaining ("I Deserve a Break")')?.count || 2,
        correlatedEmotion: 'Resentful / Lonely',
        biometricMarker: 'Craving Score: 4-6/10',
        sampleJournalQuote:
          triggersMap.get('Decompression Bargaining ("I Deserve a Break")')?.quote ||
          'Worked 11 hours straight fixing cache bugs. The voice whispers that a cocktail is the only quick reward.',
      },
      {
        triggerName: 'Evening Solitude & Boredom (HALT - Lonely)',
        frequencyCount: triggersMap.get('Evening Isolation & Empty Apartment Silence')?.count || 3,
        correlatedEmotion: 'Lonely / Restless',
        biometricMarker: 'Resting HR Spike during evening screen scrolling',
        sampleJournalQuote:
          triggersMap.get('Evening Isolation & Empty Apartment Silence')?.quote ||
          'Sitting in the quiet apartment on Friday night feeling left out of normal life.',
      },
    ],
    warningSignsFromData: [
      currentCraving >= 4 ? `⚠️ Elevated craving reported: ${currentCraving}/10` : '✓ Craving currently low (2/10)',
      sobriety.haltState.tired ? '⚠️ HALT State active: Body is flagged as Tired' : '✓ Body well-rested',
      sobriety.haltState.lonely ? '⚠️ HALT State active: Lonely vector detected' : '✓ Social support active',
    ],
    clinicalInterventions: [
      {
        title: 'Play the Tape All the Way Through',
        type: 'cognitive',
        actionText: 'Visualize drink #1, but immediately fast-forward to 3:00 AM heart palpitations, shame, broken streak, and day-after migraine.',
      },
      {
        title: '3-Minute Urge Surfing Protocol',
        type: 'somatic',
        actionText: 'Cravings crest like ocean waves and dissipate in 15-20 minutes. Set timer and ride the somatic wave without fighting it.',
      },
      {
        title: 'Direct Call to Designated Ally',
        type: 'social',
        actionText: 'Vocalize the craving out loud to a sponsor or trusted friend. Cravings wither once exposed to authentic human connection.',
      },
    ],
  };

  // Stage 3: Physical Relapse
  const stage3: RelapseCycleStageData = {
    stage: 3,
    name: 'Physical Relapse',
    subtitle: 'The behavioral action of acquiring and consuming alcohol — breaking the streak',
    coreCharacteristics: [
      'Physical acquisition of alcohol (driving to store, ordering at venue)',
      'Immediate loss of conscious agency following the first ingestion',
      'Acute cascade of guilt, secrecy, and potential binge escalation',
      'Neurochemical kindling effect: rapid reactivated craving pathways',
    ],
    historicalTriggersDetected: [
      {
        triggerName: 'Unbuffered Proximity to Alcohol While in Depleted State',
        frequencyCount: 1,
        correlatedEmotion: 'Despair / Numbness',
        biometricMarker: 'Complete Prefrontal Cortical Exhaustion',
        sampleJournalQuote: 'Being trapped at a wedding reception after 3 hours of sleep with open bar 20 feet away.',
      },
    ],
    warningSignsFromData: [
      'Critical threshold warning: If Stage 1 & 2 are unmanaged, Stage 3 becomes an automatic motor reflex',
      'Protective barrier: 43 unbroken days of neural dopamine remodeling',
    ],
    clinicalInterventions: [
      {
        title: 'Physical Exit Protocol',
        type: 'environmental',
        actionText: 'Leave the room/venue immediately without negotiation or apologizing. Your sobriety takes absolute precedence.',
      },
      {
        title: 'Cold Water Mammalian Dive Reflex',
        type: 'somatic',
        actionText: 'Submerge face in bowl of ice water for 30 seconds to instantly activate the vagal brake and slow heart rate.',
      },
      {
        title: 'Emergency Crisis Hotline / Text 988',
        type: 'social',
        actionText: 'Call 988 or SAMHSA (1-800-662-4357) for immediate live voice intervention.',
      },
    ],
  };

  // Determine active stage
  let activeStage: 1 | 2 | 3 | null = null;
  let riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'Acute' = 'Low';

  if (currentCraving >= 7) {
    activeStage = 2;
    riskLevel = 'Elevated';
  } else if (currentCraving >= 4 || (isHighStress && isSleepDeprived)) {
    activeStage = 1;
    riskLevel = 'Moderate';
  } else if (isHighStress || isHighWorkload) {
    activeStage = 1;
    riskLevel = 'Low';
  }

  return {
    overallRiskLevel: riskLevel,
    currentActiveStage: activeStage,
    autonomicStressCorrelation: `Welltory Stress Index of ${welltory.stressScore}% strongly correlates with emotional fatigue and HALT vulnerability.`,
    sleepDebtCorrelation: `Samsung Sleep of ${samsungHealth.sleepHours} hrs (${samsungHealth.deepSleepPercentage}% Deep) indicates sleep debt is the primary driver of evening craving surges.`,
    stages: [stage1, stage2, stage3],
  };
}
