/**
 * REC CampusConnect Direct Application Service
 * Rajalakshmi Engineering College, Thandalam, Chennai
 *
 * Implements:
 * - Direct internal event application submissions
 * - Real-time state + Firestore persistence + offline localStorage fallback
 * - Status transitions (Applied, Under Review, Accepted, Rejected, Waitlisted, Cancelled)
 * - Registration ID generation (CC-REC-2026-XXXX)
 */

import { collection, addDoc, getDocs, doc, updateDoc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const STORAGE_KEY = "rec_student_applications";

// Default initial applications for immediate preview
export const INITIAL_APPLICATIONS = [
  {
    id: "CC-REC-2026-8941",
    eventId: "rec_event_hacknova",
    eventTitle: "REC HackNova 2026 — 24-Hour AI & Web3 National Hackathon",
    eventDate: "2026-10-13",
    eventVenue: "REC Tech Innovation Center, Thandalam",
    category: "Hackathons",
    applicantId: "current_user",
    applicantName: "Shallini",
    applicantEmail: "shallini.2023.aids@rajalakshmi.edu.in",
    registerNumber: "211623106042",
    department: "AI & DS",
    year: "3rd Year",
    phone: "+91 98401 99887",
    type: "Team",
    teamName: "AI Innovators REC",
    teamMembers: ["Shallini (Lead)", "Karthik Subramanian (ML Lead)", "Pooja Ramanathan (UI/UX)"],
    verifiedSkills: ["Python", "TensorFlow", "React", "FastAPI"],
    statement: "Developing an AI-powered triage and emergency medical queue prediction system.",
    status: "Accepted",
    appliedAt: "2026-10-11T14:30:00Z"
  },
  {
    id: "CC-REC-2026-7215",
    eventId: "rec_event_designix_masterclass",
    eventTitle: "Designix Club UI/UX & Design Systems Masterclass",
    eventDate: "2026-10-13",
    eventVenue: "Design & Media Lab, Mech Block 3rd Floor",
    category: "Design & UI/UX",
    applicantId: "current_user",
    applicantName: "Shallini",
    applicantEmail: "shallini.2023.aids@rajalakshmi.edu.in",
    registerNumber: "211623106042",
    department: "AI & DS",
    year: "3rd Year",
    phone: "+91 98401 99887",
    type: "Individual",
    verifiedSkills: ["Figma", "UI/UX", "Prototyping"],
    statement: "Mastering enterprise design tokens and multi-platform design systems.",
    status: "Accepted",
    appliedAt: "2026-10-12T09:15:00Z"
  },
  {
    id: "CC-REC-2026-6430",
    eventId: "rec_event_deep_learning_bootcamp",
    eventTitle: "Deep Learning & LLM Fine-Tuning Bootcamp on REC GPU Cluster",
    eventDate: "2026-10-15",
    eventVenue: "CSE Advanced Research Lab, REC",
    category: "AI / ML",
    applicantId: "current_user",
    applicantName: "Shallini",
    applicantEmail: "shallini.2023.aids@rajalakshmi.edu.in",
    registerNumber: "211623106042",
    department: "AI & DS",
    year: "3rd Year",
    phone: "+91 98401 99887",
    type: "Individual",
    verifiedSkills: ["Python", "PyTorch"],
    statement: "Learning parameter-efficient fine-tuning on regional clinical text models.",
    status: "Under Review",
    appliedAt: "2026-10-13T08:00:00Z"
  }
];

export const getStoredApplications = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_APPLICATIONS;
};

export const saveApplicationsToStorage = (apps) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // fallback
  }
};

/**
 * Submit new application directly from CampusConnect
 */
export const submitApplication = async (data) => {
  const regId = `CC-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const newApp = {
    id: regId,
    ...data,
    status: "Applied",
    appliedAt: new Date().toISOString()
  };

  const currentList = getStoredApplications();
  const updatedList = [newApp, ...currentList];
  saveApplicationsToStorage(updatedList);

  // Attempt Firestore sync
  try {
    await addDoc(collection(db, "applications"), {
      ...newApp,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("Could not save application to Firestore (cached locally):", err);
  }

  return newApp;
};

/**
 * Update application status (e.g. for organizer/admin review)
 */
export const updateApplicationStatus = async (appId, status) => {
  const currentList = getStoredApplications();
  const updatedList = currentList.map(a => a.id === appId ? { ...a, status } : a);
  saveApplicationsToStorage(updatedList);
  return updatedList;
};

/**
 * Withdraw an application
 */
export const withdrawApplication = async (appId) => {
  const currentList = getStoredApplications();
  const updatedList = currentList.map(a => a.id === appId ? { ...a, status: "Cancelled" } : a);
  saveApplicationsToStorage(updatedList);
  return updatedList;
};
