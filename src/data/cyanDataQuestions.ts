export interface Question {
  id: string
  text: string
  type: 'input' | 'select' | 'checkbox'
  maxScore: number
  options?: Array<{ value: string; label: string; score: number }>
  checkboxOptions?: Array<{ id: string; label: string; score: number }>
  formula?: string
  note?: string
  referenceUrl?: string
}

export interface QuestionModule {
  id: string
  name: string
  description: string
  questions: Question[]
}

export const cyanDataQuestions: QuestionModule[] = [
  {
    id: 'module1',
    name: 'DQI',
    description: 'Data Quality & Integrity - Data Legal Personality',
    questions: [
      {
        id: 'Q1',
        text: 'Q1: Paperless Ratio - From sample collection to final COA, are multiple steps fully electronic (LIMS/ELN) with no paper records?',
        type: 'select',
        maxScore: 10,
        formula: 'R_dig = (N_electronic / N_total_steps) × 100%',
        note: 'N_total_steps typically includes: sample collection, weighing, preparation, instrument transfer, data processing, review, batch release',
        options: [
          { value: '100', label: '100%: Full electronic (Full LIMS + ELN + E-signature)', score: 10 },
          { value: '75', label: '>80%: Instrument verified paperless, but requires printed signatures', score: 7.5 },
          { value: '50', label: '50%-80%: Hybrid mode, key data electronized', score: 5 },
          { value: '25', label: '<50%: Mainly paper-based records', score: 2.5 },
          { value: '0', label: '0%: Fully manual paper records', score: 0 }
        ]
      },
      {
        id: 'Q2',
        text: 'Q2: Audit Trail Coverage - Does the system automatically record modification history (timestamps, parameters, curve modifications, reintegration) for critical data?',
        type: 'select',
        maxScore: 10,
        note: 'Based on FDA 21 CFR Part 11 compliance classification',
        options: [
          { value: '100', label: 'Complete & mandatory audit trail: Who, When, Old Value, New Value, Reason for Modification', score: 10 },
          { value: '75', label: 'Enabled, but modification reason is not mandatory', score: 7.5 },
          { value: '50', label: 'Feature exists, but admin can disable or rotate logs', score: 5 },
          { value: '0', label: 'No audit trail, or using stand-alone software with modifiable system time', score: 0 }
        ]
      },
      {
        id: 'Q3',
        text: 'Q3: Security Level - Is your system protected by role-based access control (RBAC) preventing unauthorized operations?',
        type: 'select',
        maxScore: 10,
        note: 'Typical case evaluation method',
        options: [
          { value: '100', label: 'Three-level isolation (Admin/Analyst/Reviewer), independent accounts, mandatory password update', score: 10 },
          { value: '60', label: 'Has account passwords, but shared accounts exist (e.g., everyone uses "Admin")', score: 6 },
          { value: '30', label: 'Only system boot password, no independent software login', score: 3 },
          { value: '0', label: 'No protection, anyone can operate', score: 0 }
        ]
      }
    ]
  },
  {
    id: 'module2',
    name: 'Chem-S',
    description: 'Chemometric Score - Algorithm Substitutes Chemistry',
    questions: [
      {
        id: 'Q4',
        text: 'Q4: Algorithmic Resolution - In mass spectrometry or chromatography, are numerous interfering substances resolved through chemometric algorithms (e.g., MCR-ALS, blind source separation) rather than physical/chromatographic separation?',
        type: 'input',
        maxScore: 10,
        formula: 'Score = (N_calc / N_total_analytes) × 100 + α',
        note: 'α is a bonus coefficient. If no theoretical processing is performed before direct injection, deduct 20 points (capped at 100). Scoring criteria: 100 pts: Full spectral analysis (e.g., NIR prediction), no physical separation, complete algorithmic qualitative/quantitative; 75 pts: Partially overlapping peaks resolved via algorithms (e.g., DAD purity analysis deconvolution), avoiding mobile phase optimization; 50 pts: Simple background subtraction algorithm used; 0 pts: Must rely on complete physical baseline separation for quantification'
      },
      {
        id: 'Q5',
        text: 'Q5: Calibration Model Complexity & Intelligence - What type of calibration model is used to calculate all results?',
        type: 'select',
        maxScore: 10,
        note: 'Algorithm sophistication classification',
        options: [
          { value: '100', label: 'Multivariate calibration (PLS/PCR/ANN) - extracts nonlinear relationships from high-dimensional data, strong matrix effect resistance', score: 10 },
          { value: '80', label: 'Weighted Least Squares - accounts for heteroscedasticity', score: 8 },
          { value: '60', label: 'Linear Regression - standard external standard method', score: 6 },
          { value: '40', label: 'Single Point calibration - precision risk', score: 4 },
          { value: '0', label: 'Normalization (no standard sample) - reference only', score: 0 }
        ]
      },
      {
        id: 'Q6',
        text: 'Q6: Signal Enhancement Algorithm Application - Are numerical algorithms (e.g., Savitzky-Golay, Fourier Transform) used to enhance signal-to-noise ratio, thereby reducing dependence on high-sensitivity instrument hardware?',
        type: 'select',
        maxScore: 10,
        note: 'Case evaluation',
        options: [
          { value: '100', label: 'Yes, algorithm-based SNR enhancement significantly reduces high-sensitivity hardware dependence (LOD >10x improvement)', score: 10 },
          { value: '50', label: 'Yes, minor smoothing applied', score: 5 },
          { value: '0', label: 'No, fully dependent on raw hardware signal', score: 0 }
        ]
      }
    ]
  },
  {
    id: 'module3',
    name: 'Dig-I',
    description: 'Digitalization & Interoperability - Connectivity & Universality',
    questions: [
      {
        id: 'Q7',
        text: 'Q7: Data Format Interoperability - Does the raw data support export in non-proprietary, universally exchangeable formats?',
        type: 'select',
        maxScore: 10,
        note: 'Based on FAIR principle data readability',
        options: [
          { value: '100', label: 'Supports industry-standard formats (e.g., AnIML, mzML, JCAMP-DX, CSV)', score: 10 },
          { value: '70', label: 'Exports as PDF or Excel (data points only, metadata lost)', score: 7 },
          { value: '30', label: 'Only proprietary formats supported (e.g., .raw, .wiff), must use vendor-specific software', score: 3 },
          { value: '0', label: 'Data encrypted or cannot be exported', score: 0 }
        ]
      },
      {
        id: 'Q8',
        text: 'Q8: LIMS/ERP System Integration - How are data transferred between instrument software and laboratory management systems (LIMS)?',
        type: 'select',
        maxScore: 10,
        note: 'Transfer automation level',
        options: [
          { value: '100', label: 'Bi-directional communication - LIMS auto-dispatches tasks, instrument auto-uploads results', score: 10 },
          { value: '70', label: 'Uni-directional upload - Instrument auto-uploads results, but manual sequence building required', score: 7 },
          { value: '30', label: 'Manual file export and upload (File Transfer)', score: 3 },
          { value: '0', label: 'Manual transcription data entry - extremely high error risk', score: 0 }
        ]
      },
      {
        id: 'Q9',
        text: 'Q9: Metadata Completeness - Do data files automatically encapsulate complete experimental context metadata (not just results, but also sample ID, operator, instrument status, time, method, operating conditions)?',
        type: 'input',
        maxScore: 10,
        formula: 'Score = (N_logged / N_required) × 100',
        note: 'N_required key fields: Time, Personnel, Machine, Material, Method, Environment. Scoring criteria: 100 pts: Fully automatic capture of all metadata (Full Context); 50 pts: Only basic acquisition time and method name, lacks instrument status details; 0 pts: Only final charts/results, all process parameters lost'
      },
      {
        id: 'Q10',
        text: 'Q10: Remote Monitoring & IoT Capability - Does this method support real-time status monitoring or fault diagnosis in non-laboratory environments?',
        type: 'select',
        maxScore: 10,
        note: 'Typical case evaluation',
        options: [
          { value: '100', label: 'Supports mobile app real-time viewing of spectra, remaining time, and remote error alerts (multi-person notification)', score: 10 },
          { value: '50', label: 'Only supports local network remote desktop control (Remote Desktop)', score: 5 },
          { value: '0', label: 'Personnel must be on-site at the instrument (Stand-alone)', score: 0 }
        ]
      }
    ]
  }
]
