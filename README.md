# REC Campus Connect

The official student collaboration and academic community platform for **Rajalakshmi Engineering College, Thandalam, Chennai (REC)**.

---

## 🌟 Major Highlights & Features

### 1. 🎓 Official REC Branding & Theme
- Fully customized for **Rajalakshmi Engineering College, Thandalam, Chennai (REC)**.
- **Primary Brand Color**: Purple **`#681B97`**.
- Complete **Light Mode** (`#FFFFFF` background, `#F7F5FA` secondary) and **Dark Mode** (`#0F0B13` background, `#18121F` cards, `#21182A` secondary cards) toggle with instant `localStorage` persistence.

### 2. 🔐 REC Student Authentication & Profile System
- **Student Login & Registration**: Supports official REC student credentials (`@rajalakshmi.edu.in`).
- **Student Profile**:
  - Name, Register Number, Department, Year, Section, Phone, Email
  - Technical skills with visual proficiency levels (**Beginner**, **Intermediate**, **Advanced**)
  - Soft skills, Areas of interest, Completed projects, Current project interests
  - GitHub, LinkedIn, and Portfolio links
  - Project availability status (**Available for Projects**, **Busy with Team**, **Open to collaborate**)
- **Forgot Password**: Password reset email integration via Firebase Authentication.

### 3. 🧠 REC TeamMatch AI — Smart Project Team Formation
- **Create Academic Projects**: Specify project domain, required skills, required roles, team size, difficulty, deadline, and problem statements.
- **Intelligent Compatibility Scoring**:
  - Evaluates technical skills, proficiency levels, target roles, previous projects, and availability.
  - Transparent natural-language reasoning (explains exactly why each student is recommended).
  - Categorization: 🔥 **Best Match**, 🎯 **Skill Match**, 🎨 **Role Match**, 🧠 **Complementary Skills**, 🌱 **Potential Match**.
- **Balanced Team Formation**:
  - Algorithms that pick distinct specialists for each role (e.g. UI/UX Designer, Frontend Developer, Backend Developer, ML Developer) rather than duplicating skills.
- **Team Gap Analysis**:
  - Automatically identifies missing specializations in an existing team (*"Your team currently lacks an ML specialist"*) and provides an instant *"Find ML Member"* recruitment trigger.
- **Student Discovery ("Find Teammates")**:
  - Search & multi-parameter filtering by Skill, Department, Year, Role, Availability, and Compatibility %.
- **Join Requests & Invitations**:
  - Real-time application flow allowing creators to Accept or Decline applicants and invite recommended students directly.

### 4. 📄 Automated Resume Upload & Analysis
- Supports **PDF**, **DOC**, and **DOCX** file uploads.
- Automatically extracts:
  - Technical skills, Programming languages, Frameworks, Developer tools
  - Certifications, Projects, Education, Soft skills, Areas of interest
- **Editable Preview Modal**: Allows students to verify, edit, and add to extracted data before saving to their profile and TeamMatch AI.

### 5. 📅 Daily REC Campus Events & Announcements System
- **Real-Time Firestore Sync**: Events update immediately across all student dashboards using `onSnapshot`.
- **Dynamic Date & Time Status**:
  - 🟢 **Happening Now**: Live events currently in progress with time-remaining countdown.
  - 🟣 **Today's Events**: Events happening today.
  - 🟣 **Upcoming Events**: Chronologically sorted future events.
  - ⚫ **Completed**: Past events.
- **Switchable Views**:
  - **List View** with categorized event cards.
  - **Calendar View**: Interactive monthly grid where clicking a day reveals its scheduled events.
- **Event Admin / Faculty Coordinator Dashboard**:
  - Create, edit, publish, draft, cancel, reschedule, and delete campus events.

### 6. 📚 Preserved Core Campus Tools
- **Notes Sharing**: Upload and download departmental notes (PDF, DOCX, images).
- **AI Study Assistant**: Academic questions, summaries, and MCQ generation powered by Google Gemini.
- **Placements & Internships**: Placement drives with countdowns and application links.
- **Campus Lost & Found**: Report and reclaim lost campus items with images.
- **Real-Time Chat**: Direct messages and departmental chat rooms.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite |
| **Styling** | Tailwind CSS v4 + REC Custom Theme Tokens (`#681B97`) |
| **Animations** | Framer Motion |
| **Routing** | React Router DOM v7 |
| **Backend & DB** | Firebase (Auth, Firestore, Storage, Realtime Database) |
| **Icons** | React Icons (Feather Icons) |
| **Notifications** | React Hot Toast |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```
