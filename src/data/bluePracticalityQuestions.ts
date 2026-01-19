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

export const bluePracticalityModules: Module[] = [
  {
    id: 'cost-accessibility',
    name: 'Cost & Accessibility',
    nameEn: 'Economic Feasibility and Resource Access',
    focus: 'Total cost of ownership and supply chain resilience',
    questions: [
      {
        id: 'q1',
        moduleId: 'cost-accessibility',
        question: 'Q1: Total Cost of Ownership Model - Combines "instrument purchase (CAPEX)" and "actual usage cost (OPEX)". Uses logarithmic model for fair comparison of vastly different prices',
        type: 'input',
        unit: 'USD',
        formula: 'Score = 10 × (1 - (ln(Pinst + 1) + 0.5 · ln(Crun + 1)) / 12)',
        reference: {
          name: 'Equipment Cost Database',
          url: 'https://www.labmanager.com'
        },
        scoringRules: [
          { min: 9.7, score: 10, description: 'Paper chromatography (P = 0, C = 0.5): 10 × (1 - 0.03) ≈ 9.7 points' },
          { min: 6.0, max: 9.7, score: 6.0, description: 'Standard HPLC (P = 50, C = 5): 10 × (1 - (3.9+0.9)/12) = 10 × 0.6 = 6.0 points' },
          { min: 1.7, max: 6.0, score: 1.7, description: 'High-end cold spray MS (P = 2000, C = 100): 10 × (1 - (7.6+2.3)/12) ≈ 1.7 points' }
        ]
      },
      {
        id: 'q2',
        moduleId: 'cost-accessibility',
        question: 'Q2: Throughput Saturation Kinetics - Borrows Michaelis-Menten kinetic model. Moderately increasing initial yield is beneficial, but later approaches saturation effect',
        type: 'input',
        unit: 'samples/hour',
        formula: 'Score = 10 × (Tput / (Km + Tput)) × (1 + δauto)',
        reference: {
          name: 'Throughput Standards',
          url: 'https://www.labx.com'
        },
        scoringRules: [
          { min: 10, score: 10, description: 'Maximum ceiling 10 points' },
          { min: 2.8, max: 10, score: 2.8, description: 'Manual operation (2 samples/h): 10 × 2/7 ≈ 2.8 points' },
          { min: 5.3, max: 10, score: 5.3, description: 'Standard HPLC (4 samples/h, automated): 10 × 4/9 × 1.2 ≈ 5.3 points' },
          { min: 10, score: 10, description: 'Ultra-fast method (100 samples/h, automated): 10 × 100/105 × 1.2 = 11.4 → 10 points' }
        ]
      },
      {
        id: 'q3',
        moduleId: 'cost-accessibility',
        question: 'Q3: Sample Volume Log-Efficiency - For precious samples (drugs, herbs, tears). Sample scarcity means practicality',
        type: 'input',
        unit: 'μL',
        formula: 'Score = 10 - 2.5 × log₁₀(max(1, VμL))',
        reference: {
          name: 'Sample Volume Guidelines',
          url: 'https://www.chromatographyonline.com'
        },
        scoringRules: [
          { max: 1, score: 10, description: 'Nano injection (< 1 μL): log = 0 → 10 points' },
          { min: 5.0, max: 10, score: 5.0, description: 'Standard injection (100 μL): 10 - 2.5 × 2 = 5.0 points' },
          { min: 0, max: 5.0, score: 0, description: 'Large sample (10,000 μL = 10 mL): 10 - 2.5 × 4 = 0 points' }
        ]
      },
      {
        id: 'q4',
        moduleId: 'cost-accessibility',
        question: 'Q4: Learning Curve Decay - Evaluates "human" requirements. Is it foolproof operation, or requires "passing the torch"?',
        type: 'input',
        unit: 'days',
        formula: 'Score = 10 × e^(-0.2×(Dtrain+Ledu))',
        reference: {
          name: 'Training Requirements',
          url: 'https://www.acs.org'
        },
        scoringRules: [
          { min: 8.2, score: 10, description: 'Blood glucose (0 days, high school): 10 × e^(-0.2) ≈ 8.2 points' },
          { min: 3.7, max: 8.2, score: 3.7, description: 'Standard HPLC (3 days, undergraduate): 10 × e^(-0.2×5) = 10 × e^(-1) ≈ 3.7 points' },
          { min: 0, max: 3.7, score: 0, description: 'Mass spec imaging (30 days, doctorate): 10 × e^(-6.8) ≈ 0 points' }
        ]
      },
      {
        id: 'q5',
        moduleId: 'cost-accessibility',
        question: 'Q5: Supply Chain Resilience Factor - Considers "supply disruption" risk. Reagent versatility, practical use over excellence',
        type: 'input',
        unit: 'vendors',
        formula: 'Score = 10 × (1 - e^(-0.5×Nvendor)) + 2 × Ilocal',
        reference: {
          name: 'Supplier Database',
          url: 'https://www.sigmaaldrich.com'
        },
        scoringRules: [
          { min: 10, score: 10, description: 'Maximum ceiling 10 points' },
          { min: 10, score: 10, description: 'Common reagent (imported): Suppliers >10, domestic. 10 × 1 + 2 = 10 points' },
          { min: 4.0, max: 10, score: 4.0, description: 'Patented reagent: Single supplier (N = 1), imported (I = 0). 10 × (1 - 0.6) = 4.0 points' }
        ]
      }
    ]
  },
  {
    id: 'operational-simplicity',
    name: 'Operational Simplicity',
    nameEn: 'Ease of Operation and Method Complexity',
    focus: 'Step complexity and learning curve reduction',
    questions: [
      {
        id: 'q6',
        moduleId: 'operational-simplicity',
        question: 'Q6: Operational Complexity Geometric Series - More steps, exponential difficulty increase. Emphasizes overengineering',
        type: 'input',
        unit: 'steps',
        formula: 'Score = 10 × (0.85)^(Nsteps-1)',
        reference: {
          name: 'Method Complexity Standards',
          url: 'https://www.usp.org'
        },
        scoringRules: [
          { min: 10, score: 10, description: 'Each additional step, 15% discount' },
          { min: 10, score: 10, description: 'Direct injection (1 step): 10 × 1 = 10 points' },
          { min: 8.5, max: 10, score: 8.5, description: 'Simple extraction (2 steps): 10 × 0.85 = 8.5 points' },
          { min: 2.3, max: 8.5, score: 2.3, description: 'Complex pretreatment (10 steps): 10 × 0.23 ≈ 2.3 points' }
        ]
      },
      {
        id: 'q7',
        moduleId: 'operational-simplicity',
        question: 'Q7: Infrastructure Dependency Vector - Can the method leave the lab? (POCT capability)',
        type: 'checkbox',
        formula: 'Score = 10 - √(Σ(wi · xi)²)',
        reference: {
          name: 'POCT Standards',
          url: 'https://www.poct.org'
        },
        options: [
          { value: 'electricity', score: 9, label: 'A. AC power (-9 points)' },
          { value: 'pure-water', score: 9, label: 'B. Pure water (-9 points)' },
          { value: 'gas', score: 16, label: 'C. Gas (-16 points)' },
          { value: 'ventilation', score: 25, label: 'D. Fume hood (-25 points)' },
          { value: 'clean-room', score: 64, label: 'E. Clean room (-64 points)' }
        ],
        scoringRules: [
          { score: 10, description: 'Handheld device (no dependency): 10 - 0 = 10 points' },
          { score: 5.8, description: 'Standard color comparison (electricity + water): 10 - √(9+9) ≈ 5.8 points' },
          { score: 2.3, description: 'ICP-MS (electricity + water + gas + ventilation): 10 - √(9+9+16+25) = 10 - √59 ≈ 2.3 points' }
        ]
      },
      {
        id: 'q8',
        moduleId: 'operational-simplicity',
        question: 'Q8: Multiplexing Efficiency Root - Can one run detect multiple indicators?',
        type: 'input',
        unit: 'analytes',
        formula: 'Score = 2.5 × √Nana',
        reference: {
          name: 'Multiplexing Capabilities',
          url: 'https://www.biocompare.com'
        },
        scoringRules: [
          { min: 10, score: 10, description: 'Maximum ceiling 10 points' },
          { min: 2.5, max: 10, score: 2.5, description: 'Single analyte detection (N = 1): 2.5 points' },
          { min: 5.0, max: 10, score: 5.0, description: 'Standard dual detection (N = 4): 2.5 × 2 = 5.0 points' },
          { min: 10, score: 10, description: 'Omics/array (N ≥ 16): 2.5 × 4 = 10 points' }
        ]
      }
    ]
  },
  {
    id: 'applicability',
    name: 'Applicability',
    nameEn: 'Scope and Versatility',
    focus: 'Universal applicability and instrument utilization',
    questions: [
      {
        id: 'q9',
        moduleId: 'applicability',
        question: 'Q9: Scope Applicability Index - Is it "universal tool" or "specialized tool"?',
        type: 'input',
        unit: 'matrix types',
        formula: 'Score = min(10, 1.5 × Nmatrix + 1.0 × Rlinear)',
        reference: {
          name: 'Method Validation Guidelines',
          url: 'https://www.fda.gov'
        },
        scoringRules: [
          { min: 10, score: 10, description: 'Universal method: Applies to 4 matrix types, linear range 4 orders (ppm-ppb). 1.5 × 4 + 4 = 10 points' },
          { min: 3.5, max: 10, score: 3.5, description: 'Specialized method: Only suitable for 1 matrix type, linear range 2 orders. 1.5 + 2 = 3.5 points' }
        ]
      },
      {
        id: 'q10',
        moduleId: 'applicability',
        question: 'Q10: Instrument Idle Penalty - What is the average utilization rate of this instrument in the laboratory (1=daily, 0.5=weekly, 0.1=monthly, 0.01=yearly)?',
        type: 'input',
        unit: 'utilization',
        formula: 'Score = 10 × (Fuse)^0.3',
        reference: {
          name: 'Lab Equipment Utilization',
          url: 'https://www.labmanager.com'
        },
        scoringRules: [
          { min: 10, score: 10, description: 'Daily use (F = 1): 10 points' },
          { min: 8.1, max: 10, score: 8.1, description: 'Weekly use (F = 0.5): 10 × 0.81 ≈ 8.1 points' },
          { min: 5.0, max: 8.1, score: 5.0, description: 'Monthly use (F = 0.1): 10 × 0.5 ≈ 5.0 points' },
          { min: 2.5, max: 5.0, score: 2.5, description: 'Occasional use (F = 0.01): 10 × 0.25 = 2.5 points' }
        ]
      }
    ]
  }
];
