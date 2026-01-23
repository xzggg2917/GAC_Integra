export interface Question {
  id: string;
  moduleId: string;
  question: string;
  type: 'input' | 'select' | 'multi-input';
  unit?: string;
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

export const grayIndustryModules: Module[] = [
  {
    id: 'qualitative-assessment',
    name: 'Qualitative Assessment',
    nameEn: 'Process & Minimization Focus',
    focus: 'Evaluating waste control, circularity, and process integration',
    questions: [
      {
        id: 'q1',
        moduleId: 'qualitative-assessment',
        question: 'Q1: Waste & Circularity Level - Evaluates waste liquids and consumables generated during industrial scale-up, focusing on minimization and recycling potential',
        type: 'select',
        options: [
          { 
            value: 'A', 
            score: 100, 
            label: 'A (100 pts): Process produces nearly zero emissions; waste can be directly converted to by-products or reused within the process' 
          },
          { 
            value: 'B', 
            score: 75, 
            label: 'B (75 pts): Waste volume is extremely low, suitable for laboratory-scale models, and has established mature green disposal pathways' 
          },
          { 
            value: 'C', 
            score: 50, 
            label: 'C (50 pts): Waste adheres to industrial standards, but treatment cost is higher, limiting recovery value' 
          },
          { 
            value: 'D', 
            score: 25, 
            label: 'D (25 pts): Production scale is likely to generate secondary pollutants requiring specialized treatment equipment' 
          },
          { 
            value: 'E', 
            score: 0, 
            label: 'E (0 pts): Production heavily generates environmentally hazardous non-compliant waste, unqualified for industrial compatibility' 
          }
        ]
      },
      {
        id: 'q2',
        moduleId: 'qualitative-assessment',
        question: 'Q2: Process Integration & Minimization - Evaluates the process capability to "generate maximum product with minimum raw materials", examining if flow is streamlined',
        type: 'select',
        options: [
          { 
            value: 'A', 
            score: 100, 
            label: 'A (100 pts): "One-stop" or "one-pot" process, no need for intermediate purification, raw material conversion approaches theoretical limit' 
          },
          { 
            value: 'B', 
            score: 75, 
            label: 'B (75 pts): Highly streamlined process, eliminated unnecessary isolation steps, raw material loss is very low' 
          },
          { 
            value: 'C', 
            score: 50, 
            label: 'C (50 pts): Standard industrial process, exists within normal range of raw material loss or a few redundant steps' 
          },
          { 
            value: 'D', 
            score: 25, 
            label: 'D (25 pts): Complex process with moderate transfer costs and low process yield' 
          },
          { 
            value: 'E', 
            score: 0, 
            label: 'E (0 pts): Extremely low process raw material utilization rate (<30% yield), completely unsuitable for industrial efficiency' 
          }
        ]
      }
    ]
  },
  {
    id: 'quantitative-assessment',
    name: 'Quantitative Assessment',
    nameEn: 'Efficiency & Quality Constraints',
    focus: 'Performance metrics evaluating resource efficiency, stability, and sensitivity',
    questions: [
      {
        id: 'q3',
        moduleId: 'quantitative-assessment',
        question: 'Q3: Resource-Accuracy Efficiency Index - Evaluates the capability to achieve compliant accuracy output with minimum raw material input',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'Y',
            label: 'Y (Input-Output Ratio)',
            unit: 'ratio',
            placeholder: 'Enter the mass ratio of all raw materials to valid target analyte output (0-1)',
            min: 0,
            max: 1
          },
          {
            name: 'A',
            label: 'A (Accuracy Deviation)',
            unit: 'value',
            placeholder: 'Enter |1 - Recovery Rate|. When deviation exceeds 15%, exponential penalty applies',
            min: 0,
            max: 1
          }
        ],
        scoringRules: [
          { score: 100, description: 'Perfect: Zero waste with 100% recovery rate (theoretical maximum)' },
          { score: 60, description: 'Good: Low input-output ratio with high accuracy' },
          { score: 30, description: 'Fair: Moderate efficiency with acceptable accuracy' },
          { score: 0, description: 'Poor: High waste generation or poor accuracy' }
        ]
      },
      {
        id: 'q4',
        moduleId: 'quantitative-assessment',
        question: 'Q4: Scale-In Technical Stability Index (SITSI) - Evaluates the method\'s ability to maintain data precision (batch stability) while pursuing industrial output scale (throughput)',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'P',
            label: 'P (Process Throughput)',
            unit: 'samples/hour',
            placeholder: 'Enter the minimum number of samples processed per hour under industrial environment',
            min: 0
          },
          {
            name: 'R',
            label: 'R (Industrial Precision Fluctuation)',
            unit: 'decimal',
            placeholder: 'Enter the inter-batch RSD as decimal (e.g., 0.012 for 1.2%)',
            min: 0,
            max: 1
          }
        ],
        scoringRules: [
          { score: 100, description: 'Excellent: High throughput with minimal precision fluctuation' },
          { score: 60, description: 'Good: Balanced throughput and stability' },
          { score: 30, description: 'Fair: Either low throughput or unstable precision' },
          { score: 0, description: 'Poor: Low throughput with high variability' }
        ]
      },
      {
        id: 'q5',
        moduleId: 'quantitative-assessment',
        question: 'Q5: Minimization-Sensitivity Gain - Evaluates the degree to which sensitivity is retained while reducing raw material and solvent consumption (minimization)',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'wasteRatio',
            label: 'M_waste / M_total (Waste Ratio)',
            unit: 'ratio',
            placeholder: 'Enter the mass ratio of waste materials to total input materials in production',
            min: 0,
            max: 1
          },
          {
            name: 'S',
            label: 'S (Sensitivity Compliance Ratio)',
            unit: 'ratio',
            placeholder: 'Enter the ratio of actual detection limit to laboratory standard limit. Closer to 1 scores higher; minimized process with wider margin scores lower',
            min: 0
          }
        ],
        scoringRules: [
          { score: 100, description: 'Excellent: Minimal waste with maintained or enhanced sensitivity' },
          { score: 60, description: 'Good: Reduced waste with acceptable sensitivity trade-off' },
          { score: 30, description: 'Fair: Moderate waste reduction with sensitivity compromise' },
          { score: 0, description: 'Poor: Significant waste or major sensitivity loss' }
        ]
      }
    ]
  }
];
