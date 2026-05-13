# 🎓 UniAssistant Lite

[![Netlify Status](https://api.netlify.com/api/v1/badges/7c9370e5-1c5a-4033-b3fa-1e43b75a32a5/deploy-status)](https://app.netlify.com/projects/universityassistant/deploys)

**UniAssistant Lite** is a modern, privacy-first, and fully offline university companion designed to help students manage their academic life with ease. Built with speed and aesthetics in mind, it provides a premium experience for tracking schedules, tasks, and attendance.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

---

## ✨ Key Features

### 📊 Dashboard
- **Academic Overview**: Quick glance at today's classes, pending tasks, and total subjects.
- **Dynamic Greeting**: Personalized welcome based on your semester settings.
- **Today's Schedule**: Real-time status of classes (Upcoming, Present, Absent).
- **One-Tap Attendance**: Quickly mark full-day absence or individual class status.
- **Motivational Corner**: A curated selection of quotes to keep you inspired.

### 📅 Smart Timetable
- **Import via AI**: A built-in AI prompt helper allows you to copy-paste your university's messy timetable (image/PDF) into ChatGPT/Gemini and import the clean text directly.
- **Manual Add**: Intuitive form to add classes with subject, time, faculty, and room details.
- **Temporary Classes**: Add one-off classes (e.g., extra lectures, swaps) without cluttering your permanent schedule.
- **Daily View**: Filter and manage attendance records for any specific date.

### 📝 Tasks (Assignments)
- **Priority-Based Sorting**: Organize tasks by High, Medium, or Low priority.
- **Deadline Tracking**: Stay ahead with date-sorted lists and overdue indicators.
- **Clean Transitions**: Smooth Framer Motion animations for adding, completing, and deleting tasks.

### 📈 Attendance Calculator
- **Automated Math**: Automatically estimates total classes held based on your semester start date and weekly schedule.
- **Risk Analysis**: Visual indicators (Safe, Warning, Danger) based on your current percentage.
- **Smart Insights**: Tells you exactly how many classes you **can safely skip** or **need to attend** to reach your target (default 75%).
- **Manual Overrides**: Override auto-calculated values for pinpoint accuracy.

---

## 📱 Mobile Compatibility
- **Responsive Design**: Fully optimized for all screen sizes (Mobile, Tablet, Desktop).
- **iOS Safe Areas**: Support for notched devices with `viewport-fit=cover`.
- **Touch-Friendly**: Large tap targets (44px+) and mobile-specific navigation.
- **App-Like Feel**: Smooth transitions, backdrop blurs, and glassmorphism.

---

## 🔒 Privacy & Performance
- **100% Offline**: No data ever leaves your device. Everything is stored in your browser's `localStorage`.
- **Lightweight**: Zero backend dependencies. Lightning-fast load times.
- **SEO Optimized**: Semantic HTML and meta tags for better visibility if hosted.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Stanlyps1910/MiniUniversityAssistant.git
   ```
2. Navigate to the project directory:
   ```bash
   cd MiniUniAssistant
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🛠️ Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: React Icons (Feather Icons)
- **Notifications**: React Hot Toast

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

Created with ❤️ by Stanly.
