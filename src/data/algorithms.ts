export interface Dimension {
  id: string;
  name: string;
  fullName: string;
  description: string;
  defaultWeight: number;
  color: string;
  role: string;
}

export const dimensions: Dimension[] = [
  { 
    id: 'green-ecology', 
    name: 'Green Ecology', 
    fullName: 'Environmental Guardian',
    description: 'Focuses on the direct environmental impact of analytical methods, evaluating the entire process from reagent selection to waste disposal. Emphasizes low toxicity, low energy consumption, and minimal waste generation (GAC 12 principles).',
    role: 'Environmental Guardian',
    defaultWeight: 15,
    color: '#10b981'
  },
  { 
    id: 'blue-practicality', 
    name: 'Blue Practicality', 
    fullName: 'Laboratory Steward',
    description: 'Focuses on whether methods are practical and affordable in routine laboratories. Determines if a method can be widely applied or remains confined to papers. Emphasizes cost-effectiveness, high throughput, and equipment accessibility (WAC practicality).',
    role: 'Laboratory Steward',
    defaultWeight: 12,
    color: '#3b82f6'
  },
  { 
    id: 'red-performance', 
    name: 'Red Performance', 
    fullName: 'Data Quality Gatekeeper',
    description: 'Focuses on the quality of analytical results. No matter how green a method is, it is meaningless if measurements are inaccurate. This represents traditional analytical chemistry validation metrics: accuracy, precision, and sensitivity.',
    role: 'Data Quality Gatekeeper',
    defaultWeight: 13,
    color: '#ef4444'
  },
  { 
    id: 'violet-innovation', 
    name: 'Violet Innovation', 
    fullName: 'Creative Designer',
    description: 'Focuses on whether methods introduce new insights or technological breakthroughs. Encourages breaking from traditional frameworks and rewards innovative designs with novelty, clever thinking, and technical advances.',
    role: 'Creative Designer',
    defaultWeight: 10,
    color: '#8b5cf6'
  },
  { 
    id: 'gray-industry', 
    name: 'Gray Industry', 
    fullName: 'Efficiency Engineer',
    description: 'Focuses on efficiency from laboratory to industrial production scale. Emphasizes input-output ratio, producing more effective products with minimal resources. Covers process efficiency, waste reduction, and production scale control.',
    role: 'Efficiency Engineer',
    defaultWeight: 11,
    color: '#6b7280'
  },
  { 
    id: 'yellow-society', 
    name: 'Yellow Society', 
    fullName: 'Safety Guardian',
    description: 'Focuses on human safety, evaluating whether operators face risks of explosion, poisoning, or carcinogenic exposure during experiments. Emphasizes operator safety, occupational health risks, and social responsibility.',
    role: 'Safety Guardian',
    defaultWeight: 11,
    color: '#eab308'
  },
  { 
    id: 'cyan-data', 
    name: 'Cyan Data', 
    fullName: 'Digital Navigator',
    description: 'Focuses on data reliability and compliance in the digital era. Ensures data integrity, traceability, and regulatory compliance (e.g., FDA requirements). Emphasizes ALCOA+ principles, digitalization level, and regulatory adherence.',
    role: 'Digital Navigator',
    defaultWeight: 10,
    color: '#06b6d4'
  },
  { 
    id: 'orange-circular', 
    name: 'Orange Circular', 
    fullName: 'Resource Regenerator',
    description: 'Focuses on the origin and destination of materials. Evaluates not only environmental protection but also whether resources come from renewable bio-based sources and can ultimately return to nature. Emphasizes biodegradability, renewable resources, and circular economy.',
    role: 'Resource Regenerator',
    defaultWeight: 10,
    color: '#f97316'
  },
  { 
    id: 'white-completeness', 
    name: 'White Completeness', 
    fullName: 'Gap Filler',
    description: 'Fills gaps in the evaluation framework to ensure comprehensive assessment. Addresses aspects not covered by other dimensions, making the overall evaluation more holistic and complete.',
    role: 'Gap Filler',
    defaultWeight: 8,
    color: '#e5e7eb'
  }
];
