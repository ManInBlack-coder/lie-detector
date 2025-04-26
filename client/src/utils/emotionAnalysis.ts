interface EmotionData {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
}

export interface AnalysisResult {
  truthProbability: number;
  observations: string[];
}

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

export const analyzeEmotions = (emotions: any): AnalysisResult => {
  const defaultResult: AnalysisResult = {
    truthProbability: 0.5,
    observations: ["Emotsioonide analüüs pole veel saadaval."]
  };

  if (!isValidEmotions(emotions)) {
    return defaultResult;
  }

  const observations: string[] = [];
  let truthProbability = 0.5; // Alustame 50% tõenäosusega

  // Kontrolli ärevuse märke (hirm ja üllatus)
  if (emotions.fearful > 0.3 || emotions.surprised > 0.4) {
    observations.push("Tuvastatud kõrgenenud ärevuse tase, mis võib viidata ebakindlusele.");
    truthProbability -= 0.1;
  }

  // Kontrolli emotsionaalset vastuolu
  if (emotions.happy > 0.4 && (emotions.fearful > 0.2 || emotions.angry > 0.2)) {
    observations.push("Märgatud vastuolulisi emotsioone - naeratamine koos ärevuse või vihaga võib viidata teeseldud käitumisele.");
    truthProbability -= 0.15;
  }

  // Kontrolli ülemäärast neutraalsust
  if (emotions.neutral > 0.8) {
    observations.push("Tuvastatud väga kõrge neutraalsuse tase, mis võib viidata emotsioonide teadlikule kontrollimisele.");
    truthProbability -= 0.1;
  }

  // Kontrolli mikroemotsioone
  const microExpressions = Object.entries(emotions).filter(([_, value]) => value > 0.1 && value < 0.3);
  if (microExpressions.length > 2) {
    observations.push("Tuvastatud mitu mikroväljendust, mis võivad viidata varjatud emotsioonidele.");
    truthProbability -= 0.1;
  }

  // Kontrolli emotsionaalset ebastabiilsust
  const significantEmotions = Object.entries(emotions).filter(([_, value]) => value > 0.3);
  if (significantEmotions.length > 2) {
    observations.push("Märgatud emotsionaalset ebastabiilsust - mitu tugevat emotsiooni samaaegselt.");
    truthProbability -= 0.1;
  }

  // Kontrolli viha või vastupanu märke
  if (emotions.angry > 0.3 || emotions.disgusted > 0.3) {
    observations.push("Tuvastatud kõrgenenud viha või vastupanu märgid, mis võivad viidata kaitsepositsioonile.");
    truthProbability -= 0.12;
  }

  // Lisa positiivseid märke
  if (emotions.neutral > 0.4 && emotions.neutral < 0.7 && emotions.happy < 0.4) {
    observations.push("Emotsionaalne tasakaal püsib normaalses vahemikus.");
    truthProbability += 0.1;
  }

  // Kui pole ühtegi tähelepanekut, lisa vaikimisi märkus
  if (observations.length === 0) {
    observations.push("Ei tuvastatud märkimisväärseid emotsionaalseid muutusi.");
  }

  // Piira tõenäosuse vahemikku 0-1
  truthProbability = Math.max(0, Math.min(1, truthProbability));

  return {
    truthProbability,
    observations
  };
};

export const getTruthProbabilityText = (probability: number): string => {
  if (probability >= 0.8) return "Väga tõenäoliselt tõene";
  if (probability >= 0.6) return "Pigem tõene";
  if (probability >= 0.4) return "Ebaselge";
  if (probability >= 0.2) return "Pigem ebatõene";
  return "Väga tõenäoliselt ebatõene";
}; 