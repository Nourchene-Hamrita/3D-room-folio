// =============================================================
// Nourchene Hamrita — Portfolio data
// All content the 3D scene and modals read from lives here.
// Reconciled against Nourchene's CV (Aug 2026) + public LinkedIn info.
// Update this file to keep your portfolio in sync.
// =============================================================

export const portfolioData = {
  profile: {
    name: "Nourchene Hamrita",
    shortName: "Nourchene",
    initials: "NH",
    role: "Full-Stack Engineer",
    tagline: "Engineer, builder, and lifelong learner 💜",
    // NOTE: CV lists a full street address (Krefeld, Germany) — only the
    // city/country is used here. Never publish a full home address on a
    // public site.
    location: "Düsseldorf, Germany",
    about: `Hi, I'm Nourchene Hamrita, a Software Engineer with a strong foundation
in web and mobile development and low-code platforms. I enjoy solving problems, learning new
technologies, and working in collaborative, agile environments.`,
    longAbout: `My goal is to contribute to ambitious, innovative projects while continuously
growing my skills. I love taking an idea from concept to production designing the architecture,
building the UI, wiring the backend, and shipping it.`,
    upTo: [
      "Building full-stack products at Contractzlab with React, Node.js, TypeScript & MySQL.",
      "Collaborating with product & AI teams on intelligent automation features, and shipping mobile apps with React Native.",
      "Working in agile / Scrum teams — Scrum Fundamentals Certified (SFC).",
    ],
    email: "hamritanourchene@gmail.com",
    linkedin: "https://www.linkedin.com/in/nourchene-hamrita/",
    github: "https://github.com/Nourchene-Hamrita",
  },

  // Skills grouped for chip rendering — trimmed to what's actually
  // evidenced across the CV's experience, projects, and skills sections.
  skills: [
    "React",
    "React Native",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Java",
    "Android",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "HTML",
    "CSS",
    "Sass",
    "REST APIs",
    "Microservices",
    "UML",
    "Git",
    "GitHub",
    "GitLab",
    "Docker",
    "Three.js",
    "Vite",
    "Low-code",
    "Mendix",
    "Blockchain",
    "Solidity",
    "Python",
    "OpenCV",
    "Computer Vision",
    "Agile",
    "Scrum",
  ],

  // Professional experience (most recent first) — pulled directly from the CV.
  experience: [
    {
      role: "Full-Stack Engineer",
      company: "Contractzlab",
      logo: "/images/contractzlab-logo.png",
      date: "04/2025 – 05/2026",
      location: "Tunis, Tunisia",
      description: [
        "Developing and maintaining backend services with Node.js, TypeScript, and MySQL.",
        "Designing reusable React components and interfaces for complex contract operations.",
        "Collaborating with product and AI teams to integrate intelligent agents for validation, data extraction, and reporting.",
        "Modeling databases and optimizing queries for large-scale data.",
      ],
      tools: ["Node.js", "TypeScript", "React", "MySQL", "GitHub", "JIRA"],
    },
    {
      role: "Software Engineering Intern — Graduation Project",
      company: "Think Tank Business Solutions",
      logo: "/images/thinktank-logo.png",
      date: "02/2024 – 09/2024",
      location: "Tunis, Tunisia",
      description: [
        "Benchmarking existing low-code platforms against project requirements.",
        "Designing a scalable architecture with security measures for compliance.",
        "Applying low-code principles to accelerate development and deployment.",
      ],
      tools: [
        "Mendix",
        "AngularJS",
        "Spring Boot",
        "Keycloak",
        "Docker",
        "PostgreSQL",
        "GitLab",
        "Jenkins",
      ],
      logo: "/images/thinktank-logo.png",
    },
    {
      role: "Android Development Instructor",
      company: "INFOplus",
      logo: "/images/infoplus-logo.png",
      date: "02/2024 – 06/2024",
      location: "Bizerte, Tunisia",
      description: [
        "Designing interactive course modules for Android development.",
        "Guiding students through projects and technical problem-solving.",
        "Evaluating student performance and providing constructive feedback.",
      ],
      tools: ["Android", "Java"],
    },
    {
      role: "Mobile Development Intern",
      company: "INFOplus",
      logo: "/images/infoplus-logo.png",
      date: "06/2023 – 08/2023",
      location: "Bizerte, Tunisia",
      description: [
        "Building a cross-platform Android and iOS application for training-center management.",
        "Managing trainee, parent, teacher, and administration areas.",
        "Designing the application's graphic charter and visual identity.",
      ],
      tools: ["MongoDB", "Node.js", "React.js", "React Native", "JavaScript"],
    },
    {
      role: "Web Development Intern",
      company: "Online VIP Consulting",
      logo: "/images/OVC.png",
      date: "06/2022 – 07/2022",
      location: "Tunis, Tunisia",
      description: [
        "Implementing a secure solution for managing online medical records.",
        "Enabling controlled access to records stored on a decentralized platform.",
      ],
      tools: ["Blockchain", "MongoDB", "Node.js", "React.js", "JavaScript"],
    },
    {
      role: "Mobile Application Developer",
      company: "Online VIP Consulting",
      logo: "/images/OVC.png",
      date: "06/2021 – 09/2021",
      location: "Tunis, Tunisia",
      description: [
        "Building a mobile application from scratch with React Native, Node.js, and MongoDB.",
        "Working closely with designers, product managers, and developers throughout delivery.",
        "Shipping a complete product from initial implementation to release.",
      ],
      tools: ["React Native", "Node.js", "MongoDB", "JavaScript"],
    },
    {
      role: "Mobile Development Intern — Graduation Project",
      company: "Online VIP Consulting",
      logo: "/images/OVC.png",
      date: "02/2021 – 06/2021",
      location: "Tunis, Tunisia",
      description: [
        "Developing a mobile app for streaming informative videos.",
        "Providing professionals, businesses, and learners with free educational content.",
      ],
      tools: ["MongoDB", "Node.js", "React.js", "React Native", "JavaScript"],
    },
    {
      role: "Customer Service Agent Intern",
      company: "Tunisie Telecom",
      logo: "/images/tt-logo.svg",
      date: "08/2020 – 09/2020",
      location: "Bizerte, Tunisia",
      description: [
        "Launching customer loyalty programs as part of the commercial strategy.",
        "Communicating with customers by phone and email.",
        "Listening to customer needs and recommending suitable products.",
      ],
      tools: [],
    },
  ],

  // Education — was previously mixed into "experience"; split out for accuracy.
  education: [
    {
      degree:
        "National Engineering Diploma in Applied Sciences and Technologies",
      institution: "Higher Institute of Multimedia Arts of Manouba (ISAMM)",
      date: "10/2024",
      location: "Manouba, Tunisia",
    },
    {
      degree: "Bachelor's Degree in Business Computing",
      institution: "Faculty of Economics and Management of Nabeul",
      date: "06/2021",
      location: "Nabeul, Tunisia",
    },
    {
      degree: "Baccalaureate, Experimental Sciences",
      institution: "Menzel Bourguiba Secondary School",
      date: "06/2018",
      location: "Bizerte, Tunisia",
    },
  ],

  certifications: [
    {
      name: "Scrum Fundamentals Certified (SFC)",
      issuer: "SCRUMstudy",
      date: "01/2025",
      mark: "SFC",
      logo: "/images/badge-SFC.png",
      url: "https://www.scrumstudy.com/certification/verify?type=SFC&number=1063330",
      accent: "violet",
    },
    {
      name: "Voltaire Certificate",
      issuer: "Projet Voltaire",
      date: "04/2023",
      mark: "V",
      logo: "/images/logo-voltaire.svg",
      url: "https://mon.certificat-voltaire.fr/verification-certificat?code=P67KRVT",
      accent: "coral",
    },
    {
      name: "Aptis General",
      issuer: "British Council",
      date: "11/2022",
      mark: "BC",
      logo: "/images/british_council_logo.jpeg",
      url: "https://drive.google.com/file/d/1XiEdUaHL9-HpKRVBlvXbKQxJ7kWEPoZh/view",
      accent: "cyan",
    },
  ],

  awards: [
    {
      name: "1st Prize — CSR Hackathon, Orange Tunisia",
      date: "2023",
      description:
        "Presented a technological project with social impact, built in 24 hours.",
    },
  ],

  languages: [
    { name: "Arabic", level: "Native / Bilingual" },
    { name: "English", level: "Fluent" },
    { name: "French", level: "Fluent" },
    { name: "German", level: "Conversational" },
  ],

  interests: ["Visual Arts"],

  // Featured projects — these are surfaced in the Work modal AND
  // bound to interactive 3D objects in the workspace.
  projects: [
    {
      id: "portfolio",
      title: "Interactive 3D Portfolio",
      icon: "🚀",
      summary:
        "The very site you're standing in a Three.js developer workspace you can walk around in.",
      description:
        "An award-winning-style 3D portfolio inspired by Awwwards-winning room folios, built with raw Three.js + Vite + GSAP. No 3D model files: the entire room is procedurally generated with Three.js primitives so it's tiny, fast, and fully customizable.",
      longDescription: [
        "Every piece of furniture — desk, monitors, keyboard, plant, books — is built from Three.js BoxGeometry, CylinderGeometry, and procedural materials.",
        "Raycasting powers hover hints and click-to-open interactions; orbit controls let you walk around the scene with mouse or touch.",
        "Day / Cyberpunk theme toggle swaps lighting and emissive accents across the entire scene in real time.",
      ],
      tags: ["Three.js", "Vite", "GSAP", "Sass", "Vanilla JS"],
      // TODO(Nourchene): drop in your real deployed URL + repo — these were
      // placeholders and have been cleared rather than left pointing at example.com.
      links: [],
    },
    {
      id: "fullstack-app",
      title: "Contract Management Platform",
      icon: "💼",
      summary:
        "A full-stack contract management tool built at Contractzlab — reusable React components on a Node.js / MySQL backend.",
      description:
        "Designed and built reusable React components and interfaces that improve usability and support complex contract operations. Backend services in Node.js + TypeScript + MySQL, focused on clean architecture and optimized performance.",
      longDescription: [
        "Component library built in React with strong typing via TypeScript — reusable across the whole product.",
        "Backend services in Node.js and MySQL, with database modeling and query optimization for large-scale contract data.",
        "Collaborated with product and AI teams to integrate intelligent agents that automate validation, data extraction, and reporting.",
      ],
      tags: ["React", "TypeScript", "Node.js", "MySQL", "REST API"],
      links: [],
    },
    {
      id: "mobile",
      title: "Training Center Mobile App",
      icon: "📱",
      summary:
        "Cross-platform mobile app built at INFOplus to manage trainees, parents, teachers, and admin staff.",
      description:
        "Built a cross-platform (Android & iOS) mobile application to manage trainee, parent, teacher, and administration areas, including the app's graphic charter. Earlier mobile work at Online VIP Consulting covered a from-scratch React Native app and a video-streaming education app.",
      longDescription: [
        "React Native app covering four different user roles (trainee, parent, teacher, admin) with tailored navigation for each.",
        "Earlier, at Online VIP Consulting: built a mobile app end-to-end (React Native front-end, Node.js back-end, MongoDB database).",
        "Also shipped a mobile video-streaming app giving free access to educational content for professionals and learners.",
      ],
      tags: ["React Native", "Android", "iOS", "Node.js", "MongoDB"],
      links: [],
    },
    {
      id: "ai-agent",
      title: "AI Virtual Painter",
      icon: "🎨",
      summary:
        "A computer-vision project that turns hand gestures into on-screen drawing — no stylus required.",
      description:
        "An AI-based project that detects hands and fingers via computer vision to draw directly on the screen using hand gestures — no mouse, stylus, or touchscreen needed.",
      longDescription: [
        "Real-time hand and fingertip tracking with MediaPipe, mapped to on-screen drawing coordinates.",
        "OpenCV (cv2) handles the video pipeline, gesture-based tool switching (draw, erase, color-pick), and rendering.",
        "Built in Python as a hands-on exploration of applied computer vision and gesture recognition.",
      ],
      tags: ["Python", "MediaPipe", "OpenCV", "Computer Vision"],
      links: [
        { github: "https://github.com/Nourchene-Hamrita/AI-VirtualPainter" },
      ],
    },
    {
      id: "lowcode",
      title: "Low-Code Platform Architecture",
      icon: "⚙️",
      summary:
        "Graduation-project internship benchmarking low-code platforms and designing a secure, scalable architecture.",
      description:
        "Benchmarked existing low-code platforms and designed a scalable architecture, integrating security measures to ensure compliance and applying low-code principles to speed up development and deployment.",
      longDescription: [
        "Evaluated low-code platforms, including Mendix, against project requirements to choose the right foundation.",
        "Designed a scalable architecture spanning AngularJS, Spring Boot, and PostgreSQL, secured with Keycloak.",
        "Set up CI/CD and version control with GitLab and Jenkins, and documented the workflow for the team.",
      ],
      tags: [
        "Mendix",
        "Low-code",
        "AngularJS",
        "Spring Boot",
        "Keycloak",
        "PostgreSQL",
      ],
      links: [],
    },
    {
      id: "achievechain",
      title: "AchieveChain",
      icon: "🎓",
      summary:
        "A blockchain-based app for verifying and managing student achievements.",
      description:
        "Built a blockchain-based application for verifying and managing student achievements, giving institutions and students a tamper-proof way to issue and check credentials.",
      longDescription: [
        "Smart contracts written in Solidity and tested/deployed locally with Hardhat.",
        "React front-end talking to a Node.js layer that bridges the UI and the chain.",
        "Focused on making credential verification tamper-proof and easy to check independently.",
      ],
      tags: ["Blockchain", "Solidity", "Hardhat", "Node.js", "React"],
      links: [{ github: "https://github.com/Nourchene-Hamrita/AchieveChain" }],
    },
    {
      id: "booking-app",
      title: "Booking App",
      icon: "✈️",
      summary:
        "A travel booking platform for flights, hotels, and rental cars, with curated destination recommendations.",
      description:
        "A comprehensive travel booking platform that lets users book flights, hotels, and rental cars, with curated recommendations for popular destinations.",
      longDescription: [
        "Full booking flow across three verticals — flights, hotels, and rental cars — from search to confirmation.",
        "React front-end backed by a Node.js / Express API and a MongoDB database.",
      ],
      tags: ["React", "Node.js", "Express", "MongoDB", "JavaScript"],
      links: [{ github: "https://github.com/Nourchene-Hamrita/BookingApp" }],
    },
    {
      id: "online-grocery",
      title: "Online Grocery App",
      icon: "🛒",
      summary:
        "A native Android grocery ordering app built with Java and Firebase.",
      description:
        "An online grocery application built for Android, using Java and Firebase for a fast, native ordering experience.",
      longDescription: [
        "Built natively for Android using Java for performance and a platform-native UX.",
        "Firebase handles auth, data storage, and sync for product listings and orders.",
      ],
      tags: ["Android", "Java", "Firebase"],
      links: [],
    },
    {
      id: "community",
      title: "Teaching, Certifications & Recognition",
      icon: "🌍",
      summary:
        "Teaching Android development, Scrum Fundamentals certification, and a hackathon win with Orange Tunisia.",
      description:
        "Taught Android development at INFOplus — designing course modules, guiding students, and evaluating their progress — alongside a Scrum Fundamentals certification and a 1st-place win at the Orange Tunisia CSR Hackathon.",
      longDescription: [
        "Android Development Instructor at INFOplus: built interactive course modules and coached students through real projects.",
        "Scrum Fundamentals Certified (SFC), January 2025 — comfortable working in agile / Scrum teams.",
        "1st prize at the Orange Tunisia CSR Hackathon (2023): presented a technological project with social impact, built in 24 hours.",
      ],
      tags: ["Teaching", "Android", "Scrum", "Leadership"],
      links: [],
    },
  ],

  // Interactive 3D objects in the workspace.
  // Each entry maps a 3D mesh name → an action to fire on click.
  interactive: {
    monitor: { action: "open-modal", modal: "work", label: "View my work" },
    laptop: { action: "open-modal", modal: "about", label: "About me" },
    phone: { action: "open-modal", modal: "contact", label: "Get in touch" },
    books: {
      action: "open-modal",
      modal: "project",
      project: "fullstack-app",
      label: "Full-Stack project",
    },
    plant: {
      action: "open-modal",
      modal: "project",
      project: "ai-agent",
      label: "AI Virtual Painter",
    },
    coffee: {
      action: "open-modal",
      modal: "project",
      project: "mobile",
      label: "Mobile app",
    },
    server: {
      action: "open-modal",
      modal: "project",
      project: "lowcode",
      label: "Automation",
    },
    diploma: { action: "open-modal", modal: "about", label: "About me" },
  },
};
