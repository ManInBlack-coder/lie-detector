interface EmotionData {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
  [key: string]: number;
}

interface FaceLandmarks {
  // Silmade punktid
  leftEye: {
    upperLid: number[];
    lowerLid: number[];
    corner: { x: number; y: number }[];
    pupilDilation: number;
  };
  rightEye: {
    upperLid: number[];
    lowerLid: number[];
    corner: { x: number; y: number }[];
    pupilDilation: number;
  };
  
  // Kulmude punktid
  eyebrows: {
    left: number[];
    right: number[];
    movement: {
      raising: number;
      furrowing: number;
    };
  };
  
  // Suu ja huulte punktid
  mouth: {
    upperLip: number[];
    lowerLip: number[];
    corners: { x: number; y: number }[];
    tension: number;
    opening: number;
  };
  
  // Nina punktid
  nose: {
    bridge: number[];
    tip: { x: number; y: number };
    wings: number[];
  };
  
  // Lõua ja põskede punktid
  jawline: {
    contour: number[];
    tension: number;
  };
  
  // Üldised näo proportsioonid
  faceShape: {
    symmetry: number;
    proportions: number[];
  };
}

interface DeceptionMetrics {
  asymmetry: number;
  muscleTension: number;
  rapidMovements: number;
  unnaturalExpressions: number;
}

interface BaselineComparison {
  beforeQuestion: EmotionData;
  duringQuestion: EmotionData;
  changes: {
    emotion: string;
    beforeValue: number;
    afterValue: number;
    difference: number;
    significance: string;
  }[];
}

export interface AnalysisResult {
  truthProbability: number;
  observations: string[];
  emotionalStability: number;
  dominantEmotions: string[];
  microExpressions: MicroExpression[];
  facialTension: number;
  deceptionIndicators: string[];
  emotionTransitions: EmotionTransition[];
  baselineComparison?: BaselineComparison;
  formattedResults: {
    question: string;
    answer: string;
    truthScore: {
      percentage: number;
      evaluation: string;
      confidence: number;
    };
    emotionalState: {
      primary: string;
      secondary: string[];
      stability: number;
      baseline: {
        before: string;
        after: string;
        significantChanges: string[];
      };
    };
    deceptionMarkers: {
      found: boolean;
      indicators: string[];
      microExpressions: string[];
      emotionalConflicts: string[];
    };
  };
}

interface EmotionTransition {
  from: {
    emotion: string;
    intensity: number;
  };
  to: {
    emotion: string;
    intensity: number;
  };
  timestamp: number;
  duration?: number;
  changeIntensity: number;
  significance?: string;
  isValid?: boolean;
}

interface EmotionHistory {
  previousEmotions: EmotionData | null;
  transitions: EmotionTransition[];
  lastUpdateTime: number;
  lastValidTransition?: EmotionTransition;
}

// Globaalne emotsioonide ajalugu
let emotionHistory: EmotionHistory = {
  previousEmotions: null,
  transitions: [],
  lastUpdateTime: Date.now()
};

const EMOTION_THRESHOLDS = {
  ULTRA_WEAK: 0.01,    // 1% - väga nõrgad mikro ilmed
  VERY_WEAK: 0.03,     // 3% - nõrgad mikro ilmed
  WEAK: 0.05,          // 5% - tavalised emotsioonid
  MODERATE: 0.1,       // 10% - märgatavad emotsioonid
  STRONG: 0.3,         // 30% - tugevad emotsioonid
  VERY_STRONG: 0.5     // 50% - väga tugevad emotsioonid
};

const EMOTION_CATEGORIES = {
  POSITIVE: ['happy'],
  NEGATIVE: ['sad', 'angry', 'fearful', 'disgusted'],
  SURPRISE: ['surprised'],
  NEUTRAL: ['neutral']
};

const DECEPTION_INDICATORS = {
  FEAR_THRESHOLD: 0.15,     // Alandame hirmu lävendit
  TENSION_THRESHOLD: 0.3,   // Alandame pinge lävendit
  MICRO_THRESHOLD: 0.02     // Alandame mikro ilmete lävendit
};

const LANDMARK_THRESHOLDS = {
  ASYMMETRY: 0.2,
  TENSION: 0.6,
  MOVEMENT: 0.3,
  PUPIL_DILATION: 0.4
};

const EMOTION_CHANGE_THRESHOLDS = {
  MINIMAL: 0.01,    // 1% muutus
  NOTABLE: 0.05,    // 5% muutus
  SIGNIFICANT: 0.1, // 10% muutus
  DRAMATIC: 0.2     // 20% muutus
};

const formatPercentage = (value: number): string => {
  return (value * 100).toFixed(1) + '%';
};

const getEmotionIntensity = (value: number): string => {
  if (value >= EMOTION_THRESHOLDS.VERY_STRONG) return 'väga tugev';
  if (value >= EMOTION_THRESHOLDS.STRONG) return 'tugev';
  if (value >= EMOTION_THRESHOLDS.MODERATE) return 'märkimisväärne';
  if (value >= EMOTION_THRESHOLDS.WEAK) return 'nõrk';
  if (value >= EMOTION_THRESHOLDS.VERY_WEAK) return 'väga nõrk';
  return 'olematu';
};

const getEmotionalBalance = (emotions: EmotionData): string => {
  const positiveSum = EMOTION_CATEGORIES.POSITIVE.reduce((sum, emotion) => sum + emotions[emotion as keyof EmotionData], 0);
  const negativeSum = EMOTION_CATEGORIES.NEGATIVE.reduce((sum, emotion) => sum + emotions[emotion as keyof EmotionData], 0);
  
  const ratio = positiveSum / (negativeSum || 0.0001);
  if (ratio > 2) return 'domineerivad positiivsed emotsioonid';
  if (ratio < 0.5) return 'domineerivad negatiivsed emotsioonid';
  return 'tasakaalustatud emotsioonid';
};

const isValidEmotions = (emotions: any): emotions is EmotionData => {
  if (!emotions) return false;
  
  const requiredEmotions = [
    'neutral',
    'happy',
    'sad',
    'angry',
    'fearful',
    'disgusted',
    'surprised'
  ];

  return requiredEmotions.every(emotion => 
    typeof emotions[emotion] === 'number' &&
    !isNaN(emotions[emotion])
  );
};

const getMicroExpressionSignificance = (
  emotion: string,
  intensity: number,
  duration?: number
): string => {
  // Baastähendus intensiivsuse põhjal
  let significance = '';
  if (intensity >= EMOTION_THRESHOLDS.MODERATE) {
    significance = 'selgelt väljendunud';
  } else if (intensity >= EMOTION_THRESHOLDS.WEAK) {
    significance = 'märgatav';
  } else if (intensity >= EMOTION_THRESHOLDS.VERY_WEAK) {
    significance = 'nõrk';
  } else {
    significance = 'väga nõrk';
  }

  // Lisa kestuse info kui see on olemas
  if (duration !== undefined) {
    if (duration < 100) {
      significance += ', hetkeline';
    } else if (duration < 250) {
      significance += ', lühiajaline';
    } else {
      significance += ', püsiv';
    }
  }

  // Lisa emotsiooni spetsiifiline tõlgendus
  switch (emotion) {
    case 'fearful':
      significance += ' - võimalik ärevuse märk';
      break;
    case 'angry':
      significance += ' - võimalik vastumeelsuse märk';
      break;
    case 'disgusted':
      significance += ' - võimalik ebamugavuse märk';
      break;
    case 'surprised':
      significance += ' - võimalik ettevalmistamata reaktsioon';
      break;
    case 'sad':
      significance += ' - võimalik emotsionaalne konflikt';
      break;
  }

  return significance;
};

const normalizeEmotions = (emotions: EmotionData): EmotionData => {
  // Arvuta kõikide emotsioonide summa
  const sum = Object.values(emotions).reduce((acc, val) => acc + val, 0);
  
  // Kui summa on 0, väldi nulliga jagamist
  if (sum === 0) return emotions;
  
  // Normaliseeri kõik väärtused
  const normalized: EmotionData = { ...emotions };
  Object.keys(emotions).forEach((key) => {
    normalized[key] = emotions[key] / sum;
  });
  
  return normalized;
};

const analyzeFacialTension = (landmarks: FaceLandmarks): DeceptionMetrics => {
  const metrics: DeceptionMetrics = {
    asymmetry: 0,
    muscleTension: 0,
    rapidMovements: 0,
    unnaturalExpressions: 0
  };

  // Analüüsi asümmeetriat
  metrics.asymmetry = calculateAsymmetry(landmarks);
  
  // Analüüsi lihaspingeid
  metrics.muscleTension = calculateMuscleTension(landmarks);
  
  // Analüüsi kiireid liigutusi
  metrics.rapidMovements = calculateRapidMovements(landmarks);
  
  // Analüüsi ebaloomulikke ilmeid
  metrics.unnaturalExpressions = detectUnnaturalExpressions(landmarks);

  return metrics;
};

const calculateAsymmetry = (landmarks: FaceLandmarks): number => {
  let asymmetryScore = 0;
  
  // Võrdle silmade asendit
  asymmetryScore += compareEyePositions(landmarks.leftEye, landmarks.rightEye);
  
  // Võrdle kulmude asendit
  asymmetryScore += compareEyebrowPositions(landmarks.eyebrows);
  
  // Võrdle suu nurkade asendit
  asymmetryScore += compareMouthCorners(landmarks.mouth);
  
  return Math.min(1, asymmetryScore / 3);
};

const calculateMuscleTension = (landmarks: FaceLandmarks): number => {
  const tensions = [
    landmarks.eyebrows.movement.furrowing,
    landmarks.mouth.tension,
    landmarks.jawline.tension
  ];
  
  return tensions.reduce((sum, tension) => sum + tension, 0) / tensions.length;
};

const calculateRapidMovements = (landmarks: FaceLandmarks): number => {
  // Analüüsi järske muutusi silmade, kulmude ja suu liikumises
  const movements = [
    landmarks.eyebrows.movement.raising,
    landmarks.mouth.opening,
    landmarks.leftEye.pupilDilation,
    landmarks.rightEye.pupilDilation
  ];
  
  return movements.reduce((max, movement) => Math.max(max, movement), 0);
};

const detectUnnaturalExpressions = (landmarks: FaceLandmarks): number => {
  let unnaturalScore = 0;
  
  // Kontrolli ebaloomulikke kombinatsioone
  if (landmarks.eyebrows.movement.raising > 0.7 && landmarks.mouth.tension > 0.7) {
    unnaturalScore += 0.3;
  }
  
  // Kontrolli asünkroonseid liigutusi
  if (Math.abs(landmarks.leftEye.pupilDilation - landmarks.rightEye.pupilDilation) > 0.2) {
    unnaturalScore += 0.4;
  }
  
  return Math.min(1, unnaturalScore);
};

const getDeceptionIndicators = (
  emotions: EmotionData, 
  facialTension: number,
  microExpressions: MicroExpression[]
): string[] => {
  const indicators: string[] = [];
  const currentTime = Date.now();

  // Hirmu analüüs
  if (emotions.fearful > DECEPTION_INDICATORS.FEAR_THRESHOLD) {
    indicators.push(`Tuvastatud hirm (${formatPercentage(emotions.fearful)}) - võimalik valetamise märk`);
    if (emotions.fearful > emotions.neutral) {
      indicators.push('Hirm ületab neutraalsust - tugev valetamise indikaator');
    }
  }

  // Vastuoluliste emotsioonide analüüs
  Object.entries(emotions).forEach(([emotion1, value1]) => {
    Object.entries(emotions).forEach(([emotion2, value2]) => {
      if (
        emotion1 !== emotion2 && 
        value1 > EMOTION_THRESHOLDS.WEAK && 
        value2 > EMOTION_THRESHOLDS.WEAK
      ) {
        if (
          (emotion1 === 'happy' && (emotion2 === 'fearful' || emotion2 === 'angry')) ||
          (emotion2 === 'happy' && (emotion1 === 'fearful' || emotion1 === 'angry'))
        ) {
          indicators.push(`Vastuolulised emotsioonid: ${emotion1} (${formatPercentage(value1)}) ja ${emotion2} (${formatPercentage(value2)})`);
        }
      }
    });
  });

  // Mikroilmete analüüs
  if (microExpressions.length > 0) {
    const sequenceInsights = analyzeMicroExpressionSequence(microExpressions, currentTime);
    indicators.push(...sequenceInsights);

    // Analüüsi üksikuid mikroilmeid
    microExpressions.forEach(expr => {
      if (expr.intensity >= DECEPTION_INDICATORS.MICRO_THRESHOLD) {
        const timeSinceStart = currentTime - expr.startTime;
        if (timeSinceStart < 1000) { // Viimase sekundi jooksul
          indicators.push(`Värske mikroilme: ${expr.emotion} (${formatPercentage(expr.intensity)}) - ${expr.significance}`);
        }
      }
    });
  }

  // Näolihaste pinge analüüs
  if (facialTension > DECEPTION_INDICATORS.TENSION_THRESHOLD) {
    indicators.push(`Tuvastatud kõrgenenud näolihaste pinge (${formatPercentage(facialTension)})`);
  }

  return indicators;
};

const compareEyePositions = (leftEye: FaceLandmarks['leftEye'], rightEye: FaceLandmarks['rightEye']): number => {
  // Võrdle silmade kõrguste erinevust
  const leftHeight = Math.abs(leftEye.upperLid[0] - leftEye.lowerLid[0]);
  const rightHeight = Math.abs(rightEye.upperLid[0] - rightEye.lowerLid[0]);
  const heightDiff = Math.abs(leftHeight - rightHeight);

  // Võrdle silmanurkade asendit
  const cornerDiff = Math.abs(
    leftEye.corner[0].y - rightEye.corner[0].y
  );

  // Võrdle pupillide suurust
  const dilationDiff = Math.abs(
    leftEye.pupilDilation - rightEye.pupilDilation
  );

  return (heightDiff + cornerDiff + dilationDiff) / 3;
};

const compareEyebrowPositions = (eyebrows: FaceLandmarks['eyebrows']): number => {
  // Võrdle kulmude kõrguste erinevust
  const leftHeight = Math.max(...eyebrows.left);
  const rightHeight = Math.max(...eyebrows.right);
  const heightDiff = Math.abs(leftHeight - rightHeight);

  // Võrdle kulmude liikumist
  const movementDiff = Math.abs(
    eyebrows.movement.raising - eyebrows.movement.furrowing
  );

  return (heightDiff + movementDiff) / 2;
};

const compareMouthCorners = (mouth: FaceLandmarks['mouth']): number => {
  // Võrdle suu nurkade kõrguste erinevust
  const leftCornerHeight = mouth.corners[0].y;
  const rightCornerHeight = mouth.corners[1].y;
  const cornerDiff = Math.abs(leftCornerHeight - rightCornerHeight);

  // Võrdle huulte pinget
  const lipTensionDiff = Math.abs(
    Math.max(...mouth.upperLip) - Math.max(...mouth.lowerLip)
  );

  return (cornerDiff + lipTensionDiff) / 2;
};

const detectEmotionChanges = (currentEmotions: EmotionData): EmotionTransition[] => {
  const transitions: EmotionTransition[] = [];
  const currentTime = Date.now();
  
  if (!emotionHistory.previousEmotions) {
    emotionHistory.previousEmotions = { ...currentEmotions };
    emotionHistory.lastUpdateTime = currentTime;
    return transitions;
  }

  // Arvuta ajavahemik viimasest uuendusest
  const timeSinceLastUpdate = currentTime - emotionHistory.lastUpdateTime;

  // Analüüsi iga emotsiooni muutust
  Object.entries(currentEmotions).forEach(([emotion, currentIntensity]) => {
    const previousIntensity = emotionHistory.previousEmotions![emotion];
    const change = Math.abs(currentIntensity - previousIntensity);
    const direction = currentIntensity > previousIntensity ? 'tõus' : 'langus';

    if (change >= EMOTION_THRESHOLDS.ULTRA_WEAK) {
      const transition: EmotionTransition = {
        from: {
          emotion,
          intensity: previousIntensity
        },
        to: {
          emotion,
          intensity: currentIntensity
        },
        timestamp: currentTime,
        duration: timeSinceLastUpdate,
        changeIntensity: change,
        isValid: false
      };

      // Kontrolli muutuse kestvust
      if (timeSinceLastUpdate < TIMING_THRESHOLDS.TOO_FAST) {
        transition.significance = `Liiga kiire muutus (${timeSinceLastUpdate}ms) - ignoreeritud`;
      } else if (
        timeSinceLastUpdate >= TIMING_THRESHOLDS.MIN_DURATION && 
        timeSinceLastUpdate <= TIMING_THRESHOLDS.MAX_DURATION
      ) {
        transition.isValid = true;
        
        // Lisa täpsem kirjeldus muutuse kohta
        if (change >= EMOTION_THRESHOLDS.MODERATE) {
          transition.significance = `Märkimisväärne ${direction} (${timeSinceLastUpdate}ms)`;
        } else if (change >= EMOTION_THRESHOLDS.WEAK) {
          transition.significance = `Selge ${direction} (${timeSinceLastUpdate}ms)`;
        } else {
          transition.significance = `Kerge ${direction} (${timeSinceLastUpdate}ms)`;
        }

        // Kontrolli järjestikusi muutusi
        if (emotionHistory.lastValidTransition) {
          const timeSinceLastTransition = currentTime - emotionHistory.lastValidTransition.timestamp;
          if (timeSinceLastTransition < 1000) { // 1 sekund
            transition.significance += ' - osa järjestikustest muutustest';
          }
        }
        
        emotionHistory.lastValidTransition = transition;
      } else {
        transition.significance = `Muutus väljaspool optimaalset ajavahemikku (${timeSinceLastUpdate}ms)`;
      }

      transitions.push(transition);
    }
  });

  // Uuenda ajalugu
  emotionHistory.previousEmotions = { ...currentEmotions };
  emotionHistory.lastUpdateTime = currentTime;
  emotionHistory.transitions.push(...transitions.filter(t => t.isValid));

  // Säilita ainult viimased 20 kehtivat üleminekut
  if (emotionHistory.transitions.length > 20) {
    emotionHistory.transitions = emotionHistory.transitions.slice(-20);
  }

  return transitions.filter(t => t.isValid);
};

const getTransitionDescription = (transition: EmotionTransition): string => {
  const changeType = 
    transition.changeIntensity >= EMOTION_CHANGE_THRESHOLDS.DRAMATIC ? 'Järsk muutus' :
    transition.changeIntensity >= EMOTION_CHANGE_THRESHOLDS.SIGNIFICANT ? 'Märkimisväärne muutus' :
    transition.changeIntensity >= EMOTION_CHANGE_THRESHOLDS.NOTABLE ? 'Märgatav muutus' :
    'Kerge muutus';

  const direction = transition.to.intensity > transition.from.intensity ? 'tõus' : 'langus';
  
  return `${changeType} emotsioonis "${transition.from.emotion}": ${formatPercentage(transition.from.intensity)} → ${formatPercentage(transition.to.intensity)} (${direction})`;
};

interface MicroExpression {
  emotion: string;
  intensity: number;
  significance: string;
  duration: number;
  startTime: number;
  sequence?: number;
  relatedExpressions?: MicroExpression[];
}

const MICRO_EXPRESSION_THRESHOLDS = {
  ULTRA_WEAK: 0.005,    // 0.5% - väga nõrk mikro ilme
  VERY_WEAK: 0.01,      // 1% - nõrk mikro ilme
  WEAK: 0.03,           // 3% - märgatav mikro ilme
  MODERATE: 0.05,       // 5% - selge mikro ilme
  MAX_DURATION: 500     // maksimaalne kestus millisekundites
};

const MICRO_SEQUENCE_WINDOW = 1000; // 1 sekund järjestikuste mikro ilmete jaoks

let microExpressionHistory: {
  expressions: MicroExpression[];
  lastSequenceId: number;
} = {
  expressions: [],
  lastSequenceId: 0
};

const analyzeMicroExpression = (
  emotion: string,
  intensity: number,
  currentTime: number
): MicroExpression | null => {
  if (intensity < MICRO_EXPRESSION_THRESHOLDS.ULTRA_WEAK) {
    return null;
  }

  const duration = Math.min(
    currentTime - (microExpressionHistory.expressions[0]?.startTime || currentTime),
    MICRO_EXPRESSION_THRESHOLDS.MAX_DURATION
  );

  // Kontrolli, kas see on osa olemasolevast järjestusest
  const recentExpressions = microExpressionHistory.expressions.filter(
    expr => currentTime - expr.startTime < MICRO_SEQUENCE_WINDOW
  );

  const isPartOfSequence = recentExpressions.length > 0;
  const sequenceId = isPartOfSequence 
    ? recentExpressions[0].sequence 
    : ++microExpressionHistory.lastSequenceId;

  const microExpression: MicroExpression = {
    emotion,
    intensity,
    duration,
    startTime: currentTime,
    sequence: sequenceId,
    significance: getMicroExpressionSignificance(emotion, intensity, duration),
    relatedExpressions: isPartOfSequence ? recentExpressions : undefined
  };

  // Uuenda ajalugu
  microExpressionHistory.expressions.push(microExpression);
  if (microExpressionHistory.expressions.length > 20) {
    microExpressionHistory.expressions = microExpressionHistory.expressions.slice(-20);
  }

  return microExpression;
};

const BASELINE_THRESHOLDS = {
  MINIMAL_CHANGE: 0.02,    // 2% muutus
  NOTABLE_CHANGE: 0.05,    // 5% muutus
  SIGNIFICANT_CHANGE: 0.1  // 10% muutus
};

let baselineEmotions: EmotionData | null = null;

const compareWithBaseline = (currentEmotions: EmotionData): BaselineComparison | null => {
  if (!baselineEmotions) {
    return null;
  }

  const changes = Object.entries(currentEmotions)
    .map(([emotion, afterValue]) => {
      const beforeValue = baselineEmotions![emotion];
      const difference = afterValue - beforeValue;
      
      return {
        emotion,
        beforeValue,
        afterValue,
        difference,
        significance: getChangeSignificance(emotion, difference)
      };
    })
    .filter(change => Math.abs(change.difference) >= BASELINE_THRESHOLDS.MINIMAL_CHANGE);

  return {
    beforeQuestion: baselineEmotions,
    duringQuestion: currentEmotions,
    changes
  };
};

const getChangeSignificance = (emotion: string, difference: number): string => {
  const absChange = Math.abs(difference);
  const direction = difference > 0 ? 'tõus' : 'langus';
  let significance = '';

  if (absChange >= BASELINE_THRESHOLDS.SIGNIFICANT_CHANGE) {
    significance = 'Märkimisväärne';
  } else if (absChange >= BASELINE_THRESHOLDS.NOTABLE_CHANGE) {
    significance = 'Märgatav';
  } else {
    significance = 'Kerge';
  }

  // Lisa emotsioonispetsiifiline tõlgendus
  switch (emotion) {
    case 'fearful':
      significance += ` hirmu ${direction} - võimalik reaktsioon küsimusele`;
      break;
    case 'neutral':
      significance += ` neutraalsuse ${direction} - võimalik emotsionaalne aktiveerumine`;
      break;
    case 'angry':
      significance += ` viha ${direction} - võimalik kaitsereaktsioon`;
      break;
    case 'surprised':
      significance += ` üllatuse ${direction} - võimalik ettevalmistamata reaktsioon`;
      break;
    default:
      significance += ` ${emotion} ${direction}`;
  }

  return significance;
};

export const setBaselineEmotions = (emotions: EmotionData) => {
  baselineEmotions = normalizeEmotions(emotions);
};

export const clearBaselineEmotions = () => {
  baselineEmotions = null;
};

const formatAnalysisResults = (
  question: string,
  answer: string,
  analysis: Partial<AnalysisResult>
): AnalysisResult['formattedResults'] => {
  // Tõenäosuse hindamine
  const truthPercentage = Math.round((1 - (analysis.truthProbability || 0.5)) * 100);
  const getTruthEvaluation = (percentage: number): string => {
    if (percentage >= 80) return "Väga tõenäoliselt tõene";
    if (percentage >= 60) return "Pigem tõene";
    if (percentage >= 40) return "Ebaselge";
    if (percentage >= 20) return "Pigem ebatõene";
    return "Väga tõenäoliselt ebatõene";
  };

  // Emotsionaalse seisundi analüüs
  const getPrimaryEmotion = (emotions: string[]): string => {
    if (!emotions.length) return "Neutraalne";
    return emotions[0];
  };

  // Baasemotsioonide muutuste formateerimine
  const formatBaselineChanges = (comparison?: BaselineComparison): string[] => {
    if (!comparison?.changes.length) return [];
    return comparison.changes
      .filter(change => Math.abs(change.difference) >= BASELINE_THRESHOLDS.NOTABLE_CHANGE)
      .map(change => `${change.significance} (${(change.difference * 100).toFixed(1)}%)`);
  };

  return {
    question,
    answer,
    truthScore: {
      percentage: truthPercentage,
      evaluation: getTruthEvaluation(truthPercentage),
      confidence: (analysis.emotionalStability || 0.5) * 100
    },
    emotionalState: {
      primary: getPrimaryEmotion(analysis.dominantEmotions || []),
      secondary: (analysis.dominantEmotions || []).slice(1),
      stability: (analysis.emotionalStability || 0.5) * 100,
      baseline: {
        before: analysis.baselineComparison ? "Salvestatud" : "Puudub",
        after: analysis.baselineComparison ? "Analüüsitud" : "Puudub",
        significantChanges: formatBaselineChanges(analysis.baselineComparison)
      }
    },
    deceptionMarkers: {
      found: (analysis.deceptionIndicators || []).length > 0,
      indicators: analysis.deceptionIndicators || [],
      microExpressions: analysis.microExpressions?.map(me => 
        `${me.emotion}: ${formatPercentage(me.intensity)} (${me.significance})`
      ) || [],
      emotionalConflicts: analysis.emotionTransitions?.map(et => 
        `${et.from.emotion} → ${et.to.emotion}`
      ) || []
    }
  };
};

export const analyzeEmotions = (
  emotions: any, 
  question: string = "", 
  answer: string = "", 
  landmarks?: FaceLandmarks
): AnalysisResult => {
  const defaultResult: AnalysisResult = {
    truthProbability: 0.5,
    observations: ["Emotsioonide analüüs pole veel saadaval."],
    emotionalStability: 1,
    dominantEmotions: [],
    microExpressions: [],
    facialTension: 0,
    deceptionIndicators: [],
    emotionTransitions: [],
    formattedResults: {
      question,
      answer,
      truthScore: {
        percentage: 50,
        evaluation: "Ebaselge",
        confidence: 100
      },
      emotionalState: {
        primary: "Neutraalne",
        secondary: [],
        stability: 100,
        baseline: {
          before: "Puudub",
          after: "Puudub",
          significantChanges: []
        }
      },
      deceptionMarkers: {
        found: false,
        indicators: [],
        microExpressions: [],
        emotionalConflicts: []
      }
    }
  };

  if (!isValidEmotions(emotions)) {
    return defaultResult;
  }

  const normalizedEmotions = normalizeEmotions(emotions);
  const observations: string[] = [];
  let truthProbability = 0.5;
  let emotionalStability = 1;
  const dominantEmotions: string[] = [];
  const microExpressions: MicroExpression[] = [];
  
  // Tuvasta emotsioonide muutused
  const transitions = detectEmotionChanges(normalizedEmotions);
  
  // Lisa muutuste kirjeldused tähelepanekutesse
  if (transitions.length > 0) {
    observations.push('\nEmotsioonide muutused:');
    transitions.forEach(transition => {
      const description = getTransitionDescription(transition);
      observations.push(`- ${description}`);
      
      // Järskude muutuste mõju usaldusväärsusele
      if (transition.changeIntensity >= EMOTION_CHANGE_THRESHOLDS.SIGNIFICANT) {
        truthProbability -= transition.changeIntensity * 0.3;
        emotionalStability -= transition.changeIntensity * 0.4;
      }
    });
  }

  // Analüüsi domineerivaid emotsioone
  Object.entries(normalizedEmotions)
    .filter(([_, value]) => value >= EMOTION_THRESHOLDS.WEAK)
    .sort(([_, a], [__, b]) => b - a)
    .forEach(([emotion, value]) => {
      dominantEmotions.push(emotion);
      observations.push(`${emotion}: ${formatPercentage(value)}`);
    });

  // Hirmu-põhine valetamise tõenäosuse hindamine
  if (normalizedEmotions.fearful > DECEPTION_INDICATORS.FEAR_THRESHOLD) {
    const fearImpact = normalizedEmotions.fearful * 0.5; // Hirmu mõju valetamise tõenäosusele
    truthProbability -= fearImpact;
    emotionalStability -= fearImpact;
  }

  // Analüüsi mikro ilmeid
  const currentTime = Date.now();
  Object.entries(normalizedEmotions).forEach(([emotion, value]) => {
    if (emotion !== 'neutral' && value > 0) {
      const microExpression = analyzeMicroExpression(emotion, value, currentTime);
      if (microExpression) {
        microExpressions.push(microExpression);
      }
    }
  });

  // Lisa mikro ilmete tähelepanekud
  if (microExpressions.length > 0) {
    observations.push('\nTuvastatud mikro ilmed:');
    
    // Grupeeri järjestuste kaupa
    const sequenceGroups = microExpressions.reduce((groups, expr) => {
      const key = expr.sequence || 0;
      if (!groups[key]) groups[key] = [];
      groups[key].push(expr);
      return groups;
    }, {} as Record<number, MicroExpression[]>);

    Object.values(sequenceGroups).forEach(sequence => {
      if (sequence.length > 1) {
        observations.push(`- Järjestikused mikro ilmed (${sequence.length} tk):`);
        sequence.forEach(expr => {
          observations.push(`  • ${expr.emotion}: ${formatPercentage(expr.intensity)} (${expr.significance})`);
        });
        
        // Järjestikused mikro ilmed mõjutavad usaldusväärsust rohkem
        truthProbability -= 0.05 * sequence.length;
        emotionalStability -= 0.1 * sequence.length;
      } else {
        const expr = sequence[0];
        observations.push(`- ${expr.emotion}: ${formatPercentage(expr.intensity)} (${expr.significance})`);
        
        // Üksikud mikro ilmed mõjutavad vähem
        if (expr.intensity >= MICRO_EXPRESSION_THRESHOLDS.WEAK) {
          truthProbability -= 0.03;
          emotionalStability -= 0.05;
        }
      }
    });
  }

  // Näolihaste pinge analüüs
  if (landmarks) {
    const deceptionMetrics = analyzeFacialTension(landmarks);
    
    // Lisa tähelepanekud vastavalt landmark analüüsile
    if (deceptionMetrics.asymmetry > LANDMARK_THRESHOLDS.ASYMMETRY) {
      observations.push(`Tuvastatud näo asümmeetria: ${formatPercentage(deceptionMetrics.asymmetry)}`);
      truthProbability -= deceptionMetrics.asymmetry * 0.3;
    }
    
    if (deceptionMetrics.muscleTension > LANDMARK_THRESHOLDS.TENSION) {
      observations.push(`Kõrgenenud näolihaste pinge: ${formatPercentage(deceptionMetrics.muscleTension)}`);
      truthProbability -= deceptionMetrics.muscleTension * 0.2;
    }
    
    if (deceptionMetrics.rapidMovements > LANDMARK_THRESHOLDS.MOVEMENT) {
      observations.push(`Tuvastatud kiired näolihaste liigutused: ${formatPercentage(deceptionMetrics.rapidMovements)}`);
      truthProbability -= deceptionMetrics.rapidMovements * 0.25;
    }
    
    if (deceptionMetrics.unnaturalExpressions > 0.3) {
      observations.push(`Tuvastatud ebaloomulikud näoilmed: ${formatPercentage(deceptionMetrics.unnaturalExpressions)}`);
      truthProbability -= deceptionMetrics.unnaturalExpressions * 0.35;
    }
  }

  // Valetamise indikaatorite kogumine
  const deceptionIndicators = getDeceptionIndicators(normalizedEmotions, 0, microExpressions);
  
  if (deceptionIndicators.length > 0) {
    observations.push('Tuvastatud valetamise indikaatorid:');
    observations.push(...deceptionIndicators);
  }

  // Lisa baasemotsioonide võrdlus
  const baselineResults = compareWithBaseline(normalizedEmotions);
  if (baselineResults && baselineResults.changes.length > 0) {
    observations.push('\nVõrdlus baasemotsioonidega:');
    baselineResults.changes.forEach(change => {
      const changePercent = (change.difference * 100).toFixed(1);
      observations.push(`- ${change.significance} (${changePercent}%)`);
      
      // Mõjuta usaldusväärsust vastavalt muutustele
      if (Math.abs(change.difference) >= BASELINE_THRESHOLDS.SIGNIFICANT_CHANGE) {
        if (change.emotion === 'fearful' || change.emotion === 'angry') {
          truthProbability -= Math.abs(change.difference) * 0.4;
          emotionalStability -= Math.abs(change.difference) * 0.5;
        }
      }
    });
  }

  // Piira väärtused vahemikku 0-1
  truthProbability = Math.max(0, Math.min(1, truthProbability));
  emotionalStability = Math.max(0, Math.min(1, emotionalStability));

  const formattedResults = formatAnalysisResults(question, answer, {
    truthProbability,
    observations,
    emotionalStability,
    dominantEmotions,
    microExpressions,
    facialTension: 0,
    deceptionIndicators,
    emotionTransitions: transitions,
    baselineComparison: baselineResults || undefined
  });

  return {
    truthProbability,
    observations,
    emotionalStability,
    dominantEmotions,
    microExpressions,
    facialTension: 0,
    deceptionIndicators,
    emotionTransitions: transitions,
    baselineComparison: baselineResults || undefined,
    formattedResults
  };
};

export const getTruthProbabilityText = (probability: number): string => {
  if (probability >= 0.8) return "Väga tõenäoliselt tõene";
  if (probability >= 0.6) return "Pigem tõene";
  if (probability >= 0.4) return "Ebaselge";
  if (probability >= 0.2) return "Pigem ebatõene";
  return "Väga tõenäoliselt ebatõene";
};

// Lisa uus funktsioon mikroilmete järjestuste analüüsimiseks
const analyzeMicroExpressionSequence = (
  microExpressions: MicroExpression[],
  currentTime: number
): string[] => {
  const insights: string[] = [];
  
  // Analüüsi viimase 3 sekundi mikroilmeid
  const recentExpressions = microExpressions.filter(
    expr => currentTime - expr.startTime < 3000
  );

  if (recentExpressions.length >= 2) {
    // Kontrolli kiireid üleminekuid emotsioonide vahel
    for (let i = 1; i < recentExpressions.length; i++) {
      const prev = recentExpressions[i - 1];
      const curr = recentExpressions[i];
      const timeDiff = curr.startTime - prev.startTime;

      if (timeDiff < 500) { // Pool sekundit
        insights.push(`Kiire üleminek: ${prev.emotion} → ${curr.emotion} (${timeDiff}ms)`);
        
        // Kontrolli spetsiifilisi kombinatsioone
        if (
          (prev.emotion === 'happy' && curr.emotion === 'fearful') ||
          (prev.emotion === 'happy' && curr.emotion === 'surprised') ||
          (prev.emotion === 'neutral' && curr.emotion === 'fearful')
        ) {
          insights.push('⚠️ Võimalik valetamisele viitav emotsioonide järjestus');
        }
      }
    }

    // Kontrolli emotsioonide kordumist
    const emotionCounts = recentExpressions.reduce((acc, expr) => {
      acc[expr.emotion] = (acc[expr.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count >= 3) {
        insights.push(`Korduv ${emotion} emotsioon (${count} korda) - võimalik püüe emotsiooni varjata`);
      }
    });
  }

  return insights;
};

// Muudan ajastuse konstandid täpsemaks
const TIMING_THRESHOLDS = {
  TOO_FAST: 50,        // Liiga kiire muutus (alla 50ms)
  MIN_DURATION: 100,   // Minimaalne kestus (100ms)
  MAX_DURATION: 200,   // Maksimaalne kestus (200ms)
  SEQUENCE_WINDOW: 3000 // Järjestuse analüüsi aken (3s)
}; 