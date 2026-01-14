export interface Question {
  id: string;
  moduleId: string;
  question: string;
  type: 'input' | 'select';
  unit?: string;
  formula?: string;
  options?: { value: string; score: number; label: string }[];
  scoringRules?: { min?: number; max?: number; score: number; description: string }[];
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
    id: 'mass-efficiency',
    name: 'Mass Efficiency',
    nameEn: 'Quality and Material Efficiency',
    focus: 'Atomic Economy, Input-Output Ratio',
    questions: [
      {
        id: 'q1',
        moduleId: 'mass-efficiency',
        question: 'Q1: Process Mass Intensity (PMI) - What is the ratio of total material input (reagents, solvents, auxiliaries) to product output (or sample) in a single effective analysis?',
        type: 'input',
        unit: 'kg/sample',
        formula: 'PMI = Σm_input(kg) / m_sample',
        scoringRules: [
          { max: 0.05, score: 10, description: 'Excellent, close to red, paper-level' },
          { min: 0.05, max: 0.2, score: 7.5, description: 'Good, slight analysis' },
          { min: 0.2, max: 1.0, score: 5, description: 'Fair, conventional HPLC' },
          { min: 1.0, max: 5.0, score: 2.5, description: 'Poor, large solvent consumption' },
          { min: 5.0, score: 0, description: 'Very poor, extremely wasteful' }
        ]
      },
      {
        id: 'q2',
        moduleId: 'mass-efficiency',
        question: 'Q2: Analysis E-Factor - How much waste (liquid + solid) is generated per analysis?',
        type: 'input',
        unit: 'g',
        formula: 'E = m_waste(g) / 1 sample',
        scoringRules: [
          { max: 10, score: 10, description: 'Excellent, direct injection, micronized' },
          { min: 10, max: 50, score: 7.5, description: 'Good' },
          { min: 50, max: 200, score: 5, description: 'Fair, conventional green solvent' },
          { min: 200, max: 1000, score: 2.5, description: 'Poor' },
          { min: 1000, score: 0, description: 'Very poor, large-scale consumption' }
        ]
      },
      {
        id: 'q3',
        moduleId: 'mass-efficiency',
        question: 'Q3: Auxiliary Efficiency - Are non-stoichiometric auxiliary reagents (e.g., methanol, n-hexane, diluent) used? What percentage of these non-core solvent consumptions is this?',
        type: 'input',
        unit: '%',
        formula: 'R_non-value = V_auxiliary/solvent / V_total × 100%',
        scoringRules: [
          { max: 10, score: 10, description: 'Excellent, immediate use' },
          { min: 10, max: 30, score: 7.5, description: 'Good' },
          { min: 30, max: 60, score: 5, description: 'Fair, e.g., HPLC balanced duration' },
          { min: 60, score: 0, description: 'Poor, excessive time spent on method selection, resulting in low efficiency' }
        ]
      }
    ]
  },
  {
    id: 'process-capability',
    name: 'Process Capability',
    nameEn: 'Process Capability and Quality Control',
    focus: 'Long-term operational stability, suitable for GMP QC methods',
    questions: [
      {
        id: 'q4',
        moduleId: 'process-capability',
        question: 'Q4: Process Capability Index (Cpk) - In long-term stable operation of the method, how many σ can the Cpk value reach? (Or the probability of falling within specification)',
        type: 'input',
        unit: '',
        formula: 'Cpk = min(USL-μ/3σ, μ-LSL/3σ)',
        scoringRules: [
          { min: 1.67, score: 10, description: 'Excellent, 6σ level' },
          { min: 1.33, max: 1.67, score: 7.5, description: 'Good, qualified, industrial standard' },
          { min: 1.0, max: 1.33, score: 5, description: 'Fair' },
          { max: 1.0, score: 0, description: 'Poor, out of specification, system requires major overhaul OOS adjustment' }
        ]
      },
      {
        id: 'q5',
        moduleId: 'process-capability',
        question: 'Q5: Right First Time (RFT) - In production, due to method reasons (human/sample reasons) leading to re-testing (Re-test Rate), how much is it?',
        type: 'input',
        unit: '%',
        formula: 'R_retest = N_retest/N_total × 100%',
        scoringRules: [
          { max: 1, score: 10, description: 'Excellent, minimal loss' },
          { min: 1, max: 5, score: 7.5, description: 'Good' },
          { min: 5, max: 10, score: 5, description: 'Fair' },
          { min: 10, score: 0, description: 'Poor, method unstable, frequent re-testing without cause' }
        ]
      },
      {
        id: 'q6',
        moduleId: 'process-capability',
        question: 'Q6: System Suitability Test (SST) Failure Rate - During formal batch testing, what is the SST failure rate (excluding component not detected, caused by column issues)?',
        type: 'select',
        options: [
          { value: 'low', score: 10, label: 'Low (<1% per year), highly stable' },
          { value: 'occasional', score: 7.5, label: 'Occasional (annual rate <2%), appropriate direct calibration dynamic range' },
          { value: 'monthly', score: 3, label: 'Monthly (monthly), requires investigation of replacement columns' },
          { value: 'unstable', score: 0, label: 'Unstable, frequent "shutdowns"' }
        ]
      }
    ]
  },
  {
    id: 'lean-operations',
    name: 'Lean Operations',
    nameEn: 'Lean Operations and Logistics',
    focus: 'Time-space cost, spatial cost, waste classification efficiency',
    questions: [
      {
        id: 'q7',
        moduleId: 'lean-operations',
        question: 'Q7: Solution Stability and Operation Window - How long is the stable time window for sample and reagent solution preparation to automatic injection completion?',
        type: 'input',
        unit: 'hours',
        scoringRules: [
          { min: 48, score: 10, description: 'Excellent, almost no human intervention' },
          { min: 24, max: 48, score: 7.5, description: 'Good, supports overnight operation' },
          { min: 8, max: 24, score: 5, description: 'Fair, same-day completion' },
          { max: 4, score: 0, description: 'Poor, immediate measurement, not suitable for large-batch sequencing' }
        ]
      },
      {
        id: 'q8',
        moduleId: 'lean-operations',
        question: 'Q8: Changeover Efficiency (SMED) - When switching between methods, from one method (e.g., machine start) to the average time of the next method ready for sample injection, how long?',
        type: 'input',
        unit: 'minutes',
        scoringRules: [
          { max: 10, score: 10, description: 'Excellent, instant start, e.g., UVIR' },
          { min: 10, max: 30, score: 7.5, description: 'Good' },
          { min: 30, max: 60, score: 5, description: 'Fair, conventional HPLC balance' },
          { min: 120, score: 0, description: 'Poor, long baseline or fixed detector re-extraction waiting time' }
        ]
      },
      {
        id: 'q9',
        moduleId: 'lean-operations',
        question: 'Q9: Space-Time Yield - Per unit laboratory space-time sample output?',
        type: 'select',
        options: [
          { value: 'high', score: 10, label: 'High (e.g., multi-channel microplate reader, small footprint)' },
          { value: 'medium', score: 7.5, label: 'Medium (UPLC, relatively fast run)' },
          { value: 'fair', score: 5, label: 'Fair (conventional HPLC)' },
          { value: 'low', score: 0, label: 'Low (e.g., large floor area, occupied large and time-consuming)' }
        ]
      },
      {
        id: 'q10',
        moduleId: 'lean-operations',
        question: 'Q10: Waste Segregation Contribution - Do the waste products of the method have clear classification value after analysis (e.g., chemical recycling or direct discharge)?',
        type: 'select',
        options: [
          { value: 'recyclable', score: 10, label: 'Single - recyclable, or directly discharged' },
          { value: 'pre-separation', score: 7.5, label: 'Conventional pre-/post-separation' },
          { value: 'mixed', score: 5, label: 'Simply mixed and sent to qualified disposal' },
          { value: 'hazardous', score: 0, label: 'All produced as hazardous waste (e.g., biohazard, special disposal required)' }
        ]
      }
    ]
  }
];
