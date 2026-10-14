// Realistic Rajalakshmi Engineering College (REC) student dataset
// Used to power REC TeamMatch AI recommendations, search, and balanced team formation
// seamlessly alongside any newly registered Firestore users.

export const MOCK_REC_STUDENTS = [
  {
    id: "rec_std_101",
    uid: "rec_std_101",
    name: "Karthik Subramanian",
    registerNumber: "211621104045",
    email: "karthik.s.2021.cse@rajalakshmi.edu.in",
    department: "CSE",
    year: "4th Year",
    section: "A",
    phone: "+91 98401 23456",
    bio: "Passionate Machine Learning and Full-Stack developer at REC. Experienced in building end-to-end computer vision and NLP systems.",
    profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    availability: "Available for Projects",
    activeProjectsCount: 1,
    preferredRole: "ML Developer",
    github: "https://github.com/karthik-rec-ml",
    linkedin: "https://linkedin.com/in/karthik-subramanian-rec",
    portfolio: "https://karthiksubramanian.dev",
    technicalSkills: [
      { name: "Python", level: "Advanced" },
      { name: "Machine Learning", level: "Advanced" },
      { name: "TensorFlow", level: "Advanced" },
      { name: "PyTorch", level: "Intermediate" },
      { name: "Pandas", level: "Advanced" },
      { name: "Scikit-Learn", level: "Advanced" },
      { name: "FastAPI", level: "Intermediate" },
      { name: "SQL", level: "Intermediate" }
    ],
    softSkills: ["Team Leadership", "Problem Solving", "Technical Writing", "Mentoring"],
    areasOfInterest: ["Artificial Intelligence", "Deep Learning", "Healthcare AI", "Predictive Analytics"],
    projectsCompleted: [
      {
        title: "AI Disease Diagnosis & Imaging",
        description: "Built convolutional neural network diagnosing chest X-rays with 94.2% accuracy.",
        techStack: ["Python", "TensorFlow", "OpenCV", "FastAPI"],
        role: "ML Lead",
        link: "https://github.com/karthik-rec-ml/med-vision"
      },
      {
        title: "Campus Queue Time Predictor",
        description: "Time-series forecasting model for REC cafeteria and administrative queues.",
        techStack: ["Python", "Pandas", "Scikit-Learn", "Flask"],
        role: "Data Scientist",
        link: "https://github.com/karthik-rec-ml/queue-forecast"
      }
    ],
    resumeExtractedData: {
      hasResume: true,
      lastAnalyzed: "2026-09-10",
      fileName: "Karthik_REC_Resume.pdf",
      skills: ["Python", "TensorFlow", "PyTorch", "OpenCV", "Pandas", "NumPy", "Scikit-Learn", "FastAPI", "Docker", "SQL"],
      certifications: ["TensorFlow Developer Certificate (Google)", "DeepLearning.AI Specialization"],
      education: "B.E. Computer Science and Engineering - Rajalakshmi Engineering College (CGPA: 8.92)"
    }
  },
  {
    id: "rec_std_102",
    uid: "rec_std_102",
    name: "Pooja Ramanathan",
    registerNumber: "211621106082",
    email: "pooja.r.2021.aids@rajalakshmi.edu.in",
    department: "AI & DS",
    year: "3rd Year",
    section: "B",
    phone: "+91 97902 34567",
    bio: "UI/UX Designer and Frontend Specialist at REC. Passionate about crafting accessible, pixel-perfect user journeys for college & enterprise apps.",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    availability: "Available for Projects",
    activeProjectsCount: 0,
    preferredRole: "UI/UX Designer",
    github: "https://github.com/pooja-designs",
    linkedin: "https://linkedin.com/in/pooja-ramanathan-rec",
    portfolio: "https://poojadesigns.co",
    technicalSkills: [
      { name: "UI/UX", level: "Advanced" },
      { name: "Figma", level: "Advanced" },
      { name: "Wireframing", level: "Advanced" },
      { name: "Prototyping", level: "Advanced" },
      { name: "React", level: "Intermediate" },
      { name: "Tailwind CSS", level: "Advanced" },
      { name: "HTML/CSS", level: "Advanced" },
      { name: "Design Systems", level: "Advanced" }
    ],
    softSkills: ["Design Thinking", "User Empathy", "Visual Communication", "Critique"],
    areasOfInterest: ["Design Systems", "User Research", "Frontend Architecture", "EdTech UI"],
    projectsCompleted: [
      {
        title: "REC Smart Campus Mobile App Design",
        description: "Complete UI/UX design system and Figma high-fidelity prototype for 6,000+ REC students.",
        techStack: ["Figma", "Design Systems", "User Testing"],
        role: "Lead Product Designer",
        link: "https://figma.com/@pooja-designs/rec-campus"
      },
      {
        title: "Athena E-Learning Design",
        description: "Inclusive learning portal interface optimized for mobile and desktop screens.",
        techStack: ["Figma", "Tailwind CSS", "React"],
        role: "UI/UX & Frontend",
        link: "https://github.com/pooja-designs/athena-ui"
      }
    ],
    resumeExtractedData: {
      hasResume: true,
      lastAnalyzed: "2026-09-08",
      fileName: "Pooja_R_Design_Resume.pdf",
      skills: ["UI/UX", "Figma", "Design Systems", "Wireframing", "React", "Tailwind CSS", "HTML5", "CSS3", "User Research"],
      certifications: ["Google UX Design Professional Certificate", "Interaction Design Foundation (IxDF) Certified"],
      education: "B.Tech Artificial Intelligence and Data Science - Rajalakshmi Engineering College (CGPA: 9.15)"
    }
  },
  {
    id: "rec_std_103",
    uid: "rec_std_103",
    name: "Arunachalam Murugan",
    registerNumber: "211621205018",
    email: "arun.m.2021.it@rajalakshmi.edu.in",
    department: "IT",
    year: "4th Year",
    section: "A",
    phone: "+91 98845 67890",
    bio: "Full Stack Frontend enthusiast. Specializes in scalable React, Next.js, and state-driven web applications.",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    availability: "Available for Projects",
    activeProjectsCount: 1,
    preferredRole: "Frontend Developer",
    github: "https://github.com/arun-rec-web",
    linkedin: "https://linkedin.com/in/arunachalam-m-rec",
    portfolio: "https://arundev.in",
    technicalSkills: [
      { name: "React", level: "Advanced" },
      { name: "JavaScript", level: "Advanced" },
      { name: "TypeScript", level: "Intermediate" },
      { name: "Next.js", level: "Intermediate" },
      { name: "Tailwind CSS", level: "Advanced" },
      { name: "Redux / Zustand", level: "Intermediate" },
      { name: "REST APIs", level: "Advanced" },
      { name: "Git", level: "Advanced" }
    ],
    softSkills: ["Agile/Scrum", "Code Review", "Collaboration", "Debugging"],
    areasOfInterest: ["Web Development", "Micro-frontends", "Performance Optimization"],
    projectsCompleted: [
      {
        title: "Rajalakshmi Symposium Registration Portal",
        description: "Handled 3,000+ concurrent participant registrations with zero downtime.",
        techStack: ["React", "Tailwind CSS", "Node.js", "Firebase"],
        role: "Frontend Lead",
        link: "https://github.com/arun-rec-web/rec-symposium-web"
      },
      {
        title: "Interactive Code Playground",
        description: "In-browser live editor with syntax highlighting and instant preview.",
        techStack: ["React", "TypeScript", "Tailwind CSS"],
        role: "Sole Developer",
        link: "https://github.com/arun-rec-web/codebox-rec"
      }
    ],
    resumeExtractedData: {
      hasResume: true,
      lastAnalyzed: "2026-09-05",
      fileName: "Arunachalam_Frontend_Resume.docx",
      skills: ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "Tailwind CSS", "Next.js", "Redux", "REST APIs", "Git"],
      certifications: ["Meta Frontend Developer Professional Certificate", "freeCodeCamp JavaScript Algorithms"],
      education: "B.Tech Information Technology - Rajalakshmi Engineering College (CGPA: 8.78)"
    }
  },
  {
    id: "rec_std_104",
    uid: "rec_std_104",
    name: "Siddharth Venkataraman",
    registerNumber: "211621104112",
    email: "siddharth.v.2021.cse@rajalakshmi.edu.in",
    department: "CSE",
    year: "4th Year",
    section: "C",
    phone: "+91 94440 12389",
    bio: "Backend architect and cloud system developer. Experienced in designing microservices, REST/GraphQL APIs, PostgreSQL, and caching.",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    availability: "Available for Projects",
    activeProjectsCount: 1,
    preferredRole: "Backend Developer",
    github: "https://github.com/siddharth-backend",
    linkedin: "https://linkedin.com/in/siddharth-venkataraman-rec",
    portfolio: "https://siddharth-rec.dev",
    technicalSkills: [
      { name: "Node.js", level: "Advanced" },
      { name: "Express", level: "Advanced" },
      { name: "Python", level: "Intermediate" },
      { name: "PostgreSQL", level: "Advanced" },
      { name: "MongoDB", level: "Advanced" },
      { name: "Redis", level: "Intermediate" },
      { name: "Docker", level: "Intermediate" },
      { name: "GraphQL", level: "Intermediate" },
      { name: "Database", level: "Advanced" }
    ],
    softSkills: ["System Architecture", "Security Mindset", "Time Management"],
    areasOfInterest: ["Distributed Systems", "Cloud Computing", "Database Optimization"],
    projectsCompleted: [
      {
        title: "Hospital EHR & Scheduling System",
        description: "High-concurrency medical appointment backend with role-based JWT access and HIPAA compliance.",
        techStack: ["Node.js", "PostgreSQL", "Express", "Redis", "Docker"],
        role: "Backend Architect",
        link: "https://github.com/siddharth-backend/hospital-ehr-api"
      },
      {
        title: "REC Real-Time Attendance Ledger",
        description: "Distributed ledger API storing tamper-resistant lab attendance records.",
        techStack: ["Node.js", "MongoDB", "Express", "Docker"],
        role: "Backend Lead",
        link: "https://github.com/siddharth-backend/rec-attendance-core"
      }
    ],
    resumeExtractedData: {
      hasResume: true,
      lastAnalyzed: "2026-09-02",
      fileName: "Siddharth_Backend_CV.pdf",
      skills: ["Node.js", "Express", "Python", "PostgreSQL", "MongoDB", "Redis", "Docker", "Database", "REST APIs", "AWS"],
      certifications: ["AWS Certified Developer - Associate", "MongoDB Certified Developer Associate"],
      education: "B.E. Computer Science and Engineering - Rajalakshmi Engineering College (CGPA: 9.04)"
    }
  },
  {
    id: "rec_std_105",
    uid: "rec_std_105",
    name: "Deepika Rajagopalan",
    registerNumber: "211621106034",
    email: "deepika.r.2022.aids@rajalakshmi.edu.in",
    department: "AI & DS",
    year: "3rd Year",
    section: "A",
    phone: "+91 91760 98765",
    bio: "Data analytics and NLP explorer. Experienced in sentiment analysis, data pipelines, and interactive BI dashboards.",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    availability: "Available for Projects",
    activeProjectsCount: 0,
    preferredRole: "ML Developer",
    github: "https://github.com/deepika-aids-rec",
    linkedin: "https://linkedin.com/in/deepika-rajagopalan-rec",
    portfolio: "https://deepika-data.me",
    technicalSkills: [
      { name: "Python", level: "Advanced" },
      { name: "Machine Learning", level: "Intermediate" },
      { name: "Pandas", level: "Advanced" },
      { name: "Data Visualization", level: "Advanced" },
      { name: "SQL", level: "Advanced" },
      { name: "PowerBI", level: "Intermediate" },
      { name: "NLP", level: "Intermediate" }
    ],
    softSkills: ["Analytical Thinking", "Presentation Skills", "Documentation"],
    areasOfInterest: ["Natural Language Processing", "Business Analytics", "Recommendation Engines"],
    projectsCompleted: [
      {
        title: "Tamil Sentiment Analysis Engine",
        description: "Multilingual BERT model for classifying Tamil-English mixed reviews on social media.",
        techStack: ["Python", "PyTorch", "HuggingFace", "Streamlit"],
        role: "NLP Researcher",
        link: "https://github.com/deepika-aids-rec/tamil-sentiment"
      }
    ],
    resumeExtractedData: {
      hasResume: true,
      lastAnalyzed: "2026-09-11",
      fileName: "Deepika_Resume_AI.pdf",
      skills: ["Python", "Pandas", "NumPy", "SQL", "Machine Learning", "NLP", "PowerBI", "Matplotlib", "Seaborn"],
      certifications: ["IBM Data Science Professional Certificate"],
      education: "B.Tech Artificial Intelligence and Data Science - Rajalakshmi Engineering College (CGPA: 8.85)"
    }
  },
  {
    id: "rec_std_106",
    uid: "rec_std_106",
    name: "Vigneshwaran Balaji",
    registerNumber: "211621105072",
    email: "vignesh.b.2021.ece@rajalakshmi.edu.in",
    department: "ECE",
    year: "4th Year",
    section: "B",
    phone: "+91 99620 45678",
    bio: "Embedded Systems and IoT enthusiast at REC. Experienced with microcontrollers, Arduino, ESP32, and cloud telemetry.",
    profileImage: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    availability: "Available for Projects",
    activeProjectsCount: 1,
    preferredRole: "Embedded / IoT Developer",
    github: "https://github.com/vignesh-rec-iot",
    linkedin: "https://linkedin.com/in/vigneshwaran-balaji-rec",
    portfolio: "https://vigneshiot.rec",
    technicalSkills: [
      { name: "C / C++", level: "Advanced" },
      { name: "IoT", level: "Advanced" },
      { name: "ESP32", level: "Advanced" },
      { name: "Arduino", level: "Advanced" },
      { name: "Python", level: "Intermediate" },
      { name: "MQTT", level: "Advanced" },
      { name: "Raspberry Pi", level: "Intermediate" }
    ],
    softSkills: ["Hardware Debugging", "Prototyping", "Interdisciplinary Teamwork"],
    areasOfInterest: ["Smart Agriculture", "Autonomous Robotics", "Edge AI"],
    projectsCompleted: [
      {
        title: "Smart Green Campus Sensor Mesh",
        description: "Network of 20 ESP32 nodes monitoring energy, soil, and air quality across REC premises.",
        techStack: ["C++", "ESP32", "MQTT", "Grafana", "Python"],
        role: "Hardware Lead",
        link: "https://github.com/vignesh-rec-iot/green-rec-mesh"
      }
    ],
    resumeExtractedData: {
      hasResume: true,
      lastAnalyzed: "2026-08-29",
      fileName: "Vignesh_ECE_Resume.pdf",
      skills: ["C", "C++", "IoT", "ESP32", "Arduino", "Python", "MQTT", "Circuit Design", "PCB Design"],
      certifications: ["Arm Education Embedded Systems Certificate"],
      education: "B.E. Electronics and Communication Engineering - Rajalakshmi Engineering College (CGPA: 8.65)"
    }
  }
];
