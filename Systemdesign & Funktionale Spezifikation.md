# Systemdesign & Funktionale Spezifikation: Notenrechner BSc WiWi (FernUni Hagen)

## 1. Management Summary

Das Ziel ist die Entwicklung einer **client-seitigen Single-Page-Application (SPA)**, die Studierenden des Bachelor Wirtschaftswissenschaften ermöglicht, ihren Studienverlauf zu planen und die Abschlussnote basierend auf verschiedenen Prüfungsordnungen (PO 2023 vs. PO 2025) zu prognostizieren.

**Kernproblem:** Die Validierung der komplexen Wahlpflichtregeln. Der Nutzer entscheidet selbstständig, welche Module in die Note eingehen; das System prüft lediglich die Konformität dieser Auswahl (Validierung statt Optimierung).

## 2. Tech Stack Definition

| Komponente | Technologie | Begründung |
|------------|-------------|------------|
| **Language** | TypeScript 5.x | Zwingend erforderlich für Domain Modeling (Interfaces für Module, Rulesets) |
| **Frontend** | React 18+ | Komponentenbasierte UI für dynamische Listen (Pflicht/Wahlpflicht) |
| **State** | Zustand | Leichter als Redux, aber mächtig genug für komplexe Abhängigkeiten (Cross-Module Validation) |
| **Styling** | Tailwind CSS | Schnelles Prototyping, Responsive Design für Mobile-Nutzung |
| **UI Lib** | shadcn/ui | Hochwertige Komponenten (Alerts, Dialogs, Inputs) für professionellen Look |
| **Persistence** | LocalStorage | Datenschutzfreundlich, kein Backend notwendig. State bleibt bei Reload erhalten |
| **Build** | Vite | Performante Developer Experience |

## 3. Datenmodell (Domain Driven Design)

### 3.1 Entitäten & Konstanten

Wir nutzen ein striktes Typensystem. Daten werden hardcoded (als TypeScript-Konstanten) hinterlegt.

**Konstante:** `DEFAULT_ECTS = 10` (Gilt für alle Module inkl. Thesis)

```typescript
type ExamRegulation = 'PO_2023' | 'PO_2025';

type ModuleGroup = 
  | 'PFLICHT' 
  | 'WP_I_BWL' 
  | 'WP_II_VWL_QUANTI' 
  | 'WP_III_JURA' 
  | 'UEBERFACHLICHE_KOMPETENZEN' 
  | 'SEMINAR' 
  | 'ABSCHLUSSARBEIT';

interface Module {
  id: string; // z.B. "31001"
  name: string;
  groups: ModuleGroup[]; 
  // ects ist implizit immer 10
}

interface UserModuleState {
  moduleId: string;
  grade?: number; // 1.0 bis 5.0
  points?: number; // 0 bis 100 
  includedInCalculation: boolean; // Checkbox: "In Endnote einbeziehen"
}

interface ValidationResult {
  isValid: boolean;
  messages: {
    type: 'ERROR' | 'WARNING'; // ERROR blockiert nichts, zeigt aber Rot an.
    text: string;
  }[];
}
```


## 4. Funktionale Anforderungen (Basierend auf PDFs)

### 4.1 Modus: PO 2023 (Alte Ordnung)

#### Regelwerk (Validierung)

Das System zeigt Fehler an, wenn die ausgewählten Module (`includedInCalculation === true`) folgende Regeln verletzen:

- **Summe WP-Module:** Genau 6 Stück ausgewählt?
- **Gruppen:**
  - Min. 1 aus Gruppe I
  - Min. 1 aus Gruppe II
  - Max. 1 aus Gruppe III
- **Seminar:** Genau 1 Pflichtseminar ausgewählt?
- **Thesis:** 1 Bachelorarbeit ausgewählt?

#### Berechnung (§23 PO 2023)

- **Pflicht-Note:** Durchschnitt Prozentpunkte der 10 Pflichtmodule → Note (20% Gewicht)
- **Rest-Note:** Durchschnitt der Noten der gewählten WP-Module (6 Stk) + Seminar + Thesis (80% Gewicht)

### 4.2 Modus: PO 2025 (Neue Ordnung)

#### Regelwerk (Validierung)

Das System zeigt Fehler an, wenn die ausgewählten Module folgende Regeln verletzen:

**Basis-Validierung:**
- Min. 1 aus Gruppe I
- Min. 1 aus Gruppe II
- Max. 1 aus Gruppe III

**Mengen-Validierung (Substitutionslogik):**

Der User wählt aus, welche WP-Module er einbringen will. Das System zählt die Anzahl der WP-Module.

**Erlaubte Konstellationen (Beispiele):**
- 4 WP + 1 ÜK + 2 Seminare (Standard)
- 5 WP (eines ersetzt ÜK) + 2 Seminare
- 5 WP (eines ersetzt Seminar 2) + 1 ÜK + 1 Seminar
- 6 WP (ersetzen ÜK und Seminar 2) + 1 Seminar

**Fehleranzeige:** "Du hast X WP-Module gewählt. Das ist in Kombination mit Y Seminaren nicht zulässig."

#### Berechnung (§24 PO 2025)

- **Pflicht-Note:** Durchschnitt Prozentpunkte der 10 Pflichtmodule → Note (25% Gewicht)
- **Rest-Note:** Durchschnitt der Noten (75% Gewicht)
- **Besonderheit:** Note der Bachelorarbeit zählt doppelt (Faktor 2 in der Durchschnittsberechnung)

### 4.3 UI-Logik & User Flow

**Onboarding:** Umschalter PO 2023 / 2025

**Pflichtbereich:**
- Statische Liste
- Eingabefelder für Punkte/Note

**Wahlbereich & Sonstiges:**
- Liste der verfügbaren Module (filterbar)
- User fügt Module hinzu → erscheinen in einer Liste "Meine Wahlmodule"
- In dieser Liste gibt es für jedes Modul:
  - Eingabefeld Note
  - Checkbox "Zählt zur Endnote"

**Validierungs-Feedback (Passiv):**
- Über/Unter der Notenanzeige ist ein Status-Bereich
- Ist die Auswahl invalide (z.B. nur BWL-Module angehakt), erscheint dort roter Text: *"Auswahl ungültig: Es muss mindestens ein Modul aus Gruppe II (VWL) in die Wertung eingehen."*
- Ist die Auswahl valide, erscheint grüner Text/Icon

**Ergebnis:**
- Gesamtnote wird immer berechnet (basierend auf der aktuellen Auswahl, auch wenn invalide – ggf. mit Hinweis "Vorläufig")

## 5. Offene Punkte / Risiken

- **Rundungsregeln:** Strikt nach §23(6) und §24(6) implementieren (`truncateDecimal(value, 1)`)
- **Verantwortung:** Der User trägt die Verantwortung für die korrekte Auswahl (Checkboxen). Das System ist nur ein Assistent, der Regelverstöße anzeigt

