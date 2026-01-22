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

export const whiteCompletenessModules: Module[] = [
  {
    id: 'method-validation',
    name: 'Method Validation Assessment',
    nameEn: 'Analytical Method Robustness & Compliance',
    focus: 'Evaluating method validation rigor, specificity, and operational robustness',
    questions: [
      {
        id: 'q1',
        moduleId: 'method-validation',
        question: 'Q1: Method Validation Rigor and Compliance - Evaluates whether the method has undergone systematic validation by authoritative bodies (e.g., ICH, FDA, GB standards)',
        type: 'select',
        options: [
          { 
            value: 'full-validation', 
            score: 100, 
            label: 'A (100 pts): Strictly follows national/international standards, completed full validation including accuracy, precision, specificity, linearity, range with complete compliance reports' 
          },
          { 
            value: 'core-validation', 
            score: 75, 
            label: 'B (75 pts): Completed core validation procedures with legally accepted data support, meets general laboratory quality system requirements' 
          },
          { 
            value: 'partial-validation', 
            score: 50, 
            label: 'C (50 pts): Insufficient validation, lacking key indicator verification (e.g., long-term stability testing), data may only support preliminary application' 
          },
          { 
            value: 'basic-test', 
            score: 25, 
            label: 'D (25 pts): Only performed simple basic testing, lacking systematic validation data' 
          },
          { 
            value: 'no-validation', 
            score: 0, 
            label: 'E (0 pts): Not validated at any level, results highly uncertain' 
          }
        ]
      },
      {
        id: 'q2',
        moduleId: 'method-validation',
        question: 'Q2: Analytical Specificity and Matrix Interference Resistance - Evaluates method\'s ability to accurately identify or quantify target analytes in complex backgrounds (e.g., excipients, impurities, degradation products)',
        type: 'select',
        options: [
          { 
            value: 'high-selectivity', 
            score: 100, 
            label: 'A (100 pts): Highly selective, unaffected by matrix interferences at substrate level or even below salt level, fully resistant to matrix effects' 
          },
          { 
            value: 'good-selectivity', 
            score: 75, 
            label: 'B (75 pts): Good selectivity, matrix interference relatively weak, can be eliminated through simple pretreatment or optimized conditions' 
          },
          { 
            value: 'moderate-interference', 
            score: 50, 
            label: 'C (50 pts): Matrix interference exists, requires additional matrix matching or correction procedures, but similar analogues may still interfere under certain conditions' 
          },
          { 
            value: 'poor-specificity', 
            score: 25, 
            label: 'D (25 pts): Poor specificity, highly susceptible to similar sample matrix or background impurity interference, results prone to false positives/negatives or systematic bias' 
          },
          { 
            value: 'no-specificity', 
            score: 0, 
            label: 'E (0 pts): No specificity, cannot distinguish or identify target analytes in complex matrices' 
          }
        ]
      },
      {
        id: 'q3',
        moduleId: 'method-validation',
        question: 'Q3: Operational Robustness and Method Transfer Reliability - Evaluates method\'s tolerance to minor experimental variations (e.g., pH, temperature, flow rate, operator changes)',
        type: 'select',
        options: [
          { 
            value: 'robust-doe', 
            score: 100, 
            label: 'A (100 pts): Systematic robustness evaluation (e.g., DoE experiments), proven stable under normal operational condition fluctuations with consistent results' 
          },
          { 
            value: 'core-parameters', 
            score: 75, 
            label: 'B (75 pts): Completed core parameter usage testing, method stable in standard experimental environment' 
          },
          { 
            value: 'sensitive-small', 
            score: 50, 
            label: 'C (50 pts): Sensitive to operational details, minor environmental or condition variations may cause result fluctuations, requiring system correction' 
          },
          { 
            value: 'weak-method', 
            score: 25, 
            label: 'D (25 pts): Weak method, only works under strictly controlled conditions, minor parameter drift causes significant personnel-dependent variance, lacking migration capability' 
          },
          { 
            value: 'unstable', 
            score: 0, 
            label: 'E (0 pts): Lacks stability, experimental results have inherent randomness, cannot be validated through repeat verification' 
          }
        ]
      },
      {
        id: 'q4',
        moduleId: 'method-validation',
        question: 'Q4: Precision-Accuracy Collaborative Index (PACI) - Comprehensively evaluates the balance between recovery rate (accuracy) and RSD (precision), assessing core data robustness',
        type: 'multi-input',
        formula: 'Score = 100 × exp(-0.5 × ((R-100)/3)²) × 1/(1+(RSD/2.5)²)',
        multiInputFields: [
          {
            name: 'recovery',
            label: 'R (Average Spike Recovery Rate)',
            unit: '%',
            placeholder: 'Enter recovery rate (80-120)',
            min: 0,
            max: 200
          },
          {
            name: 'rsd',
            label: 'RSD (Relative Standard Deviation)',
            unit: '%',
            placeholder: 'Enter RSD (0-20)',
            min: 0,
            max: 100
          }
        ]
      },
      {
        id: 'q5',
        moduleId: 'method-validation',
        question: 'Q5: Sensitivity-Linearity Fidelity Score (SLFS) - Evaluates method\'s linear fit quality and whether sensitivity exceeds regulatory threshold',
        type: 'multi-input',
        formula: 'Score = 100 × ((r²-0.99)/0.0099)⁴ × cos(π/2 × LOD/C_req)',
        multiInputFields: [
          {
            name: 'r2',
            label: 'r² (Linear Correlation Coefficient)',
            unit: '',
            placeholder: 'Enter r² value (0.990-1.000)',
            min: 0.99,
            max: 1.0
          },
          {
            name: 'lod',
            label: 'LOD (Actual Limit of Detection)',
            unit: 'concentration unit',
            placeholder: 'Enter LOD',
            min: 0
          },
          {
            name: 'creq',
            label: 'C_req (Regulatory Maximum LOD Threshold)',
            unit: 'concentration unit',
            placeholder: 'Enter regulatory threshold (e.g., 2.0)',
            min: 0
          }
        ]
      }
    ]
  }
];
