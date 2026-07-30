import { Mindmap } from '@visualli/shared';

export const mockSoftwareArchitectureMindmap: Mindmap = {
  title: 'Microservices vs Monolith Architecture',
  rootId: 'root-node',
  nodes: [
    {
      id: 'root-node',
      label: 'Software Architecture',
      summary: 'High-level structure and system design decisions for scaling web platforms.',
      isRoot: true,
    },
    {
      id: 'node-monolith',
      label: 'Monolithic Systems',
      summary: 'Single unified codebase easy to test and deploy initially but harder to scale across teams.',
    },
    {
      id: 'node-microservices',
      label: 'Microservices Architecture',
      summary: 'Decoupled services communicating over network RPC/REST, offering independent scaling and deployment.',
    },
    {
      id: 'node-databases',
      label: 'Database Strategy',
      summary: 'Choosing between shared database anti-pattern and database-per-service isolation.',
    },
    {
      id: 'node-devops',
      label: 'DevOps & CI/CD',
      summary: 'Automated build, test, and release pipelines to maintain reliability.',
    },
    {
      id: 'node-observability',
      label: 'Observability & Telemetry',
      summary: 'Centralized logging, distributed tracing, and metrics for runtime health tracking.',
    },
  ],
  connections: [
    { id: 'conn-1', from: 'root-node', to: 'node-monolith', label: 'traditional approach' },
    { id: 'conn-2', from: 'root-node', to: 'node-microservices', label: 'modern distributed pattern' },
    { id: 'conn-3', from: 'node-monolith', to: 'node-databases', label: 'uses' },
    { id: 'conn-4', from: 'node-microservices', to: 'node-databases', label: 'isolates' },
    { id: 'conn-5', from: 'node-microservices', to: 'node-devops', label: 'requires' },
    { id: 'conn-6', from: 'node-microservices', to: 'node-observability', label: 'monitors' },
  ],
};

export const mockAiMlMindmap: Mindmap = {
  title: 'Artificial Intelligence & Machine Learning Overview',
  rootId: 'ai-root',
  nodes: [
    {
      id: 'ai-root',
      label: 'Artificial Intelligence',
      summary: 'Subfield of computer science building systems capable of intelligent human-like behavior.',
      isRoot: true,
    },
    {
      id: 'ml-node',
      label: 'Machine Learning',
      summary: 'Algorithms that learn statistical patterns from datasets without explicit step-by-step programming.',
    },
    {
      id: 'dl-node',
      label: 'Deep Learning',
      summary: 'Multi-layer neural network architectures capable of feature extraction from complex unstructured data.',
    },
    {
      id: 'llm-node',
      label: 'Large Language Models',
      summary: 'Transformer-based models trained on massive text corpora for text understanding and generation.',
    },
    {
      id: 'eval-node',
      label: 'Evaluation & Benchmarks',
      summary: 'Systematic testing of model accuracy, alignment, and structured output schema compliance.',
    },
    {
      id: 'app-node',
      label: 'Production Applications',
      summary: 'Deploying model endpoints into APIs, user interfaces, and automated agent workflows.',
    },
  ],
  connections: [
    { id: 'c1', from: 'ai-root', to: 'ml-node', label: 'core branch' },
    { id: 'c2', from: 'ml-node', to: 'dl-node', label: 'subset' },
    { id: 'c3', from: 'dl-node', to: 'llm-node', label: 'powers' },
    { id: 'c4', from: 'llm-node', to: 'eval-node', label: 'assessed by' },
    { id: 'c5', from: 'llm-node', to: 'app-node', label: 'integrated into' },
  ],
};

export const mockGeneralMindmap: Mindmap = {
  title: 'Key Concepts Summary',
  rootId: 'gen-root',
  nodes: [
    {
      id: 'gen-root',
      label: 'Core Topic Overview',
      summary: 'A structured breakdown of the primary concepts identified in the provided text.',
      isRoot: true,
    },
    {
      id: 'gen-node-1',
      label: 'Primary Objective',
      summary: 'The main goal or driving strategy defined in the source text.',
    },
    {
      id: 'gen-node-2',
      label: 'Key Components',
      summary: 'The foundational elements and modules building up the system.',
    },
    {
      id: 'gen-node-3',
      label: 'Implementation Steps',
      summary: 'Practical sequence of actions necessary for execution.',
    },
    {
      id: 'gen-node-4',
      label: 'Expected Outcomes',
      summary: 'Measurable benefits and deliverables produced upon completion.',
    },
    {
      id: 'gen-node-5',
      label: 'Risk Mitigation',
      summary: 'Potential pitfalls identified alongside strategic solutions.',
    },
  ],
  connections: [
    { id: 'g1', from: 'gen-root', to: 'gen-node-1', label: 'defines' },
    { id: 'g2', from: 'gen-root', to: 'gen-node-2', label: 'contains' },
    { id: 'g3', from: 'gen-node-2', to: 'gen-node-3', label: 'guides' },
    { id: 'g4', from: 'gen-node-3', to: 'gen-node-4', label: 'delivers' },
    { id: 'g5', from: 'gen-node-3', to: 'gen-node-5', label: 'addresses' },
  ],
};

export const mockFixtures = [
  mockSoftwareArchitectureMindmap,
  mockAiMlMindmap,
  mockGeneralMindmap,
];
