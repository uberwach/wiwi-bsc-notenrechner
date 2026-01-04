import { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, GraduationCap, Calculator, BookOpen, AlertCircle, Info, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

// --- DATA CONSTANTS ---

const GRADING_SCALE = [
  { min: 95, grade: 1.0 }, { min: 90, grade: 1.3 }, { min: 85, grade: 1.7 },
  { min: 80, grade: 2.0 }, { min: 75, grade: 2.3 }, { min: 70, grade: 2.7 },
  { min: 65, grade: 3.0 }, { min: 60, grade: 3.3 }, { min: 55, grade: 3.7 },
  { min: 50, grade: 4.0 }, { min: 0, grade: 5.0 }
];

const PFLICHT_MODULES = [
  { id: '31001', short: 'eWiWi', name: 'Einführung in die Wirtschaftswissenschaft' },
  { id: '31011', short: 'ExtRewe', name: 'Externes Rechnungswesen' },
  { id: '31021', short: 'InvFin', name: 'Investition und Finanzierung' },
  { id: '31031', short: 'IntRewe', name: 'Internes Rechnungswesen und funktionale Steuerung' },
  { id: '31041', short: 'Mikro', name: 'Mikroökonomik' },
  { id: '31051', short: 'Makro', name: 'Makroökonomik' },
  { id: '31061', short: 'Recht', name: 'Grundlagen des Privat- und Wirtschaftsrechts' },
  { id: '31071', short: 'WInfo', name: 'Einführung in die Wirtschaftsinformatik' },
  { id: '31101', short: 'Mathe', name: 'Grundlagen der Wirtschaftsmathematik und Statistik' },
  { id: '31102', short: 'UF', name: 'Unternehmensführung' },
];

const WAHLPFLICHT_MODULES = [
  // Gruppe I (BWL)
  { id: '31491', name: 'Logistik & Supply Chain Management', group: 'I' },
  { id: '31501', name: 'Finanzwirtschaft', group: 'I' },
  { id: '31521', name: 'Finanzintermediation und Bankmanagement', group: 'I' }, // Nur PO 2023
  { id: '31541', name: 'Produktionsplanung', group: 'I' },
  { id: '31561', name: 'Dienstleistungskonzeptionen', group: 'I' }, // Nur PO 2023
  { id: '31581', name: 'Unternehmensgründung', group: 'I' },
  { id: '31591', name: 'Unternehmensnachfolge', group: 'I' },
  { id: '31601', name: 'Instrumente des Controllings', group: 'I' },
  { id: '31611', name: 'Innovationscontrolling', group: 'I' },
  { id: '31621', name: 'Grundlagen des Marketing', group: 'I' },
  { id: '31631', name: 'Marktforschung und Käuferverhalten', group: 'I' }, // Nur PO 2023
  { id: '31661', name: 'Organisation: Theorie, Gestaltung, Wandel', group: 'I' },
  { id: '31671', name: 'Strategisches Management', group: 'I' },
  { id: '31681', name: 'Unternehmensbesteuerung', group: 'I' },
  { id: '31691', name: 'Steuerliche Gewinnermittlung', group: 'I' }, // (In PO 2025 letztmalig SoSe 2026)
  { id: '31701', name: 'Personalführung', group: 'I' },
  { id: '31711', name: 'Verhalten in Organisationen', group: 'I' },
  { id: '31911', name: 'Jahresabschluss nach IFRS', group: 'I' },
  { id: '31921', name: 'Konzernrechnungslegung', group: 'I' },
  { id: '31991', name: 'Handelsmarketing, E-Commerce & Digital Marketing', group: 'I' },

  // Gruppe II (VWL/Quanti)
  { id: '31481', name: 'Digitale Ethik', group: 'II' }, // Nur PO 2025
  { id: '31721', name: 'Markt und Staat', group: 'II' },
  { id: '31751', name: 'Modellierung betrieblicher Informationssysteme', group: 'II' },
  { id: '31771', name: 'Informationsmanagement', group: 'II' },
  { id: '31781', name: 'Probleme der Wirtschaftspolitik', group: 'II' },
  { id: '31791', name: 'Industrieökonomik', group: 'II' }, // (In PO 2025 letztmalig WiSe 25/26)
  { id: '31801', name: 'Problemlösen in graphischen Strukturen', group: 'II' },
  { id: '31811', name: 'Planen mit mathematischen Modellen', group: 'II' },
  { id: '31821', name: 'Multivariate Verfahren', group: 'II' }, // Nur PO 2023
  { id: '31831', name: 'Knowledge Management', group: 'II' }, 
  { id: '31901', name: 'Öffentliche Ausgaben', group: 'II' }, // Nur PO 2023
  { id: '31931', name: 'Grundlagen der Int. Wirtschaftsbeziehungen', group: 'II' }, 
  { id: '31951', name: 'Digitale Transformation', group: 'II' }, 
  { id: '31961', name: 'Spieltheorie', group: 'II' },
  { id: '31971', name: 'Geldtheorie und Geldpolitik', group: 'II' },
  { id: '31981', name: 'Devisenmärkte & Int. Währungssystem', group: 'II' },

  // Gruppe III (Recht)
  { id: '55109', name: 'Handels- und Gesellschaftsrecht', group: 'III' }, // Nur PO 2025 gelistet
  { id: '55203', name: 'Insolvenzrecht', group: 'III' }, // Nur PO 2025 gelistet
  { id: '55207', name: 'Steuerrechtliche Grundlagen', group: 'III' },

  // Gruppe S (Seminar)
  { id: 'SEMINAR', name: 'Wahlseminar', group: 'S' },
];
// --- UTILS ---

const getGrade = (points: number) => {
  const mapping = GRADING_SCALE.find(s => points >= s.min);
  return mapping ? mapping.grade : 5.0;
};

const truncateDecimal = (num: number, digits: number) => {
  const factor = Math.pow(10, digits);
  return Math.floor(num * factor) / factor;
};

// --- MAIN COMPONENT ---

export default function App() {
  const [po, setPo] = useState<'PO_2023' | 'PO_2025'>(() => {
    const saved = localStorage.getItem('notenrechner_po');
    return (saved as 'PO_2023' | 'PO_2025') || 'PO_2025';
  });
  
  // State for Pflicht modules
  const [pflichtEntries, setPflichtEntries] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('notenrechner_pflicht');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back to defaults if parsing fails
      }
    }
    const defaults: any = {};
    PFLICHT_MODULES.forEach(m => defaults[m.id] = '');
    return defaults;
  });

  // State for Wahlpflicht slots (6 slots)
  const [wahlSlots, setWahlSlots] = useState<Array<{ moduleId: string | null, points: string }>>(() => {
    const saved = localStorage.getItem('notenrechner_wahl');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back to defaults
      }
    }
    return [
      { moduleId: null, points: '' },
      { moduleId: null, points: '' },
      { moduleId: null, points: '' },
      { moduleId: null, points: '' },
      { moduleId: null, points: '' },
      { moduleId: null, points: '' },
    ];
  });

  // State for Seminar & Thesis
  const [seminarPoints, setSeminarPoints] = useState(() => {
    return localStorage.getItem('notenrechner_seminar') || '';
  });
  const [thesisPoints, setThesisPoints] = useState(() => {
    return localStorage.getItem('notenrechner_thesis') || '';
  });

  // Persist to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('notenrechner_po', po);
  }, [po]);

  useEffect(() => {
    localStorage.setItem('notenrechner_pflicht', JSON.stringify(pflichtEntries));
  }, [pflichtEntries]);

  useEffect(() => {
    localStorage.setItem('notenrechner_wahl', JSON.stringify(wahlSlots));
  }, [wahlSlots]);

  useEffect(() => {
    localStorage.setItem('notenrechner_seminar', seminarPoints);
  }, [seminarPoints]);

  useEffect(() => {
    localStorage.setItem('notenrechner_thesis', thesisPoints);
  }, [thesisPoints]);

  const handleReset = () => {
    if (confirm('Möchtest du wirklich alle eingegebenen Daten löschen?')) {
      localStorage.clear();
      // Reset all states to defaults
      setPo('PO_2025');
      const defaults: any = {};
      PFLICHT_MODULES.forEach(m => defaults[m.id] = '');
      setPflichtEntries(defaults);
      setWahlSlots([
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
      ]);
      setSeminarPoints('');
      setThesisPoints('');
    }
  };

  const handlePflichtPointChange = (id: string, val: string) => {
    // Allow 'A' or 'a' for recognized modules, empty string, or valid numbers
    const upperVal = val.toUpperCase();
    if (val === '' || upperVal === 'A' || (Number(val) >= 0 && Number(val) <= 100)) {
      setPflichtEntries(prev => ({ ...prev, [id]: upperVal === 'A' ? 'A' : val }));
    }
  };

  const handleWahlSlotSelect = (index: number, moduleId: string) => {
    setWahlSlots(prev => {
      const newSlots = [...prev];
      newSlots[index].moduleId = moduleId;
      if (moduleId === 'UK') newSlots[index].points = ''; // ÜK has no grade
      return newSlots;
    });
  };

  const handleWahlPointChange = (index: number, val: string) => {
    // Allow 'A' or 'a' for recognized modules, empty string, or valid numbers
    const upperVal = val.toUpperCase();
    if (val === '' || upperVal === 'A' || (Number(val) >= 0 && Number(val) <= 100)) {
      setWahlSlots(prev => {
        const newSlots = [...prev];
        newSlots[index].points = upperVal === 'A' ? 'A' : val;
        return newSlots;
      });
    }
  };

  // Helper functions for slot configuration
  const getSlotLabel = (index: number): string => {
    if (po === 'PO_2023') {
      if (index === 0) return 'BWL (Pflicht)';
      if (index === 1) return 'VWL (Pflicht)';
      return 'Frei wählbar';
    } else {
      if (index === 0) return 'BWL (Pflicht)';
      if (index === 1) return 'VWL (Pflicht)';
      if (index === 2) return 'Frei oder ÜK';
      if (index === 3 || index === 4 || index === 5) return 'Frei wählbar';
      return '';
    }
  };

  const getAvailableModules = (index: number): typeof WAHLPFLICHT_MODULES => {
    if (po === 'PO_2023') {
      if (index === 0) return WAHLPFLICHT_MODULES.filter(m => m.group === 'I');
      if (index === 1) return WAHLPFLICHT_MODULES.filter(m => m.group === 'II');
      return WAHLPFLICHT_MODULES;
    } else {
      if (index === 0) return WAHLPFLICHT_MODULES.filter(m => m.group === 'I');
      if (index === 1) return WAHLPFLICHT_MODULES.filter(m => m.group === 'II');
      return WAHLPFLICHT_MODULES;
    }
  };

  // --- CALCULATION LOGIC ---

  const pflichtStats = useMemo(() => {
    let totalPoints = 0;
    let count = 0;
    let modulesUnder50 = 0;
    let modulesUnder25 = 0;
    let sumAllPoints = 0;
    let recognizedCount = 0;

    PFLICHT_MODULES.forEach(m => {
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
  }, [pflichtEntries]);

  const wahlAbschlussStats = useMemo(() => {
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
  }, [wahlSlots, seminarPoints, thesisPoints, po]);

  const finalGrade = useMemo(() => {
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
  }, [pflichtStats, wahlAbschlussStats, po]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">Notenrechner WiWi (B.Sc.)</h1>
              <p className="text-sm text-slate-500">FernUniversität in Hagen</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2"
              title="Alle Eingaben löschen"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Zurücksetzen</span>
            </button>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setPo('PO_2023')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${po === 'PO_2023' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                PO 2023 (Alt)
              </button>
              <button 
                onClick={() => setPo('PO_2025')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${po === 'PO_2025' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                PO 2025 (Neu)
              </button>
            </div>
          </div>
        </header>

        {/* PROGNOSIS DASHBOARD */}
        {(pflichtStats.hasData || wahlAbschlussStats.hasData) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Prognosis */}
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-800">Prognose (Aktuell)</h3>
              </div>
              <div className="text-3xl font-bold text-blue-700 mb-1">
                {finalGrade.current > 0 ? finalGrade.current.toFixed(1).replace('.', ',') : '-,-'}
              </div>
              <p className="text-xs text-slate-600">
                Basiert auf eingegebenen Noten
              </p>
            </div>

            {/* Best Case */}
            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-slate-800">Best Case</h3>
              </div>
              <div className="text-3xl font-bold text-emerald-700 mb-1">
                {finalGrade.best > 0 ? finalGrade.best.toFixed(1).replace('.', ',') : '-,-'}
              </div>
              <p className="text-xs text-slate-600">
                Fehlende Module mit 1,0 (100P)
              </p>
            </div>

            {/* Worst Case */}
            <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-rose-600" />
                <h3 className="font-semibold text-slate-800">Worst Case</h3>
              </div>
              <div className="text-3xl font-bold text-rose-700 mb-1">
                {finalGrade.worst > 0 ? finalGrade.worst.toFixed(1).replace('.', ',') : '-,-'}
              </div>
              <p className="text-xs text-slate-600">
                Fehlende Module mit 4,0 (50P)
              </p>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="space-y-6">
          
          {/* PFLICHT SECTION */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Pflichtbereich
              </h3>
              <span className="text-xs bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-medium">
                {po === 'PO_2023' ? '20%' : '25%'} Gewichtung
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 divide-x divide-slate-100">
              <div className="divide-y divide-slate-100">
                {PFLICHT_MODULES.slice(0, 5).map(m => (
                  <PflichtModuleRow 
                    key={m.id}
                    module={m}
                    points={pflichtEntries[m.id]}
                    onChange={(v) => handlePflichtPointChange(m.id, v)}
                    pflichtStats={pflichtStats}
                  />
                ))}
              </div>
              
              <div className="divide-y divide-slate-100">
                {PFLICHT_MODULES.slice(5, 10).map(m => (
                  <PflichtModuleRow 
                    key={m.id}
                    module={m}
                    points={pflichtEntries[m.id]}
                    onChange={(v) => handlePflichtPointChange(m.id, v)}
                    pflichtStats={pflichtStats}
                  />
                ))}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t-2 border-slate-200 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Durchschnitt Pflichtbereich:
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  {!pflichtStats.requirementsMet && pflichtStats.hasData ? (
                    <>
                      <div className="text-sm text-rose-600 font-medium">
                        {pflichtStats.totalPoints} Punkte {pflichtStats.totalPoints < 500 && '(mind. 500 erforderlich)'}
                        {pflichtStats.modulesUnder25 > 0 && `${pflichtStats.modulesUnder25} Modul(e) unter 25P`}
                        {pflichtStats.modulesUnder25 === 0 && pflichtStats.modulesUnder50 > 2 && `${pflichtStats.modulesUnder50} Module unter 50P (max. 2)`}
                      </div>
                      <div className="text-lg font-bold text-rose-600">
                        keine Note (nicht bestanden)
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-slate-500">
                        {pflichtStats.hasData ? (
                          <>
                            {pflichtStats.avgPoints} Punkte (Summe: {pflichtStats.totalPoints})
                            {pflichtStats.recognizedCount > 0 && (
                              <span className="text-blue-600 ml-1">inkl. {pflichtStats.recognizedCount} anerkannt (à 50P)</span>
                            )}
                          </>
                        ) : 'Keine Eingaben'}
                      </div>
                      <div className="text-2xl font-bold text-slate-800">
                        {pflichtStats.hasData ? pflichtStats.avgGrade.toFixed(1) : '-,-'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* WAHL- UND ABSCHLUSSBEREICH */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" /> Wahl- und Abschlussbereich
              </h3>
              <span className="text-xs bg-emerald-100 px-3 py-1 rounded-full text-emerald-700 font-medium">
                {po === 'PO_2023' ? '80%' : '75%'} Gewichtung
              </span>
            </div>

            {/* Wahlpflicht - 3 rows x 2 cols */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Wahlpflichtmodule</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {wahlSlots.map((slot, idx) => (
                    <WahlSlotRow 
                      key={idx}
                      index={idx}
                      label={getSlotLabel(idx)}
                      slot={slot}
                      availableModules={getAvailableModules(idx)}
                      onModuleSelect={(moduleId) => handleWahlSlotSelect(idx, moduleId)}
                      onPointChange={(val) => handleWahlPointChange(idx, val)}
                      po={po}
                      wahlAbschlussStats={wahlAbschlussStats}
                    />
                  ))}
                </div>
              </div>

              {/* Abschluss - 1 row with 2 entries */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Abschluss</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <AbschlussRow 
                    label="Seminar"
                    points={seminarPoints}
                    onChange={setSeminarPoints}
                    wahlAbschlussStats={wahlAbschlussStats}
                  />
                  <AbschlussRow 
                    label={po === 'PO_2025' ? 'Bachelorarbeit (zählt 2x)' : 'Bachelorarbeit'}
                    points={thesisPoints}
                    onChange={setThesisPoints}
                    wahlAbschlussStats={wahlAbschlussStats}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">⌀ Wahlpflicht ({wahlAbschlussStats.wpWeight}%):</span>
                  <span className="font-bold text-slate-800">{wahlAbschlussStats.wpAvg}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">⌀ Abschluss ({wahlAbschlussStats.abschlussWeight}%):</span>
                  <span className="font-bold text-slate-800">{wahlAbschlussStats.abschlussAvg}</span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between">
                  <span className="text-slate-700 font-medium">Gesamtnote Wahl-/Abschlussbereich:</span>
                  <span className="text-xl font-bold text-emerald-700">
                    {wahlAbschlussStats.hasData ? wahlAbschlussStats.combinedAvg.toFixed(1) : '-,-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FINAL GRADE BOX */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm opacity-90 mb-1">Voraussichtliche Abschlussnote</div>
                <div className="text-5xl font-bold">{finalGrade.current > 0 ? finalGrade.current.toFixed(1) : '-,-'}</div>
              </div>
              <GraduationCap className="w-16 h-16 opacity-20" />
            </div>
            <div className="mt-4 text-xs opacity-75">
              Berechnung: Pflicht {po === 'PO_2023' ? '20%' : '25%'} + Wahl/Abschluss {po === 'PO_2023' ? '80%' : '75%'}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 mt-10">
          Deine Eingaben werden automatisch im Browser gespeichert.<br/>
          Alle Angaben ohne Gewähr. Es gelten ausschließlich die offiziellen Prüfungsordnungen der FernUniversität in Hagen.
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function PflichtModuleRow({ module, points, onChange, pflichtStats }: { 
    module: { id: string; short: string; name: string }; 
    points: string; 
    onChange: (value: string) => void;
    pflichtStats: { averagePointsForPlaceholder: number | null };
}) {
    const isRecognized = points === 'A';
    const pts = points && !isRecognized ? Number(points) : null;
    const grade = pts !== null ? getGrade(pts) : null;
    
    const status = isRecognized
        ? 'recognized'
        : pts !== null 
        ? pts >= 50 ? 'passed' 
        : pts >= 25 ? 'compensable' 
        : 'failed'
        : null;

    const statusIcon = status === 'recognized'
        ? <CheckCircle2 className="w-5 h-5 text-blue-500" />
        : status === 'passed' 
        ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        : status === 'compensable'
        ? <Info className="w-5 h-5 text-amber-500" />
        : status === 'failed'
        ? <AlertCircle className="w-5 h-5 text-rose-500" />
        : null;

    return (
        <div className="p-4 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 mb-0.5">
                        {module.id} ({module.short})
                    </div>
                    <div className="text-xs italic text-slate-500 leading-snug">
                        {module.name}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <input 
                        type="text" 
                        placeholder={pflichtStats.averagePointsForPlaceholder ? String(pflichtStats.averagePointsForPlaceholder) : "xxx"}
                        className="w-[42px] text-right px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-400"
                        value={points}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <div className="w-12 text-center text-base font-bold text-slate-700">
                        {isRecognized ? 'A' : grade !== null ? grade.toFixed(1) : '-'}
                    </div>
                    <div className="w-6 flex items-center justify-center">
                        {statusIcon}
                    </div>
                </div>
            </div>
        </div>
    );
}

function WahlSlotRow({ 
    index, 
    label, 
    slot, 
    availableModules, 
    onModuleSelect, 
    onPointChange,
    po,
    wahlAbschlussStats
}: { 
    index: number;
    label: string;
    slot: { moduleId: string | null; points: string };
    availableModules: typeof WAHLPFLICHT_MODULES;
    onModuleSelect: (moduleId: string) => void;
    onPointChange: (value: string) => void;
    po: 'PO_2023' | 'PO_2025';
    wahlAbschlussStats: { averagePointsForPlaceholder: number | null };
}) {
    const isRecognized = slot.points === 'A';
    const grade = slot.points && slot.moduleId !== 'UK' && !isRecognized ? getGrade(Number(slot.points)).toFixed(1) : '-';
    const isUK = slot.moduleId === 'UK';
    
    // Add special ÜK option for slot 2 in PO 2025
    const showUKOption = po === 'PO_2025' && index === 2;

    return (
        <div className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
            <div className="text-xs text-slate-500 mb-2 font-medium">{label}</div>
            <div className="grid grid-cols-[minmax(222px,1fr)_42px_48px] gap-2 items-center">
                <select 
                    className="text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none min-w-0"
                    value={slot.moduleId || ''}
                    onChange={(e) => onModuleSelect(e.target.value)}
                >
                    <option value="">-- Modul wählen --</option>
                    {showUKOption && (
                        <option value="UK">Überfachliche Kompetenzen (keine Note)</option>
                    )}
                    {availableModules.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.id} - {m.name}
                        </option>
                    ))}
                </select>
                
                {!isUK && slot.moduleId ? (
                    <>
                        <input 
                            type="text"
                            placeholder={wahlAbschlussStats.averagePointsForPlaceholder ? String(wahlAbschlussStats.averagePointsForPlaceholder) : "xxx"}
                            className="w-full text-right px-2 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400"
                            value={slot.points}
                            onChange={(e) => onPointChange(e.target.value)}
                        />
                        <div className="text-center text-sm font-bold text-slate-700">
                            {isRecognized ? 'A' : grade}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-xs text-slate-400 text-center">{isUK ? 'keine Note' : '-'}</div>
                        <div className="text-center text-sm text-slate-400">-</div>
                    </>
                )}
            </div>
        </div>
    );
}

function AbschlussRow({ label, points, onChange, wahlAbschlussStats }: { 
    label: string; 
    points: string; 
    onChange: (value: string) => void;
    wahlAbschlussStats: { averagePointsForPlaceholder: number | null };
}) {
    // Seminar and Thesis cannot be recognized, so always calculate grade from points
    const grade = points ? getGrade(Number(points)).toFixed(1) : '-';
    
    return (
        <div className="p-3 border-2 border-emerald-200 rounded-lg bg-emerald-50/30">
            <div className="text-sm text-slate-700 mb-2 font-semibold">{label}</div>
            <div className="grid grid-cols-[42px_48px] gap-2 items-center">
                <input 
                    type="number"
                    placeholder={wahlAbschlussStats.averagePointsForPlaceholder ? String(wahlAbschlussStats.averagePointsForPlaceholder) : "xxx"}
                    className="w-full text-right px-2 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-400"
                    value={points}
                    onChange={(e) => {
                        const val = e.target.value;
                        // Seminar and Thesis cannot be recognized, only accept numbers
                        if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                            onChange(val);
                        }
                    }}
                    min="0"
                    max="100"
                />
                <div className="text-center text-base font-bold text-emerald-700">
                    {grade}
                </div>
            </div>
        </div>
    );
}
