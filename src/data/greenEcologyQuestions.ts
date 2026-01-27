export interface Question {
  id: string
  question: string
  type: 'select' | 'multi-input' | 'multi-reagent'
  options?: Array<{ value: string; label: string; score: number }>
  multiInputFields?: Array<{
    name: string
    label: string
    unit: string
    placeholder: string
    min?: number
    max?: number
    step?: number
  }>
}

export interface QuestionModule {
  title: string
  questions: Question[]
}

export const greenEcologyModules: QuestionModule[] = [
  {
    title: 'Part 1: Qualitative Assessment (Design & Prevention)',
    questions: [
      {
        id: 'q1',
        question: 'Q1: Analytical Process Integration & Prevention Design (Prevention & Integration)',
        type: 'select',
        options: [
          { value: 'A', label: 'A (100 pts): Online/In-situ Non-destructive Analysis - No sampling or chemical reagents required, real-time data via probe, zero waste emission', score: 100 },
          { value: 'B', label: 'B (75 pts): Integrated/Miniaturized Instrumental Analysis - Microfluidics or automated ultra-efficient techniques, minimal reagent consumption per analysis', score: 75 },
          { value: 'C', label: 'C (50 pts): Optimized Conventional Instrumental Analysis - Fast chromatography (analysis time <5min), no derivatization steps required', score: 50 },
          { value: 'D', label: 'D (25 pts): Traditional Off-line Instrumental Analysis - Manual sampling, filtration, longer analysis runtime (>15min)', score: 25 },
          { value: 'E', label: '0 pts: Tedious manual liquid-liquid extraction or outdated processes generating significant solid waste', score: 0 }
        ]
      },
      {
        id: 'q2',
        question: 'Q2: Intrinsic Environmental Compatibility of Reagents & Materials (Safer Solvents & Degradability)',
        type: 'select',
        options: [
          { value: 'A', label: 'A (100 pts): Natural/Bio-based Green Solvents - Pure water, fermentation ethanol, supercritical fluids, completely non-toxic and rapidly biodegradable', score: 100 },
          { value: 'B', label: 'B (75 pts): Low-Risk Synthetic Solvents - Isopropanol, ethyl acetate, halogen-free, minimal hazard codes (1-2 H-codes)', score: 75 },
          { value: 'C', label: 'C (50 pts): Conventional Manageable Solvents - Methanol, acetonitrile, some toxicity or flammability, but environmental risks within manageable range', score: 50 },
          { value: 'D', label: 'D (25 pts): High-Risk/Regulated Solvents - n-Hexane, toluene, or reagents containing single halogen atoms', score: 25 },
          { value: 'E', label: '0 pts: Highly toxic, carcinogenic, persistent, or multi-halogenated reagents (e.g., chloroform, carbon tetrachloride)', score: 0 }
        ]
      }
    ]
  },
  {
    title: 'Part 2: Quantitative Assessment (Mathematical Quantification)',
    questions: [
      {
        id: 'q3',
        question: 'Q3: Essential Hazard Index (EHI)',
        type: 'multi-reagent',
        multiInputFields: []
      },
      {
        id: 'q4',
        question: 'Q4: Atmospheric Safety Index (ASI)',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'tbp',
            label: 'Tbp (Boiling Point)',
            unit: '°C',
            placeholder: 'Boiling point of main organic solvent',
            min: -200,
            max: 400
          },
          {
            name: 'nhalogen',
            label: 'Nhalogen (Halogen Atoms)',
            unit: 'count',
            placeholder: 'Number of halogen atoms (F, Cl, Br) in molecule',
            min: 0,
            max: 20
          },
          {
            name: 'nh',
            label: 'NH (H-code Count)',
            unit: 'count',
            placeholder: 'Number of H-codes (hazard statements)',
            min: 0,
            max: 20
          }
        ]
      },
      {
        id: 'q5',
        question: 'Q5: Operational Energy Load (OEL)',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'power',
            label: 'P (Equipment Power)',
            unit: 'W',
            placeholder: 'Total rated power of all relevant equipment',
            min: 0,
            max: 100000
          },
          {
            name: 'time',
            label: 't (Analysis Time)',
            unit: 'min',
            placeholder: 'Total duration of complete analysis process',
            min: 0,
            max: 10000
          },
          {
            name: 'throughput',
            label: 'n (Sample Throughput)',
            unit: 'samples',
            placeholder: 'Number of samples analyzed simultaneously per run',
            min: 1,
            max: 1000
          }
        ]
      },
      {
        id: 'q6',
        question: 'Q6: Waste Burden Intensity (WBI)',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'vwaste',
            label: 'Vwaste (Waste Volume)',
            unit: 'mL',
            placeholder: 'Total volume of liquid/solid waste generated',
            min: 0,
            max: 100000
          },
          {
            name: 'eta',
            label: 'η (Recovery Rate)',
            unit: '',
            placeholder: 'Waste recycling/reuse rate (0~1)',
            min: 0,
            max: 1,
            step: 0.01
          }
        ]
      }
    ]
  }
]
