import { EmotionNode } from '../types/journal';

export const EMOTIONS_DATA: EmotionNode[] = [
  {
    id: 'joyful',
    name: 'Joyful',
    level: 'primary',
    color: '#F59E0B', // Amber
    lightColor: '#FEF3C7',
    description: 'A sense of well-being, satisfaction, delight, and open-hearted warmth.',
    somaticClues: ['Warmth in chest', 'Relaxed shoulders', 'Lightness in limbs', 'Easy smile', 'Expanded breathing'],
    defaultPrompts: [
      'What specific moment or realization sparked this feeling of joy today?',
      'How does this joy feel in your body, and how can you anchor this feeling into your memory?',
      'Who or what contributed to this uplifted state, and how might you express appreciation?'
    ],
    children: [
      {
        id: 'content',
        name: 'Content',
        parentId: 'joyful',
        level: 'secondary',
        color: '#F59E0B',
        lightColor: '#FEF3C7',
        description: 'Peaceful satisfaction with the present moment as it is.',
        somaticClues: ['Slow steady pulse', 'Soft gaze', 'Grounded feet', 'Quiet mind'],
        defaultPrompts: [
          'What in your life right now is "enough"? What are you not needing to rush or fix?',
          'Describe the atmosphere around you that supports this tranquil contentment.'
        ],
        children: [
          {
            id: 'peaceful',
            name: 'Peaceful',
            parentId: 'content',
            level: 'tertiary',
            color: '#F59E0B',
            lightColor: '#FEF3C7',
            description: 'Inner stillness free from disturbance or agitation.',
            somaticClues: ['Unclenched jaw', 'Even breathing', 'Soothing stillness'],
            defaultPrompts: [
              'What internal permission slip did you give yourself to arrive at this peace?',
              'How can you preserve a small slice of this quiet clarity for tomorrow?'
            ]
          },
          {
            id: 'thankful',
            name: 'Thankful',
            parentId: 'content',
            level: 'tertiary',
            color: '#F59E0B',
            lightColor: '#FEF3C7',
            description: 'A deep sense of gratitude for gifts, support, and simple blessings.',
            somaticClues: ['Warm heart center', 'Soft exhale', 'Tear of gratitude'],
            defaultPrompts: [
              'Name three understated blessings that made today possible.',
              'How does acknowledging gratitude shift your mental horizon right now?'
            ]
          }
        ]
      },
      {
        id: 'proud',
        name: 'Proud',
        parentId: 'joyful',
        level: 'secondary',
        color: '#F59E0B',
        lightColor: '#FEF3C7',
        description: 'Healthy self-respect and satisfaction derived from one’s own achievements or growth.',
        somaticClues: ['Tall posture', 'Open chest', 'Confident pulse', 'Clear focus'],
        defaultPrompts: [
          'What obstacle did you navigate recently that deserves your own genuine applause?',
          'What does this accomplishment reveal about your internal resilience?'
        ],
        children: [
          {
            id: 'confident',
            name: 'Confident',
            parentId: 'proud',
            level: 'tertiary',
            color: '#F59E0B',
            lightColor: '#FEF3C7',
            description: 'Trust in one’s abilities, judgment, and inherent worth.',
            somaticClues: ['Firm stance', 'Steady voice', 'Unwavering focus'],
            defaultPrompts: [
              'What challenge feels less intimidating now because of the skills you trust within yourself?',
              'Where can you lean into this confidence to take an authentic step forward?'
            ]
          },
          {
            id: 'successful',
            name: 'Successful',
            parentId: 'proud',
            level: 'tertiary',
            color: '#F59E0B',
            lightColor: '#FEF3C7',
            description: 'The fruition of effort, dedication, or meaningful progress.',
            somaticClues: ['Exhilaration', 'High energy', 'Grounded satisfaction'],
            defaultPrompts: [
              'How do you personally define success in this instance beyond external validation?',
              'What did this milestone teach you about your discipline and capabilities?'
            ]
          }
        ]
      },
      {
        id: 'optimistic',
        name: 'Optimistic',
        parentId: 'joyful',
        level: 'secondary',
        color: '#F59E0B',
        lightColor: '#FEF3C7',
        description: 'Hopefulness and confidence about the future and positive outcomes.',
        somaticClues: ['Forward-leaning energy', 'Bright eyes', 'Quickened enthusiastic breath'],
        defaultPrompts: [
          'What exciting possibilities are opening up that energize your spirit?',
          'How can you channel this forward optimism into purposeful action today?'
        ],
        children: [
          {
            id: 'hopeful',
            name: 'Hopeful',
            parentId: 'optimistic',
            level: 'tertiary',
            color: '#F59E0B',
            lightColor: '#FEF3C7',
            description: 'A resilient belief that good things are coming into reach.',
            somaticClues: ['Gentle anticipation', 'Lifting sensation in chest'],
            defaultPrompts: [
              'What seed of hope are you nurturing right now, and what helps it grow?',
              'If this hope fully unfolds, how will your daily life transform?'
            ]
          },
          {
            id: 'inspired',
            name: 'Inspired',
            parentId: 'optimistic',
            level: 'tertiary',
            color: '#F59E0B',
            lightColor: '#FEF3C7',
            description: 'Mentally stimulated to do or create something new and meaningful.',
            somaticClues: ['Tingling excitement', 'Surge of ideas', 'Alert attention'],
            defaultPrompts: [
              'What sparked this rush of creative enthusiasm or new perspective?',
              'Write down the raw, unfiltered idea that is calling for your attention.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'surprised',
    name: 'Surprised',
    level: 'primary',
    color: '#06B6D4', // Cyan
    lightColor: '#CFFAFE',
    description: 'An alert, spontaneous reaction to the unexpected, novel, or startling.',
    somaticClues: ['Widened eyes', 'Sharp inhale', 'Brief pause in movement', 'Sudden alertness'],
    defaultPrompts: [
      'What caught you completely off-guard today, and what was your immediate instinct?',
      'How is your brain adjusting its expectations based on this surprise?',
      'Is there an unexpected opportunity or lesson hiding within this twist?'
    ],
    children: [
      {
        id: 'amazed',
        name: 'Amazed',
        parentId: 'surprised',
        level: 'secondary',
        color: '#06B6D4',
        lightColor: '#CFFAFE',
        description: 'Filled with wonder, astonishment, or reverence.',
        somaticClues: ['Goosebumps', 'Breath caught', 'Open posture'],
        defaultPrompts: [
          'What grandeur, beauty, or human feat left you in genuine awe?',
          'How does feeling small in the face of wonder bring relief or perspective?'
        ],
        children: [
          {
            id: 'awestruck',
            name: 'Awestruck',
            parentId: 'amazed',
            level: 'tertiary',
            color: '#06B6D4',
            lightColor: '#CFFAFE',
            description: 'Overwhelmed by a sense of vastness and mystery.',
            somaticClues: ['Spine shiver', 'Deep stillness', 'Quiet wonder'],
            defaultPrompts: [
              'What mystery reminded you of how much wonder exists beyond our daily worries?',
              'Capture in vivid sensory words what you witnessed that moved you so deeply.'
            ]
          },
          {
            id: 'astonished',
            name: 'Astonished',
            parentId: 'amazed',
            level: 'tertiary',
            color: '#06B6D4',
            lightColor: '#CFFAFE',
            description: 'Great surprise bordering on disbelief at an extraordinary turn of events.',
            somaticClues: ['Disbelief', 'Rapid heartbeat', 'Spontaneous laughter'],
            defaultPrompts: [
              'What assumption was shattered in the most surprising and delightful way?',
              'How does this astonishment invite you to remain open-minded?'
            ]
          }
        ]
      },
      {
        id: 'confused',
        name: 'Confused',
        parentId: 'surprised',
        level: 'secondary',
        color: '#06B6D4',
        lightColor: '#CFFAFE',
        description: 'A state of uncertainty or disorientation when things do not align with logic.',
        somaticClues: ['Furrowed brow', 'Restless head tilt', 'Hesitant speech'],
        defaultPrompts: [
          'What two pieces of information or emotion seem to contradict each other right now?',
          'What happens if you sit with not knowing instead of demanding immediate certainty?'
        ],
        children: [
          {
            id: 'perplexed',
            name: 'Perplexed',
            parentId: 'confused',
            level: 'tertiary',
            color: '#06B6D4',
            lightColor: '#CFFAFE',
            description: 'Baffled by an intricate puzzle or mixed signal.',
            somaticClues: ['Tension between eyebrows', 'Pacing', 'Mental fog'],
            defaultPrompts: [
              'What question, if answered clearly, would dissolve this puzzle?',
              'Who could offer you an unbiased outside perspective on this confusion?'
            ]
          },
          {
            id: 'disillusioned',
            name: 'Disillusioned',
            parentId: 'confused',
            level: 'tertiary',
            color: '#06B6D4',
            lightColor: '#CFFAFE',
            description: 'Disappointed by finding that something is not as good as previously believed.',
            somaticClues: ['Heavy sigh', 'Deflation in chest', 'Quiet shock'],
            defaultPrompts: [
              'What fantasy or expectation ended, and what reality is taking its place?',
              'How can seeing things as they truly are actually be a superpower moving forward?'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'sad',
    name: 'Sad',
    level: 'primary',
    color: '#3B82F6', // Blue
    lightColor: '#DBEAFE',
    description: 'A tender emotional weight signaling loss, unmet needs, hurt, or a longing for comfort.',
    somaticClues: ['Heaviness in limbs', 'Lump in throat', 'Tears or tearfulness', 'Dull ache in chest', 'Lowered energy'],
    defaultPrompts: [
      'What loss, disappointment, or unmet longing is asking for your gentle attention today?',
      'If your sadness had a voice, what compassionate words would it ask you to say to yourself?',
      'What small comfort or safe boundary do you need right now without having to explain yourself?'
    ],
    children: [
      {
        id: 'lonely',
        name: 'Lonely',
        parentId: 'sad',
        level: 'secondary',
        color: '#3B82F6',
        lightColor: '#DBEAFE',
        description: 'A deep craving for meaningful connection, understanding, or companionship.',
        somaticClues: ['Hollow feeling in stomach', 'Cold skin', 'Slumped shoulders'],
        defaultPrompts: [
          'In what ways do you feel unseen or unheard right now, even around others?',
          'How can you show up as a loyal, compassionate friend to yourself this evening?'
        ],
        children: [
          {
            id: 'isolated',
            name: 'Isolated',
            parentId: 'lonely',
            level: 'tertiary',
            color: '#3B82F6',
            lightColor: '#DBEAFE',
            description: 'Feeling separated from others or living on an island of one’s own struggles.',
            somaticClues: ['Withdrawn posture', 'Silent gaze', 'Numbing sensation'],
            defaultPrompts: [
              'What invisible barrier feels like it stands between you and the rest of the world?',
              'Who is one gentle person you could send a low-pressure text or hello to today?'
            ]
          },
          {
            id: 'abandoned',
            name: 'Abandoned',
            parentId: 'lonely',
            level: 'tertiary',
            color: '#3B82F6',
            lightColor: '#DBEAFE',
            description: 'The sharp ache of feeling left behind, neglected, or unsupported.',
            somaticClues: ['Ache in chest', 'Shallow breathing', 'Curling inward'],
            defaultPrompts: [
              'What younger part of you feels left on its own, and how can you comfort it now?',
              'Reassure yourself: you are here for you, and your presence matters unconditionally.'
            ]
          }
        ]
      },
      {
        id: 'vulnerable',
        name: 'Vulnerable',
        parentId: 'sad',
        level: 'secondary',
        color: '#3B82F6',
        lightColor: '#DBEAFE',
        description: 'Feeling exposed, open to hurt, or walking without emotional armor.',
        somaticClues: ['Sensitized skin', 'Trembling hands', 'Fluttery stomach'],
        defaultPrompts: [
          'What courage did it take to let your guard down or show up authentically?',
          'How can you honor your tenderness without interpreting vulnerability as weakness?'
        ],
        children: [
          {
            id: 'fragile',
            name: 'Fragile',
            parentId: 'vulnerable',
            level: 'tertiary',
            color: '#3B82F6',
            lightColor: '#DBEAFE',
            description: 'Feeling delicate, easily bruised, or close to your emotional threshold.',
            somaticClues: ['Tear readiness', 'Fatigue', 'Desire to curl up under a blanket'],
            defaultPrompts: [
              'What demands can you take off your plate today to protect your delicate state?',
              'Write a gentle reminder to yourself that rest and softness are not failures.'
            ]
          },
          {
            id: 'insecure',
            name: 'Insecure',
            parentId: 'vulnerable',
            level: 'tertiary',
            color: '#3B82F6',
            lightColor: '#DBEAFE',
            description: 'Doubts about one’s self-worth, stability, or standing in relationships.',
            somaticClues: ['Self-conscious fidgeting', 'Constricted throat', 'Comparison spiral'],
            defaultPrompts: [
              'What harsh story is your inner critic whispering, and what is the compassionate truth?',
              'What intrinsic value do you possess that has nothing to do with external opinions?'
            ]
          }
        ]
      },
      {
        id: 'hurt',
        name: 'Hurt',
        parentId: 'sad',
        level: 'secondary',
        color: '#3B82F6',
        lightColor: '#DBEAFE',
        description: 'Emotional pain resulting from harsh words, neglect, or broken expectations.',
        somaticClues: ['Sharp pang in chest', 'Tightness behind eyes', 'Heavy limbs'],
        defaultPrompts: [
          'What boundary was crossed or what expectation was bruised?',
          'What truth do you need to validate for yourself, regardless of whether others apologize?'
        ],
        children: [
          {
            id: 'disappointed',
            name: 'Disappointed',
            parentId: 'hurt',
            level: 'tertiary',
            color: '#3B82F6',
            lightColor: '#DBEAFE',
            description: 'The gap between what you hoped would happen and what actually transpired.',
            somaticClues: ['Deflated posture', 'Sighing', 'Dulled enthusiasm'],
            defaultPrompts: [
              'What high hope did you hold, and how can you grieve the gap with kindness?',
              'What grounded lesson can you carry forward from this experience?'
            ]
          },
          {
            id: 'regretful',
            name: 'Regretful',
            parentId: 'hurt',
            level: 'tertiary',
            color: '#3B82F6',
            lightColor: '#DBEAFE',
            description: 'Sorrow over an action taken, a word spoken, or a missed opportunity.',
            somaticClues: ['Twist in stomach', 'Restless hands', 'Self-reproach'],
            defaultPrompts: [
              'If you acted based on what you knew and felt at the time, can you offer yourself grace?',
              'What amends or repair—internal or external—would bring closure?'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'fearful',
    name: 'Fearful',
    level: 'primary',
    color: '#8B5CF6', // Purple
    lightColor: '#EDE9FE',
    description: 'An instinctual alarm responding to real or anticipated threats, ambiguity, or loss of safety.',
    somaticClues: ['Racing pulse', 'Shallow breathing', 'Cold sweat', 'Tight stomach', 'Heightened vigilance'],
    defaultPrompts: [
      'What specific outcome is your mind trying so urgently to protect you from?',
      'If you separate fact from fear-story, what is actually true in this exact room right now?',
      'What grounding practice helps your nervous system feel that you are safe in this moment?'
    ],
    children: [
      {
        id: 'anxious',
        name: 'Anxious',
        parentId: 'fearful',
        level: 'secondary',
        color: '#8B5CF6',
        lightColor: '#EDE9FE',
        description: 'Vague apprehension, mental looping, or anticipating future catastrophes.',
        somaticClues: ['Restless pacing', 'Buzzing nervous energy', 'Shallow high-chest breath'],
        defaultPrompts: [
          'What "what-ifs" are spinning in your head, and what is a realistic "what if things work out"?',
          'Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.'
        ],
        children: [
          {
            id: 'overwhelmed',
            name: 'Overwhelmed',
            parentId: 'anxious',
            level: 'tertiary',
            color: '#8B5CF6',
            lightColor: '#EDE9FE',
            description: 'Sensory or emotional overload where demands far exceed available bandwidth.',
            somaticClues: ['Brain fog', 'Paralysis/freezing', 'Racing heart', 'Tension headache'],
            defaultPrompts: [
              'What are 3 things you can ruthlessly drop or postpone for the next 24 hours?',
              'What is the single smallest, 2-minute micro-step you can take to regain agency?'
            ]
          },
          {
            id: 'worried',
            name: 'Worried',
            parentId: 'anxious',
            level: 'tertiary',
            color: '#8B5CF6',
            lightColor: '#EDE9FE',
            description: 'Chronic mental rumination focused on uncontrollable outcomes.',
            somaticClues: ['Clenched stomach', 'Fidgeting', 'Disturbed sleep'],
            defaultPrompts: [
              'Draw a mental circle: what is inside your control, and what must you release?',
              'What would you tell a beloved friend who was carrying this exact same worry?'
            ]
          }
        ]
      },
      {
        id: 'scared',
        name: 'Scared',
        parentId: 'fearful',
        level: 'secondary',
        color: '#8B5CF6',
        lightColor: '#EDE9FE',
        description: 'A direct surge of alarm when facing a sudden or daunting challenge.',
        somaticClues: ['Tremor in hands', 'Adrenaline spike', 'Dry mouth'],
        defaultPrompts: [
          'What fear is staring you down, and how can you stand tall alongside your fear?',
          'What source of sanctuary, guidance, or physical comfort is available to you right now?'
        ],
        children: [
          {
            id: 'helpless',
            name: 'Helpless',
            parentId: 'scared',
            level: 'tertiary',
            color: '#8B5CF6',
            lightColor: '#EDE9FE',
            description: 'Feeling stripped of power or unable to influence a difficult outcome.',
            somaticClues: ['Heavy immobility', 'Sinking stomach', 'Exhaustion'],
            defaultPrompts: [
              'Even in this hard situation, what tiny freedom of attitude or response is still yours?',
              'Who can you invite into your corner so you do not carry this weight alone?'
            ]
          },
          {
            id: 'frightened',
            name: 'Frightened',
            parentId: 'scared',
            level: 'tertiary',
            color: '#8B5CF6',
            lightColor: '#EDE9FE',
            description: 'Acute fear triggered by sudden threats or intimidating authority.',
            somaticClues: ['Jolt in heart', 'Fight-or-flight readiness', 'Wide pupils'],
            defaultPrompts: [
              'Place a hand over your heart. Breathe in for 4, hold for 4, exhale for 6. How does your body respond?',
              'What inner protector or past courage can you summon right now?'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'angry',
    name: 'Angry',
    level: 'primary',
    color: '#EF4444', // Red
    lightColor: '#FEE2E2',
    description: 'A forceful emotional fire responding to injustice, violated boundaries, or blocked desires.',
    somaticClues: ['Heat in face/neck', 'Clenched fists', 'Tight jaw', 'Pounding heart', 'Sharpened tunnel vision'],
    defaultPrompts: [
      'What boundary was crossed, or what principle of fairness was trampled upon?',
      'Underneath the fire of this anger, is there hurt, fear, or a desire to protect yourself?',
      'How can you channel this fiery energy into assertive, constructive boundary setting?'
    ],
    children: [
      {
        id: 'frustrated',
        name: 'Frustrated',
        parentId: 'angry',
        level: 'secondary',
        color: '#EF4444',
        lightColor: '#FEE2E2',
        description: 'Exasperation caused by repeated roadblocks, delays, or thwarted progress.',
        somaticClues: ['Gritted teeth', 'Restless pacing', 'Flushed forehead', 'Tense shoulders'],
        defaultPrompts: [
          'What brick wall have you been banging your head against, and is there a side door?',
          'What would happen if you paused your efforts for 30 minutes to reset your nervous system?'
        ],
        children: [
          {
            id: 'annoyed',
            name: 'Annoyed',
            parentId: 'frustrated',
            level: 'tertiary',
            color: '#EF4444',
            lightColor: '#FEE2E2',
            description: 'Irritation caused by minor frictions, repetitive noises, or small friction points.',
            somaticClues: ['Eye roll reflex', 'Short breath', 'Tense neck'],
            defaultPrompts: [
              'Is this annoyance about the small trigger itself, or is your stress tank already full?',
              'What boundary or quick communication could clear this petty friction?'
            ]
          },
          {
            id: 'infuriated',
            name: 'Infuriated',
            parentId: 'frustrated',
            level: 'tertiary',
            color: '#EF4444',
            lightColor: '#FEE2E2',
            description: 'White-hot rage over severe obstruction or blatant disrespect.',
            somaticClues: ['Explosive urge', 'Fast throbbing pulse', 'Clenched jaw'],
            defaultPrompts: [
              'Write down every raw sentence of fury without censorship—get it out of your body onto the page.',
              'Once the heat vents, what is the clear, non-negotiable standard you need to uphold?'
            ]
          }
        ]
      },
      {
        id: 'critical',
        name: 'Critical',
        parentId: 'angry',
        level: 'secondary',
        color: '#EF4444',
        lightColor: '#FEE2E2',
        description: 'Sharp judgment, finding fault, or viewing situations with cynical appraisal.',
        somaticClues: ['Narrowed eyes', 'Skeptical smirk', 'Cold intellectual tension'],
        defaultPrompts: [
          'What high standard or unexpressed ideal is driving this sharp criticism?',
          'How might your critique sound if delivered with curiosity rather than contempt?'
        ],
        children: [
          {
            id: 'sarcastic',
            name: 'Sarcastic',
            parentId: 'critical',
            level: 'tertiary',
            color: '#EF4444',
            lightColor: '#FEE2E2',
            description: 'Using irony or biting wit to mask underlying frustration or hurt.',
            somaticClues: ['Defensive humor', 'Guarded posture', 'Tense lips'],
            defaultPrompts: [
              'What sincere feeling is the sarcasm protecting from being directly vulnerable?',
              'Can you state your direct need plainly, without the sharp humorous shield?'
            ]
          },
          {
            id: 'dismissive',
            name: 'Dismissive',
            parentId: 'critical',
            level: 'tertiary',
            color: '#EF4444',
            lightColor: '#FEE2E2',
            description: 'Writing off others, ideas, or feelings as unworthy of serious attention.',
            somaticClues: ['Turning away', 'Heavy sigh', 'Emotional wall'],
            defaultPrompts: [
              'What are you shutting down to avoid emotional expenditure?',
              'What would be required for you to re-engage with an open mind?'
            ]
          }
        ]
      },
      {
        id: 'bitter',
        name: 'Bitter',
        parentId: 'angry',
        level: 'secondary',
        color: '#EF4444',
        lightColor: '#FEE2E2',
        description: 'Lingering resentment over past unfairness that has hardened over time.',
        somaticClues: ['Sour taste', 'Ache in upper back', 'Persistent grudge weight'],
        defaultPrompts: [
          'What old grievance are you still reliving in your head, and who is it poisoning?',
          'What would it cost you to put down the burden of having to be proven right?'
        ],
        children: [
          {
            id: 'indignant',
            name: 'Indignant',
            parentId: 'bitter',
            level: 'tertiary',
            color: '#EF4444',
            lightColor: '#FEE2E2',
            description: 'Righteous outrage over an unfair ruling or broken moral code.',
            somaticClues: ['Rigid spine', 'Pulsing temples', 'Clear moral conviction'],
            defaultPrompts: [
              'What core value was compromised that made your soul cry "this is wrong!"?',
              'How can you transform this moral outrage into an act of kindness or advocacy?'
            ]
          },
          {
            id: 'betrayed',
            name: 'Betrayed',
            parentId: 'bitter',
            level: 'tertiary',
            color: '#EF4444',
            lightColor: '#FEE2E2',
            description: 'The profound sting when trusted loyalty, secrecy, or safety is violated.',
            somaticClues: ['Stab in chest', 'Nausea', 'Loss of ground'],
            defaultPrompts: [
              'How has your trust been fractured, and what do you need to rebuild your own safety?',
              'What self-care can you give yourself while your trust heals?'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'disgusted',
    name: 'Disgusted',
    level: 'primary',
    color: '#10B981', // Emerald / Sage
    lightColor: '#D1FAE5',
    description: 'An aversion response rejecting something toxic, offensive, distasteful, or violating.',
    somaticClues: ['Curled upper lip', 'Queasy stomach', 'Pulling back motion', 'Desire to cleanse'],
    defaultPrompts: [
      'What situation, behavior, or dynamic feels toxic or fundamentally misaligned with you?',
      'How is this revulsion serving as a protective immune system for your psyche?',
      'What clean, unequivocal line do you need to draw to step away from this toxicity?'
    ],
    children: [
      {
        id: 'disapproving',
        name: 'Disapproving',
        parentId: 'disgusted',
        level: 'secondary',
        color: '#10B981',
        lightColor: '#D1FAE5',
        description: 'Strong moral, ethical, or aesthetic objection to an action or environment.',
        somaticClues: ['Shaking head', 'Cold distance', 'Displeasure in gut'],
        defaultPrompts: [
          'What standard of integrity is clashing with what you witnessed?',
          'Can you separate your disapproval of the action from your regard for the human involved?'
        ],
        children: [
          {
            id: 'judgmental',
            name: 'Judgmental',
            parentId: 'disapproving',
            level: 'tertiary',
            color: '#10B981',
            lightColor: '#D1FAE5',
            description: 'Evaluating others with harsh scrutiny or a feeling of moral superiority.',
            somaticClues: ['Stiff posture', 'Smug or guarded tension', 'Internal lecture'],
            defaultPrompts: [
              'In what way does judging others provide an illusion of safety or control?',
              'If you softened the judgment into curiosity, what might you discover?'
            ]
          },
          {
            id: 'embarrassed',
            name: 'Embarrassed',
            parentId: 'disapproving',
            level: 'tertiary',
            color: '#10B981',
            lightColor: '#D1FAE5',
            description: 'Self-directed discomfort over an awkward misstep or social exposure.',
            somaticClues: ['Burning red ears/cheeks', 'Desire to disappear', 'Cringe reflex'],
            defaultPrompts: [
              'Can you laugh with tender self-compassion at your shared human clumsiness?',
              'Will this awkward moment matter 6 months or 5 years from now?'
            ]
          }
        ]
      },
      {
        id: 'repelled',
        name: 'Repelled',
        parentId: 'disgusted',
        level: 'secondary',
        color: '#10B981',
        lightColor: '#D1FAE5',
        description: 'An instinctual urge to push away, flee, or eject an unpleasant influence.',
        somaticClues: ['Stomach recoil', 'Chills', 'Physical step backward'],
        defaultPrompts: [
          'What gut instinct is commanding you to step back right now?',
          'What healthy boundary allows you to remove yourself cleanly without lingering drama?'
        ],
        children: [
          {
            id: 'hesitant',
            name: 'Hesitant',
            parentId: 'repelled',
            level: 'tertiary',
            color: '#10B981',
            lightColor: '#D1FAE5',
            description: 'Holding back because something does not feel right or safe.',
            somaticClues: ['Foot tapping pause', 'Catch in breath', 'Internal yellow light'],
            defaultPrompts: [
              'What quiet intuition is asking you to slow down before committing?',
              'Honor your hesitation: what extra clarity do you need before taking a step?'
            ]
          },
          {
            id: 'horrified',
            name: 'Horrified',
            parentId: 'repelled',
            level: 'tertiary',
            color: '#10B981',
            lightColor: '#D1FAE5',
            description: 'Deep shock combined with intense disgust or moral revulsion.',
            somaticClues: ['Drop in blood pressure', 'Gasp', 'Cold extremities'],
            defaultPrompts: [
              'What shocking violation did you encounter, and what grounding can stabilize your spirit?',
              'What grounding ritual (warm tea, washing hands, fresh air) helps cleanse your system?'
            ]
          }
        ]
      }
    ]
  }
];

// Helper functions for lookup
export function findEmotionById(id: string, list = EMOTIONS_DATA): EmotionNode | null {
  for (const node of list) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findEmotionById(id, node.children);
      if (found) return found;
    }
  }
  return null;
}

export function getEmotionPath(nodeId: string): EmotionNode[] {
  const path: EmotionNode[] = [];
  function search(currentList: EmotionNode[], targetId: string, currentPath: EmotionNode[]): boolean {
    for (const node of currentList) {
      const nextPath = [...currentPath, node];
      if (node.id === targetId) {
        path.push(...nextPath);
        return true;
      }
      if (node.children && search(node.children, targetId, nextPath)) {
        return true;
      }
    }
    return false;
  }
  search(EMOTIONS_DATA, nodeId, []);
  return path;
}

export function getAllEmotionsFlat(): EmotionNode[] {
  const result: EmotionNode[] = [];
  function collect(nodes: EmotionNode[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.children) collect(node.children);
    }
  }
  collect(EMOTIONS_DATA);
  return result;
}

export const SOMATIC_OPTIONS = [
  'Chest tightness',
  'Relaxed shoulders',
  'Butterflies in stomach',
  'Lump in throat',
  'Warm glow in heart',
  'Deep easy breathing',
  'Clenched jaw / teeth',
  'Heavy limbs',
  'Buzzing restless energy',
  'Grounded feet',
  'Tingling in fingers',
  'Shallow breathing'
];
