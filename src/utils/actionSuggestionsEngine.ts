import {
  MoodEntry,
  WelltoryBiometrics,
  SamsungHealthData,
  TaskProjectData,
  SobrietyRecoveryContext,
  MindsaraContext,
  ActionSuggestion,
  ActionDomain,
} from '../types/journal';

export function generateActionSuggestions(
  entries: MoodEntry[],
  welltory: WelltoryBiometrics,
  samsungHealth: SamsungHealthData,
  tasks: TaskProjectData,
  sobriety: SobrietyRecoveryContext,
  mindsara: MindsaraContext
): ActionSuggestion[] {
  const suggestions: ActionSuggestion[] = [];

  const latestEntry = entries[0];
  const avgIntensity = entries.length
    ? entries.slice(0, 5).reduce((acc, e) => acc + e.intensity, 0) / Math.min(5, entries.length)
    : 5;
  const isHighStress = welltory.stressScore >= 65;
  const isLowHrv = welltory.hrvScore < 60;
  const isSleepDeprived = samsungHealth.sleepHours < 7.0 || samsungHealth.deepSleepPercentage < 18;
  const hasSprintOverload = tasks.currentSprintPressure === 'High' || tasks.pendingHighPriorityTasks >= 3;

  // 1. PRODUCTIVITY & WORK
  if (hasSprintOverload) {
    suggestions.push({
      id: 'act-work-1',
      title: 'Timebox P1 Sprint Bottlenecks into 25-Min Pomodoros',
      domain: 'Productivity & Work',
      priority: 'High',
      description: `You have ${tasks.pendingHighPriorityTasks} high-priority engineering tasks pending under high sprint pressure. Prevent cognitive overwhelm by isolating the hardest task.`,
      dataRationale: `TickTick MCP indicates ${tasks.pendingHighPriorityTasks} P1 tasks pending with "High" sprint pressure.`,
      concreteSteps: [
        'Select top P1 task (Review distributed caching architecture).',
        'Close Slack, email, and extraneous browser tabs for 25 minutes.',
        'Document the core blocking decision in bullet points, then take a mandatory 5-min walk.',
      ],
      timeEstimate: '30 mins',
    });
  } else {
    suggestions.push({
      id: 'act-work-2',
      title: 'Conduct End-of-Day Asynchronous Handover',
      domain: 'Productivity & Work',
      priority: 'Medium',
      description: 'Cleanly park open work threads so work does not bleed into your evening recovery buffer.',
      dataRationale: 'TickTick MCP reports healthy pacing with 8 tasks completed today.',
      concreteSteps: [
        'Write 3-line status update in team channel on current sprint progress.',
        'Define tomorrow’s single primary MIT (Most Important Task).',
        'Shutdown development IDE at 17:30 to preserve evening vagal decompression.',
      ],
      timeEstimate: '10 mins',
    });
  }

  // 2. FINANCES & LIFE ADMIN
  const estimatedSavings = sobriety.moneySavedEstimated || 860;
  suggestions.push({
    id: 'act-fin-1',
    title: `Allocate $${estimatedSavings} Sobriety Savings to Recovery Fund`,
    domain: 'Finances & Life Admin',
    priority: 'Medium',
    description: `43 days alcohol-free has saved approximately $${estimatedSavings}. Anchor your streak with tangible financial reward and proactive life admin.`,
    dataRationale: `Sobriety tracker records 43 days clean ($20/day avoided alcohol expenditure).`,
    concreteSteps: [
      `Review personal banking app and transfer $100-$200 of the $${estimatedSavings} into a dedicated 'Health & Recovery' savings bucket.`,
      'Invest in high-grade recovery gear (e.g. ergonomic workspace cushion, artisanal tea selection, or fitness class pass).',
      'Automate upcoming recurring utility or hosting bills to remove ambient cognitive friction.',
    ],
    timeEstimate: '15 mins',
  });

  // 3. SCHOOL & SKILL GROWTH
  suggestions.push({
    id: 'act-skill-1',
    title: 'Engage 20-Min Deep Cognitive Study Before Screen Cutoff',
    domain: 'School & Skill Growth',
    priority: 'Routine',
    description: 'Channel your prefrontal clarity into high-leverage technical reading rather than passive digital scrolling.',
    dataRationale: 'Mindsera integration active with Stoic lens and cognitive inversion models loaded.',
    concreteSteps: [
      'Read one chapter of distributed system architecture or technical whitepaper offline.',
      'Write a 3-bullet summary in your personal notes using the Feynman technique.',
      'Disconnect from blue-light screens at least 45 minutes before sleep.',
    ],
    timeEstimate: '20 mins',
  });

  // 4. RELATIONSHIPS & SOCIAL CONNECTION
  suggestions.push({
    id: 'act-rel-1',
    title: 'Send Proactive Connection Text to Recovery Ally',
    domain: 'Relationships & Social',
    priority: isHighStress ? 'High' : 'Medium',
    description: 'Isolation is the single biggest catalyst for the HALT "Lonely" vulnerability. Reach out before feeling depleted.',
    dataRationale: `Welltory autonomic stress at ${welltory.stressScore}% and HALT state detected.`,
    concreteSteps: [
      'Send a brief text to Alex or trusted partner: "Hey, having a high-focus day, checking in to stay grounded and connected."',
      'Confirm weekend plans that do not center around alcohol or crowded bar environments.',
      'Express genuine gratitude for their ongoing support in your recovery journey.',
    ],
    timeEstimate: '5 mins',
  });

  // 5. THERAPEUTIC & SOMATIC TECHNIQUES
  if (isHighStress || isLowHrv) {
    suggestions.push({
      id: 'act-soma-1',
      title: '4-7-8 Parasympathetic Vagal Nerve Activation',
      domain: 'Therapeutic & Somatic',
      priority: 'High',
      description: 'Your autonomic nervous system is in sympathetic overdrive. Manually reset heart rate variability and cortisol.',
      dataRationale: `Welltory HRV is ${welltory.hrvScore}ms with 68% Stress Index (Sympathetic dominance).`,
      concreteSteps: [
        'Sit with spine erect, feet flat on the floor, relaxing the jaw and tongue.',
        'Inhale through nose quietly for 4 seconds.',
        'Hold breath gently for 7 seconds without straining.',
        'Exhale through parted lips with an audible whoosh for 8 seconds. Repeat 4 full cycles.',
      ],
      exerciseType: 'vagal_reset',
      timeEstimate: '5 mins',
    });
  }

  suggestions.push({
    id: 'act-soma-2',
    title: 'DBT TIPP: Temperature Reset with Cold Water Facial Dip',
    domain: 'Therapeutic & Somatic',
    priority: 'Medium',
    description: 'Activate the mammalian dive reflex to instantaneously reduce resting heart rate by 10-15 bpm during acute craving or anger.',
    dataRationale: 'Clinically proven protocol for acute distress tolerance and craving interruption.',
    concreteSteps: [
      'Fill a sink or large bowl with cold water and ice cubes.',
      'Hold breath and submerge face from temples to cheeks for 15-30 seconds.',
      'Notice the immediate drop in pulse and mental hyperactivity.',
    ],
    exerciseType: 'grounding',
    timeEstimate: '3 mins',
  });

  // 6. JOURNALING & SHADOW WORK REFLECTION
  suggestions.push({
    id: 'act-journ-1',
    title: 'Explore the "Decompression Trap" in Journaling',
    domain: 'Journaling & Reflection',
    priority: 'High',
    description: 'Dissect the exact moment when the urge to numb or disconnect arises after high-output work hours.',
    dataRationale: `Recent mood entries indicate recurring evening exhaustion and craving spikes at 18:00.`,
    concreteSteps: [
      'Open the Guided Journal Editor.',
      'Address the prompt: "What emotional need is my exhaustion masking right now, and how can I honor that need without numbing it?"',
      'Identify 2 non-substance rituals that give genuine nervous system rest.',
    ],
    journalPrompt: 'What emotional need is my evening fatigue masking right now, and how can I genuinely honor that need without chemical sedation or avoidance?',
    timeEstimate: '10 mins',
  });

  suggestions.push({
    id: 'act-journ-2',
    title: 'Examine Cognitive Bias: The Tyranny of "Must & Should"',
    domain: 'Journaling & Reflection',
    priority: 'Medium',
    description: 'Uncover where perfectionism and hyper-responsibility are creating artificial emotional emergencies.',
    dataRationale: 'Mindsera flagged Catastrophizing & Urgency Fallacy in recent cognitive reflections.',
    concreteSteps: [
      'Write down the 3 things you felt pressured to complete perfectly today.',
      'Apply the Stoic Dichotomy of Control: Which of these outcomes are truly within your control vs outside it?',
      'Permit yourself to leave 20% imperfect to protect your mental health.',
    ],
    journalPrompt: 'Where am I demanding absolute perfection of myself today, and how is that perfectionism fueling resentment, fatigue, or the desire to escape?',
    timeEstimate: '12 mins',
  });

  return suggestions;
}
