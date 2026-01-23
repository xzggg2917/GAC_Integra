export interface Question {
  id: string;
  moduleId: string;
  question: string;
  type: 'input' | 'select' | 'multi-input';
  unit?: string;
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

export const cyanDataModules: Module[] = [
  {
    id: 'qualitative-assessment',
    name: 'Qualitative Assessment',
    nameEn: 'Compliance & Identity Management',
    focus: 'Evaluating data lifecycle compliance and identity authentication systems',
    questions: [
      {
        id: 'q1',
        moduleId: 'qualitative-assessment',
        question: 'Q1: Data Lifecycle Compliance Management (ALCOA+ Compliance) - Evaluates whether data collection, processing, and reporting follow ALCOA+ principles (Attributable, Legible, Contemporaneous, Original, Accurate, Complete, Consistent, Enduring, Available) throughout the entire lifecycle',
        type: 'select',
        options: [
          { 
            value: 'A', 
            score: 100, 
            label: 'A (100 pts): Fully automated electronic management system established; all data meets ALCOA+ international standards with automated verification mechanisms; strictly prevents retrospective data processing' 
          },
          { 
            value: 'B', 
            score: 75, 
            label: 'B (75 pts): Majority of process meets standards, but with critical gaps (e.g., data transfer) requiring secondary manual verification; exists in a semi-manual recording to electronic record transition' 
          },
          { 
            value: 'C', 
            score: 50, 
            label: 'C (50 pts): Only final report stage meets compliance requirements; intermediate process lacks data traceability or equipment preparation inconsistencies; lacks system-level integrity assurance' 
          },
          { 
            value: 'D', 
            score: 25, 
            label: 'D (25 pts): Data management is chaotic; synchronization is poor (exists as post-supplement records); definition patterns of original records (Raw Data) are ambiguous; difficult to support complete audit trail' 
          },
          { 
            value: 'E', 
            score: 0, 
            label: 'E (0 pts): Completely dependent on paper quality records or uncontrolled electronic files; data can be arbitrarily modified and untraceably altered' 
          }
        ]
      },
      {
        id: 'q2',
        moduleId: 'qualitative-assessment',
        question: 'Q2: User Identity Authentication & Electronic Signature System (Identity & e-Signature) - Evaluates whether system access control and electronic signatures have legal validity (reference FDA 21 CFR Part 11)',
        type: 'select',
        options: [
          { 
            value: 'A', 
            score: 100, 
            label: 'A (100 pts): Implements strict role-based access control (RBAC); features biometric identification or dual authentication; electronic signatures linked to actual operational bindings; tamper-proof' 
          },
          { 
            value: 'B', 
            score: 75, 
            label: 'B (75 pts): Has hierarchical permission management and personal account system; supports electronic signatures but name change processes and some auxiliary operations have related contacts not fully satisfied' 
          },
          { 
            value: 'C', 
            score: 50, 
            label: 'C (50 pts): Has basic account registration mechanism but actual operation may have shared account possibility; or electronic signatures are simply text marks' 
          },
          { 
            value: 'D', 
            score: 25, 
            label: 'D (25 pts): Only operates as system-level password protection; no professional software permission separation; signature names are mainly dependent on physical document seal supplementation or paper-quality seal' 
          },
          { 
            value: 'E', 
            score: 0, 
            label: 'E (0 pts): Open work station; no login control; multiple persons share one anonymous account for operations' 
          }
        ]
      }
    ]
  },
  {
    id: 'quantitative-assessment',
    name: 'Quantitative Assessment',
    nameEn: 'Digital Transfer, Audit & Redundancy Metrics',
    focus: 'Quantifying data integrity, audit trail vigilance, and metadata completeness with redundancy safety',
    questions: [
      {
        id: 'q3',
        moduleId: 'quantitative-assessment',
        question: 'Q3: Digital Transfer & Integrity Index - Evaluates the defense against "tampering" in data transmission through the degree of automated data direct transfer compared to manual pre-save steps',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'x',
            label: 'x (Automated Ratio)',
            unit: '%',
            placeholder: 'Enter the percentage of raw data directly transferred to receiver database via instrument interface (e.g., LIMS) (0 ≤ x ≤ 100)',
            min: 0,
            max: 100
          },
          {
            name: 'y',
            label: 'y (Manual Intervention Steps)',
            unit: 'steps',
            placeholder: 'Enter the number of manual operations (calculations, format conversions, manual input steps) required during data processing and summary (0 ≤ y ≤ 10)',
            min: 0,
            max: 10
          }
        ],
        scoringRules: [
          { score: 100, description: 'Perfect: 100% automated direct transfer with zero manual intervention' },
          { score: 60, description: 'Good: High automation with minimal manual steps' },
          { score: 30, description: 'Fair: Moderate automation with some manual processing' },
          { score: 0, description: 'Poor: Heavy manual intervention or low automation' }
        ]
      },
      {
        id: 'q4',
        moduleId: 'quantitative-assessment',
        question: 'Q4: Audit Trail Vigilance Score - Evaluates the comprehensive effectiveness of opening coverage and its sustained active verification dynamism for Audit Trail functionality',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'x',
            label: 'x (Audit Trail Coverage)',
            unit: '%',
            placeholder: 'Enter the percentage of key system parameters/methods modified under actual monitoring (0 ≤ x ≤ 100)',
            min: 0,
            max: 100
          },
          {
            name: 'y',
            label: 'y (Review Frequency)',
            unit: 'times/quarter',
            placeholder: 'Enter the number of times per quarter (quarterly) quality managers formally verify and spot-check audit logs (0 ≤ y ≤ 12; if exceeding 12 times, count as 12)',
            min: 0,
            max: 12
          }
        ],
        scoringRules: [
          { score: 100, description: 'Excellent: Comprehensive audit trail coverage with frequent active verification' },
          { score: 60, description: 'Good: Good coverage with regular reviews' },
          { score: 30, description: 'Fair: Limited coverage or infrequent reviews' },
          { score: 0, description: 'Poor: Minimal audit trail or no active verification' }
        ]
      },
      {
        id: 'q5',
        moduleId: 'quantitative-assessment',
        question: 'Q5: Metadata Completeness & Data Redundancy Safety (Metadata & Redundancy Index) - Evaluates the information context completeness in data backend storage and the survival capability under unexpected situations',
        type: 'multi-input',
        multiInputFields: [
          {
            name: 'x',
            label: 'x (Key Metadata Dimensions)',
            unit: 'dimensions',
            placeholder: 'Enter the total number of items for "key element data" associated with a single data file (e.g., environmental temperature/humidity, pressure, flow rate, personnel information, equipment calibration status, etc.) (0 < x ≤ 10)',
            min: 0,
            max: 10
          },
          {
            name: 'y',
            label: 'y (Physical Redundancy Independence)',
            unit: 'level',
            placeholder: 'Enter the data backup physical independence indicator (defined: local device as 1, server off-site backup as 2, off-site/cloud cold backup as 3, maximum value 3)',
            min: 1,
            max: 3
          }
        ],
        scoringRules: [
          { score: 100, description: 'Excellent: Comprehensive metadata with multiple independent backup layers' },
          { score: 60, description: 'Good: Good metadata coverage with adequate backup redundancy' },
          { score: 30, description: 'Fair: Basic metadata with limited backup' },
          { score: 0, description: 'Poor: Minimal metadata or insufficient backup safety' }
        ]
      }
    ]
  }
];
