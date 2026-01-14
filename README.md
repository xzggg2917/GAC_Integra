# GAC Integra

Green Analytical Chemistry Integration Platform

## Project Overview

GAC Integra is a desktop application that integrates 9 key dimensions for comprehensive evaluation of analytical chemistry experiments' greenness.

## Evaluation Dimensions

1. **Green Ecology** (Environmental Guardian) - Focuses on environmental impact throughout the analytical process, from reagent selection to waste disposal. Core principles: low toxicity, low energy, minimal waste.

2. **Blue Practicality** (Laboratory Steward) - Evaluates practical usability and affordability in routine laboratories. Key aspects: cost-effectiveness, high throughput, equipment accessibility.

3. **Red Performance** (Data Quality Gatekeeper) - Assesses the quality of analytical results. Emphasizes accuracy, precision, and sensitivity as fundamental validation metrics.

4. **Violet Innovation** (Creative Designer) - Rewards novel insights and technological breakthroughs. Encourages breaking from traditional frameworks with innovative designs.

5. **Gray Industry** (Efficiency Engineer) - Evaluates efficiency from lab to industrial scale. Focuses on input-output ratio, process efficiency, and production scale control.

6. **Yellow Society** (Safety Guardian) - Prioritizes human safety, assessing risks of explosion, poisoning, or carcinogenic exposure. Emphasizes operator safety and occupational health.

7. **Cyan Data** (Digital Navigator) - Ensures data integrity, traceability, and regulatory compliance in the digital era. Adheres to ALCOA+ principles and FDA requirements.

8. **Orange Circular** (Resource Regenerator) - Evaluates material origin and destination. Focuses on renewable bio-based sources, biodegradability, and circular economy principles.

9. **White Completeness** (Gap Filler) - Fills evaluation gaps to ensure comprehensive assessment, covering aspects not addressed by other dimensions.

## Tech Stack

- Electron - Desktop application framework
- React - User interface
- TypeScript - Type safety
- Vite - Build tool

## Installation & Running

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

### Build Application

```bash
npm run build
npm run build:electron
```

## Project Structure

```
GAC_Integra/
├── electron/           # Electron main process
│   └── main.js
├── src/               # React application source
│   ├── components/    # Components
│   │   ├── DimensionGrid.tsx
│   │   ├── DimensionGrid.css
│   │   ├── InputPanel.tsx
│   │   └── InputPanel.css
│   ├── data/         # Data definitions
│   │   └── algorithms.ts
│   ├── App.tsx       # Main app component
│   ├── App.css
│   ├── main.tsx      # Entry point
│   └── index.css
├── index.html        # HTML template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features

- ✨ 9-grid dimension display
- 🎯 Dimension selection interface
- ⚖️ Custom weight configuration
- 📊 Real-time weight calculation
- 🎨 Modern dark theme UI
- 🖱️ Interactive card hover effects

## Future Plans

- Implement specific calculation functions for each dimension
- Add comprehensive scoring system
- Create experiment data input interface
- Generate evaluation reports
- Data visualization dashboard

## License

MIT
