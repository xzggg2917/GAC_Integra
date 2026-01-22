export interface Question {
  id: string;
  moduleId: string;
  question: string;
  type: 'input' | 'select' | 'checkbox' | 'multi-input';
  unit?: string;
  formula?: string;
  reference?: { name: string; url: string };
  options?: { value: string; score: number; label: string }[];
  scoringRules?: { min?: number; max?: number; score: number; description: string }[];
  multiInputFields?: Array<{
    name: string;
    label: string;
    unit: string;
    placeholder: string;
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

export const bluePracticalityModules: Module[] = [
  {
    id: 'laboratory-steward',
    name: 'Laboratory Steward',
    nameEn: 'Laboratory Practicality & Affordability',
    focus: 'Evaluating whether methods are practical and affordable in routine laboratories',
    questions: [
      {
        id: 'q1',
        moduleId: 'laboratory-steward',
        question: 'Q1: Instrument Accessibility - Assesses the entry barrier based on hardware asset requirements',
        type: 'select',
        options: [
          { 
            value: 'basic', 
            score: 100, 
            label: 'A (100 pts): Basic equipment (spectrophotometer, centrifuge, analytical balance)' 
          },
          { 
            value: 'standard', 
            score: 75, 
            label: 'B (75 pts): Standard large instruments (HPLC, GC with standard detectors)' 
          },
          { 
            value: 'advanced', 
            score: 50, 
            label: 'C (50 pts): High-precision/expensive equipment (UHPLC, LC-MS/MS)' 
          },
          { 
            value: 'specialized', 
            score: 25, 
            label: 'D (25 pts): Highly specialized or non-commercial custom equipment' 
          },
          { 
            value: 'national', 
            score: 0, 
            label: '0 pts: Requires special national-level laboratory platforms' 
          }
        ]
      },
      {
        id: 'q2',
        moduleId: 'laboratory-steward',
        question: 'Q2: Operational Expertise - Evaluates the method\'s dependence on operator skills',
        type: 'select',
        options: [
          { 
            value: 'automated', 
            score: 100, 
            label: 'A (100 pts): Fully automated/direct reading, no sample pretreatment, direct results' 
          },
          { 
            value: 'standardized', 
            score: 75, 
            label: 'B (75 pts): Standardized process, simple dilution/filtration, autosampler compatible' 
          },
          { 
            value: 'moderate', 
            score: 50, 
            label: 'C (50 pts): Moderate complexity with multi-step manual operations (pH adjustment, ultrasonication, manual injection)' 
          },
          { 
            value: 'complex', 
            score: 25, 
            label: 'D (25 pts): High-difficulty manual operations (liquid-liquid extraction, SPE), prone to operator errors' 
          },
          { 
            value: 'unstable', 
            score: 0, 
            label: '0 pts: Extremely unstable process, large variation between operators' 
          }
        ]
      },
      {
        id: 'q3',
        moduleId: 'laboratory-steward',
        question: 'Q3: Economic Burden Index (EBI) - Quantifies cost and labor time. Uses 2.5 power to heavily penalize manual labor time',
        type: 'multi-input',
        formula: 'Score = 100 / (1 + ((C_total + 2×t_man) / 15)^2.5)',
        multiInputFields: [
          {
            name: 'cost',
            label: 'C_total (Total reagent cost per analysis)',
            unit: 'USD',
            placeholder: 'Enter cost in USD',
            min: 0
          },
          {
            name: 'time',
            label: 't_man (Manual operation time per analysis)',
            unit: 'hours',
            placeholder: 'Enter time in hours',
            min: 0
          }
        ]
      },
      {
        id: 'q4',
        moduleId: 'laboratory-steward',
        question: 'Q4: Time-Output Efficiency (TOE) - Time cost vs throughput. Penalizes "single-component/time-consuming" methods, rewards high throughput',
        type: 'multi-input',
        formula: 'Score = 100 / (1 + 0.01 × (T_run / N_sub)^4.5)',
        multiInputFields: [
          {
            name: 'runtime',
            label: 'T_run (Total runtime per run)',
            unit: 'min',
            placeholder: 'Enter runtime in minutes',
            min: 0
          },
          {
            name: 'analytes',
            label: 'N_sub (Number of target analytes per run)',
            unit: 'count',
            placeholder: 'Number of analytes detected',
            min: 1
          }
        ]
      },
      {
        id: 'q5',
        moduleId: 'laboratory-steward',
        question: 'Q5: Resource Productivity Ratio (RPR) - Resource utilization (information density). Evaluates producing maximum quantitative information with minimal sample volume',
        type: 'multi-input',
        formula: 'Score = 100 × N²_sub / (N²_sub + ln(1 + V_sample))',
        multiInputFields: [
          {
            name: 'analytes',
            label: 'N_sub (Number of quantified target substances)',
            unit: 'count',
            placeholder: 'Number of quantified analytes',
            min: 1
          },
          {
            name: 'volume',
            label: 'V_sample (Initial sample volume required)',
            unit: 'mL',
            placeholder: 'Enter sample volume in mL',
            min: 0
          }
        ]
      }
    ]
  }
];
