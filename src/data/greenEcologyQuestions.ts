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

export const greenEcologyModules: Module[] = [
  {
    id: 'hazard-assessment',
    name: 'Hazard Assessment',
    nameEn: 'Chemical Hazard Evaluation',
    focus: 'Based on GHS hazard codes, evaluating reagent inherent risks',
    questions: [
      {
        id: 'q1',
        moduleId: 'hazard-assessment',
        question: 'Q1: Solvent Hazard Exponential Model - What are the GHS hazard codes on the reagent bottle label? (including metal salt formula)',
        type: 'select',
        formula: 'Score = 10 × exp(-Σφᵢ · α · Ncodes,i)',
        reference: {
          name: 'Check GHS Codes via PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov'
        },
        options: [
          { value: 'none', score: 10, label: 'Water (N = 0): 10 × e⁰ = 10 points' },
          { value: 'ethanol', score: 8.6, label: 'Ethanol (N = 1, flammable only): 10 × e⁻⁰·¹⁵ ≈ 8.6 points' },
          { value: 'ethyl-acetate', score: 6.4, label: 'Ethyl acetate (N = 3, flammable + harmful): 10 × e⁻⁰·⁴⁵ ≈ 6.4 points' },
          { value: 'chloroform', score: 4.7, label: 'Chloroform (N = 5, carcinogenic + toxic): 10 × e⁻⁰·⁷⁵ ≈ 4.7 points' }
        ]
      },
      {
        id: 'q2',
        moduleId: 'hazard-assessment',
        question: 'Q2: Bio-Carbon Weighted Ratio - Check reagent bottle label (for "Bio" mark) or raw material source knowledge?',
        type: 'select',
        formula: 'Score = 10 × Σ(mᵢ × Ibio,i) / mtotal_organic',
        reference: {
          name: 'Check Chemical Source via PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov'
        },
        options: [
          { value: 'all-bio', score: 10, label: 'All bio-based = 10 points' },
          { value: 'half-bio', score: 5, label: 'Partially bio-based (e.g., ethyl acetate, acetic acid can be bio-sourced) ≈ 5 points' },
          { value: 'all-petro', score: 0, label: 'All petroleum-based = 0 points' }
        ]
      },
      {
        id: 'q3',
        moduleId: 'hazard-assessment',
        question: 'Q3: Halogen Atmospheric Burden - Chemical molecular formula (check if there are F, Cl, Br in the formula)',
        type: 'input',
        unit: 'score',
        formula: 'Score = 10 × (1 - IVOC) + 10 × IVOC × e⁻⁽²·ᴺᶜˡ⁺¹·⁵·ᴺᴮʳ⁺⁰·¹·ᴺꜰ⁾',
        reference: {
          name: 'Check Molecular Formula via PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov'
        },
        scoringRules: [
          { min: 10, score: 10, description: 'Ethanol (C₂H₆O): No halogens, e⁰ = 1 → 10 points' },
          { min: 0.2, max: 10, score: 0.2, description: 'Dichloromethane (CH₂Cl₂): Contains 2 Cl, 10 × e⁻⁴ ≈ 0.2 points (severe penalty)' },
          { min: 7.4, max: 10, score: 7.4, description: 'Trifluoroacetic acid (CF₃COOH): Contains 3 F, 10 × e⁻⁰·³ ≈ 7.4 points (fluorine has less ozone impact, mainly GWP, lighter penalty)' }
        ]
      },
      {
        id: 'q4',
        moduleId: 'hazard-assessment',
        question: 'Q4: Aquatic Toxicity Decay - Check reagent bottle label (for H400, H410, H411 codes)',
        type: 'select',
        formula: 'Score = 10 × (1 - max(LevelH4zz) / 4)²',
        reference: {
          name: 'Check H-Codes via PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov'
        },
        options: [
          { value: 'none', score: 10, label: 'No code: 10 × (1 - 0)² = 10 points' },
          { value: 'h411', score: 2.5, label: 'H411 (toxic): 10 × (1 - 0.5)² = 2.5 points' },
          { value: 'h400-h410', score: 0, label: 'H400/H410 (highly toxic/long-term toxic): 10 × (1 - 1)² = 0 points' }
        ]
      },
      {
        id: 'q5',
        moduleId: 'hazard-assessment',
        question: 'Q5: Structural Alert Index for Persistence - Chemical molecular formula',
        type: 'checkbox',
        formula: 'Score = 10 × ∏(1 - Pⱼ)',
        reference: {
          name: 'Check Chemical Structure via PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov'
        },
        options: [
          { value: 'pfas', score: 100, label: 'Fluorine atoms (NF ≥ 3): P = 1.0 (PFAS risk, direct zero) (-100 points)' },
          { value: 'aromatic-ring', score: 20, label: 'Aromatic ring (Cl on Ring): P = 0.2 (-20 points)' },
          { value: 'heavy-metal', score: 100, label: 'Heavy metal atoms (Hg, Pb, Cd): P = 1.0 (-100 points)' },
          { value: 'long-chain', score: 50, label: 'Long chain (C > 16): P = 0.5 (-50 points)' }
        ],
        scoringRules: [
          { score: 10, description: 'No structural alerts → 10 points' },
          { score: 0, description: 'Contains PFAS or heavy metals → 0 points' },
          { score: 8, description: 'Only aromatic ring → 8 points' },
          { score: 5, description: 'Contains long chain → 5 points' }
        ]
      }
    ]
  },
  {
    id: 'atom-economy',
    name: 'Atom Economy',
    nameEn: 'Atomic and Molecular Efficiency',
    focus: 'Evaluating atom utilization and waste generation',
    questions: [
      {
        id: 'q6',
        moduleId: 'atom-economy',
        question: 'Q6: Atom Economy Efficiency - Periodic table (calculate molecular weight MW)',
        type: 'input',
        unit: 'score',
        formula: 'Score = 10 × (MWproduct - MWwaste) / MWreagent',
        reference: {
          name: 'Check Molecular Weight via PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov'
        },
        scoringRules: [
          { min: 10, score: 10, description: 'Addition reaction (no waste), Score = 10' },
          { min: 5.8, max: 10, score: 5.8, description: 'Typical derivatization (e.g., silylation BSTFA, MW 257, releases trimethylsilanol MW 108): 10 × (257-108)/257 ≈ 5.8 points' }
        ]
      },
      {
        id: 'q7',
        moduleId: 'atom-economy',
        question: 'Q7: Bioaccumulation Potential Index - Design intent: Some reagents, although not lethal (Q4 pass), are "lipophilic" and easily accumulate in fish fat, eventually entering human body (e.g., DDT, certain organic solvents). We use Log P (octanol-water partition coefficient) to quantify this risk',
        type: 'input',
        unit: 'score',
        formula: 'Score = 10 × 1 / (1 + e^(α(LogPmax - β)))',
        reference: {
          name: 'Check Log P (Octanol/Water Partition Coefficient) via PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov'
        },
        scoringRules: [
          { max: 3, score: 10, description: 'LogPmax < 3: No significant bioaccumulation' },
          { min: 3, max: 5, score: 5, description: 'LogPmax 3-5: Environmental science generally considers Log P > 3 to have significant bioaccumulation' },
          { min: 5, score: 2, description: 'LogPmax > 5: High bioaccumulation risk' }
        ]
      }
    ]
  },
  {
    id: 'energy-emissions',
    name: 'Energy & Emissions',
    nameEn: 'Energy Consumption and Atmospheric Impact',
    focus: 'Clean energy usage and carbon footprint',
    questions: [
      {
        id: 'q8',
        moduleId: 'energy-emissions',
        question: 'Q8: Stoichiometric Eutrophication - Buffer salt chemical formula (count N and P atoms)',
        type: 'input',
        unit: 'score',
        formula: 'Score = 10 × e⁻⁽⁵·ᴺᴾ⁺¹·ᴺᴺ⁾',
        reference: {
          name: 'Check Chemical Formula via PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov'
        },
        scoringRules: [
          { min: 10, score: 10, description: 'Ethanol (C₂H₆O₁): NP = 0, NN = 0 → 10 × e⁰ = 10 points' },
          { min: 3.7, max: 10, score: 3.7, description: 'Ammonium acetate (CH₃COONH₄): NN = 1 → 10 × e⁻¹ ≈ 3.7 points' },
          { min: 0.06, max: 3.7, score: 0.06, description: 'Potassium dihydrogen phosphate (KH₂PO₄): NP = 1 → 10 × e⁻⁵ ≈ 0.06 points (close to 0)' }
        ]
      },
      {
        id: 'q9',
        moduleId: 'energy-emissions',
        question: 'Q9: Clean Energy Vector - Laboratory location city (common sense: hydroelectric-rich area or coal power area)',
        type: 'select',
        formula: 'Score = 10 × (Rlocal + δREC)',
        reference: {
          name: 'Check Local Energy Structure',
          url: 'https://www.iea.org'
        },
        options: [
          { value: 'hydro-nuclear', score: 8, label: 'Hydro/wind/nuclear power base (e.g., Yunnan, Jiuquan): 0.8' },
          { value: 'mixed-grid', score: 3, label: 'General mixed power grid (e.g., Yangtze River Delta, Pearl River Delta): 0.3' },
          { value: 'coal', score: 1, label: 'Pure coal power area (e.g., some mining cities): 0.1' }
        ]
      },
      {
        id: 'q10',
        moduleId: 'energy-emissions',
        question: 'Q10: Photochemical Smog Potential - Design intent: Some solvents (e.g., ethanol, acetone), although low GWP (not warming the earth) and low Ozone Depletion (not damaging stratospheric ozone), are extremely volatile and form "photochemical smog" (ground-level ozone) under sunlight, causing urban haze and plant death. This is the biggest hidden pollution source in analytical laboratories (using large amounts of organic solvents)',
        type: 'input',
        unit: '°C',
        formula: 'Score = 10 × 1 / (1 + e⁻ᵏ⁽ᵀᵇ⁻ᵀᵗʰʳᵉˢʰᵒˡᵈ⁾)',
        reference: {
          name: 'Check Boiling Point via ChemicalBook',
          url: 'https://www.chemicalbook.com'
        },
        scoringRules: [
          { min: 80, score: 10, description: 'Solvents with boiling point below 80°C (e.g., diethyl ether, acetone, dichloromethane) are considered highly volatile and are key contributors to photochemical pollution' },
          { max: 80, score: 5, description: '(For mixed solvents, use the lowest boiling point component value, following the "bottleneck effect")' }
        ]
      }
    ]
  }
];
