# TOEIC Neural Academy: Development Tasks

## Status: 🚀 LAUNCHING NEURAL LINK...


## Phase 1: Foundation & Setup
- [x] Initialize Project (Vite + React + TS)
- [x] Install Dependencies (Tailwind, Zustand, Dexie, Framer Motion, Lucide)
- [x] Configure Tailwind CSS (Slate-950, Cyan-400, Indigo-500)
- [x] Setup i18n (JP, EN, CN, KR)
- [x] Create Directory Structure

## Phase 2: Core Features (Migration & Adaptation)
- [x] Implement Quiz Engine (4-choice, shortcuts, TTS)
- [x] Implement Study Mode (Category selection, 2-column mobile)
- [x] Implement Flashcards (Shuffle, Flip)
- [x] Implement Analysis System (Charts, Error Density)
- [x] Implement Admin Dashboard (User mgmt, Approvals)
- [x] **Bug Fix**: Study Mode "Sectors" (Category) buttons are unresponsive (Seeded questions & Added error handling).
- [x] **Bug Fix**: G-Kentei Data ("AI Fundamentals") appearing in TOEIC App (Port Conflict Resolved - Moved to :3015).
- [x] **Database Isolation**: Prefix tables with `toeic_` to avoid G-Kentei conflict.

## Phase 2.5: User Engagement & Monetization (New)
- [x] **Ranking System**: Display top users based on total score/XP on Home Screen.
- [x] **Public Chat**: Real-time(ish) community chat on Home Screen.
- [ ] **Monetization Strategy**:
    - [ ] **Ads Integration**: Prepare slots for Display/Video ads (e.g., between quizzes).
    - [ ] **Premium Membership**: "Neural Elite" tier (No ads, advanced analytics, unlimited hearts).
    - [ ] **Affiliate Links**: "Recommended Books/Courses" section in Study Mode.
- [ ] **Feature Organization**: Ensure code modularity for new features.

## Phase 3: UI/UX & Design
- [x] Apply "Neural" Aesthetic (Glassmorphism, WebGL Background)
- [x] Implement Glossary/Typography (Black Italic Uppercase)
- [x] Mobile Optimization (Bottom Navigation, Touch Targets)

## Phase 4: Backend & Database
- [x] Setup Dexie.js (Local DB)
- [x] Setup Backend Connection (Render PostgreSQL)
- [x] Implement Data Sync/API

## Phase 5: Polish & Finalization
- [x] SEO Optimization (Meta tags, Semantic HTML)
- [x] Performance Tuning
- [x] Final Review
