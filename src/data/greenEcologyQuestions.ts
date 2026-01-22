export interface Question {
  id: string;
  moduleId: string;
  question: string;
  type: 'input' | 'select' | 'checkbox' | 'multi-input' | 'multi-reagent';
  unit?: string;
  formula?: string;
  reference?: { name: string; url: string };
  options?: { value: string; score: number; label: string }[];
  scoringRules?: { min?: number; max?: number; score: number; description: string }[];
  multiInputFields?: Array<{ 
    name: string; 
    label: string; 
    placeholder: string; 
    unit: string; 
    type: 'number'; 
    min?: number; 
    max?: number;
  }>;
}

export interface Module {
  id: string;
  name: string;
  nameEn: string;
  focus: string;
  questions: Question[];
}

export const greenEcologyModules: Module[] = [
  {
    id: 'hazard-assessment',
    name: 'Hazard Assessment',
    nameEn: 'Chemical Hazard Evaluation',
    focus: 'Based on GHS hazard codes, evaluating reagent inherent risks',
    questions: [
      {
        id: 'q1',
        moduleId: 'hazard-assessment',
        question: 'Q1: Analytical Process Integration & Prevention Design (Prevention & Integration)',
        type: 'select',
        options: [
          { 
            value: 'A', 
            score: 100, 
            label: 'A (100 pts): Online/In-situ Non-destructive Analysis - No sampling or chemical reagents required, real-time data acquisition via probe, achieving zero waste emissions' 
          },
          { 
            value: 'B', 
            score: 75, 
            label: 'B (75 pts): Integrated/Miniaturized Instrument Analysis - Using microfluidic or automated ultra-high efficiency technology, extremely low reagent consumption per analysis' 
          },
          { 
            value: 'C', 
            score: 50, 
            label: 'C (50 pts): Optimized Conventional Instrument Analysis - Using fast chromatography (analysis time <5min), without any derivatization steps' 
          },
          { 
            value: 'D', 
            score: 25, 
            label: 'D (25 pts): Traditional Offline Instrument Analysis - Involving manual sampling, filtration, longer analysis run time (>15min)' 
          },
          { 
            value: 'E', 
            score: 0, 
            label: 'E (0 pts): Tedious manual liquid-liquid extraction or obsolete procedures generating significant solid waste' 
          }
        ],
        scoringRules: [
          { score: 100, description: '100 pts: Online/in-situ analysis with zero waste and real-time monitoring' },
          { score: 75, description: '75 pts: Miniaturized/integrated systems with minimal reagent use' },
          { score: 50, description: '50 pts: Fast chromatography without derivatization' },
          { score: 25, description: '25 pts: Traditional offline analysis with manual steps' },
          { score: 0, description: '0 pts: Obsolete procedures with significant waste generation' }
        ]
      },
      {
        id: 'q2',
        moduleId: 'hazard-assessment',
        question: 'Q2: Intrinsic Environmental Compatibility of Reagents & Materials (Safer Solvents & Degradability)',
        type: 'select',
        options: [
          { 
            value: 'A', 
            score: 100, 
            label: 'A (100 pts): Natural/Bio-based Green Solvents - Such as pure water, fermentation ethanol, supercritical fluids, completely non-toxic and rapidly biodegradable' 
          },
          { 
            value: 'B', 
            score: 75, 
            label: 'B (75 pts): Low-Risk Synthetic Solvents - Such as isopropanol, ethyl acetate. Halogen-free, with minimal hazard codes (H-codes) (1-2 codes)' 
          },
          { 
            value: 'C', 
            score: 50, 
            label: 'C (50 pts): Conventional Controllable Solvents - Such as methanol, acetonitrile. Have certain toxicity or flammability, but environmental risks are within controllable range' 
          },
          { 
            value: 'D', 
            score: 25, 
            label: 'D (25 pts): High-Risk/Regulated Solvents - Such as n-hexane, toluene, or reagents containing single halogen atoms' 
          },
          { 
            value: 'E', 
            score: 0, 
            label: 'E (0 pts): Using highly toxic, carcinogenic, persistent, or multi-halogenated reagents (such as chloroform, carbon tetrachloride)' 
          }
        ],
        scoringRules: [
          { score: 100, description: '100 pts: Natural/bio-based solvents, completely non-toxic and rapidly biodegradable' },
          { score: 75, description: '75 pts: Low-risk synthetic solvents, halogen-free with minimal hazard codes (1-2)' },
          { score: 50, description: '50 pts: Conventional solvents with controllable environmental risks' },
          { score: 25, description: '25 pts: High-risk or regulated solvents with single halogen atoms' },
          { score: 0, description: '0 pts: Highly toxic, carcinogenic, persistent, or multi-halogenated reagents' }
        ]
      },
      {
        id: 'q3',
        moduleId: 'hazard-assessment',
        question: 'Q3: Essential Hazard Index (EHI)',
        type: 'multi-reagent',
        reference: {
          name: 'Check H-Codes via PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov'
        },
        scoringRules: [
          { score: 100, description: 'Water only (Nₕ=0): Score = 100' },
          { score: 60, description: 'Low hazard reagent (Nₕ=2, m=0.1kg): Score ≈ 60' },
          { score: 20, description: 'High hazard reagent (Nₕ=5, m=0.2kg): Score ≈ 20' },
          { score: 0, description: 'Formula: Score = 100 × exp(-1.5 × √(Σ(mᵢ · N²ₕ,ᵢ)))' }
        ]
      },
      {
        id: 'q4',
        moduleId: 'hazard-assessment',
        question: 'Q4: Atmospheric Safety Index (ASI)',
        type: 'multi-input',
        reference: {
          name: 'Check Properties via PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov'
        },
        multiInputFields: [
          { 
            name: 'tbp', 
            label: 'Tᵦₚ (Boiling Point)', 
            placeholder: 'Main organic solvent boiling point', 
            unit: '°C', 
            type: 'number'
          },
          { 
            name: 'nhalogen', 
            label: 'Nₕₐₗₒ (Halogen Count)', 
            placeholder: 'Number of F, Cl, Br atoms', 
            unit: 'count', 
            type: 'number', 
            min: 0 
          },
          { 
            name: 'nh', 
            label: 'Nₕ (H-codes Count)', 
            placeholder: 'Number of H-codes', 
            unit: 'count', 
            type: 'number', 
            min: 0 
          }
        ],
        scoringRules: [
          { score: 100, description: 'Water (Tᵦₚ=100°C, no halogen, Nₕ=0): Score ≈ 100' },
          { score: 75, description: 'Ethanol (Tᵦₚ=78°C, no halogen, Nₕ=1): Score ≈ 75' },
          { score: 20, description: 'Chloroform (Tᵦₚ=61°C, 3 Cl, Nₕ=5): Score ≈ 20' },
          { score: 0, description: 'Formula: Score = 100 × (1/(1+e^(-0.05·(Tᵦₚ-50)))) · exp(-(2·Nₕₐₗₒ + 0.5·Nₕ)/5)' }
        ]
      },
      {
        id: 'q5',
        moduleId: 'hazard-assessment',
        question: 'Q5: Operational Energy Load (OEL)',
        type: 'multi-input',
        multiInputFields: [
          { 
            name: 'power', 
            label: 'Pⱼ (Total Power)', 
            placeholder: 'Sum of all equipment rated power', 
            unit: 'W', 
            type: 'number', 
            min: 0 
          },
          { 
            name: 'time', 
            label: 'tⱼ (Total Time)', 
            placeholder: 'Complete analysis process duration', 
            unit: 'min', 
            type: 'number', 
            min: 0 
          },
          { 
            name: 'throughput', 
            label: 'n (Sample Throughput)', 
            placeholder: 'Number of analytes in samples per run', 
            unit: 'samples', 
            type: 'number', 
            min: 1 
          }
        ],
        scoringRules: [
          { score: 100, description: 'Low power/high throughput: Score ≈ 100' },
          { score: 60, description: 'Moderate equipment (1000W, 30min, n=10): Score ≈ 60' },
          { score: 20, description: 'High energy/single sample: Score ≈ 20' },
          { score: 0, description: 'Formula: Score = 100 × exp(-Σ(Pⱼ·tⱼ)/(10000·n))' }
        ]
      },
      {
        id: 'q6',
        moduleId: 'atom-economy',
        question: 'Q6: Waste Burden Intensity (WBI)',
        type: 'multi-input',
        reference: {
          name: 'Waste Management Guidelines',
          url: 'https://www.epa.gov/hwgenerators'
        },
        multiInputFields: [
          { 
            name: 'vwaste', 
            label: 'Vwaste (Total Waste)', 
            placeholder: 'Total liquid/solid waste generated', 
            unit: 'mL', 
            type: 'number', 
            min: 0 
          },
          { 
            name: 'eta', 
            label: 'η (Recycling Rate)', 
            placeholder: 'Waste recycling/reuse rate', 
            unit: '0-1', 
            type: 'number', 
            min: 0, 
            max: 1 
          }
        ],
        scoringRules: [
          { score: 100, description: 'Minimal waste (<10 mL) with high recycling: Score ≈ 100' },
          { score: 60, description: 'Moderate waste (50 mL, η=0.5): Score ≈ 60' },
          { score: 10, description: 'Large waste (>200 mL) without recycling: Score ≈ 10' },
          { score: 0, description: 'Formula: Score = 100 × [1/(1+0.05·(Vwaste·(1-η))^1.2)] · exp(-Vwaste/200)' }
        ]
      }
    ]
  }
];
