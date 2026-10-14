/**
 * REC Projects & Team Group Formation Service
 * Rajalakshmi Engineering College, Thandalam, Chennai
 */

import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "../firebase";

export const INITIAL_REC_PROJECTS = [
  {
    id: "rec_proj_hospital",
    title: "AI-Based Hospital Queue Management",
    description: "Intelligent patient flow and triage prediction system optimizing queue wait times in clinical departments.",
    problemStatement: "Outpatient departments face severe bottlenecks and unpredictable surge hours, leading to 3+ hours wait times and patient distress.",
    domain: "Healthcare AI",
    requiredSkills: ["Python", "Machine Learning", "UI/UX", "Database", "React"],
    preferredTeamSize: 4,
    requiredRoles: ["ML Developer", "Frontend Developer", "Backend Developer", "UI/UX Designer"],
    deadline: "2026-11-20",
    difficulty: "Advanced",
    technologies: ["Python", "TensorFlow", "React", "Node.js", "PostgreSQL", "Figma"],
    creatorId: "rec_std_101",
    creatorName: "Karthik Subramanian",
    creatorEmail: "karthik.s.2021.cse@rajalakshmi.edu.in",
    status: "recruiting",
    members: [
      {
        uid: "rec_std_101",
        name: "Karthik Subramanian",
        email: "karthik.s.2021.cse@rajalakshmi.edu.in",
        role: "ML Developer",
        department: "CSE",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
      },
      {
        uid: "rec_std_102",
        name: "Pooja Ramanathan",
        email: "pooja.r.2021.aids@rajalakshmi.edu.in",
        role: "UI/UX Designer",
        department: "AI & DS",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
      }
    ],
    tasks: [
      { id: "t1", title: "Design hospital kiosk Figma wireframes", status: "completed", assignedTo: "Pooja Ramanathan" },
      { id: "t2", title: "Train queue wait-time regression model", status: "in-progress", assignedTo: "Karthik Subramanian" },
      { id: "t3", title: "Build patient check-in REST API endpoints", status: "todo", assignedTo: "Backend Developer" },
      { id: "t4", title: "Develop live token display frontend dashboard", status: "todo", assignedTo: "Frontend Developer" }
    ]
  },
  {
    id: "rec_proj_greencampus",
    title: "REC Smart Green Campus IoT & Carbon Tracker",
    description: "Mesh network of IoT sensors tracking classroom energy consumption, solar output, and carbon footprint reduction.",
    problemStatement: "Large university campuses consume excessive HVAC and lighting power during non-peak hours with limited telemetry.",
    domain: "Internet of Things (IoT)",
    requiredSkills: ["IoT", "ESP32", "Python", "React", "Database"],
    preferredTeamSize: 4,
    requiredRoles: ["Embedded / IoT Developer", "Backend Developer", "Frontend Developer", "Data Analyst"],
    deadline: "2026-10-30",
    difficulty: "Intermediate",
    technologies: ["C++", "ESP32", "MQTT", "Python", "React", "PostgreSQL"],
    creatorId: "rec_std_106",
    creatorName: "Vigneshwaran Balaji",
    creatorEmail: "vignesh.b.2021.ece@rajalakshmi.edu.in",
    status: "recruiting",
    members: [
      {
        uid: "rec_std_106",
        name: "Vigneshwaran Balaji",
        email: "vignesh.b.2021.ece@rajalakshmi.edu.in",
        role: "Embedded / IoT Developer",
        department: "ECE",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"
      }
    ],
    tasks: [
      { id: "t1", title: "Calibrate current sensing CT coils on ESP32", status: "completed", assignedTo: "Vigneshwaran Balaji" },
      { id: "t2", title: "Setup secure MQTT broker over TLS", status: "in-progress", assignedTo: "Vigneshwaran Balaji" },
      { id: "t3", title: "Build energy telemetry backend API", status: "todo", assignedTo: "Backend Developer" }
    ]
  },
  {
    id: "rec_proj_multilingual",
    title: "Regional Language Clinical NLP Assistant",
    description: "Speech-to-text and multilingual translation engine bridging Tamil-English vernacular medical queries.",
    problemStatement: "Rural patients struggle with English medical summaries; physicians need instant translated vernacular notes.",
    domain: "Artificial Intelligence",
    requiredSkills: ["Python", "Machine Learning", "NLP", "React", "FastAPI"],
    preferredTeamSize: 3,
    requiredRoles: ["ML Developer", "Frontend Developer", "Backend Developer"],
    deadline: "2026-12-15",
    difficulty: "Advanced",
    technologies: ["Python", "PyTorch", "HuggingFace", "React", "FastAPI"],
    creatorId: "rec_std_105",
    creatorName: "Deepika Rajagopalan",
    creatorEmail: "deepika.r.2022.aids@rajalakshmi.edu.in",
    status: "recruiting",
    members: [
      {
        uid: "rec_std_105",
        name: "Deepika Rajagopalan",
        email: "deepika.r.2022.aids@rajalakshmi.edu.in",
        role: "ML Developer",
        department: "AI & DS",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
      }
    ],
    tasks: [
      { id: "t1", title: "Curate bilingual clinical parallel corpus", status: "in-progress", assignedTo: "Deepika Rajagopalan" },
      { id: "t2", title: "Create voice query web interface", status: "todo", assignedTo: "Frontend Developer" }
    ]
  }
];

/**
 * Ensures initial projects are seeded into Firestore if collection is empty
 */
export const ensureSeedProjectsInFirestore = async () => {
  try {
    const snap = await getDocs(collection(db, "projects"));
    if (snap.empty) {
      for (const proj of INITIAL_REC_PROJECTS) {
        const { id, ...data } = proj;
        await addDoc(collection(db, "projects"), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (err) {
    console.warn("Could not seed projects to Firestore:", err);
  }
};
