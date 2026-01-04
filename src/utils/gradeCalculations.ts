// --- DATA CONSTANTS ---

export const GRADING_SCALE = [
  { min: 95, grade: 1.0 }, { min: 90, grade: 1.3 }, { min: 85, grade: 1.7 },
  { min: 80, grade: 2.0 }, { min: 75, grade: 2.3 }, { min: 70, grade: 2.7 },
  { min: 65, grade: 3.0 }, { min: 60, grade: 3.3 }, { min: 55, grade: 3.7 },
  { min: 50, grade: 4.0 }, { min: 0, grade: 5.0 }
];

// --- UTILS ---

export const getGrade = (points: number): number => {
  const mapping = GRADING_SCALE.find(s => points >= s.min);
  return mapping ? mapping.grade : 5.0;
};

export const truncateDecimal = (num: number, digits: number): number => {
  const factor = Math.pow(10, digits);
  return Math.floor(num * factor) / factor;
};

// --- TYPES ---

export interface PflichtModule {
  id: string;
  short: string;
  name: string;
}

export interface PflichtStats {
  avgPoints: number;
  avgGrade: number;
  averagePointsForPlaceholder: number | null;
  hasData: boolean;
  recognizedCount: number;
  totalPoints: number;
  modulesUnder50: number;
  modulesUnder25: number;
  requirementsMet: boolean;
}

export interface WahlSlot {
  moduleId: string | null;
  points: string;
}

export interface WahlAbschlussStats {
  wpAvg: string;
  wpWeight: string;
  abschlussAvg: string;
  abschlussWeight: string;
  combinedAvg: number;
  hasData: boolean;
  currentGrade: number;
  bestGrade: number;
  worstGrade: number;
  averagePointsForPlaceholder: number | null;
}

export interface FinalGrade {
  current: number;
  best: number;
  worst: number;
}

// --- CALCULATION LOGIC ---

export const calculatePflichtStats = (
  pflichtEntries: Record<string, string>,
  pflichtModules: PflichtModule[]
): PflichtStats => {
  let totalPoints = 0;
  let count = 0;
  let modulesUnder50 = 0;
  let modulesUnder25 = 0;
  let sumAllPoints = 0;
  let recognizedCount = 0;

  pflichtModules.forEach(m => {
    const pts = pflichtEntries[m.id];
    if (pts !== '') {
      if (pts === 'A') {
        // Recognized modules don't count for grade average, but count as 50P for 500P rule
        recognizedCount++;
        sumAllPoints += 50;
      } else {
        const points = Number(pts);
        totalPoints += points;
        sumAllPoints += points;
        count++;
        
        if (points < 50) {
          modulesUnder50++;
        }
        if (points < 25) {
          modulesUnder25++;
        }
      }
    }
  });

  const avgPoints = count > 0 ? totalPoints / count : 0;
  const avgGrade = avgPoints > 0 ? getGrade(avgPoints) : 0;

  // Check if Pflicht requirements are met
  // Requirements:
  // 1. Total points must be at least 500 (recognized modules count as 50P)
  // 2. At most 2 modules can be under 50 points (if they have at least 25 points)
  // 3. No module can be under 25 points
  const requirementsMet = count + recognizedCount > 0 && 
    sumAllPoints >= 500 && 
    modulesUnder50 <= 2 && 
    modulesUnder25 === 0;

  return {
    avgPoints: truncateDecimal(avgPoints, 1),
    avgGrade: avgGrade,
    averagePointsForPlaceholder: count > 0 ? Math.round(avgPoints) : null,
    hasData: count > 0 || recognizedCount > 0,
    recognizedCount: recognizedCount,
    totalPoints: sumAllPoints,
    modulesUnder50: modulesUnder50,
    modulesUnder25: modulesUnder25,
    requirementsMet: requirementsMet
  };
};

export const calculateWahlAbschlussStats = (
  wahlSlots: WahlSlot[],
  seminarPoints: string,
  thesisPoints: string,
  po: 'PO_2023' | 'PO_2025'
): WahlAbschlussStats => {
  // Helper function to calculate for any scenario (current, best, worst)
  const calculateScenario = (fillerGrade: number | null) => {
    // Collect WP grades (excluding ÜK and recognized modules) - NO ROUNDING YET
    const wpGrades: number[] = [];
    wahlSlots.forEach(slot => {
      if (slot.moduleId && slot.moduleId !== 'UK' && slot.points !== '' && slot.points !== 'A') {
        wpGrades.push(getGrade(Number(slot.points)));
      }
    });

    // Seminar & Thesis grades
    const semGrade = seminarPoints ? getGrade(Number(seminarPoints)) : (fillerGrade || null);
    const thesisGrade = thesisPoints ? getGrade(Number(thesisPoints)) : (fillerGrade || null);

    // Check configuration
    const hasUK = wahlSlots.some(s => s.moduleId === 'UK');

    // Fill missing WP slots with filler grade if provided
    const totalWPSlots = 6;
    const filledWPSlots = wahlSlots.filter(s => s.moduleId && s.moduleId !== 'UK').length;
    const missingWPSlots = totalWPSlots - filledWPSlots;
    
    if (fillerGrade !== null && missingWPSlots > 0) {
      for (let i = 0; i < missingWPSlots; i++) {
        wpGrades.push(fillerGrade);
      }
    }

    // Calculate WP average - NO ROUNDING
    const wpAvg = wpGrades.length > 0 
      ? wpGrades.reduce((a, b) => a + b, 0) / wpGrades.length 
      : 0;

    // Calculate Abschluss average (Seminar + Thesis)
    let abschlussSum = 0;
    let abschlussCount = 0;
    
    if (semGrade !== null) {
      abschlussSum += semGrade;
      abschlussCount += 1;
    }
    
    if (thesisGrade !== null) {
      if (po === 'PO_2025') {
        abschlussSum += thesisGrade * 2;
        abschlussCount += 2;
      } else {
        abschlussSum += thesisGrade;
        abschlussCount += 1;
      }
    }

    const abschlussAvg = abschlussCount > 0 ? abschlussSum / abschlussCount : 0;

    // Calculate weights based on PO and whether ÜK is used
    let wpWeight = 0.75; // default (6/8)
    let abschlussWeight = 0.25; // default (2/8)

    if (po === 'PO_2025') {
      if (hasUK) {
        // 5 WP + ÜK + Sem + Thesis(2x) = 5 vs 3 => 5/8 vs 3/8
        wpWeight = 5/8;
        abschlussWeight = 3/8;
      } else {
        // 6 WP + Sem + Thesis(2x) = 6 vs 3 => 2/3 vs 1/3
        wpWeight = 2/3;
        abschlussWeight = 1/3;
      }
    }

    // Combined average - NO ROUNDING (will be truncated only at final grade level)
    const combinedAvg = (wpAvg * wpWeight) + (abschlussAvg * abschlussWeight);

    return {
      wpAvg,
      wpWeight,
      abschlussAvg,
      abschlussWeight,
      combinedAvg,
      hasData: wpGrades.length > 0 || semGrade !== null || thesisGrade !== null
    };
  };

  // Calculate all three scenarios
  const current = calculateScenario(null); // No filler
  const best = calculateScenario(1.0); // Fill with 1.0
  const worst = calculateScenario(4.0); // Fill with 4.0

  // Calculate average points for placeholder (excluding recognized modules)
  let totalPoints = 0;
  let pointsCount = 0;
  wahlSlots.forEach(slot => {
    if (slot.moduleId && slot.moduleId !== 'UK' && slot.points !== '' && slot.points !== 'A') {
      totalPoints += Number(slot.points);
      pointsCount++;
    }
  });
  if (seminarPoints && seminarPoints !== 'A') {
    totalPoints += Number(seminarPoints);
    pointsCount++;
  }
  if (thesisPoints && thesisPoints !== 'A') {
    totalPoints += Number(thesisPoints);
    pointsCount++;
  }
  const avgPointsForPlaceholder = pointsCount > 0 ? Math.round(totalPoints / pointsCount) : null;

  return {
    // Current (for display in summary box)
    wpAvg: current.wpAvg > 0 ? current.wpAvg.toFixed(2) : '-,-',
    wpWeight: (current.wpWeight * 100).toFixed(0),
    abschlussAvg: current.abschlussAvg > 0 ? current.abschlussAvg.toFixed(2) : '-,-',
    abschlussWeight: (current.abschlussWeight * 100).toFixed(0),
    combinedAvg: current.combinedAvg,
    hasData: current.hasData,
    // Best and worst for prognosis
    currentGrade: current.combinedAvg,
    bestGrade: best.combinedAvg,
    worstGrade: worst.combinedAvg,
    // Average points for placeholder
    averagePointsForPlaceholder: avgPointsForPlaceholder,
  };
};

export const calculateFinalGrade = (
  pflichtStats: PflichtStats,
  wahlAbschlussStats: WahlAbschlussStats,
  po: 'PO_2023' | 'PO_2025'
): FinalGrade => {
  if (!pflichtStats.hasData && !wahlAbschlussStats.hasData) {
    return {
      current: 0,
      best: 0,
      worst: 0
    };
  }

  // If Pflicht requirements are not met, no final grade
  if (!pflichtStats.requirementsMet && pflichtStats.hasData) {
    return {
      current: 0,
      best: 0,
      worst: 0
    };
  }

  const pflichtWeight = po === 'PO_2023' ? 0.2 : 0.25;
  const wahlWeight = po === 'PO_2023' ? 0.8 : 0.75;

  const pflichtGrade = pflichtStats.avgGrade || 0;

  // Calculate current, best, worst final grades
  const current = (pflichtGrade * pflichtWeight) + (wahlAbschlussStats.currentGrade * wahlWeight);
  const best = (pflichtGrade * pflichtWeight) + (wahlAbschlussStats.bestGrade * wahlWeight);
  const worst = (pflichtGrade * pflichtWeight) + (wahlAbschlussStats.worstGrade * wahlWeight);

  return {
    current: truncateDecimal(current, 1),
    best: truncateDecimal(best, 1),
    worst: truncateDecimal(worst, 1)
  };
};
