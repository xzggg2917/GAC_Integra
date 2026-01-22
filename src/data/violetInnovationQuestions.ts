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

export const violetInnovationModules: Module[] = [
  {
    id: 'innovation-assessment',
    name: 'Innovation Assessment',
    nameEn: 'Technical Innovation & Conceptual Ingenuity',
    focus: 'Evaluating originality, design ingenuity, and methodological integration',
    questions: [
      {
        id: 'q1',
        moduleId: 'innovation-assessment',
        question: 'Q1: Technical Route Originality - Evaluates whether the method has achieved disruptive innovation and proposed completely new approaches on the underlying technology path',
        type: 'select',
        options: [
          { 
            value: 'revolutionary', 
            score: 100, 
            label: 'A (100 pts): Revolutionary original creation - Proposed a completely new analytical format (e.g., introduced fragment ion detection to convert non-invasive measurement into real-time sensing), significantly reduced intermediate links' 
          },
          { 
            value: 'technical-migration', 
            score: 75, 
            label: 'B (75 pts): Technical migration innovation - Migrated other niche technologies (e.g., electrochemical quantification, supercritical material, programmable probe system) for the first time to interdisciplinary application' 
          },
          { 
            value: 'combinatorial', 
            score: 50, 
            label: 'C (50 pts): Combinatorial innovation - Combined two unrelated mature technologies for non-obvious depth integration' 
          },
          { 
            value: 'partial-improvement', 
            score: 25, 
            label: 'D (25 pts): Partial improvement - Only made limited local optimizations (targeting specific troublesome detection groups), lacking innovation for universal individual groups' 
          },
          { 
            value: 'no-innovation', 
            score: 0, 
            label: 'E (0 pts): No innovation - Completely followed existing laboratory or official standard methods' 
          }
        ]
      },
      {
        id: 'q2',
        moduleId: 'innovation-assessment',
        question: 'Q2: Conceptual Ingenuity - Evaluates whether the method broke through special definition framework in solving problems, demonstrating ingenious degree of "unconstrained design"',
        type: 'select',
        options: [
          { 
            value: 'paradigm-shift', 
            score: 100, 
            label: 'A (100 pts): Paradigm breakthrough - Completely opposite to traditional thinking, achieved revolutionary design through extreme simplification (e.g., self-assembly, reverse-logic engineering mechanism), surpassing the original benchmark' 
          },
          { 
            value: 'intensive-integration', 
            score: 75, 
            label: 'B (75 pts): Intensive integration - Achieved densification or integrated design through modular optimization, significantly improving the characteristic density and versatility of identification' 
          },
          { 
            value: 'clever-evolution', 
            score: 50, 
            label: 'C (50 pts): Clever evolution - Used non-traditional, non-standard materials or combinations, solving problems of special defined design issues' 
          },
          { 
            value: 'compensatory-design', 
            score: 25, 
            label: 'D (25 pts): Compensatory design - Achieved progressive step-by-step auxiliary means through increasing complexity to solve some existing problems' 
          },
          { 
            value: 'blind-maintenance', 
            score: 0, 
            label: 'E (0 pts): Blind maintenance - Not even basic analytical selectivity has been validated, neither feasibility optimization nor design' 
          }
        ]
      },
      {
        id: 'q3',
        moduleId: 'innovation-assessment',
        question: 'Q3: Methodological Synergy Integration Degree (I_mc) - Method complexity and interdisciplinary coupling breadth',
        type: 'multi-input',
        formula: 'Score = 100 × [1 - exp(-0.1 × V_t² × √(J_p + 1))]',
        multiInputFields: [
          {
            name: 'vt',
            label: 'V_t (Number of specialized modules in technical domain)',
            unit: 'count',
            placeholder: 'e.g., chromatography, mass spectrometry, microfluidics',
            min: 0
          },
          {
            name: 'jp',
            label: 'J_p (Number of cross-integration coupling points between disciplines/modules)',
            unit: 'count',
            placeholder: 'Represents interaction complexity not just linear addition',
            min: 0
          }
        ]
      },
      {
        id: 'q4',
        moduleId: 'innovation-assessment',
        question: 'Q4: Structural Advancement and Nonlinear Logic Index (U_sa) - Non-linear logical complexity and customization degree',
        type: 'multi-input',
        formula: 'Score = 100 × (L_s × D_sa)² / ((L_s × D_sa)² + 1.5)',
        multiInputFields: [
          {
            name: 'ls',
            label: 'L_s (Nonlinear logical steps count)',
            unit: 'count',
            placeholder: 'Experimental mid-process feedback-regulated self-targeting, wind-probing trial, multi-dimensional index calculation etc.',
            min: 0
          },
          {
            name: 'dsa',
            label: 'D_sa (Customization degree coefficient)',
            unit: 'ratio (0-1)',
            placeholder: 'Refers to non-standard degree, self-defined protocol deviation from whole system proportion, 0 < D_sa ≤ 1',
            min: 0,
            max: 1
          }
        ]
      },
      {
        id: 'q5',
        moduleId: 'innovation-assessment',
        question: 'Q5: Theoretical Extension and Knowledge Acquisition Efficiency (I_ex) - Innovation intellectual value and theory depth',
        type: 'multi-input',
        formula: 'Score = 100 × sin(π/2 × (N_r × M_a)/(N_r × M_a + 5))',
        multiInputFields: [
          {
            name: 'nr',
            label: 'N_r (Interdisciplinary/non-standard reference resource count)',
            unit: 'count',
            placeholder: 'Refers to external literature citations outside chemistry, or providing "inspiration from other fields" non-textbook knowledge',
            min: 0
          },
          {
            name: 'ma',
            label: 'M_a (Methodological universality transfer capability)',
            unit: 'ratio',
            placeholder: 'After innovation completion, measured relative target, theoretically able to migrate and apply to multiple other similar scenarios',
            min: 0
          }
        ]
      }
    ]
  }
];
