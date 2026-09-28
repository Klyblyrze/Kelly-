export interface SentimentAnalysisResult {
  valence: 'Positive' | 'Challenging' | 'Cathartic Growth' | 'Neutral';
  score: number; // -1.0 to 1.0
  emotionTags: string[];
  themeTags: string[];
  allTags: string[];
}

interface EmotionRule {
  tag: string;
  keywords: string[];
  weight: number;
}

interface ThemeRule {
  tag: string;
  keywords: string[];
}

const EMOTION_RULES: EmotionRule[] = [
  {
    tag: 'Anxious',
    keywords: ['anxious', 'nervous', 'racing', 'worry', 'dread', 'panic', 'anticipation', 'unease', 'restless'],
    weight: -0.6,
  },
  {
    tag: 'Overwhelmed',
    keywords: ['overwhelm', 'too much', 'drowning', 'avalanche', 'exhausted', 'collapse', 'frantic', 'burnout'],
    weight: -0.8,
  },
  {
    tag: 'Frustrated',
    keywords: ['frustrat', 'annoy', 'irritat', 'blocker', 'stuck', 'impatient', 'resent', 'friction'],
    weight: -0.6,
  },
  {
    tag: 'Grateful',
    keywords: ['grateful', 'thankful', 'appreciat', 'blessed', 'fortunate', 'gift'],
    weight: 0.8,
  },
  {
    tag: 'Peaceful',
    keywords: ['peaceful', 'calm', 'quiet', 'stillness', 'seren', 'grounded', 'settled', 'tranquil'],
    weight: 0.7,
  },
  {
    tag: 'Joyful',
    keywords: ['joy', 'happy', 'excited', 'delight', 'wonderful', 'smile', 'celebrat', 'ecstatic', 'fun'],
    weight: 0.9,
  },
  {
    tag: 'Melancholy',
    keywords: ['sad', 'grief', 'heavy', 'crying', 'tears', 'loss', 'blue', 'gloomy', 'melancholy', 'sorrow'],
    weight: -0.7,
  },
  {
    tag: 'Hopeful',
    keywords: ['hope', 'optimis', 'looking forward', 'brighter', 'progress', 'promising', 'faith'],
    weight: 0.6,
  },
  {
    tag: 'Confident',
    keywords: ['confident', 'proud', 'accomplish', 'competent', 'mastery', 'strong', 'capable', 'delivered'],
    weight: 0.8,
  },
  {
    tag: 'Vulnerable',
    keywords: ['vulnerab', 'fragile', 'tender', 'exposed', 'open heart', 'uncertain', 'raw'],
    weight: 0.1, // sensitive / introspective
  },
  {
    tag: 'Content',
    keywords: ['content', 'satisfied', 'at ease', 'comfortable', 'balanced', 'centered'],
    weight: 0.6,
  },
  {
    tag: 'Lonely',
    keywords: ['lonely', 'alone', 'isolated', 'disconnected', 'unseen', 'distance', 'empty'],
    weight: -0.7,
  },
];

const THEME_RULES: ThemeRule[] = [
  {
    tag: 'WorkPressure',
    keywords: ['deadline', 'sprint', 'client', 'meeting', 'project', 'boss', 'deliverable', 'workload', 'tasks', 'ticktick'],
  },
  {
    tag: 'DeepFocus',
    keywords: ['flow state', 'deep work', 'coding', 'writing', 'focus', 'concentration', 'creative flow'],
  },
  {
    tag: 'SomaticTension',
    keywords: ['chest tightness', 'jaw clench', 'shallow breathing', 'headache', 'stomach knot', 'muscle tension', 'shoulders'],
  },
  {
    tag: 'SleepRecovery',
    keywords: ['sleep', 'insomnia', 'woke up', 'rested', 'nap', 'tired', 'rem sleep', 'nightmare', 'dreams'],
  },
  {
    tag: 'SelfCompassion',
    keywords: ['gentle with myself', 'self-compassion', 'forgiving', 'patience with myself', 'inner critic', 'acceptance'],
  },
  {
    tag: 'BoundarySetting',
    keywords: ['boundary', 'said no', 'limits', 'protect my time', 'non-negotiable', 'space for myself'],
  },
  {
    tag: 'SobrietyRelapsePrevention',
    keywords: ['craving', 'alcohol', 'sober', 'sobriety', 'drink', 'relapse', 'urge surfing', 'halt', 'bar', 'wine', 'beer'],
  },
  {
    tag: 'SocialConnection',
    keywords: ['friend', 'partner', 'family', 'conversation', 'connection', 'loved ones', 'talked with', 'shared meal'],
  },
  {
    tag: 'NatureGrounding',
    keywords: ['walk outside', 'sunlight', 'trees', 'nature', 'fresh air', 'park', 'outdoor', 'breeze'],
  },
  {
    tag: 'CognitiveReframing',
    keywords: ['reframe', 'perspective', 'stoic', 'realized', 'mindset', 'rational', 'mental model', 'clarity'],
  },
];

/**
 * Analyzes journal text and associated metadata to produce automated sentiment
 * score, emotion tags, and thematic contextual tags.
 */
export function analyzeJournalSentimentAndTags(
  text: string,
  primaryEmotion?: string,
  secondaryEmotion?: string,
  somaticSensations: string[] = [],
  intensity = 5,
  existingTags: string[] = []
): SentimentAnalysisResult {
  const lowerText = text.toLowerCase();
  const detectedEmotionTags = new Set<string>();
  const detectedThemeTags = new Set<string>();

  // Always seed with primary and secondary emotion if present
  if (primaryEmotion) {
    detectedEmotionTags.add(primaryEmotion.trim());
  }
  if (secondaryEmotion) {
    detectedEmotionTags.add(secondaryEmotion.trim());
  }

  // Calculate weighted sentiment score
  let sentimentScore = 0;
  let matchesCount = 0;

  for (const rule of EMOTION_RULES) {
    const isMatched = rule.keywords.some((kw) => lowerText.includes(kw));
    if (isMatched) {
      detectedEmotionTags.add(rule.tag);
      sentimentScore += rule.weight;
      matchesCount++;
    }
  }

  // Theme matching
  for (const rule of THEME_RULES) {
    const isMatched = rule.keywords.some((kw) => lowerText.includes(kw));
    if (isMatched) {
      detectedThemeTags.add(rule.tag);
    }
  }

  // Somatic cues analysis
  if (somaticSensations.length > 0) {
    detectedThemeTags.add('SomaticAwareness');
    const hasTension = somaticSensations.some((s) =>
      ['Chest tightness', 'Rapid pulse', 'Jaw clenching', 'Knotted stomach', 'Headache'].includes(s)
    );
    if (hasTension) {
      detectedThemeTags.add('SomaticTension');
      sentimentScore -= 0.3;
      matchesCount++;
    }
    const hasCalm = somaticSensations.some((s) =>
      ['Deep slow breaths', 'Warm chest', 'Relaxed shoulders', 'Light limbs'].includes(s)
    );
    if (hasCalm) {
      detectedThemeTags.add('SomaticCalm');
      sentimentScore += 0.4;
      matchesCount++;
    }
  }

  // Factor in user-rated intensity and baseline primary emotion
  if (primaryEmotion) {
    const positiveBaselines = ['Joyful', 'Peaceful', 'Powerful', 'Content', 'Proud', 'Optimistic'];
    const challengingBaselines = ['Sad', 'Mad', 'Scared', 'Anxious', 'Frustrated', 'Overwhelmed'];

    if (positiveBaselines.includes(primaryEmotion)) {
      sentimentScore += 0.5 * (intensity / 10);
      matchesCount++;
    } else if (challengingBaselines.includes(primaryEmotion)) {
      sentimentScore -= 0.5 * (intensity / 10);
      matchesCount++;
    }
  }

  // Normalize sentiment score between -1.0 and 1.0
  const normalizedScore =
    matchesCount > 0 ? Math.max(-1, Math.min(1, sentimentScore / Math.max(1, matchesCount))) : 0;

  // Determine sentiment valence
  let valence: SentimentAnalysisResult['valence'] = 'Neutral';
  const hasReframing =
    detectedThemeTags.has('CognitiveReframing') ||
    detectedThemeTags.has('SelfCompassion') ||
    lowerText.includes('now i feel') ||
    lowerText.includes('moving forward') ||
    lowerText.includes('grateful that');

  if (normalizedScore >= 0.25) {
    valence = 'Positive';
  } else if (normalizedScore <= -0.25) {
    if (hasReframing) {
      valence = 'Cathartic Growth';
    } else {
      valence = 'Challenging';
    }
  } else {
    valence = hasReframing ? 'Cathartic Growth' : 'Neutral';
  }

  // Deduplicate and combine all tags
  const emotionTagsList = Array.from(detectedEmotionTags);
  const themeTagsList = Array.from(detectedThemeTags);

  // Clean user tags
  const cleanExistingTags = existingTags
    .map((t) => t.replace(/^#/, '').trim())
    .filter(Boolean);

  const combinedTagsSet = new Set<string>([
    ...cleanExistingTags,
    ...emotionTagsList,
    ...themeTagsList,
  ]);

  return {
    valence,
    score: parseFloat(normalizedScore.toFixed(2)),
    emotionTags: emotionTagsList,
    themeTags: themeTagsList,
    allTags: Array.from(combinedTagsSet),
  };
}
