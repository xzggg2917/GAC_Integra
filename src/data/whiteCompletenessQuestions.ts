export interface Question {
  id: string;
  moduleId: string;
  question: string;
  type: 'input' | 'select' | 'checkbox';
  unit?: string;
  formula?: string;
  reference?: { name: string; url: string };
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

export const whiteCompletenessModules: Module[] = [
  {
    id: 'sample-reagent-constraints',
    name: 'Sample & Reagent Constraints',
    nameEn: 'Physical and Chemical Limitations',
    focus: 'Sample heterogeneity, biosafety risks, and reagent shelf-life pressure',
    questions: [
      {
        id: 'q1',
        moduleId: 'sample-reagent-constraints',
        question: 'Q1: Sample Heterogeneity Index - Gray dimensions focus on "processing the sample as is", emphasizing "sample diversity". Heterogeneous samples (e.g., soil, non-uniform minerals) have greater sampling variance. [User Input]',
        type: 'select',
        formula: 'Score = 10 × (Nphase)^(-1.5)',
        reference: {
          name: 'Sample Heterogeneity Standards',
          url: 'https://www.iso.org'
        },
        options: [
          { value: '1', score: 10, label: 'Pure solution (N = 1): 10 × 1 = 10 points' },
          { value: '2', score: 3.5, label: 'Oil/emulsion (N = 2): 10 × 0.35 ≈ 3.5 points' },
          { value: '4', score: 1.2, label: 'Soil/slag (N = 4): 10 × 0.125 ≈ 1.2 points' }
        ]
      },
      {
        id: 'q2',
        moduleId: 'sample-reagent-constraints',
        question: 'Q2: Bio-safety Risk Factor - Yellow dimensions focus on "reagent toxicity", this focuses on "sample toxicity". Pathogen samples and vaccine testing have vastly different protection requirements. [User Input]',
        type: 'select',
        formula: 'Score = 10 × e^(-0.8×(BSL-1))',
        reference: {
          name: 'Biosafety Level Guidelines',
          url: 'https://www.cdc.gov/labs/BMBL.html'
        },
        options: [
          { value: '1', score: 10, label: 'Environmental sample (BSL-1): 10 × e⁰ = 10 points' },
          { value: '2', score: 4.5, label: 'General blood sample (BSL-2): 10 × e⁻⁰·⁸ ≈ 4.5 points' },
          { value: '3', score: 2.0, label: 'Highly pathogenic bacteria (BSL-3): 10 × e⁻¹·⁶ ≈ 2.0 points' }
        ]
      },
      {
        id: 'q3',
        moduleId: 'sample-reagent-constraints',
        question: 'Q3: Warm-up Burden Ratio - Blue dimensions focus on "analysis time", this focuses on "waiting time". Some instruments require vacuum pumping or preheating before starting, severely affecting emergency response. [User Input]',
        type: 'input',
        unit: 'minutes',
        formula: 'Score = 10 × 1/(1 + ln(1 + Twait/Trun))',
        reference: {
          name: 'Instrument Warm-up Standards',
          url: 'https://www.labmanager.com'
        },
        scoringRules: [
          { min: 0, max: 0, score: 10, description: 'pH measurement (0 wait): 10 × 1 = 10 points' },
          { min: 1, max: 30, score: 5.9, description: 'HPLC (30 min preheat, 30 min run): Tw/Tr = 1 → 10/(1 + 0.69) ≈ 5.9 points' },
          { min: 72, score: 1.9, description: 'MS (extract vacuum 12h = 720 min, run 10 min): Tw/Tr = 72 → 10/(1 + 4.3) ≈ 1.9 points' }
        ]
      },
      {
        id: 'q4',
        moduleId: 'sample-reagent-constraints',
        question: 'Q4: Reagent Inventory Pressure - Substitute principle: sample flow is stable. Design focus: attention to "short shelf life supply pressure". Cannot buy what you cannot buy (blue dimension), but can buy back without being able to store it. For biologics or antibodies with only 1-month validity period, it forces labs to purchase frequently or face waste, greatly increasing logistics cost. [User Input]',
        type: 'input',
        unit: 'days',
        formula: 'Score = 10 × Tshelf/(Klogistics + Tshelf)',
        reference: {
          name: 'Reagent Storage Guidelines',
          url: 'https://www.sigmaaldrich.com'
        },
        scoringRules: [
          { min: 365, score: 9.2, description: 'Regular chemical reagent (1 year/365 days): Calculation: 10 × 365/395 ≈ 9.2 points. Interpretation: Storage management relaxed, buy once a year.' },
          { min: 90, max: 365, score: 7.5, description: 'Short-term reagent (3 months/90 days): Calculation: 10 × 90/120 = 7.5 points' },
          { min: 30, max: 90, score: 5.0, description: 'Biological reagent/antibody (1 month/30 days): Calculation: 10 × 30/60 = 5.0 points. Interpretation: Must repurchase monthly, managementally burdensome.' },
          { min: 7, max: 30, score: 1.9, description: 'Extremely unstable reagent (1 week/7 days): Calculation: 10 × 7/37 ≈ 1.9 points. Interpretation: Extreme pain, must frequently order reagents to avoid wasting.' }
        ]
      }
    ]
  },
  {
    id: 'environmental-maintenance',
    name: 'Environmental & Maintenance',
    nameEn: 'Operational Environment and Upkeep',
    focus: 'Environmental stringency, maintenance burden, and calibration frequency',
    questions: [
      {
        id: 'q5',
        moduleId: 'environmental-maintenance',
        question: 'Q5: Environmental Stringency Index - Substitute principle: Material space occupancy. Design focus: Focus on "environmental suitability". Not about "how large the instrument is", but "how harsh the environment". Some precision instruments require room temperature < 1°C variation, humidity < 40%, vibration-free constant temperature. This determines whether the method can only be performed in constant temperature labs, or can be used anywhere. [User Input]',
        type: 'input',
        unit: '°C',
        formula: 'Score = (10 - 2 × Ihumidity) × 1/(1 + e^(-0.1×(ΔTops-15)))',
        reference: {
          name: 'Environmental Control Standards',
          url: 'https://www.ashrae.org'
        },
        scoringRules: [
          { min: 60, score: 9.9, description: 'Field/handheld device (operating range -10~50°C, ΔT = 60, no humidity requirement): Calculation: (10 - 0) × 1/(1+e⁻⁴·⁵) ≈ 10 × 0.99 = 9.9 points. Interpretation: Real-world applicable, able to go to field/desert.' },
          { min: 25, max: 35, score: 7.3, description: 'Standard benchtop (operating range 10~35°C, ΔT = 25, no humidity requirement): Calculation: 10 × 1/(1+e⁻¹) ≈ 10 × 0.73 = 7.3 points' },
          { min: 10, max: 25, score: 3.0, description: 'Precision lab instrument (operating range 15~25°C, ΔT = 10, requires humidity <60%): Calculation: (10 - 2) × 1/(1+e⁰·⁵) ≈ 8 × 0.38 = 3.0 points. Interpretation: Not conventional, must be in air-conditioned clean room.' },
          { min: 2, max: 10, score: 1.7, description: 'Metrology-grade device (operating range 20±1°C, ΔT = 2, strict humidity): Calculation: 8 × 1/(1+e¹·³) ≈ 8 × 0.21 = 1.7 points' }
        ]
      },
      {
        id: 'q6',
        moduleId: 'environmental-maintenance',
        question: 'Q6: Maintenance Ratio - Design focus: 1 hour actual work, needs 3 hours for cleaning. This is most likely to be overlooked as invisible form damage. [User Input]',
        type: 'input',
        unit: 'hours',
        formula: 'Score = 10 × 1/(1 + √(Tclean/Tbatch))',
        reference: {
          name: 'Maintenance Time Guidelines',
          url: 'https://www.labmanager.com'
        },
        scoringRules: [
          { min: 0, max: 0, score: 10, description: 'No cleaning (single use): Tclean = 0 → 10 points' },
          { min: 1, max: 4, score: 6.7, description: 'Standard (wash 1h, run 4h): √0.25 = 0.5 → 10/1.5 ≈ 6.7 points' },
          { min: 4, max: 4, score: 3.3, description: 'Severe contamination (wash 4h, run 1h): √4 = 2 → 10/3 ≈ 3.3 points' }
        ]
      },
      {
        id: 'q7',
        moduleId: 'environmental-maintenance',
        question: 'Q7: Calibration Load - Design focus: "Is the instrument arrogant?" Some instruments require weekly standard curves; some semi-annually once calibration is done. [User Input]',
        type: 'input',
        unit: 'samples per 100',
        formula: 'Score = 10 × e^(-0.1×Nstd)',
        reference: {
          name: 'Calibration Frequency Standards',
          url: 'https://www.nist.gov'
        },
        scoringRules: [
          { min: 1, max: 1, score: 9.0, description: 'Extremely stable (no need for standard curve, N = 1): 9.0 points' },
          { min: 10, max: 10, score: 3.7, description: 'Standard (direct addition, N = 10): 10 × e⁻¹ ≈ 3.7 points' },
          { min: 100, score: 0, description: 'Extreme instability (always one standard curve, N = 100): 0 points' }
        ]
      }
    ]
  },
  {
    id: 'resource-dependency',
    name: 'Resource Dependency',
    nameEn: 'Sample, Supply Chain, and Service Constraints',
    focus: 'Sample scarcity, lead time risks, and service dependency',
    questions: [
      {
        id: 'q8',
        moduleId: 'resource-dependency',
        question: 'Q8: Sample Scarcity Penalty - Design focus: Attention to "capacity limit". If sample is rare as moon rock or absolutely scarce, the analytical method must be non-destructive or abundant. Like tap water, cheap. [User Input]',
        type: 'input',
        unit: 'USD',
        formula: 'Score = 10 - (Idestruct × 2 × log₁₀(Costsample + 1))',
        reference: {
          name: 'Sample Cost Database',
          url: 'https://www.nist.gov'
        },
        scoringRules: [
          { min: 0, score: 10, description: 'Non-destructive analysis (regardless of value): 10 - 0 = 10 points (Note: minimum 0 points)' },
          { min: 1, max: 1, score: 9.4, description: 'Tap water (destructive, $1): 10 - 2 × 0.3 ≈ 9.4 points' },
          { min: 1000, score: 4.0, description: 'Rare sample (destructive, $1000): 10 - 2 × 3 = 4.0 points' }
        ]
      },
      {
        id: 'q9',
        moduleId: 'resource-dependency',
        question: 'Q9: Lead Time Risk - Design focus: Blue dimensions focus on "can it be bought", this focuses on "how long to wait". For emergency testing, waiting 3 months or half a year is useless. [User Input]',
        type: 'input',
        unit: 'weeks',
        formula: 'Score = 10 × (0.7)^Weeklead',
        reference: {
          name: 'Supply Chain Lead Time',
          url: 'https://www.thomasnet.com'
        },
        scoringRules: [
          { min: 0, max: 0, score: 10, description: 'In stock (0 weeks): 10 points' },
          { min: 1, max: 1, score: 7.0, description: '1 week arrival: 7.0 points' },
          { min: 4, max: 4, score: 2.4, description: '1 month (4 weeks): 10 × 0.24 ≈ 2.4 points' },
          { min: 12, score: 0.1, description: '3 months (12 weeks): 0.1 points' }
        ]
      },
      {
        id: 'q10',
        moduleId: 'resource-dependency',
        question: 'Q10: Service Dependency Index - Design focus: Broken, unable to fix? Self-repair is the best environment. [User Input]',
        type: 'select',
        formula: 'Score = 10 × cos(Lfix × π/6)',
        reference: {
          name: 'Service Dependency Guidelines',
          url: 'https://www.iso.org'
        },
        options: [
          { value: '0', score: 10, label: 'DIY (L = 0): 10 × cos(0) = 10 points' },
          { value: '1', score: 8.7, label: 'Internal engineer (L = 1): 10 × cos(30°) ≈ 8.7 points' },
          { value: '2', score: 5.0, label: 'Factory door-to-door (L = 2): 10 × cos(60°) = 5.0 points' },
          { value: '3', score: 0, label: 'Return to factory (L = 3): 10 × cos(90°) = 0 points' }
        ]
      }
    ]
  }
];
