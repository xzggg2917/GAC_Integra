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

export const violetInnovationModules: Module[] = [
  {
    id: 'automation-innovation',
    name: 'Automation & Innovation',
    nameEn: 'Physical Automation and Design Innovation',
    focus: 'Automation level and Quality by Design application',
    questions: [
      {
        id: 'q1',
        moduleId: 'automation-innovation',
        question: 'Q1: Physical Automation Index - Degree of "manual → machine replacement" in experimental procedures (excluding data processing).',
        type: 'input',
        unit: 'score',
        formula: 'Score = (N_robot / N_total) × 10',
        reference: {
          name: 'No data needed',
          url: '#'
        },
        scoringRules: [
          { min: 10, score: 10, description: '10 pts: Fully automated online analysis - Sample in, result out, no manual intervention (e.g., Process Analytical Technology, PAT)' },
          { min: 7, max: 10, score: 8, description: '7-8 pts: Standard automation - Equipped with autosampler and automatic column box, but manual preprocessing' },
          { max: 7, score: 0, description: '0 pts: Fully manual - Manual injection, manual mixing' }
        ]
      },
      {
        id: 'q2',
        moduleId: 'automation-innovation',
        question: 'Q2: Quality by Design (AQbD) Application Depth - Whether the method development used modern "Design Space" concept, rather than traditional "Trial and Error".',
        type: 'select',
        reference: {
          name: 'Check ICH Q14 (Analytical Procedure Development)',
          url: 'https://www.ich.org'
        },
        options: [
          { value: 'complete-aqbd', score: 10, label: 'A (10 pts): Complete AQbD - Defined ATP (Analytical Target Profile), conducted Risk Assessment, established MODR (Method Operable Design Region) through DOE (Design of Experiments)' },
          { value: 'partial-doe', score: 6, label: 'B (6 pts): Partial DOE - Used orthogonal design or response surface optimization, but did not establish complete design space' },
          { value: 'ofat', score: 3, label: 'C (3 pts): Single factor optimization (OFAT) - Changed only one parameter at a time, traditional optimization method' },
          { value: 'direct-use', score: 0, label: 'D (0 pts): Direct use - According to pharmacopoeia or literature, no optimization design' }
        ]
      }
    ]
  },
  {
    id: 'miniaturization-detection',
    name: 'Miniaturization & Detection',
    nameEn: 'Miniaturization Integration and Detection Innovation',
    focus: 'Equipment miniaturization and novel detection mechanisms',
    questions: [
      {
        id: 'q3',
        moduleId: 'miniaturization-detection',
        question: 'Q3: Miniaturization & Integration - Whether equipment form has undergone fundamental changes. Changed from "room size → chip size"?',
        type: 'input',
        unit: 'score',
        formula: 'Score = 2 × log₁₀(Integration Factor)',
        reference: {
          name: 'No data needed',
          url: '#'
        },
        scoringRules: [
          { score: 10, description: '10 pts: Lab-on-a-Chip (microfluidic chip) - Sample, reagent, separation, detection integrated on cm-level chip' },
          { score: 7, description: '7 pts: Micro/capillary tube technology - Nano-LC, Capillary Electrophoresis (equipment volume significantly reduced)' },
          { score: 4, description: '4 pts: Benchtop combined equipment - HPLC, GC (no miniaturization of instrument)' },
          { score: 0, description: '0 pts: Large conventional equipment - Specialized rooms (e.g., walk-in connection, large-scale spray chamber)' }
        ]
      },
      {
        id: 'q4',
        moduleId: 'miniaturization-detection',
        question: 'Q4: Detection Mechanism Novelty - Whether the detector is "old light" or "new perspective".',
        type: 'select',
        reference: {
          name: 'Check Web of Science / Google Patents (recent)',
          url: 'https://www.webofscience.com'
        },
        options: [
          { value: 'quantum-bio', score: 10, label: 'A (10 pts): Quantum principle - First use of a certain physical/biological mechanism for this analysis (e.g., CRISPR-based nucleic acid detection, nanoparticle resonance, solar concentrating photometry)' },
          { value: 'coupling-innovation', score: 7, label: 'B (7 pts): Coupling technology innovation - Innovative combination of two mature technologies for physical connection (e.g., LC-NMR, GC-ICP-MS)' },
          { value: 'conventional-upgrade', score: 4, label: 'C (4 pts): Conventional detector optimization - More sensitive MS, or improved DAD (technical iteration)' },
          { value: 'traditional-detector', score: 0, label: 'D (0 pts): Traditional detector - Common UV, RI (refractive index), FID (flame ionization detector)' }
        ]
      },
      {
        id: 'q5',
        moduleId: 'miniaturization-detection',
        question: 'Q5: Material Science Breakthrough - Whether column filler and sensing coating have material science breakthroughs?',
        type: 'input',
        unit: 'score',
        formula: 'Score = 10 × I_mat',
        reference: {
          name: 'No data needed',
          url: '#'
        },
        scoringRules: [
          { score: 10, description: '10 pts: Custom new materials - Using MOFs (metal-organic frameworks), COFs, molecularly imprinted composite materials (MIPs) or graphene quantum dots and other pre-made materials' },
          { score: 6, description: '6 pts: High-performance business materials - Sub-2um silica particles, core-shell structure, monolithic column (Monolith)' },
          { score: 2, description: '2 pts: Traditional business materials - Regular C18 silica column' },
          { score: 0, description: '0 pts: No material dependency - Simple liquid extraction or precipitation' }
        ]
      }
    ]
  },
  {
    id: 'green-separation',
    name: 'Green Design & Separation',
    nameEn: 'Green Substitution and Multi-dimensional Separation',
    focus: 'Environmental friendliness and separation technology advancement',
    questions: [
      {
        id: 'q6',
        moduleId: 'green-separation',
        question: 'Q6: On-line Sample Prep - Innovation in "eliminating steps". Sample preprocessing and analysis "seamless connection".',
        type: 'select',
        reference: {
          name: 'No data needed',
          url: '#'
        },
        options: [
          { value: 'fully-online', score: 10, label: 'A (10 pts): Fully online (In-line/On-line) - Direct solid-phase microextraction (SPME) with GC, or online SPE-LC, or direct flow-injection color development' },
          { value: 'offline-automated', score: 6, label: 'B (6 pts): Offline automation - Robot completes preprocessing, manual sample loading to instrument (has breakpoint)' },
          { value: 'fully-offline', score: 0, label: 'C (0 pts): Fully offline - Manual sampling, centrifugation, transfer before injection' }
        ]
      },
      {
        id: 'q7',
        moduleId: 'green-separation',
        question: 'Q7: Green Design Substitution - Whether innovation is to solve environmental problems. This examines the "new technology" substitution for "old toxic substances" ability.',
        type: 'input',
        unit: 'score',
        formula: 'Score = 10 × Substitution Level',
        reference: {
          name: 'Distinguish from green dimension evaluation',
          url: '#'
        },
        scoringRules: [
          { score: 10, description: '10 pts: Supercritical fluid (SFC) - Replacing organic solvents with CO₂ (principle-level substitution)' },
          { score: 8, description: '8 pts: Ionic liquid/deep eutectic solvent (DES) - Replacing traditional solvents with newly designed dissolution systems' },
          { score: 5, description: '5 pts: No solvent technology - Headspace injection or thermal desorption' },
          { score: 0, description: '0 pts: No substitution - Still using traditional liquids/gas solvent systems' }
        ]
      },
      {
        id: 'q8',
        moduleId: 'green-separation',
        question: 'Q8: Multi-dimensional Separation - Solves the problem of "separation limit" for complex systems (e.g., traditional Chinese medicine, protein group).',
        type: 'input',
        unit: 'score',
        formula: 'Score = 5 × (D - 1)',
        reference: {
          name: 'No data needed',
          url: '#'
        },
        scoringRules: [
          { score: 10, description: '10 pts: Comprehensive 2D/multi-dimensional (e.g., GCxGC, LCxLC) - Can present several times digital growth' },
          { score: 5, description: '5 pts: Heart-cutting 2D-LC - Only performs targeted fraction 2D separation' },
          { score: 0, description: '0 pts: 1D separation - Normal color spectrum' }
        ]
      }
    ]
  },
  {
    id: 'manufacturing-ip',
    name: 'Manufacturing & IP',
    nameEn: 'Additive Manufacturing and Intellectual Property',
    focus: '3D printing application and patent density',
    questions: [
      {
        id: 'q9',
        moduleId: 'manufacturing-ip',
        question: 'Q9: 3D Printing/Additive Manufacturing - Whether using the latest manufacturing technology to customize analytical devices.',
        type: 'select',
        reference: {
          name: 'No data needed',
          url: '#'
        },
        options: [
          { value: 'core-3d', score: 10, label: 'A (10 pts): Core component 3D printing - Printing microfluidic channels, printing chromatographic column beds, customized reaction chambers' },
          { value: 'peripheral-3d', score: 5, label: 'B (5 pts): Peripheral component 3D printing - Printing supports, shells, adapters (DIY modification)' },
          { value: 'traditional-mfg', score: 0, label: 'C (0 pts): Traditional manufacturing - Mold injection or mechanical processing' }
        ]
      },
      {
        id: 'q10',
        moduleId: 'manufacturing-ip',
        question: 'Q10: Patent and Intellectual Property Intensity (IP Intensity) - The most direct innovation indicator.',
        type: 'input',
        unit: 'count',
        formula: 'Score = min(10, 5 × N_patent)',
        reference: {
          name: 'Check Google Patents / Espacenet',
          url: 'https://patents.google.com'
        },
        scoringRules: [
          { score: 10, description: '10 pts: Core technology owns ≥ 2 issued patents' },
          { score: 5, description: '5 pts: Core technology owns 1 issued patent' },
          { score: 0, description: '0 pts: Using existing public knowledge (Public Domain), no patents applied to any patent office' }
        ]
      }
    ]
  }
];
