export interface Question {
  id: string
  moduleId: string
  question: string
  type: 'input' | 'select' | 'multi-input'
  unit?: string
  multiInputFields?: {
    name: string
    label: string
    unit: string
    placeholder: string
    min?: number
    max?: number
  }[]
  options?: { value: string; score: number; label: string }[]
  scoringRules?: { score: number; description: string }[]
}

export interface Module {
  id: string
  name: string
  nameEn: string
  focus: string
  questions: Question[]
}

export const whiteCompletenessModules: Module[] = [
  {
    id: 'qualitative-assessment',
    name: 'Qualitative Assessment',
    nameEn: 'Qualitative Assessment',
    focus: 'Causal Chain Clarity and Predictive Logic',
    questions: [
      {
        id: 'q1',
        moduleId: 'qualitative-assessment',
        question: 'Q1: Causal Chain Clarity - Evaluate the clarity and transparency of the causal relationships and physicochemical conversion logic in the evaluation process from sample pretreatment, separation to detection',
        type: 'select',
        options: [
          { value: 'completely-transparent', label: 'A: Completely transparent - Every intermediate state has mature microscale dynamics or thermodynamic support', score: 100 },
          { value: 'mainly-clear', label: 'B: Mainly clear - Main processes have theoretical support, only a few boundary effects or secondary reactions have minor empirical assumptions', score: 75 },
          { value: 'logically-discontinuous', label: 'C: Logically discontinuous - Known certain operations are effective but microscopic mechanism is in academic debate or only passes qualitative analogy comparison', score: 50 },
          { value: 'theoretically-weak', label: 'D: Theoretically weak - Method design mainly references similar instrument parameters, lacks systematic rigorous deduction for system itself', score: 25 },
          { value: 'logically-contradictory', label: 'E: Logically contradictory - Method is entirely built on trial and error basis, processes oppose operating principles (Trial and Error), or are described as black box', score: 0 }
        ]
      },
      {
        id: 'q2',
        moduleId: 'qualitative-assessment',
        question: 'Q2: Predictive Logic - Evaluate whether the existing theoretical model can be validated in advance to predict variation trends when environmental parameters (such as temperature, pH, substrate) change',
        type: 'select',
        options: [
          { value: 'strong-deductive', label: 'A: Strong deductive ability - Based on theoretical formulas can immediately calculate impact of variable changes', score: 100 },
          { value: 'directionally-accurate', label: 'B: Directionally accurate prediction - Can predict result trends qualitatively, but quantitative deviation requires experimental verification', score: 75 },
          { value: 'empirical-judgment', label: 'C: Empirical judgment - Relies on past experience with similar samples for processing prediction, lacks strict formula derivation', score: 50 },
          { value: 'frequently-inaccurate', label: 'D: Frequently inaccurate prediction - Predictions frequently fail, interference impacts exceed theoretical predictions', score: 25 },
          { value: 'completely-unpredictive', label: 'E: Completely unpredictive - Every new situation requires extensive trial and error experiments to confirm rules', score: 0 }
        ]
      }
    ]
  },
  {
    id: 'quantitative-assessment',
    name: 'Quantitative Assessment',
    nameEn: 'Quantitative Assessment',
    focus: 'Parameter Purity Index, Trend Alignment Modulus, Logic Density Ratio',
    questions: [
      {
        id: 'q3',
        moduleId: 'quantitative-assessment',
        question: 'Q3: Parameter Purity Index (PPI) - Measures the number of scientific constants or fundamental physical quantities used in calculation formulas',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'P',
            label: 'P (Scientific Constants Count)',
            unit: 'count',
            placeholder: 'Enter number of core scientific constants or fundamental quantities in calculation formula (e.g., gas constant, Faraday constant, Arrhenius constant, wavelength, temperature)',
            min: 0
          },
          {
            name: 'E',
            label: 'E (Empirical Correction Count)',
            unit: 'count',
            placeholder: 'Enter number of artificially calibrated factors introduced to fit standard curves, batch constants, or experimental correction items for tightening results',
            min: 0
          }
        ],
        scoringRules: [
          { score: 100, description: 'Excellent: High scientific constant usage with minimal empirical corrections' },
          { score: 60, description: 'Good: Balanced theory and empirical calibration' },
          { score: 30, description: 'Fair: Heavy reliance on empirical fitting' },
          { score: 0, description: 'Poor: Entirely empirical black-box approach' }
        ]
      },
      {
        id: 'q4',
        moduleId: 'quantitative-assessment',
        question: 'Q4: Trend Alignment Modulus (TAM) - Measures the consistency between actual experimental results and theoretical predictions by calculating the ratio',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'Ratio',
            label: 'Ratio (Experimental/Theoretical)',
            unit: 'ratio',
            placeholder: 'Enter the ratio of actual experimental result to theoretical prediction value. Example: If experimental value matches theory well, Ratio approaches 1; small deviations pass non-linear function filtering',
            min: 0
          }
        ],
        scoringRules: [
          { score: 100, description: 'Excellent: Perfect alignment between experiment and theory (Ratio ≈ 1)' },
          { score: 60, description: 'Good: Minor deviation with acceptable consistency' },
          { score: 30, description: 'Fair: Moderate mismatch requiring explanation' },
          { score: 0, description: 'Poor: Significant divergence from theoretical predictions' }
        ]
      },
      {
        id: 'q5',
        moduleId: 'quantitative-assessment',
        question: 'Q5: Logic Density Ratio (LDR) - Measures the density ratio of core scientific principles supported by the method to artificially preset undisclosed settings or special limitation conditions',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'L',
            label: 'L (Core Scientific Principles)',
            unit: 'count',
            placeholder: 'Enter the number of core scientific principles supported by the method (e.g., mass conservation law, fluorescence excitation law, chromatographic color management theory)',
            min: 0
          },
          {
            name: 'A',
            label: 'A (Preset Undisclosed Settings)',
            unit: 'count',
            placeholder: 'Enter the number of artificially preset undisclosed or special limited conditions to establish. Note: The formula passes A^1.4 power handling, which slightly penalizes methods built on thick theoretical foundations, ensuring minimum accumulation of theoretical cornerstone support while tolerating reasonable operational assumptions',
            min: 0
          }
        ],
        scoringRules: [
          { score: 100, description: 'Excellent: High scientific principle foundation with minimal undisclosed assumptions' },
          { score: 60, description: 'Good: Reasonable balance of theory and operational requirements' },
          { score: 30, description: 'Fair: Heavy dependence on undisclosed settings' },
          { score: 0, description: 'Poor: Method lacks theoretical foundation, mostly empirical black box' }
        ]
      }
    ]
  }
];
