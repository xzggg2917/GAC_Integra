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
  referenceTable?: string
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

export const orangeCircularModules: Module[] = [
  {
    id: 'qualitative-assessment',
    name: 'Qualitative Assessment',
    nameEn: 'Qualitative Assessment',
    focus: 'Material Provenance and End-of-life Hierarchy',
    questions: [
      {
        id: 'q1',
        moduleId: 'qualitative-assessment',
        question: 'Q1: Material Provenance - Evaluate the initial source of the main reagents or consumables used in the procedure, considering whether they are renewable bio-based resources or non-renewable resources',
        type: 'select',
        options: [
          { value: '100', label: 'A: 100% from renewable sources or bio-mass feedstocks (e.g., biomass without competing with food)', score: 100 },
          { value: '75', label: 'B: ≥50% bio-based or fully proven post-consumer recycled (PCR)', score: 75 },
          { value: '50', label: 'C: Derived from internal lab recycling process (e.g., recovered petrochemicals)', score: 50 },
          { value: '25', label: 'D: Derived from non-renewable petrochemical but belongs to industrial by-products (e.g., ethylene)', score: 25 },
          { value: '0', label: 'E: Derived from virgin petrochemical resources with minimal recycled component', score: 0 }
        ]
      },
      {
        id: 'q2',
        moduleId: 'qualitative-assessment',
        question: 'Q2: End-of-life Hierarchy - Evaluate the end-of-life fate of the waste or by-products when they lose their use value, prioritizing natural or industrial cycles over landfill',
        type: 'select',
        options: [
          { value: '100', label: 'A: Natural component fully biodegraded into benign molecules (H₂O, CO₂), directly returned to the biosphere', score: 100 },
          { value: '75', label: 'B: Needs industrial composting or specific bio-stage but can ultimately return to nature', score: 75 },
          { value: '50', label: 'C: Inorganic degradation product, but can be reused through material management within industrial system (e.g., 100% closed-loop recovery)', score: 50 },
          { value: '25', label: 'D: No method for return, but can be converted via thermal/combustion energy recovery (e.g., energy recovery), with minimal toxic emissions', score: 25 },
          { value: '0', label: 'E: Belongs to long-lasting solid waste, must go through landfill or conversion handling, with potential long-term harm', score: 0 }
        ]
      }
    ]
  },
  {
    id: 'quantitative-assessment',
    name: 'Quantitative Assessment',
    nameEn: 'Quantitative Assessment',
    focus: 'Circular Loop Index, Biomass Substitution Intensity, Ecosystem Integration Potential',
    questions: [
      {
        id: 'q3',
        moduleId: 'quantitative-assessment',
        question: 'Q3: Circular Loop Index (CLI) - Measure the single-time recovery rate of core materials and the maximum theoretical reuse cycles under non-degraded performance conditions',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'R',
            label: 'R (Single-time Recovery Rate)',
            unit: 'decimal',
            placeholder: 'Enter the core material single recovery rate (0 ≤ R ≤ 1). Example: 0.7 represents 70% recovery',
            min: 0,
            max: 1
          },
          {
            name: 'N',
            label: 'N (Maximum Reuse Cycles)',
            unit: 'times',
            placeholder: 'Enter the theoretical maximum reuse cycles without performance degradation. Example: Column can be reused 5 times, enter 5',
            min: 0
          }
        ],
        scoringRules: [
          { score: 100, description: 'Excellent: High recovery rate with multiple sustainable reuse cycles' },
          { score: 60, description: 'Good: Moderate recovery with adequate reuse potential' },
          { score: 30, description: 'Fair: Low recovery rate or limited reuse cycles' },
          { score: 0, description: 'Poor: Negligible recovery or single-use only' }
        ]
      },
      {
        id: 'q4',
        moduleId: 'quantitative-assessment',
        question: 'Q4: Biomass Substitution Intensity (BSI) - Measure the proportion of non-fossil carbon (bio-carbon, captured CO₂ etc.) in the material and the natural regeneration cycle time of the feedstock',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'Fb',
            label: 'Fb (Sustainable Carbon Fraction)',
            unit: 'decimal',
            placeholder: 'Enter the proportion of non-fossil carbon (0≤Fb≤1). 1.0=full biomass, 0=full petroleum',
            min: 0,
            max: 1
          },
          {
            name: 'Tr',
            label: 'Tr (Regeneration Period)',
            unit: 'year',
            placeholder: 'Enter the natural feedstock recovery time (years). For fossil energy sources, considered non-renewable',
            min: 0
          }
        ],
        referenceTable: `<table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background: rgba(0,0,0,0.05);">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Level</th>
              <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd; font-weight: 600;">Fb Value</th>
              <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd; font-weight: 600;">Tr Value</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Typical Material Description</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Common Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: rgba(0,0,0,0.02);">
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L1: Rapid-growth</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">1.0</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">0.5</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Agricultural waste/fast-growing crops</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Straw, algae</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L2: Standard biomass</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">1.0</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">1.0</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Annual crop fermentation products</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Bioethanol</td>
            </tr>
            <tr style="background: rgba(0,0,0,0.02);">
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L3: Long-cycle biomass</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">0.9</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">20.0</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Multi-year woody plant resources</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Pine, hardwood</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L4: High-mix composite</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">0.7</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">10.0</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Recycled materials with biomass blends</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Recycled/assisted materials</td>
            </tr>
            <tr style="background: rgba(0,0,0,0.02);">
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L5: Partial recycled</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">0.5</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">15.0</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Partial recycling industrial chemicals</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Recovery chemical solvents</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L6: Petrochemical</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">0.3</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">25.0</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Industrial petrochemical by-products</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Acetonitrile</td>
            </tr>
            <tr style="background: rgba(0,0,0,0.02);">
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L7: Low-grade petro</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">0.1</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">50.0</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Difficult-to-recycle or unstable petrochemicals</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Stone oil, biofuel waste</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L8: Fossil origin</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">0.05</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">100.0</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Direct high-purity petrochemical solvents</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Chloroform</td>
            </tr>
          </tbody>
        </table>`,
        scoringRules: [
          { score: 100, description: 'Excellent: High biomass content with rapid regeneration cycle' },
          { score: 60, description: 'Good: Moderate biomass substitution with acceptable regeneration time' },
          { score: 30, description: 'Fair: Limited biomass content or long regeneration period' },
          { score: 0, description: 'Poor: Fossil-based origin with no regeneration potential' }
        ]
      },
      {
        id: 'q5',
        moduleId: 'quantitative-assessment',
        question: 'Q5: Ecosystem Integration Potential (EIP) - Measure the biodegradation percentage in standard 28-day aerobic degradation tests and the environmental half-life for concentration reduction',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'D28',
            label: 'D28 (28-Day Degradation Rate)',
            unit: '%',
            placeholder: 'Enter 28-day aerobic degradation rate (%). Higher values indicate easier bio-mineralization',
            min: 0,
            max: 100
          },
          {
            name: 'Hlife',
            label: 'Hlife (Environmental Half-life)',
            unit: 'day',
            placeholder: 'Enter environmental half-life (days). Lower values indicate shorter environmental persistence',
            min: 0
          }
        ],
        referenceTable: `<table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background: rgba(0,0,0,0.05);">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Level</th>
              <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd; font-weight: 600;">D28 (%)</th>
              <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd; font-weight: 600;">Hlife (days)</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Environmental Pressure Description</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600;">Common Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: rgba(0,0,0,0.02);">
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L1: Instant integration</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">100</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">1</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Unstable, rapidly converts to harmless substances</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">No machine, oxidized gas</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L2: Excellent degradation</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">95</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">3</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Extremely easily utilized by microorganisms</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Ethanol, glycerol, glucose</td>
            </tr>
            <tr style="background: rgba(0,0,0,0.02);">
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L3: Bio-degradable</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">85</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">10</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Meets standard definition of biodegradability</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Methanol, propanol</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L4: Moderate degradation</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">65</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">30</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Lower environmental pressure</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Isopropanol, some ester solvents</td>
            </tr>
            <tr style="background: rgba(0,0,0,0.02);">
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L5: Difficult to degrade</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">45</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">60</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Requires specific environmental conditions to degrade</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Dichloroethane, epoxide</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L6: Slow degradation</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">20</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">90</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Certain stability exists in the environment</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Acetonitrile</td>
            </tr>
            <tr style="background: rgba(0,0,0,0.02);">
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L7: Extremely persistent</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">5</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">200</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Difficult to degrade, potentially accumulates in soft tissues</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Toluene, four chlorides</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">L8: Ultra-persistent</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">1</td>
              <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">365</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Extremely stable and toxic, hazardous to environment</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Chloroform</td>
            </tr>
          </tbody>
        </table>`,
        scoringRules: [
          { score: 100, description: 'Excellent: Rapid biodegradation with minimal environmental persistence' },
          { score: 60, description: 'Good: Moderate biodegradability with acceptable half-life' },
          { score: 30, description: 'Fair: Low biodegradation rate with extended environmental presence' },
          { score: 0, description: 'Poor: Highly persistent with extreme environmental stability' }
        ]
      }
    ]
  }
];
