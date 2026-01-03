# 🎓 Notenrechner BSc WiWi – FernUniversität Hagen

Ein moderner, benutzerfreundlicher Notenrechner für Studierende des Bachelor-Studiengangs Wirtschaftswissenschaften (B.Sc.) an der FernUniversität in Hagen.

## 📋 Über das Projekt

Dieser Notenrechner hilft Studierenden, ihre voraussichtliche Abschlussnote zu berechnen und ihren Studienverlauf zu planen. Die Anwendung unterstützt beide aktuellen Prüfungsordnungen:

- **PO 2023** (alte Prüfungsordnung)
- **PO 2025** (neue Prüfungsordnung)

Die Berechnung erfolgt vollständig **client-seitig** – alle eingegebenen Daten bleiben im Browser und werden nicht an einen Server übertragen.

## ✨ Features

- ✅ **Unterstützung beider Prüfungsordnungen** (PO 2023 und PO 2025)
- ✅ **Einfache Noteneingabe** mit automatischer Konvertierung von Punkten zu Noten
- ✅ **Intelligente Prognosen**: Aktueller Stand, Best Case und Worst Case
- ✅ **Lokale Speicherung**: Eingaben werden automatisch im Browser gespeichert
- ✅ **Responsive Design**: Funktioniert auf Desktop und mobilen Geräten
- ✅ **Datenschutzfreundlich**: Keine Server-Kommunikation, alle Daten bleiben lokal
- ✅ **Visuelle Feedback**: Farbcodierte Anzeigen für bestandene/nicht bestandene Module
- ✅ **Flexible Modulauswahl**: Wahlpflichtmodule aus den Gruppen BWL, VWL/Quanti und Recht

## 🛠️ Technologie-Stack

- **Frontend**: React 18+ mit TypeScript
- **Build-Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Persistierung**: LocalStorage (Browser)

## 🚀 Installation & Entwicklung

### Voraussetzungen

- Node.js (Version 18 oder höher)
- npm oder yarn

### Setup

1. Repository klonen:
```bash
git clone https://github.com/uberwach/wiwi-bsc-notenrechner.git
cd wiwi-bsc-notenrechner
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Entwicklungsserver starten:
```bash
npm run dev
```

Die Anwendung ist dann unter `http://localhost:5173` erreichbar.

### Verfügbare Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `npm run dev` | Startet den Entwicklungsserver mit Hot-Reload |
| `npm run build` | Erstellt einen Production Build (TypeScript-Kompilierung + Vite Build) |
| `npm run preview` | Zeigt den Production Build lokal an |

## 💡 Verwendung

### Grundlegende Bedienung

1. **Prüfungsordnung wählen**: Wähle zwischen PO 2023 (Alt) und PO 2025 (Neu)
2. **Pflichtmodule eingeben**: Trage deine erreichten Punkte (0-100) für die 10 Pflichtmodule ein
3. **Wahlpflichtmodule auswählen**: Wähle deine Wahlpflichtmodule und gib die erreichten Punkte ein
4. **Seminar & Bachelorarbeit**: Trage die Punkte für dein Seminar und deine Bachelorarbeit ein
5. **Ergebnis ablesen**: Die voraussichtliche Abschlussnote wird automatisch berechnet

### Prognosen

Die Anwendung zeigt drei verschiedene Prognosen:

- **Aktuell**: Basiert auf deinen eingegebenen Noten
- **Best Case**: Nimmt an, dass alle fehlenden Module mit 1,0 (100 Punkte) bestanden werden
- **Worst Case**: Nimmt an, dass alle fehlenden Module mit 4,0 (50 Punkte) bestanden werden

### Datenspeicherung

Alle Eingaben werden automatisch im LocalStorage deines Browsers gespeichert und bleiben auch nach einem Neuladen der Seite erhalten. Mit dem "Zurücksetzen"-Button können alle Eingaben gelöscht werden.

## 📁 Projektstruktur

```
wiwi-bsc-notenrechner/
├── src/
│   ├── App.tsx           # Hauptkomponente mit gesamter Anwendungslogik
│   ├── main.tsx          # React Entry Point
│   └── index.css         # Globale Styles (Tailwind)
├── index.html            # HTML Template
├── package.json          # Projekt-Dependencies
├── tsconfig.json         # TypeScript-Konfiguration
├── tailwind.config.js    # Tailwind CSS Konfiguration
├── vite.config.ts        # Vite Build-Konfiguration
└── Systemdesign & Funktionale Spezifikation.md
```

## 📊 Berechnungslogik

### PO 2023

- **Pflichtbereich**: 20% Gewichtung
  - Durchschnitt der Prozentpunkte aller 10 Pflichtmodule → Note
- **Wahl- und Abschlussbereich**: 80% Gewichtung
  - 6 Wahlpflichtmodule (mind. 1 aus BWL, mind. 1 aus VWL, max. 1 aus Recht)
  - 1 Seminar
  - 1 Bachelorarbeit

### PO 2025

- **Pflichtbereich**: 25% Gewichtung
  - Durchschnitt der Prozentpunkte aller 10 Pflichtmodule → Note
- **Wahl- und Abschlussbereich**: 75% Gewichtung
  - 4-6 Wahlpflichtmodule mit flexibler Substitution
  - Optional: Überfachliche Kompetenzen (ÜK)
  - 1-2 Seminare
  - 1 Bachelorarbeit (zählt doppelt!)

## ⚠️ Haftungsausschluss

Diese Anwendung dient ausschließlich zur ungefähren Orientierung und Planung. Es gelten ausschließlich die offiziellen Prüfungsordnungen der FernUniversität in Hagen. Die Berechnungen erfolgen nach bestem Wissen und Gewissen, jedoch **ohne Gewähr**.

Für verbindliche Auskünfte wende dich bitte an das Prüfungsamt der FernUniversität.

## 📝 Lizenz

Dieses Projekt ist Open Source. Bitte beachte die geltenden Lizenzbedingungen.

## 🤝 Beitragen

Verbesserungsvorschläge und Pull Requests sind willkommen! Bei größeren Änderungen bitte zuerst ein Issue öffnen, um die Änderung zu besprechen.

## 📧 Kontakt

Bei Fragen oder Anregungen öffne gerne ein Issue im Repository.

---

Made with ❤️ for FernUni Hagen students
