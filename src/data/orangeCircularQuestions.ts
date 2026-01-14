export interface Question {
  id: string
  moduleId: string
  question: string
  type: 'input' | 'select'
  unit?: string
  formula?: string
  options?: { value: string; score: number; label: string }[]
  scoringRules?: { min?: number; max?: number; score: number; description: string }[]
}

export interface Module {
  id: string
  name: string
  nameEn: string
  focus: string
  questions: Question[]
}

export const orangeCircularModules: Module[] = [
  {
    id: 'mci',
    name: 'MCI',
    nameEn: 'Material Circularity Indicator',
    focus: 'Recovery, Reuse and Waste Destination',
    questions: [
      {
        id: 'q1',
        moduleId: 'mci',
        question: 'Q1: Solvent Recovery Rate - In this analytical method, are multiple organic solvents (e.g., mobile phase, extraction solvent) recovered or reused multiple times through condensation or other recovery methods?',
        type: 'input',
        unit: '%',
        formula: 'R_solvent = V_recycled/V_total × 100%',
        scoringRules: [
          { min: 40, score: 10, description: 'Direct score conversion (V: volume). Example: Recover 40% of solvent → 40 points' },
          { max: 0, score: 0, description: '0% recovery (disposable) → 0 points' }
        ]
      },
      {
        id: 'q2',
        moduleId: 'mci',
        question: 'Q2: Consumable Reuse Life (Columns/Tubes/SPEF Cartridges) - What is the average useful life (number of injections) of the core consumable materials for the test method?',
        type: 'select',
        options: [
          { value: '10', label: '> 1000 injections (High durability)', score: 10 },
          { value: '7.5', label: '500-1000 injections', score: 7.5 },
          { value: '5', label: '100-500 injections', score: 5 },
          { value: '2.5', label: '10-100 injections', score: 2.5 },
          { value: '0', label: 'Single use (Disposable/One-off)', score: 0 }
        ]
      },
      {
        id: 'q3',
        moduleId: 'mci',
        question: 'Q3: Material Properties of Auxiliary Consumables - What are the main materials of the auxiliary consumables used (e.g., caps, transfer tubes, sample bottles)?',
        type: 'select',
        options: [
          { value: '10', label: 'Glass or metal (can be cleaned indefinitely for reuse)', score: 10 },
          { value: '5', label: 'Biodegradable plastics (e.g., PLA) or plastics with established recycling pathways', score: 5 },
          { value: '0', label: 'One-time non-degradable plastics (PPPE) discarded directly', score: 0 }
        ]
      },
      {
        id: 'q4',
        moduleId: 'mci',
        question: 'Q4: End-of-Life Destination of Waste Liquids/Waste Materials - How are the waste materials generated after analysis ultimately disposed of?',
        type: 'select',
        options: [
          { value: '10', label: 'Internal recycling/regeneration (Recycle)', score: 10 },
          { value: '7.5', label: 'Energy recovery incineration (Energy Recovery)', score: 7.5 },
          { value: '2.5', label: 'Non-toxic incineration (Incineration)', score: 2.5 },
          { value: '0', label: 'Landfill or unknown destination', score: 0 }
        ]
      }
    ]
  },
  {
    id: 'bio-s',
    name: 'Bio-S',
    nameEn: 'Bio-renewability Score',
    focus: 'Based on bio-based carbon from renewable materials rather than petroleum-based materials',
    questions: [
      {
        id: 'q5',
        moduleId: 'bio-s',
        question: 'Q5: Bio-based Carbon Content of Solvents - For the main organic solvents (excluding water) used in the method, what is the average percentage of bio-based carbon (Bio-based Carbon)?',
        type: 'input',
        unit: '%',
        formula: 'Score = Σ(C_bio,i × φ_i)',
        scoringRules: [
          { min: 100, score: 10, description: 'Example: Using bioethanol (100% Bio) → 100 points' },
          { max: 0, score: 0, description: 'Example: Using ethanol (0% Bio) → 0 points' },
          { min: 50, max: 50, score: 10, description: 'Example: Using 50:50 ethanol/water (assuming water not counted) → 100 points (only machine-derived component calculated)' }
        ]
      },
      {
        id: 'q6',
        moduleId: 'bio-s',
        question: 'Q6: Renewable Certification of Reagents/Derivatives - For key chemical reagents (non-solvent types, e.g., indicator reagents, derivatization reagents), are all clearly certified as bio-based/renewable (e.g., FSC, RSB, USDA BioPreferred)?',
        type: 'select',
        options: [
          { value: '10', label: 'Has clear bio-based/renewable certification', score: 10 },
          { value: '5', label: 'Claimed to be natural source but not certified', score: 5 },
          { value: '0', label: 'Traditional petrochemical synthetic products', score: 0 }
        ]
      },
      {
        id: 'q7',
        moduleId: 'bio-s',
        question: 'Q7: Gas Source Properties - Are the carrier/auxiliary gases used (e.g., He, N₂, H₂, Ar) sources that can regenerate or are infinitely available without resource depletion?',
        type: 'select',
        options: [
          { value: '10', label: 'H₂ (electrolyzed water production) or N₂ (air separation enrichment, unlimited)', score: 10 },
          { value: '5', label: 'Ar (inert gas, air separation purification)', score: 5 },
          { value: '0', label: 'He (helium, non-renewable strategic resource)', score: 0 }
        ]
      }
    ]
  },
  {
    id: 'cf-lca',
    name: 'CF-LCA',
    nameEn: 'Carbon Footprint',
    focus: 'Low carbon and emissions throughout the life cycle',
    questions: [
      {
        id: 'q8',
        moduleId: 'cf-lca',
        question: 'Q8: Direct Energy Consumption per Analysis - How much direct electricity is consumed to complete one sample analysis cycle (from sample placement + instrument operation)?',
        type: 'input',
        unit: 'kWh',
        formula: 'E_sample = P_used×t / N_sample',
        scoringRules: [
          { max: 0.1, score: 10, description: '< 0.1 kWh (Low energy consumption)' },
          { min: 0.1, max: 0.5, score: 7.5, description: '0.1 - 0.5 kWh' },
          { min: 0.5, max: 1.5, score: 5, description: '0.5 - 1.5 kWh' },
          { min: 1.5, max: 5.0, score: 2.5, description: '1.5 - 5.0 kWh' },
          { min: 5.0, score: 0, description: '> 5.0 kWh (e.g., large NMR/long-term high-temperature ashing)' }
        ]
      },
      {
        id: 'q9',
        moduleId: 'cf-lca',
        question: 'Q9: Cleanliness of Laboratory Energy Structure - What is the main source of electricity used in the laboratory?',
        type: 'select',
        options: [
          { value: '10', label: '100% renewable energy (solar/wind direct supply)', score: 10 },
          { value: '7.5', label: 'Mixed grid but purchased green certificates (REC)', score: 7.5 },
          { value: '5', label: 'Ordinary municipal grid (Grid mix)', score: 5 },
          { value: '0', label: 'Self-provided coal/oil generator power supply', score: 0 }
        ]
      },
      {
        id: 'q10',
        moduleId: 'cf-lca',
        question: 'Q10: Comprehensive Carbon Footprint (LCA) Estimate - Combining consideration of production, transportation, and laboratory energy consumption, how much total CO₂e emissions per analysis is emitted?',
        type: 'select',
        options: [
          { value: '10', label: '< 50g CO₂e (Extremely low, like paper-based test strips)', score: 10 },
          { value: '7.5', label: '50g - 200g CO₂e (Routine high-efficiency liquid phase)', score: 7.5 },
          { value: '5', label: '200g - 1000g CO₂e', score: 5 },
          { value: '2.5', label: '1kg - 5kg CO₂e', score: 2.5 },
          { value: '0', label: '> 5kg CO₂e (High pollution high energy consumption process)', score: 0 }
        ]
      }
    ]
  }
]
