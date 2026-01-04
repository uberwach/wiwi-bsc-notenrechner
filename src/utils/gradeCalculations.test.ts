import { describe, it, expect } from 'vitest';
import {
  getGrade,
  truncateDecimal,
  calculatePflichtStats,
  calculateWahlAbschlussStats,
  calculateFinalGrade,
  type PflichtModule,
  type WahlSlot,
} from './gradeCalculations';

// Mock Pflicht modules for testing
const MOCK_PFLICHT_MODULES: PflichtModule[] = [
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

describe('getGrade', () => {
  describe('Simple scenarios', () => {
    it('should return 1.0 for 100 points', () => {
      expect(getGrade(100)).toBe(1.0);
    });

    it('should return 4.0 for 50 points', () => {
      expect(getGrade(50)).toBe(4.0);
    });

    it('should return 5.0 for 0 points', () => {
      expect(getGrade(0)).toBe(5.0);
    });

    it('should return correct grades for all 50-point scenario', () => {
      expect(getGrade(50)).toBe(4.0);
    });

    it('should return correct grades for all 100-point scenario', () => {
      expect(getGrade(100)).toBe(1.0);
    });
  });

  describe('Edge cases', () => {
    it('should return 1.0 for 95 points (threshold)', () => {
      expect(getGrade(95)).toBe(1.0);
    });

    it('should return 1.3 for 94 points (just below threshold)', () => {
      expect(getGrade(94)).toBe(1.3);
    });

    it('should return 1.3 for 90 points (threshold)', () => {
      expect(getGrade(90)).toBe(1.3);
    });

    it('should return 1.7 for 89 points', () => {
      expect(getGrade(89)).toBe(1.7);
    });

    it('should return 4.0 for 50 points (threshold)', () => {
      expect(getGrade(50)).toBe(4.0);
    });

    it('should return 5.0 for 49 points (failed)', () => {
      expect(getGrade(49)).toBe(5.0);
    });

    it('should return 5.0 for 25 points', () => {
      expect(getGrade(25)).toBe(5.0);
    });

    it('should return 5.0 for 24 points', () => {
      expect(getGrade(24)).toBe(5.0);
    });

    it('should handle decimal points correctly (94.5)', () => {
      expect(getGrade(94.5)).toBe(1.3);
    });

    it('should handle decimal points correctly (95.5)', () => {
      expect(getGrade(95.5)).toBe(1.0);
    });
  });

  describe('All grade thresholds', () => {
    it('should return correct grades for all thresholds', () => {
      expect(getGrade(95)).toBe(1.0);
      expect(getGrade(90)).toBe(1.3);
      expect(getGrade(85)).toBe(1.7);
      expect(getGrade(80)).toBe(2.0);
      expect(getGrade(75)).toBe(2.3);
      expect(getGrade(70)).toBe(2.7);
      expect(getGrade(65)).toBe(3.0);
      expect(getGrade(60)).toBe(3.3);
      expect(getGrade(55)).toBe(3.7);
      expect(getGrade(50)).toBe(4.0);
    });
  });
});

describe('truncateDecimal', () => {
  it('should truncate to 1 decimal place', () => {
    expect(truncateDecimal(2.456, 1)).toBe(2.4);
    expect(truncateDecimal(1.999, 1)).toBe(1.9);
  });

  it('should truncate to 2 decimal places', () => {
    expect(truncateDecimal(2.456, 2)).toBe(2.45);
    expect(truncateDecimal(1.999, 2)).toBe(1.99);
  });

  it('should handle edge case where rounding would differ', () => {
    expect(truncateDecimal(2.99999, 1)).toBe(2.9);
    expect(truncateDecimal(1.55555, 1)).toBe(1.5);
  });
});

describe('calculatePflichtStats', () => {
  describe('Simple scenarios - all 50 points', () => {
    it('should calculate correctly when all modules have 50 points', () => {
      const entries: Record<string, string> = {};
      MOCK_PFLICHT_MODULES.forEach(m => entries[m.id] = '50');

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      expect(stats.avgPoints).toBe(50.0);
      expect(stats.avgGrade).toBe(4.0);
      expect(stats.totalPoints).toBe(500);
      expect(stats.modulesUnder50).toBe(0);
      expect(stats.modulesUnder25).toBe(0);
      expect(stats.requirementsMet).toBe(true);
      expect(stats.hasData).toBe(true);
    });
  });

  describe('Simple scenarios - all 100 points', () => {
    it('should calculate correctly when all modules have 100 points', () => {
      const entries: Record<string, string> = {};
      MOCK_PFLICHT_MODULES.forEach(m => entries[m.id] = '100');

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      expect(stats.avgPoints).toBe(100.0);
      expect(stats.avgGrade).toBe(1.0);
      expect(stats.totalPoints).toBe(1000);
      expect(stats.modulesUnder50).toBe(0);
      expect(stats.modulesUnder25).toBe(0);
      expect(stats.requirementsMet).toBe(true);
      expect(stats.hasData).toBe(true);
    });
  });

  describe('Edge cases - requirement boundaries', () => {
    it('should require at least 500 total points', () => {
      const entries: Record<string, string> = {
        '31001': '49',
        '31011': '49',
        '31021': '49',
        '31031': '49',
        '31041': '49',
        '31051': '49',
        '31061': '49',
        '31071': '49',
        '31101': '49',
        '31102': '52',
      };

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      expect(stats.totalPoints).toBe(493);
      expect(stats.requirementsMet).toBe(false); // Fails 500P requirement
    });

    it('should pass with exactly 500 points', () => {
      const entries: Record<string, string> = {};
      MOCK_PFLICHT_MODULES.forEach(m => entries[m.id] = '50');

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      expect(stats.totalPoints).toBe(500);
      expect(stats.modulesUnder50).toBe(0);
      expect(stats.requirementsMet).toBe(true);
    });

    it('should allow maximum 2 modules under 50 points (with at least 25)', () => {
      const entries: Record<string, string> = {
        '31001': '45',
        '31011': '45',
        '31021': '60',
        '31031': '60',
        '31041': '60',
        '31051': '60',
        '31061': '60',
        '31071': '60',
        '31101': '60',
        '31102': '60',
      };

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      expect(stats.modulesUnder50).toBe(2);
      expect(stats.modulesUnder25).toBe(0);
      expect(stats.requirementsMet).toBe(true);
    });

    it('should fail with 3 modules under 50 points', () => {
      const entries: Record<string, string> = {
        '31001': '45',
        '31011': '45',
        '31021': '45',
        '31031': '60',
        '31041': '60',
        '31051': '60',
        '31061': '60',
        '31071': '60',
        '31101': '60',
        '31102': '60',
      };

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      expect(stats.modulesUnder50).toBe(3);
      expect(stats.requirementsMet).toBe(false);
    });

    it('should fail with any module under 25 points', () => {
      const entries: Record<string, string> = {
        '31001': '24',
        '31011': '60',
        '31021': '60',
        '31031': '60',
        '31041': '60',
        '31051': '60',
        '31061': '60',
        '31071': '60',
        '31101': '60',
        '31102': '60',
      };

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      expect(stats.modulesUnder25).toBe(1);
      expect(stats.requirementsMet).toBe(false);
    });

    it('should pass with exactly 25 points in a module', () => {
      const entries: Record<string, string> = {
        '31001': '25',
        '31011': '60',
        '31021': '60',
        '31031': '60',
        '31041': '60',
        '31051': '60',
        '31061': '60',
        '31071': '60',
        '31101': '60',
        '31102': '60',
      };

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      expect(stats.modulesUnder50).toBe(1);
      expect(stats.modulesUnder25).toBe(0);
      expect(stats.requirementsMet).toBe(true);
    });
  });

  describe('Edge cases - recognized modules', () => {
    it('should count recognized modules as 50P for 500P rule but not in average', () => {
      const entries: Record<string, string> = {
        '31001': 'A',
        '31011': '100',
        '31021': '100',
        '31031': '100',
        '31041': '100',
        '31051': '100',
        '31061': '100',
        '31071': '100',
        '31101': '100',
        '31102': '100',
      };

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      expect(stats.recognizedCount).toBe(1);
      expect(stats.totalPoints).toBe(950); // 50 + 900
      expect(stats.avgPoints).toBe(100.0); // Only 9 graded modules
      expect(stats.avgGrade).toBe(1.0);
      expect(stats.requirementsMet).toBe(true);
    });

    it('should handle all modules recognized', () => {
      const entries: Record<string, string> = {};
      MOCK_PFLICHT_MODULES.forEach(m => entries[m.id] = 'A');

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      expect(stats.recognizedCount).toBe(10);
      expect(stats.totalPoints).toBe(500);
      expect(stats.avgPoints).toBe(0); // No graded modules
      expect(stats.avgGrade).toBe(0);
      expect(stats.requirementsMet).toBe(true); // 500P requirement met
      expect(stats.hasData).toBe(true);
    });
  });

  describe('Edge cases - mixed scenarios', () => {
    it('should handle empty entries', () => {
      const entries: Record<string, string> = {};
      MOCK_PFLICHT_MODULES.forEach(m => entries[m.id] = '');

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      expect(stats.hasData).toBe(false);
      expect(stats.avgPoints).toBe(0);
      expect(stats.totalPoints).toBe(0);
      expect(stats.requirementsMet).toBe(false);
    });

    it('should handle partial entries', () => {
      const entries: Record<string, string> = {
        '31001': '80',
        '31011': '75',
        '31021': '',
        '31031': '',
        '31041': '',
        '31051': '',
        '31061': '',
        '31071': '',
        '31101': '',
        '31102': '',
      };

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      expect(stats.hasData).toBe(true);
      expect(stats.avgPoints).toBe(77.5);
      expect(stats.totalPoints).toBe(155);
      expect(stats.requirementsMet).toBe(false); // Not enough points
    });

    it('should truncate average points correctly', () => {
      const entries: Record<string, string> = {
        '31001': '93',
        '31011': '87',
        '31021': '81',
        '31031': '75',
        '31041': '69',
        '31051': '63',
        '31061': '57',
        '31071': '51',
        '31101': '45',
        '31102': '79',
      };

      const stats = calculatePflichtStats(entries, MOCK_PFLICHT_MODULES);

      // Total = 700, Average = 70.0
      expect(stats.avgPoints).toBe(70.0);
      expect(stats.avgGrade).toBe(2.7);
    });
  });
});

describe('calculateWahlAbschlussStats', () => {
  describe('Simple scenarios - all modules with same points', () => {
    it('should calculate correctly with all 50 points (PO_2025)', () => {
      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '50' },
        { moduleId: 'M2', points: '50' },
        { moduleId: 'M3', points: '50' },
        { moduleId: 'M4', points: '50' },
        { moduleId: 'M5', points: '50' },
        { moduleId: 'M6', points: '50' },
      ];

      const stats = calculateWahlAbschlussStats(wahlSlots, '50', '50', 'PO_2025');

      expect(stats.hasData).toBe(true);
      expect(parseFloat(stats.wpAvg)).toBeCloseTo(4.0, 2);
      expect(parseFloat(stats.abschlussAvg)).toBeCloseTo(4.0, 2);
      expect(stats.currentGrade).toBeCloseTo(4.0, 2);
    });

    it('should calculate correctly with all 100 points (PO_2025)', () => {
      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '100' },
        { moduleId: 'M2', points: '100' },
        { moduleId: 'M3', points: '100' },
        { moduleId: 'M4', points: '100' },
        { moduleId: 'M5', points: '100' },
        { moduleId: 'M6', points: '100' },
      ];

      const stats = calculateWahlAbschlussStats(wahlSlots, '100', '100', 'PO_2025');

      expect(stats.hasData).toBe(true);
      expect(parseFloat(stats.wpAvg)).toBeCloseTo(1.0, 2);
      expect(parseFloat(stats.abschlussAvg)).toBeCloseTo(1.0, 2);
      expect(stats.currentGrade).toBeCloseTo(1.0, 2);
    });
  });

  describe('Edge cases - PO_2025 weights', () => {
    it('should use 2/3 and 1/3 weights without ÜK (PO_2025)', () => {
      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '100' },
        { moduleId: 'M2', points: '100' },
        { moduleId: 'M3', points: '100' },
        { moduleId: 'M4', points: '100' },
        { moduleId: 'M5', points: '100' },
        { moduleId: 'M6', points: '100' },
      ];

      const stats = calculateWahlAbschlussStats(wahlSlots, '100', '100', 'PO_2025');

      expect(stats.wpWeight).toBe('67'); // 2/3 = 66.666...
      expect(stats.abschlussWeight).toBe('33'); // 1/3 = 33.333...
    });

    it('should use 5/8 and 3/8 weights with ÜK (PO_2025)', () => {
      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '100' },
        { moduleId: 'M2', points: '100' },
        { moduleId: 'UK', points: '' }, // ÜK
        { moduleId: 'M4', points: '100' },
        { moduleId: 'M5', points: '100' },
        { moduleId: 'M6', points: '100' },
      ];

      const stats = calculateWahlAbschlussStats(wahlSlots, '100', '100', 'PO_2025');

      expect(stats.wpWeight).toBe('63'); // 5/8 = 62.5 rounds to 63
      expect(stats.abschlussWeight).toBe('38'); // 3/8 = 37.5 rounds to 38
    });
  });

  describe('Edge cases - PO_2023 weights', () => {
    it('should use 6/8 and 2/8 weights (PO_2023)', () => {
      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '100' },
        { moduleId: 'M2', points: '100' },
        { moduleId: 'M3', points: '100' },
        { moduleId: 'M4', points: '100' },
        { moduleId: 'M5', points: '100' },
        { moduleId: 'M6', points: '100' },
      ];

      const stats = calculateWahlAbschlussStats(wahlSlots, '100', '100', 'PO_2023');

      expect(stats.wpWeight).toBe('75'); // 6/8 = 0.75
      expect(stats.abschlussWeight).toBe('25'); // 2/8 = 0.25
    });
  });

  describe('Edge cases - thesis weight in PO_2025', () => {
    it('should count thesis 2x in PO_2025', () => {
      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '50' },
        { moduleId: 'M2', points: '50' },
        { moduleId: 'M3', points: '50' },
        { moduleId: 'M4', points: '50' },
        { moduleId: 'M5', points: '50' },
        { moduleId: 'M6', points: '50' },
      ];

      // Seminar: 4.0, Thesis: 1.0 (counted 2x)
      // Abschluss: (4.0 + 1.0*2) / 3 = 6.0/3 = 2.0
      const stats = calculateWahlAbschlussStats(wahlSlots, '50', '100', 'PO_2025');

      expect(parseFloat(stats.abschlussAvg)).toBeCloseTo(2.0, 2);
    });

    it('should count thesis 1x in PO_2023', () => {
      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '50' },
        { moduleId: 'M2', points: '50' },
        { moduleId: 'M3', points: '50' },
        { moduleId: 'M4', points: '50' },
        { moduleId: 'M5', points: '50' },
        { moduleId: 'M6', points: '50' },
      ];

      // Seminar: 4.0, Thesis: 1.0 (counted 1x)
      // Abschluss: (4.0 + 1.0) / 2 = 5.0/2 = 2.5
      const stats = calculateWahlAbschlussStats(wahlSlots, '50', '100', 'PO_2023');

      expect(parseFloat(stats.abschlussAvg)).toBeCloseTo(2.5, 2);
    });
  });

  describe('Edge cases - recognized modules', () => {
    it('should exclude recognized WP modules from average', () => {
      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '100' },
        { moduleId: 'M2', points: 'A' }, // Recognized
        { moduleId: 'M3', points: '100' },
        { moduleId: 'M4', points: '100' },
        { moduleId: 'M5', points: '100' },
        { moduleId: 'M6', points: '100' },
      ];

      const stats = calculateWahlAbschlussStats(wahlSlots, '100', '100', 'PO_2025');

      // Only 5 modules count: all with 100 points = grade 1.0
      expect(parseFloat(stats.wpAvg)).toBeCloseTo(1.0, 2);
    });
  });

  describe('Edge cases - best/worst prognosis', () => {
    it('should fill missing slots with 1.0 for best case', () => {
      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '100' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
      ];

      const stats = calculateWahlAbschlussStats(wahlSlots, '', '', 'PO_2025');

      // Best: all 6 slots with 1.0
      expect(stats.bestGrade).toBeCloseTo(1.0, 2);
    });

    it('should fill missing slots with 4.0 for worst case', () => {
      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '100' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
      ];

      const stats = calculateWahlAbschlussStats(wahlSlots, '', '', 'PO_2025');

      // Worst: 1 module with 1.0, 5 modules with 4.0
      // WP average: (1.0 + 4.0*5) / 6 = 21/6 = 3.5
      // With PO_2025, no ÜK: wpWeight = 2/3, abschlussWeight = 1/3
      // Abschluss filled with 4.0: (4.0 + 4.0*2) / 3 = 4.0
      // Combined: 3.5 * (2/3) + 4.0 * (1/3) = 2.333... + 1.333... = 3.666...
      expect(stats.worstGrade).toBeCloseTo(3.666, 2);
    });
  });

  describe('Edge cases - empty data', () => {
    it('should handle completely empty data', () => {
      const wahlSlots: WahlSlot[] = [
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
      ];

      const stats = calculateWahlAbschlussStats(wahlSlots, '', '', 'PO_2025');

      expect(stats.hasData).toBe(false);
      expect(stats.wpAvg).toBe('-,-');
      expect(stats.abschlussAvg).toBe('-,-');
    });
  });
});

describe('calculateFinalGrade', () => {
  describe('Simple scenarios - all 50 or 100 points', () => {
    it('should calculate final grade with all 50 points (PO_2025)', () => {
      // Create Pflicht stats
      const pflichtEntries: Record<string, string> = {};
      MOCK_PFLICHT_MODULES.forEach(m => pflichtEntries[m.id] = '50');
      const pflichtStats = calculatePflichtStats(pflichtEntries, MOCK_PFLICHT_MODULES);

      // Create Wahl stats
      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '50' },
        { moduleId: 'M2', points: '50' },
        { moduleId: 'M3', points: '50' },
        { moduleId: 'M4', points: '50' },
        { moduleId: 'M5', points: '50' },
        { moduleId: 'M6', points: '50' },
      ];
      const wahlStats = calculateWahlAbschlussStats(wahlSlots, '50', '50', 'PO_2025');

      // Calculate final
      const finalGrade = calculateFinalGrade(pflichtStats, wahlStats, 'PO_2025');

      // All grades are 4.0, so final should be 4.0
      expect(finalGrade.current).toBe(4.0);
    });

    it('should calculate final grade with all 100 points (PO_2025)', () => {
      // Create Pflicht stats
      const pflichtEntries: Record<string, string> = {};
      MOCK_PFLICHT_MODULES.forEach(m => pflichtEntries[m.id] = '100');
      const pflichtStats = calculatePflichtStats(pflichtEntries, MOCK_PFLICHT_MODULES);

      // Create Wahl stats
      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '100' },
        { moduleId: 'M2', points: '100' },
        { moduleId: 'M3', points: '100' },
        { moduleId: 'M4', points: '100' },
        { moduleId: 'M5', points: '100' },
        { moduleId: 'M6', points: '100' },
      ];
      const wahlStats = calculateWahlAbschlussStats(wahlSlots, '100', '100', 'PO_2025');

      // Calculate final
      const finalGrade = calculateFinalGrade(pflichtStats, wahlStats, 'PO_2025');

      // All grades are 1.0, so final should be 1.0
      expect(finalGrade.current).toBe(1.0);
    });
  });

  describe('Edge cases - PO weights', () => {
    it('should use 25/75 weights for PO_2025', () => {
      const pflichtEntries: Record<string, string> = {};
      MOCK_PFLICHT_MODULES.forEach(m => pflichtEntries[m.id] = '100');
      const pflichtStats = calculatePflichtStats(pflichtEntries, MOCK_PFLICHT_MODULES);

      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '50' },
        { moduleId: 'M2', points: '50' },
        { moduleId: 'M3', points: '50' },
        { moduleId: 'M4', points: '50' },
        { moduleId: 'M5', points: '50' },
        { moduleId: 'M6', points: '50' },
      ];
      const wahlStats = calculateWahlAbschlussStats(wahlSlots, '50', '50', 'PO_2025');

      const finalGrade = calculateFinalGrade(pflichtStats, wahlStats, 'PO_2025');

      // Pflicht: 1.0, Wahl: 4.0
      // Final: 1.0 * 0.25 + 4.0 * 0.75 = 0.25 + 3.0 = 3.25
      expect(finalGrade.current).toBe(3.2); // Truncated to 1 decimal
    });

    it('should use 20/80 weights for PO_2023', () => {
      const pflichtEntries: Record<string, string> = {};
      MOCK_PFLICHT_MODULES.forEach(m => pflichtEntries[m.id] = '100');
      const pflichtStats = calculatePflichtStats(pflichtEntries, MOCK_PFLICHT_MODULES);

      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '50' },
        { moduleId: 'M2', points: '50' },
        { moduleId: 'M3', points: '50' },
        { moduleId: 'M4', points: '50' },
        { moduleId: 'M5', points: '50' },
        { moduleId: 'M6', points: '50' },
      ];
      const wahlStats = calculateWahlAbschlussStats(wahlSlots, '50', '50', 'PO_2023');

      const finalGrade = calculateFinalGrade(pflichtStats, wahlStats, 'PO_2023');

      // Pflicht: 1.0, Wahl: 4.0
      // Final: 1.0 * 0.2 + 4.0 * 0.8 = 0.2 + 3.2 = 3.4
      expect(finalGrade.current).toBe(3.4);
    });
  });

  describe('Edge cases - requirements not met', () => {
    it('should return 0 when Pflicht requirements not met', () => {
      const pflichtEntries: Record<string, string> = {
        '31001': '24', // Under 25
        '31011': '60',
        '31021': '60',
        '31031': '60',
        '31041': '60',
        '31051': '60',
        '31061': '60',
        '31071': '60',
        '31101': '60',
        '31102': '60',
      };
      const pflichtStats = calculatePflichtStats(pflichtEntries, MOCK_PFLICHT_MODULES);

      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '100' },
        { moduleId: 'M2', points: '100' },
        { moduleId: 'M3', points: '100' },
        { moduleId: 'M4', points: '100' },
        { moduleId: 'M5', points: '100' },
        { moduleId: 'M6', points: '100' },
      ];
      const wahlStats = calculateWahlAbschlussStats(wahlSlots, '100', '100', 'PO_2025');

      const finalGrade = calculateFinalGrade(pflichtStats, wahlStats, 'PO_2025');

      expect(finalGrade.current).toBe(0);
      expect(finalGrade.best).toBe(0);
      expect(finalGrade.worst).toBe(0);
    });

    it('should return 0 when no data provided', () => {
      const pflichtEntries: Record<string, string> = {};
      const pflichtStats = calculatePflichtStats(pflichtEntries, MOCK_PFLICHT_MODULES);

      const wahlSlots: WahlSlot[] = [
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
        { moduleId: null, points: '' },
      ];
      const wahlStats = calculateWahlAbschlussStats(wahlSlots, '', '', 'PO_2025');

      const finalGrade = calculateFinalGrade(pflichtStats, wahlStats, 'PO_2025');

      expect(finalGrade.current).toBe(0);
    });
  });

  describe('Edge cases - truncation', () => {
    it('should truncate final grade to 1 decimal place', () => {
      const pflichtEntries: Record<string, string> = {};
      MOCK_PFLICHT_MODULES.forEach(m => pflichtEntries[m.id] = '93'); // 1.3
      const pflichtStats = calculatePflichtStats(pflichtEntries, MOCK_PFLICHT_MODULES);

      const wahlSlots: WahlSlot[] = [
        { moduleId: 'M1', points: '87' }, // 1.7
        { moduleId: 'M2', points: '87' },
        { moduleId: 'M3', points: '87' },
        { moduleId: 'M4', points: '87' },
        { moduleId: 'M5', points: '87' },
        { moduleId: 'M6', points: '87' },
      ];
      const wahlStats = calculateWahlAbschlussStats(wahlSlots, '87', '87', 'PO_2025');

      const finalGrade = calculateFinalGrade(pflichtStats, wahlStats, 'PO_2025');

      // Result should be truncated, not rounded
      expect(finalGrade.current).toBeLessThanOrEqual(2.0);
      expect(Number.isInteger(finalGrade.current * 10)).toBe(true); // Should have exactly 1 decimal
    });
  });
});
