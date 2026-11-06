// Everything on the hire-me page comes from this file, so updating the resume never touches UI code.
export const PROFILE = {
  name: 'Sarthak Sharma',
  firstName: 'Sarthak',
  role: 'Full stack and AI developer',
  location: 'Ghaziabad, India',
  photo: '/images/sarthak.jpg',
  resume: '/resume/resume_sarthak.pdf',
  email: 'sarthakkaushik927@gmail.com',
  phone: '+91 7060321453',
  summary:
    'I build with MERN, Next.js, FastAPI, Python and AWS. I have shipped a production AI hiring platform load-tested at 500 concurrent users, and portals used by 180+ people.',
  links: [
    { label: 'GitHub', href: 'https://github.com/sarthakkaushik927' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/sarthak-sharma-323652318' },
    { label: 'LeetCode', href: 'https://leetcode.com/u/sarthakkaushik927' },
    { label: 'Portfolio', href: 'https://os.sarthaksharma927.me' },
  ],
};

export const STATS = [
  { value: '150+', label: 'APIs built' },
  { value: '500+', label: 'Concurrent users tested' },
  { value: '180+', label: 'Registrations managed' },
];

export const EXPERIENCE = [
  {
    company: 'AxioraPeople',
    url: 'https://axiorapeople.com',
    role: 'Full Stack & AI Developer Intern',
    date: 'Sep 2026 – Present',
    location: 'Remote',
    points: [
      'Built EdTalent on React 19, FastAPI and PostgreSQL (150+ APIs), with agentic AI resume screening at Rs 0.09 per resume and proctored voice AI interviews at Rs 4.87 each.',
      'Added LangGraph sourcing, a calling bot, WhatsApp and email alerts, and 5-tier pricing.',
      'Deployed on AWS (ECS, ALB, SQS, RDS, ElastiCache, CloudFront) with Terraform and CI/CD for Rs 12.5k/month at 1,000 users.',
      'Load-tested 500+ concurrent users and 47,000+ requests with 0 server errors.',
      'Used prerendered pages, structured data, sitemaps and AI-crawler access to cut first page load by 64% and rank EdTalent #1 on Google for its brand search.',
    ],
  },
  {
    company: 'Cloud Computing Cell, AKGEC',
    url: 'https://www.cccakgec.in/',
    role: 'Web Developer (Part-time)',
    date: 'Oct 2025 – Present',
    location: 'Ghaziabad, India',
    points: [
      'Developed the Nimbus 3.0 Registration Portal & Verification Dashboard, the Probation Management Portal, and the NextGen Assessment coding platform, and contributed to the official CCC website.',
      'Worked with React.js, Next.js, Node.js/Express.js and MongoDB/PostgreSQL.',
      'Added secure authentication, role-based access for 3+ user roles, and automated email notifications.',
      'Managed 180+ registrations at 100% accuracy and enabled trainees, admins and senior developers to track progress evaluations across six domains.',
    ],
  },
  {
    company: 'Podman (Red Hat), stdlib, Zulip',
    url: 'https://github.com/sarthakkaushik927',
    role: 'Open Source Contributor',
    date: 'Sep 2026 – Oct 2026',
    points: [
      'Podman: fixed a broken docs link, 8 typos and missing image alt text across React/TypeScript components, improving screen reader accessibility (PR #668, #674).',
      'stdlib: fixed a data-integrity bug where the array with() method mutated its source and misplaced writes on buffer views, and added regression tests for 3 cases (PR #16346).',
      'Zulip: corrected incorrect user-list settings in the status help documentation, merged into main (PR #40479).',
    ],
  },
];

export const PROJECTS = [
  {
    title: 'NextGen Assessment Systems',
    description:
      'Full-stack assessment platform for 300+ candidates and 250+ concurrent sessions, with an admin console for bulk ingestion, live monitoring and auto-evaluation, plus self-hosted Judge0 behind a custom load balancer.',
    tech: ['React 19', 'TypeScript', 'Node.js', 'MongoDB', 'Redis', 'BullMQ', 'AWS ECS'],
    github: 'https://github.com/sarthakkaushik927/Coding-Plateform',
    demo: 'https://coding-plateform-egyb.vercel.app',
  },
  {
    title: 'Fire Detection System',
    description:
      'Ranks regions by fire probability from NASA FIRMS satellite data on a Mapbox GL dashboard, verifies detections with OpenCV and Python AI, and sends Socket.io alerts in under 1 second.',
    tech: ['React.js', 'Express.js', 'Mapbox GL', 'Socket.io', 'Supabase'],
    github: 'https://github.com/sarthakkaushik927/Fire-Detection-System',
    demo: 'https://fire-detection-system-one.vercel.app/',
  },
];

export const SKILLS = [
  { title: 'Languages', items: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'Go', 'Java', 'C++', 'SQL', 'Data Structures & Algorithms'] },
  { title: 'Frontend', items: ['HTML5', 'CSS3', 'React.js', 'Next.js', 'React Native', 'Redux', 'Tailwind CSS', 'Framer Motion', 'Mapbox GL', 'Three.js'] },
  { title: 'Backend', items: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'GraphQL', 'WebSockets', 'Socket.io', 'SSE', 'BullMQ', 'JWT', 'OAuth 2.0', 'RBAC'] },
  { title: 'Architecture', items: ['Microservices', 'CQRS', 'DDD', 'Event-Driven Architecture', 'Serverless', 'Kafka', 'SQS', 'System Design'] },
  { title: 'Databases', items: ['MongoDB', 'PostgreSQL', 'Redis', 'Supabase', 'Database Indexing', 'Aggregation Pipelines'] },
  { title: 'AI & GenAI', items: ['Generative AI', 'RAG', 'Agentic AI', 'LangChain', 'LangGraph', 'Voice AI', 'Context Engineering', 'AI-Assisted Development', 'OpenCV'] },
  { title: 'Cloud & DevOps', items: ['AWS EC2', 'ECS', 'ALB', 'S3', 'SQS', 'RDS', 'ElastiCache', 'CloudFront', 'IAM', 'Terraform', 'CloudWatch', 'Docker', 'CI/CD'] },
  { title: 'Testing & Tools', items: ['TestSprite', 'Jest', 'Locust', 'k6', 'Artillery', 'JMeter', 'Postman', 'Git', 'GitHub', 'Linux', 'Cursor AI', 'Codex', 'MCP'] },
];
