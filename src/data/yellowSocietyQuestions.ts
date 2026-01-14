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

export const yellowSocietyModules: Module[] = [
  {
    id: 'chemical-health',
    name: 'Chemical Health',
    nameEn: 'Chemical Toxicity and Occupational Health',
    focus: 'Based on GHS/CLP regulations for chemical hazard assessment (ToxPi core)',
    questions: [
      {
        id: 'q1',
        moduleId: 'chemical-health',
        question: 'Q1: CMR Substance Toxic Risk - Does the method use substances classified as CMR (Carcinogenic, Mutagenic, Reprotoxic)?',
        type: 'select',
        reference: {
          name: 'Check via PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov'
        },
        options: [
          { value: 'none', score: 10, label: 'No CMR substances' },
          { value: 'category2', score: 5, label: 'Contains CMR Category 2 substances (suspected carcinogenic), but in closed system' },
          { value: 'category1ab', score: 2.5, label: 'Contains CMR 1A/1B substances (confirmed carcinogenic, e.g., benzene, formaldehyde), and open operation' },
          { value: 'target', score: 0, label: 'Target analyte itself is highly carcinogenic and unprotected' }
        ]
      },
      {
        id: 'q2',
        moduleId: 'chemical-health',
        question: 'Q2: Acute Toxicity Composite Score - According to GHS labels, what is the acute toxicity "hazard" level for all reagents and signals?',
        type: 'input',
        unit: 'score',
        formula: 'Score = 100 - (50 × N_Danger) - (20 × N_Warning)',
        scoringRules: [
          { min: 100, score: 10, description: 'All reagents are "low toxicity/non-toxic" (no labels)' },
          { min: 50, max: 100, score: 5, label: 'Example: Used 1 "Danger" label reagent, score 50; Used 2, score 0' },
          { max: 50, score: 0, description: 'Involved and fatal extremely toxic substances (e.g., cyanide)' }
        ]
      },
      {
        id: 'q3',
        moduleId: 'chemical-health',
        question: 'Q3: Occupational Exposure Band (OEB Level) - What is the lowest protective level required for the method\'s reagents to control exposure risk?',
        type: 'select',
        reference: {
          name: 'Check OEB via GESTIS or NIOSH',
          url: 'https://limitvalue.ifa.dguv.de'
        },
        options: [
          { value: 'oeb1', score: 10, label: 'OEB 1 (non-toxic/non-irritant) - directly accessible and cross-flow pass' },
          { value: 'oeb2', score: 7.5, label: 'OEB 2 (low toxicity) - instrument direct or manual operation' },
          { value: 'oeb3', score: 5, label: 'OEB 3 (moderate) - must operate in ventilated hood (Fume Hood)' },
          { value: 'oeb4', score: 2.5, label: 'OEB 4 (high toxicity) - requires isolator or glove box' },
          { value: 'oeb5', score: 0, label: 'OEB 5 (extremely high) - requires full body entry protection' }
        ]
      },
      {
        id: 'q4',
        moduleId: 'chemical-health',
        question: 'Q4: Nanomaterial Safety - Does the method involve nanomaterials (Nanoparticles) handling? (Due to inhalable skin/lung penetration, higher risk than bulk materials)',
        type: 'select',
        options: [
          { value: 'none', score: 10, label: 'Does not involve nanomaterials' },
          { value: 'terminal', score: 8, label: 'Nanomaterials end-stage and liquid state (non-inhalable)' },
          { value: 'powder-precautions', score: 4, label: 'Involves nanopowder, but has special operation platform' },
          { value: 'open-powder', score: 0, label: 'Open handling of dry nanomaterials (extremely high inhalation risk)' }
        ]
      }
    ]
  },
  {
    id: 'process-safety',
    name: 'Process Safety',
    nameEn: 'Process Operation Safety',
    focus: 'OSI (Operator Safety Index) includes hazards such as explosion, high pressure, radiation',
    questions: [
      {
        id: 'q5',
        moduleId: 'process-safety',
        question: 'Q5: Extreme Condition Risk Score - Is the analysis process subjected to high temperature, high pressure, or high voltage hazard conditions?',
        type: 'checkbox',
        formula: 'Score = 100 - ΣP_i',
        scoringRules: [
          { score: 10, description: 'Normal pressure operation (e.g., paper chromatography, simple titration)' },
          { score: 8, description: 'Conventional heating (water bath) or conventional HPLC pressure' },
          { score: 6, description: 'UHPLC ultra-high pressure or GC inlet high temperature' },
          { score: 0, description: 'Simultaneously involves high-temperature high-pressure environment (e.g., microwave digestion without explosion-proof safety valve) or radioactive ion source ignition risk' }
        ],
        options: [
          { value: 'high-temp', score: 20, label: 'High temperature (>150°C): 20 points' },
          { value: 'high-pressure', score: 20, label: 'High pressure (>50bar): 20 points' },
          { value: 'high-voltage', score: 20, label: 'High voltage (>1kV): 20 points' },
          { value: 'ignition', score: 40, label: 'Ignition: 40 points' }
        ]
      },
      {
        id: 'q6',
        moduleId: 'process-safety',
        question: 'Q6: Solvent Volatility and Ignitability - What is the flash point (Flash Point) risk of the main solvent used?',
        type: 'select',
        reference: {
          name: 'Check Flash Point',
          url: 'http://www.basechem.org'
        },
        options: [
          { value: 'aqueous', score: 10, label: 'Aqueous solvent (non-flammable)' },
          { value: 'high-fp', score: 7.5, label: 'High flash point solvent (>60°C, e.g., DMSO), non-volatile' },
          { value: 'moderate-fp', score: 5, label: 'Flammable solvent (flash point <23°C, e.g., methanol/ethylene glycol), but in closed container' },
          { value: 'extremely-fp', score: 0, label: 'Extremely flammable solvent (e.g., diethyl ether/n-hexane) and involves open flame/heating operations' }
        ]
      },
      {
        id: 'q7',
        moduleId: 'process-safety',
        question: 'Q7: Sensory Impact - Does the operation produce harmful gas or odor that makes operators uncomfortable, affecting work peace of mind?',
        type: 'select',
        options: [
          { value: 'odorless', score: 10, label: 'Completely odorless' },
          { value: 'mild-chemical', score: 7, label: 'Has mild chemical smell or instrument noise' },
          { value: 'unpleasant', score: 3, label: 'Unpleasant smell (e.g., using ammonia, trimethylamine) or obvious irritating noise (e.g., ultrasonic loudness)' },
          { value: 'requires-ppe', score: 0, label: 'Requires protective mask to prevent inhalation or earplugs for work' }
        ]
      }
    ]
  },
  {
    id: 'social-ethics',
    name: 'Social Ethics',
    nameEn: 'Social Ethics and Responsibility',
    focus: 'S-LCA (Social Life Cycle Assessment), supply chain ethical issues',
    questions: [
      {
        id: 'q8',
        moduleId: 'social-ethics',
        question: 'Q8: Conflict Minerals and Critical Resources - In instrument consumption consumables (digestion vessels), is it inevitable to use 3TG (tin, tantalum, tungsten, gold) or conflict minerals?',
        type: 'select',
        options: [
          { value: 'none', score: 10, label: 'Does not involve trial resources, or supply chain guarantees RMI (Responsible Minerals Initiative) certification' },
          { value: 'minimal', score: 5, label: 'Contains a small amount of rare metals (e.g., gold electrodes), source unclear' },
          { value: 'conflict', score: 0, label: 'Used from source risk conflict minerals (e.g., tantalum ore cannot be verified origin)' }
        ]
      },
      {
        id: 'q9',
        moduleId: 'social-ethics',
        question: 'Q9: Animal Welfare - If it is biological analysis, is it based on animal experimental reagent testing?',
        type: 'select',
        options: [
          { value: 'full-3r', score: 10, label: 'Complete non-animal source (synthetic antibody, recombinant protein, chemical testing)' },
          { value: 'animal-derived', score: 7, label: 'Uses animal-derived reagents (e.g., bovine serum albumin BSA), but seeks alternative products' },
          { value: 'limited-testing', score: 3, label: 'No real-time experimental animals obtained samples (e.g., small scale tissue sections)' },
          { value: 'extensive-testing', score: 0, label: 'Involves long-term live animal experiments or high-spec animal experiments' }
        ]
      },
      {
        id: 'q10',
        moduleId: 'social-ethics',
        question: 'Q10: Dual-Use Concern - Are the high-purity chemical products used difficult to control as "dual-use precursors" or "military dual-use chemicals," causing social security concerns?',
        type: 'input',
        unit: 'score',
        formula: 'Score = 100 - (30 × N_Precursor)',
        scoringRules: [
          { min: 100, score: 10, description: 'All reagents are general commercial products' },
          { min: 70, max: 100, score: 7, description: 'Involves Class III control reagents (e.g., iodine, sulfuric acid, propanol)' },
          { min: 40, max: 70, score: 4, description: 'Involves Class I/II control reagents (e.g., ether, three methyl bromide)' },
          { max: 40, score: 0, description: 'Involves highly controlled chemical weapons although legal public welfare chemicals' }
        ]
      }
    ]
  }
];
