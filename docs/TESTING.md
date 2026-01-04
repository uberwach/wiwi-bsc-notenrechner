# Test Documentation

## Overview
This project now includes comprehensive automated tests for the grade calculation logic using Vitest.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run tests with UI
npm test:ui
```

## Test Coverage

The test suite includes **50 test cases** covering:

### 1. Grade Conversion Tests (`getGrade`)
- **Simple scenarios**: All 50 points, all 100 points
- **Edge cases**: Threshold boundaries (95, 90, 85, etc.), decimal points
- **All thresholds**: Verifies correct grades for all point thresholds

### 2. Truncation Tests (`truncateDecimal`)
- Truncation to 1 and 2 decimal places
- Edge cases where rounding would differ from truncation

### 3. Pflicht Module Calculation Tests (`calculatePflichtStats`)
- **Simple scenarios**: 
  - All modules with 50 points
  - All modules with 100 points
  
- **Edge cases - Requirement boundaries**:
  - Minimum 500 total points requirement
  - Maximum 2 modules under 50 points (with at least 25 points)
  - No module under 25 points
  - Exact boundary values (25, 50 points)
  
- **Edge cases - Recognized modules**:
  - Recognized modules (marked 'A') count as 50P for 500P rule
  - Recognized modules don't count in grade average
  - All modules recognized scenario
  
- **Edge cases - Mixed scenarios**:
  - Empty entries
  - Partial entries
  - Average point truncation

### 4. Wahlpflicht & Abschluss Calculation Tests (`calculateWahlAbschlussStats`)
- **Simple scenarios**: 
  - All 50 points with PO_2025
  - All 100 points with PO_2025
  
- **Edge cases - PO weights**:
  - PO_2025 without ÜK: 2/3 vs 1/3 weights
  - PO_2025 with ÜK: 5/8 vs 3/8 weights
  - PO_2023: 6/8 vs 2/8 weights
  
- **Edge cases - Thesis weighting**:
  - Thesis counts 2x in PO_2025
  - Thesis counts 1x in PO_2023
  
- **Edge cases - Recognized modules**:
  - Recognized WP modules excluded from average
  
- **Edge cases - Prognosis**:
  - Best case: Missing slots filled with 1.0
  - Worst case: Missing slots filled with 4.0
  - Empty data handling

### 5. Final Grade Calculation Tests (`calculateFinalGrade`)
- **Simple scenarios**:
  - All 50 points with PO_2025
  - All 100 points with PO_2025
  
- **Edge cases - PO weights**:
  - PO_2025: 25% Pflicht, 75% Wahl/Abschluss
  - PO_2023: 20% Pflicht, 80% Wahl/Abschluss
  
- **Edge cases - Requirements**:
  - Returns 0 when Pflicht requirements not met
  - Returns 0 when no data provided
  
- **Edge cases - Truncation**:
  - Final grade truncated to 1 decimal place (not rounded)

## Test Structure

Tests are organized in [src/utils/gradeCalculations.test.ts](src/utils/gradeCalculations.test.ts) and test the functions extracted to [src/utils/gradeCalculations.ts](src/utils/gradeCalculations.ts).

The main application ([src/App.tsx](src/App.tsx)) imports and uses these tested functions, ensuring the calculations are reliable and correct.

## Key Testing Principles

1. **Simple scenarios first**: Tests basic cases with all modules having the same points (50 or 100)
2. **Edge cases second**: Tests boundary conditions, special rules, and error cases
3. **Separation of concerns**: Calculation logic extracted into testable utility functions
4. **Comprehensive coverage**: 50 tests covering all major calculation paths

## Configuration

Test configuration is in [vitest.config.ts](vitest.config.ts):
- Uses jsdom environment for DOM simulation
- Global test APIs enabled

## Dependencies

- `vitest`: Test runner
- `@vitest/ui`: Web UI for tests
- `jsdom`: DOM environment for tests
