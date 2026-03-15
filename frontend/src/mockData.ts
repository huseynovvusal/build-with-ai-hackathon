export type Skill = 'Go' | 'Python' | 'Django' | 'React' | 'TypeScript' | 'Node.js' | 'Docker' | 'Kubernetes';

export interface Stats {
  commits: number;
  prs: number;
  issues: number;
  reviews: number;
  score: number;
}

export interface Member {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  skills: Skill[];
  contributionScore: number;
  stats: {
    weekly: Stats;
    monthly: Stats;
    lifetime: Stats;
  };
}

export interface ProjectProposal {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  suggestedMembers: string[]; // Member IDs
  requiredSkills: Skill[];
  initiatives: string[];
  technicalTips: string[];
  overallTips: string[];
}

export const mockMembers: Member[] = [
  {
    id: 'm1',
    name: 'Vusal',
    handle: '@vusal_dev',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vusal&backgroundColor=f1f5f9',
    skills: ['Go', 'Docker', 'Kubernetes'],
    contributionScore: 94,
    stats: {
      weekly: { commits: 42, prs: 5, issues: 2, reviews: 8, score: 94 },
      monthly: { commits: 156, prs: 18, issues: 7, reviews: 32, score: 380 },
      lifetime: { commits: 1240, prs: 145, issues: 42, reviews: 210, score: 3150 }
    }
  },
  {
    id: 'm2',
    name: 'Isa',
    handle: '@isa_codes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isa&backgroundColor=f1f5f9',
    skills: ['Python', 'Django', 'React'],
    contributionScore: 88,
    stats: {
      weekly: { commits: 28, prs: 3, issues: 4, reviews: 5, score: 88 },
      monthly: { commits: 112, prs: 12, issues: 15, reviews: 20, score: 340 },
      lifetime: { commits: 890, prs: 95, issues: 88, reviews: 150, score: 2800 }
    }
  },
  {
    id: 'm3',
    name: 'Nazrin',
    handle: '@nazrin_tech',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nazrin&backgroundColor=f1f5f9',
    skills: ['React', 'TypeScript', 'Node.js'],
    contributionScore: 91,
    stats: {
      weekly: { commits: 35, prs: 4, issues: 1, reviews: 12, score: 91 },
      monthly: { commits: 140, prs: 16, issues: 5, reviews: 45, score: 365 },
      lifetime: { commits: 1050, prs: 120, issues: 30, reviews: 300, score: 2950 }
    }
  },
  {
    id: 'm4',
    name: 'Elvin',
    handle: '@elvin_sys',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elvin&backgroundColor=f1f5f9',
    skills: ['Go', 'Python', 'Node.js'],
    contributionScore: 76,
    stats: {
      weekly: { commits: 15, prs: 2, issues: 5, reviews: 3, score: 76 },
      monthly: { commits: 65, prs: 8, issues: 20, reviews: 12, score: 210 },
      lifetime: { commits: 520, prs: 60, issues: 110, reviews: 85, score: 1800 }
    }
  },
  {
    id: 'm5',
    name: 'Aysel',
    handle: '@aysel_ui',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aysel&backgroundColor=f1f5f9',
    skills: ['React', 'TypeScript'],
    contributionScore: 82,
    stats: {
      weekly: { commits: 22, prs: 3, issues: 3, reviews: 6, score: 82 },
      monthly: { commits: 90, prs: 14, issues: 12, reviews: 25, score: 290 },
      lifetime: { commits: 780, prs: 110, issues: 65, reviews: 180, score: 2400 }
    }
  },
];

export const mockProjects: ProjectProposal[] = [
  {
    id: 'p1',
    title: 'EcoTrack Backend Microservices',
    description: 'A scalable backend architecture for the EcoTrack platform, handling high-throughput telemetry data from IoT sensors.',
    reasoning: 'High density of Go developers detected (Vusal, Elvin); optimizing for backend scalability and concurrent processing. Docker/K8s expertise available for deployment.',
    suggestedMembers: ['m1', 'm4'],
    requiredSkills: ['Go', 'Docker', 'Kubernetes'],
    initiatives: [
      'Design RESTful API contracts for sensor data ingestion.',
      'Implement a Go-based worker pool for concurrent data processing.',
      'Containerize services using Docker and orchestrate with Kubernetes.',
      'Set up CI/CD pipelines for automated testing and deployment.'
    ],
    technicalTips: [
      'Use Go channels and goroutines for efficient concurrent processing of IoT streams.',
      'Leverage gRPC for internal microservice-to-microservice communication to reduce latency.',
      'Ensure Kubernetes deployment includes horizontal pod autoscaling (HPA) based on CPU/Memory.'
    ],
    overallTips: [
      'Prioritize system reliability and fault tolerance over feature completeness in the first sprint.',
      'Maintain clear documentation for the API endpoints using Swagger/OpenAPI.',
      'Establish a robust logging and monitoring strategy early on.'
    ]
  },
  {
    id: 'p2',
    title: 'Community Hub Portal',
    description: 'Full-stack web application for community members to share resources, track events, and collaborate on open-source initiatives.',
    reasoning: 'Strong React/TypeScript cluster identified (Nazrin, Aysel) paired with robust Django backend capabilities (Isa). Ideal full-stack synergy.',
    suggestedMembers: ['m2', 'm3', 'm5'],
    requiredSkills: ['React', 'TypeScript', 'Django', 'Python'],
    initiatives: [
      'Develop a responsive frontend using React, TypeScript, and Tailwind CSS.',
      'Build a robust REST API using Django REST Framework.',
      'Implement user authentication and role-based access control.',
      'Integrate GitHub API for real-time open-source contribution tracking.'
    ],
    technicalTips: [
      'Use React Query for efficient server-state management and caching on the frontend.',
      'Optimize Django ORM queries using select_related and prefetch_related to avoid N+1 issues.',
      'Implement strict TypeScript interfaces for all API responses to ensure type safety.'
    ],
    overallTips: [
      'Focus on a seamless and accessible user experience (UX) to encourage community engagement.',
      'Adopt an iterative approach, releasing core features first and gathering user feedback.',
      'Ensure the codebase follows strict linting and formatting rules for maintainability.'
    ]
  }
];
