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

export const yellowSocietyModules: Module[] = [
  {
    id: 'qualitative-assessment',
    name: 'Qualitative Assessment',
    nameEn: 'Risk Identification & Safety Boundaries',
    focus: 'Evaluating hazard identification accuracy and safety boundary validation',
    questions: [
      {
        id: 'q1',
        moduleId: 'qualitative-assessment',
        question: 'Q1: Hazard Source Identification & Risk Communication Accuracy - Evaluates whether the method accurately identifies and communicates all toxic, explosive, and flammable risks, corresponding to GHS hazard labeling and prevention system',
        type: 'select',
        options: [
          { 
            value: 'A', 
            score: 100, 
            label: 'A (100 pts): Risk prediction is fully compliant with all reactants and by-products, with precise quantitative risk assessments for release hazards, pressure fluctuations, and other physical risks' 
          },
          { 
            value: 'B', 
            score: 75, 
            label: 'B (75 pts): Predicted and covered all major toxic risks (e.g., skin irritation, carcinogenic potential); informed internal operators or guidelines explicitly' 
          },
          { 
            value: 'C', 
            score: 50, 
            label: 'C (50 pts): Only conducted basic safety precautions; limited reverse validation of team or product-specific processes (e.g., non-pressure-tested flasks); occupational risk identification incomplete' 
          },
          { 
            value: 'D', 
            score: 25, 
            label: 'D (25 pts): Informed users about traditional precautions (e.g., attention to "flammable, antistatic"), but did not specifically mention chemical or physical hazards of the method' 
          },
          { 
            value: 'E', 
            score: 0, 
            label: 'E (0 pts): Risk warnings do not exist in the process or are extremely high, not covered by legal methods and may involve high toxicity or serious combustion hazards' 
          }
        ]
      },
      {
        id: 'q2',
        moduleId: 'qualitative-assessment',
        question: 'Q2: Safety Boundary Stress Testing - Evaluates whether the experimental method undergoes systematic QbD (Quality by Design) or robustness validation at safe boundaries (e.g., highest temperature, maximum pressure, longest exposure time), to confirm method resilience under stress',
        type: 'select',
        options: [
          { 
            value: 'A', 
            score: 100, 
            label: 'A (100 pts): Method underwent boundary pressure validation (e.g., CCD design), proving no equipment failure or explosion (e.g., cooling interruption, outage) under operating boundary conditions; safe design margin established' 
          },
          { 
            value: 'B', 
            score: 75, 
            label: 'B (75 pts): Established chemical dynamic push or robustness testing based on protocols; safety boundary was clearly defined' 
          },
          { 
            value: 'C', 
            score: 50, 
            label: 'C (50 pts): Only basic prequalification screening with statistical frequency design (e.g., t-test); limited validation of extreme working conditions or supplier batch consistency testing' 
          },
          { 
            value: 'D', 
            score: 25, 
            label: 'D (25 pts): Safety validation only applicable to general experimental environment rules; did not specifically validate extreme boundaries under this method' 
          },
          { 
            value: 'E', 
            score: 0, 
            label: 'E (0 pts): Lacked specialized safety specification validation; completely relied on operator random response' 
          }
        ]
      }
    ]
  },
  {
    id: 'quantitative-assessment',
    name: 'Quantitative Assessment',
    nameEn: 'Toxicity, Stability & Thermal Hazard Metrics',
    focus: 'Quantifying occupational exposure risk, physical protection stability, and thermal runaway prevention',
    questions: [
      {
        id: 'q3',
        moduleId: 'quantitative-assessment',
        question: 'Q3: Occupational Exposure Risk Sensitivity Index (S_tox) - Evaluates the method\'s sensitivity to high-hazard substance contact',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'H',
            label: 'H (Hazard Weight)',
            unit: 'score',
            placeholder: 'Select hazard level: 1=Low toxicity (water, ethanol); 2=Mild hazard (dilute acid/alkali); 3=Moderate toxicity (ethyl acetate, methyl alcohol); 4=High hazard (concentrated acids, 10% H₂O₂); 5=Highly toxic (cyanide, benzene, peroxide reflux)',
            min: 1,
            max: 5
          },
          {
            name: 't',
            label: 't (Manual Operation Cumulative Time)',
            unit: 'min',
            placeholder: 'Enter cumulative time operator is in proximity to hazardous materials processing (minutes)',
            min: 0
          }
        ],
        scoringRules: [
          { score: 100, description: 'Excellent: Minimal exposure to low-hazard substances' },
          { score: 60, description: 'Good: Limited exposure time with moderate hazards' },
          { score: 30, description: 'Fair: Extended exposure or higher hazard levels' },
          { score: 0, description: 'Poor: Prolonged exposure to highly toxic substances' }
        ]
      },
      {
        id: 'q4',
        moduleId: 'quantitative-assessment',
        question: 'Q4: Physical Protection Layer Stable Precision Index (S_stab) - Evaluates the reliability of protective system during long-term operation',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'N',
            label: 'N (Independent Protection Layers)',
            unit: 'layers',
            placeholder: 'Select protection level: 1=Basic (lab coat, gloves, goggles); 2=Personal PPE + ventilation (fume hood); 3=Personal PPE + ventilation + automation (HPLC/UHPLC autosampler); 4=PPE + ventilation + automation + intrinsic safety design (low-toxicity reagent substitution, closed system); 5=Fully enclosed isolation system (glove box, remote robot operation)',
            min: 1,
            max: 5
          },
          {
            name: 'F',
            label: 'F (Weekly Experiment Frequency)',
            unit: 'times/week',
            placeholder: 'Enter the recommended or expected frequency of repetitions per week for this method',
            min: 0
          }
        ],
        scoringRules: [
          { score: 100, description: 'Excellent: Multiple protection layers with low-frequency operations' },
          { score: 60, description: 'Good: Adequate protection with moderate frequency' },
          { score: 30, description: 'Fair: Limited protection or high-frequency operations' },
          { score: 0, description: 'Poor: Insufficient protection with frequent operations' }
        ]
      },
      {
        id: 'q5',
        moduleId: 'quantitative-assessment',
        question: 'Q5: Thermal Runaway Risk Defense Accuracy Score (S_therm) - Evaluates the safety of temperature control operations',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'T_op',
            label: 'T_op (Operating Temperature)',
            unit: '°C',
            placeholder: 'Enter the maximum reaction or operating temperature set for the method (°C)',
            min: 0
          },
          {
            name: 'deltaT',
            label: 'ΔT (Temperature Margin)',
            unit: '°C',
            placeholder: 'Enter the difference between solvent boiling point and operating temperature (°C). When ΔT ≤ 35, this score becomes 0',
            min: 0
          }
        ],
        scoringRules: [
          { score: 100, description: 'Excellent: Large temperature margin (ΔT > 35°C) with safe operating temperature' },
          { score: 60, description: 'Good: Adequate temperature buffer zone' },
          { score: 30, description: 'Fair: Limited temperature margin or elevated operating temperature' },
          { score: 0, description: 'Poor: Critical temperature margin (ΔT ≤ 35°C) indicating high thermal runaway risk' }
        ]
      }
    ]
  }
];
