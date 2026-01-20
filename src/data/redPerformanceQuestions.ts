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

export const redPerformanceModules: Module[] = [
  {
    id: 'trueness-precision',
    name: 'Trueness & Precision',
    nameEn: 'Accuracy and Repeatability',
    focus: 'Recovery rate close to 100%, RSD consistent with Horwitz theory',
    questions: [
      {
        id: 'q1',
        moduleId: 'trueness-precision',
        question: 'Q1: Accuracy Gaussian Deviation - Recovery rate is the core of accuracy. Uses Gaussian function (normal distribution curve) for scoring. Near 100% highest score, gradually decreases when exceeding tolerance. [User Input]',
        type: 'input',
        unit: '%',
        formula: 'Score = 10 × e^(-(Ravg-100)²/(2σ²))',
        reference: {
          name: 'AOAC Recovery Guidelines',
          url: 'https://www.aoac.org'
        },
        scoringRules: [
          { min: 100, max: 100, score: 10, description: 'Perfect recovery (100%): 10 × e⁰ = 10 points' },
          { min: 95, max: 105, score: 8.8, description: 'Excellent (95% or 105%): 10 × e⁻⁰·¹²⁵ ≈ 8.8 points' },
          { min: 80, max: 120, score: 1.35, description: 'Borderline pass (80% or 120%): 10 × e⁻² ≈ 1.35 points' },
          { max: 70, score: 0.1, description: 'Severe deviation (70%): 10 × e⁻⁴·⁵ ≈ 0.1 points' }
        ]
      },
      {
        id: 'q2',
        moduleId: 'trueness-precision',
        question: 'Q2: HorRat Precision Score - Introduces AOAC golden standard Horwitz method. Calculates theoretical RSD based on concentration, then compares with actual RSD using ratio. Lower is better, larger means beyond expectations. [User Input]',
        type: 'input',
        unit: 'ppm',
        formula: 'HorRat = RSDexp / PRSD, where PRSD = 2 × C⁻⁰·¹⁵⁰⁵',
        reference: {
          name: 'Horwitz Curve Standards',
          url: 'https://www.aoac.org/horwitz'
        },
        scoringRules: [
          { min: 0.5, max: 0.5, score: 10, description: 'Perfect compliance (HorRat = 0.5): 10 points' },
          { min: 1.0, max: 1.0, score: 9.4, description: 'Standard compliance (HorRat = 1.0): 10 × 1/(1+0.06) ≈ 9.4 points' },
          { min: 2.0, max: 2.0, score: 1.6, description: 'Reluctant compliance (HorRat = 2.0): 10 × 1/(1+5) ≈ 1.6 points' }
        ]
      },
      {
        id: 'q3',
        moduleId: 'trueness-precision',
        question: 'Q3: Logarithmic Linearity Penalty - R² value between 0.99 and 0.999 appears similar, but represents linearity quality difference. Uses -log(1-R²) to amplify this difference. [User Input]',
        type: 'input',
        unit: 'R²',
        formula: 'Score = min(10, 2.5 × [-log₁₀(1 - R²)])',
        reference: {
          name: 'FDA Linearity Validation',
          url: 'https://www.fda.gov/linearity'
        },
        scoringRules: [
          { min: 0.9999, score: 10, description: 'Extreme linearity (0.9999): -log(0.0001) = 4 → 2.5 × 4 = 10 points' },
          { min: 0.999, max: 0.9999, score: 7.5, description: 'Excellent linearity (0.999): -log(0.001) = 3 → 2.5 × 3 = 7.5 points' },
          { min: 0.99, max: 0.999, score: 5.0, description: 'Qualified linearity (0.99): -log(0.01) = 2 → 2.5 × 2 = 5.0 points' },
          { min: 0.9, max: 0.99, score: 2.5, description: 'Baseline (0.9): -log(0.1) = 1 → 2.5 points' }
        ]
      },
      {
        id: 'q4',
        moduleId: 'trueness-precision',
        question: 'Q4: Fitness-for-Purpose Sensitivity - Does not pursue infinitely low LOD, but checks if LOD is relatively sufficient for the limit standard. [User Input]',
        type: 'input',
        unit: 'Lreq/LOQ',
        formula: 'Score = 5 × log₁₀(Lreq/LOQ) + 5',
        reference: {
          name: 'ICH Q2 Sensitivity Guidelines',
          url: 'https://www.ich.org'
        },
        scoringRules: [
          { min: 10, max: 10, score: 10, description: 'Extremely sensitive (LOQ = Lreq/10): 5 × log(10) + 5 = 10 points' },
          { min: 1, max: 1, score: 5, description: 'Standard configuration (LOQ = Lreq, just meets): 5 × 0 + 5 = 5 points' },
          { max: 1, score: 0, description: 'Insufficient sensitivity (LOQ > Lreq, cannot detect): Score < 5, approaches 0' }
        ]
      }
    ]
  },
  {
    id: 'signal-quality',
    name: 'Signal Quality',
    nameEn: 'Peak Shape and Interference Control',
    focus: 'S/N ratio, peak symmetry, blank interference - all bottom-line quality indicators',
    questions: [
      {
        id: 'q5',
        moduleId: 'signal-quality',
        question: 'Q5: Signal-to-Noise Saturation Index - For any instrumental analysis, signal-to-noise (S/N) is the most fundamental "signal quality" bottom-line indicator. Higher S/N gives better results. But when S/N reaches a certain level (e.g., >100), further improvement approaches diminishing returns. Therefore, we use Michaelis-Menten model to simulate this saturation effect. [User Input]',
        type: 'input',
        unit: 'S/N',
        formula: 'Score = 10 × (S/N)/(Km + S/N) × α',
        reference: {
          name: 'Signal-to-Noise Standards',
          url: 'https://www.chromatographyonline.com'
        },
        scoringRules: [
          { min: 100, score: 10, description: 'Extremely good signal (S/N = 100): 10 × 100/110 × 1.1 = 10 × 0.909 × 1.1 ≈ 10.0 points (ceiling)' },
          { min: 50, max: 100, score: 9.2, description: 'Good signal (S/N = 50): 10 × 50/60 × 1.1 ≈ 9.2 points' },
          { min: 10, max: 50, score: 5.5, description: 'Standard quantification limit (S/N = 10): 10 × 10/20 × 1.1 = 5.5 points' },
          { min: 3, max: 10, score: 2.5, description: 'Detection limit edge (S/N = 3): 10 × 3/13 × 1.1 ≈ 2.5 points' }
        ]
      },
      {
        id: 'q6',
        moduleId: 'signal-quality',
        question: 'Q6: Peak Symmetry Gaussian Index - Considers chromatographic peaks as "perfect or not". Perfect peak shape is Gaussian distribution premise. Tailing (Tf > 1) or fronting (Tf < 1) both cause fixed error. [User Input]',
        type: 'input',
        unit: 'Tf',
        formula: 'Score = 10 × e^(-3×(Tf-1)²)',
        reference: {
          name: 'USP Peak Tailing Standards',
          url: 'https://www.usp.org'
        },
        scoringRules: [
          { min: 1.0, max: 1.0, score: 10, description: 'Perfect peak (Tf = 1.0): 10 × e⁰ = 10 points' },
          { min: 1.1, max: 1.1, score: 9.7, description: 'Excellent (Tf = 1.1): 10 × e⁻³ˣ⁰·⁰¹ = 10 × e⁻⁰·⁰³ ≈ 9.7 points' },
          { min: 1.2, max: 1.2, score: 8.8, description: 'Good/common (Tf = 1.2): 10 × e⁻³ˣ⁰·⁰⁴ = 10 × 0.88 ≈ 8.8 points (most experiments fall here)' },
          { min: 1.5, max: 1.5, score: 4.7, description: 'Critical state (Tf = 1.5): Note: USP typically requires Tf < 2.0, but better methods generally require < 1.5. 10 × e⁻³ˣ⁰·²⁵ = 10 × e⁻⁰·⁷⁵ ≈ 4.7 points (score rapidly approaches < 5, indicating peak has deteriorated)' },
          { min: 2.0, max: 2.0, score: 0.5, description: 'Severe tailing (Tf = 2.0): 10 × e⁻³ˣ¹ = 10 × 0.05 ≈ 0.5 points' }
        ]
      },
      {
        id: 'q7',
        moduleId: 'signal-quality',
        question: 'Q7: Blank Interference Index - Matrix effect. All analytical methods have some "blank peak/signal". Regardless of solvent impurity, reagent contamination, or color interference from sample, blank signal (Sblank) relative to quantification limit signal (SLOQ) ratio is a universal "cleanliness" indicator for the method. [User Input]',
        type: 'input',
        unit: 'Sblank/SLOQ',
        formula: 'Score = 10 × e^(-β×(Sblank/SLOQ)²)',
        reference: {
          name: 'Blank Interference Guidelines',
          url: 'https://www.epa.gov'
        },
        scoringRules: [
          { min: 0, max: 0, score: 10, description: 'Perfect blank (Sblank = 0): 10 × e⁰ = 10.0 points. Interpretation: Completely interference-free' },
          { min: 0.1, max: 0.1, score: 9.5, description: 'Minor background (Sblank is 10% of SLOQ): Input ratio = 0.1. Calculation: 10 × e⁻⁵ˣ⁰·⁰¹ = 10 × e⁻⁰·⁰⁵ ≈ 9.5 points. Interpretation: Very low background, acceptable' },
          { min: 0.5, max: 0.5, score: 2.9, description: 'Obvious interference (Sblank is 50% of SLOQ): Input ratio = 0.5. Calculation: 10 × e⁻⁵ˣ⁰·²⁵ = 10 × e⁻¹·²⁵ ≈ 2.9 points. Interpretation: Blank signal too high, already occupies a significant portion of quantification limit, method prone to threshold issues, score drops severely' },
          { min: 1.0, score: 0, description: 'Severe interference (Sblank ≥ SLOQ): Calculation: Approaches 0 points. Interpretation: Blank signal comparable to sample signal, method completely unusable' }
        ]
      }
    ]
  },
  {
    id: 'robustness-uncertainty',
    name: 'Robustness & Uncertainty',
    nameEn: 'Method Stability and Measurement Confidence',
    focus: 'Sample stability, robustness testing, measurement uncertainty - red flags',
    questions: [
      {
        id: 'q8',
        moduleId: 'robustness-uncertainty',
        question: 'Q8: Stability Decay Function - Has the sample been stored for a long time? [User Input]',
        type: 'input',
        unit: '%',
        formula: 'Score = 10 × e^(-0.1×ΔC24h)',
        reference: {
          name: 'ICH Q1 Stability Guidelines',
          url: 'https://www.ich.org/q1'
        },
        scoringRules: [
          { min: 0, max: 0, score: 10, description: 'Non-constant stable (change 0%): 10 points' },
          { min: 2, max: 2, score: 8.2, description: 'Stable (change 2%): 10 × e⁻⁰·² ≈ 8.2 points' },
          { min: 10, max: 10, score: 3.7, description: 'Unstable (change 10%): 10 × e⁻¹·⁰ ≈ 3.7 points' },
          { min: 20, score: 1.4, description: 'Extremely unstable (change 20%): 10 × e⁻²·⁰ ≈ 1.4 points' }
        ]
      },
      {
        id: 'q9',
        moduleId: 'robustness-uncertainty',
        question: 'Q9: Robustness Design Space - Will slight parameter changes still maintain results? [User Input]',
        type: 'input',
        unit: 'failed tests',
        formula: 'Score = 10 × (0.6)^Nfail',
        reference: {
          name: 'ICH Q2 Robustness Testing',
          url: 'https://www.ich.org/q2'
        },
        scoringRules: [
          { min: 0, max: 0, score: 10, description: 'Extremely stable (0 failures): 10 × 1 = 10 points' },
          { min: 1, max: 1, score: 6.0, description: 'Slightly sensitive (1 failure): 10 × 0.6 = 6.0 points' },
          { min: 3, score: 2.2, description: 'Very sensitive (3 failures): 10 × 0.216 ≈ 2.2 points' }
        ]
      },
      {
        id: 'q10',
        moduleId: 'robustness-uncertainty',
        question: 'Q10: Measurement Uncertainty Penalty - Final red flag indicator. [User Input]',
        type: 'input',
        unit: '%',
        formula: 'Score = 10 - √(20 × Urel)',
        reference: {
          name: 'GUM Uncertainty Guidelines',
          url: 'https://www.bipm.org/gum'
        },
        scoringRules: [
          { min: 1, max: 1, score: 5.5, description: 'High precision (U = 1%): 10 - √20 ≈ 5.5 points (Note: This formula has high requirements for U, may need adjustment system)' },
          { min: 2, max: 2, score: 9.0, description: 'High precision (U = 2%): 10 × e⁻⁰·¹ ≈ 9.0 points' },
          { min: 10, max: 10, score: 6.0, description: 'Standard (U = 10%): 10 × e⁻⁰·⁵ ≈ 6.0 points' },
          { min: 30, score: 2.2, description: 'High risk (U = 30%): 10 × e⁻¹·⁵ ≈ 2.2 points' }
        ]
      }
    ]
  }
];
