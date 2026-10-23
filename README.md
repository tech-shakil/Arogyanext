# 🏥 ArogyaNext AI — Multi-Tenant Hospital & Clinical Operating System

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.11-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Lucide Icons](https://img.shields.io/badge/Icons-Lucide_React-F05032?logo=lucide&logoColor=white)](https://lucide.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-tech--shakil%2FArogyanext-181717?logo=github&logoColor=white)](https://github.com/tech-shakil/Arogyanext)

**ArogyaNext AI** is an enterprise-grade, cloud-native outpatient department (OPD) and clinical operations platform designed to eliminate waiting-room congestion, paper prescription loss, and disconnected hospital communication.

Built on **React 19**, **Vite 8**, **Tailwind CSS 4**, and **Firebase Firestore & Authentication**, ArogyaNext interconnects the entire patient journey:
- **Front-Desk Reception & Triage** (Instant walk-ins, emergency priority tagging, smart token allocation)
- **Doctor Consultation Cabins** (Queue management, past paper Rx OCR review, instant e-prescriptions)
- **Smart Stylus Letterhead Pad** (Custom printed clinic letterhead overlays with calibrated margin alignment & stylus signatures)
- **Waiting Lobby TV Signage** (High-visibility neon queue monitor with Web Speech API audio callouts)
- **E-Pharmacy Fulfillment Counter** (Live doctor-to-dispensary prescription sync)
- **Hospital Director Analytics** (Real-time operational KPIs, revenue tracking, and automated CSV audit exports)
- **Multi-Tenant Founder Governance** (Super Admin workspace provisioning and staff account control)

---

## 📋 Table of Contents

- [🌟 The Core Problems ArogyaNext Solves](#-the-core-problems-arogyanext-solves)
- [✨ Specialized Portals & Panel Walkthrough](#-specialized-portals--panel-walkthrough)
- [🧠 System Architecture & Cross-Panel Data Flow](#-system-architecture--cross-panel-data-flow)
- [🗄️ Database Collections & Security Rules](#️-database-collections--security-rules)
- [📁 Project Directory Structure](#-project-directory-structure)
- [⚙️ Tech Stack & Key Libraries](#️-tech-stack--key-libraries)
- [🚀 Step-by-Step Installation & Setup Guide](#-step-by-step-installation--setup-guide)
- [💻 Development & Production Commands](#-development--production-commands)
- [👥 Role-Based Access Control (RBAC) Setup](#-role-based-access-control-rbac-setup)
- [🌐 Deployment Guide (Vercel & Firebase Hosting)](#-deployment-guide-vercel--firebase-hosting)
- [📄 License & Authorship](#-license--authorship)

---

## 🌟 The Core Problems ArogyaNext Solves

Traditional healthcare clinics and hospitals suffer from systemic inefficiencies:

| Problem in Traditional Clinics | How ArogyaNext AI Solves It |
| :--- | :--- |
| **Lobby Chaos & Overcrowded Counters** | Patients are assigned sequential tokens (`S-14` for standard, `E-05` for emergencies). A dedicated lobby TV display announces tokens via audible text-to-speech (TTS), preventing counter crowding. |
| **Lost or Illegible Paper Prescriptions** | Prescriptions are authored digitally or overlaid directly onto printed clinic letterheads, immediately transmitting to the in-house pharmacy the instant consultation ends. |
| **Delayed Emergency Attention** | Front-desk staff can flag walk-in patients as **Emergency**, instantly placing them at the top of doctor queues with flashing danger banners. |
| **Doctor Hesitation Toward Complex Software** | The **Smart Prescription Pad** lets doctors write or sign with an Apple Pencil or stylus directly over their existing physical clinic letterhead, requiring zero change in clinical habits. |
| **Data Leakage Across Multiple Facilities** | Built-in multi-tenant isolation ensures every hospital workspace (`hospitalId`) only accesses its own staff, appointments, and pharmacy records. |

---

## ✨ Specialized Portals & Panel Walkthrough

### 1. 📋 Front Desk Control Center (`ReceptionistPanel.jsx`)
- **Fast-Track Registration**: Enter patient name, age, symptoms, and assign an active doctor in seconds.
- **Dynamic Token Allocation**:
  - `S-XX` (Standard OPD Consultations)
  - `E-XX` (Emergency Cases — auto-bypasses appointment schedules to `IMMEDIATE`)
- **Real-Time Doctor Cabin Directory**: Live dropdown of available doctors filtered by the logged-in hospital facility.
- **Grouped Queue Monitoring**: Displays patient counts per cabin in real-time, allowing front-desk personnel to balance doctor workloads.
- **Cancellation & Triage Management**: 1-click status updates to `Cancelled` or `In Consultation`.

### 2. 🩺 Doctor Clinical Workspace (`DoctorPanel.jsx`)
- **Doctor-Scoped Waiting Queue**: Shows only patients assigned to the authenticated doctor with real-time Firestore listeners.
- **Emergency Alert Banner**: Emergency patients flash red at the top of the queue.
- **"Call In" Trigger**: Sets appointment to `In Consultation` and updates global `doctor_status`, instantly triggering audio chimes and neon highlights on the waiting room TV.
- **Previous Paper Rx (OCR) Review**: Monospaced inspection card for patients with scanned past prescriptions, with a 1-click `+ Insert into E-Prescription` button.
- **Seamless Pharmacy Handoff**: Finishing a consultation marks the appointment `Completed` and sets `pharmacyStatus = 'Pending'`, instantly routing medicines to the dispensary.

### 3. ✍️ Smart Letterhead & Stylus Signature Pad (`SmartPrescriptionPanel.jsx`)
- **Clinic Letterhead Customization**: Doctors can upload their clinic's printed letterhead background (cached in Base64 via `localStorage`).
- **Interactive Calibration Sliders**: Adjust `Margin Top`, `Signature Bottom`, and toggle `Mask Background Lines` to align digital text over physical paper layouts.
- **Retina Stylus Canvas**: HTML5 Canvas with pointer event listeners supporting stylus pressure and freehand signatures.
- **One-Touch Print & Dispatch**: Invokes `window.print()` with dedicated `@media print` CSS that strips UI chrome and headers, producing a clean physical printout.

### 4. 📺 Lobby TV Signage & Voice Callouts (`TVDisplay.jsx`)
- **Designed for 55"+ Smart TVs**: High-contrast, dark-mode display readable across waiting halls.
- **Multi-Doctor Cabin Split**: Real-time grid displaying each cabin's currently consulting token in glowing neon emerald alongside the next 4 patients in line.
- **Speech Synthesis (TTS) Engine**: Automatically calls patient tokens via the browser's Web Speech API:
  > *"Token number S 14, please proceed to Dr. Sharma's cabin."*
- **Visual Audio Equalizer**: Animated soundwave bars appear during voice callouts.
- **Continuous News Marquee**: Bottom ticker for hospital announcements, queue guidelines, and emergency notices.

### 5. 💊 E-Pharmacy Fulfillment Hub (`PharmacyPanel.jsx`)
- **Live Dispatch Queue**: Automatically updates when any doctor completes a consultation with prescribed medicines.
- **Order Details**: Displays patient token, age, prescribing physician, and itemized medication list.
- **Fulfillment Action**: Pharmacist marks orders as `Dispensed ✅` with a single tap, updating Firestore records and clearing active dispensary tickets.

### 6. 📊 Hospital Director Analytics & Audit Hub (`HospitalAdmin.jsx`)
- **Operational KPI Cards**: Today's Footfall, Pharmacy Revenue, Average Patient Wait Time, and Active Duty Staff.
- **Automated CSV Audit Reporting**: Select timeframe (`1 Day`, `7 Days`, `1 Month`, `6 Months`, `1 Year`) to download full consultation logs for compliance and operational reviews.

### 7. 🛡️ Multi-Tenant Founder Console (`AdminPanel.jsx`)
- **Tenant Generation**: Super Admin creates unique hospital organizations with auto-generated tenant codes (e.g., `HOSP_9X8B2`).
- **Platform Analytics**: Global counts for total hospitals, registered medical officers, and operational personnel.
- **Staff Governance**: Audit and delete compromised or inactive staff accounts across any tenant facility.

---

## 🧠 System Architecture & Cross-Panel Data Flow

```text
+--------------------------------------------------------------------------------------------------+
|                                    AROGYANEXT CLINICAL PIPELINE                                  |
+--------------------------------------------------------------------------------------------------+

 [Front Desk / Receptionist] 
          |
          v
   appointments collection
   (status: "Waiting", tokenNumber: "S-14", hospitalId: "HOSP_X92K", doctorName: "Dr. Sharma")
          |
          +-----------------------+----------------------------------+
          |                       |                                  |
          v                       v                                  v
  [Doctor Workspace]      [Smart Prescription Pad]          [TV Waiting Room Display]
  - View waiting queue    - Blank letterhead overlay        - Soundwave TTS Audio Callout
  - Review OCR paper Rx   - Stylus digital signature        - Real-time Neon queue board
  - Digital prescription  - Auto-print to hardware printer  - Continuous Marquee ticker
          |                       |
          +-----------+-----------+
                      |
                      v
         (status: "Completed", pharmacyStatus: "Pending", prescription: "Dolo 650mg...")
                      |
                      v
             [E-Pharmacy Hub] ------------------------> [Hospital Admin Analytics]
             - Instant medicine alert                   - CSV Audit Reports (Day/Week/Month/Year)
             - 1-click Dispensed action                 - Footfall & Wait-time metrics
```

---

## 🗄️ Database Collections & Security Rules

ArogyaNext utilizes Google Cloud Firestore with strict multi-tenant isolation rules configured in `firestore.rules`:

| Collection | Document ID | Key Fields | Purpose |
| :--- | :--- | :--- | :--- |
| **`users`** | `auth.uid` | `uid`, `email`, `fullName`, `role`, `hospitalId`, `createdAt` | Profile management and role routing. |
| **`hospitals`** | `hospitalId` (e.g. `HOSP_X92K`) | `hospitalId`, `hospitalName`, `createdAt` | Hospital tenancy directory. |
| **`doctors`** | `doctor.uid` | `name`, `hospitalId`, `specialty`, `isActive` | Active doctors list for front-desk assignments. |
| **`appointments`** | Auto-generated UUID | `tokenNumber`, `patientName`, `patientAge`, `symptoms`, `doctorName`, `hospitalId`, `status`, `isEmergency`, `appointmentDate`, `timeSlot`, `timestamp`, `prescription`, `pharmacyStatus`, `scannedPrescriptionText` | End-to-end appointment lifecycle and prescription record. |
| **`doctor_status`** | `doctorName` | `status` (`Active` \| `Away` \| `In Consultation`), `currentToken`, `lastUpdated` | Doctor availability indicator synced across the clinic. |
| **`queue`** | `hospitalId` | `activeDoctor`, `activeToken`, `status`, `lastUpdated` | Real-time queue broadcast for lobby TV displays. |

### Multi-Tenancy Security Policy
Every query across the reception desk, doctor cabins, pharmacy, and management dashboards enforces:
```javascript
where("hospitalId", "==", userProfile.hospitalId)
```
Data is isolated per facility — clinic staff cannot view or query patient records from other hospital workspaces.

---

## 📁 Project Directory Structure

```text
arogyanext-admin/
├── .firebaserc                           # Firebase project binding (arogyanext-ab375)
├── firebase.json                         # Firebase Hosting and Firestore configuration
├── firestore.rules                       # Production Firestore security and RBAC rules
├── firestore.indexes.json                # Firestore index configurations
├── index.html                            # HTML5 root with responsive meta tags & favicon
├── package.json                          # Node.js dependencies and script definitions
├── vite.config.js                        # Vite 8 config with React & Tailwind plugins
├── vercel.json                           # Vercel SPA route rewrite rules
├── public/
│   ├── favicon.svg                       # Medical caduceus SVG browser favicon
│   └── icons.svg                         # UI vector iconography sprite sheet
└── src/
    ├── main.jsx                          # React 19 root mounting with StrictMode
    ├── App.jsx                           # Master orchestrator, RBAC routing & mobile menu
    ├── App.css                           # 3D isometric transforms and utility classes
    ├── index.css                         # Tailwind CSS 4 theme, dark scrollbars & keyframe animations
    ├── firebase.js                       # Firebase App, Firestore (db), and Auth exports
    ├── Auth.jsx                          # Staff login, registration, and password recovery portal
    ├── LandingPage.jsx                   # Public marketing showcase, feature breakdown & lead form
    ├── ReceptionistPanel.jsx             # Front desk patient intake & emergency triage queue
    ├── DoctorPanel.jsx                   # Doctor clinical workspace, OCR review & e-prescriptions
    ├── SmartPrescriptionPanel.jsx        # Smart clinic letterhead overlay & stylus signature pad
    ├── TabletDoctorPanel.jsx             # Stylus freehand drawing notepad with OCR simulation
    ├── TVDisplay.jsx                     # Waiting lobby TV dashboard with Web Speech TTS audio
    ├── PharmacyPanel.jsx                 # Real-time medication fulfillment counter
    ├── HospitalAdmin.jsx                 # Hospital Director metrics dashboard & CSV exporter
    └── AdminPanel.jsx                    # Super Admin (Founder) tenant provisioning console
```

---

## ⚙️ Tech Stack & Key Libraries

- **Framework**: [React 19.2](https://react.dev/)
- **Bundler & Tooling**: [Vite 8.0](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4.2](https://tailwindcss.com/) (using `@tailwindcss/vite` engine)
- **Database & Auth**: [Firebase 12.11](https://firebase.google.com/) (Cloud Firestore & Firebase Authentication)
- **Icons**: [Lucide React 0.577](https://lucide.dev/)
- **Audio Announcements**: Native Web Speech API (`window.speechSynthesis`)
- **Digital Signatures**: HTML5 Canvas 2D Context with Pointer Events API
- **Document Generation**: Custom CSS `@media print` print styles and HTML-to-CSV generator

---

## 🚀 Step-by-Step Installation & Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes bundled with Node.js)
- **Git**: Installed and configured ([Download Git](https://git-scm.com/))

### 2. Clone the Repository
```bash
git clone https://github.com/tech-shakil/Arogyanext.git
cd Arogyanext
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Firebase
The repository includes a default configuration pointing to `arogyanext-ab375`. To use your own Firebase backend:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication** and turn on the **Email/Password** sign-in method.
3. Enable **Cloud Firestore** in production mode.
4. Deploy the security rules from this repo:
   ```bash
   npx firebase-tools deploy --only firestore:rules
   ```
5. Copy your web app credentials into `src/firebase.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

---

## 💻 Development & Production Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Launches the local Vite development server with Hot Module Replacement (HMR) at `http://localhost:5173`. |
| `npm run build` | Compiles and optimizes React 19 JSX into minified production assets in the `dist/` directory. |
| `npm run preview` | Spins up a local web server to preview the production `dist/` build. |
| `npm run lint` | Runs ESLint 9 across all `.js` and `.jsx` source files. |

---

## 👥 Role-Based Access Control (RBAC) Setup

To set up an initial operational environment:

1. **Create the Super Admin Account**:
   - Launch the application (`npm run dev`) and click **Staff Login**.
   - Select **Create Account**, enter your email and password, and choose the role **Super Admin**.
   - *(Note: Super Admins bypass hospital tenant requirements).*

2. **Generate a Hospital Workspace**:
   - Access the **Founder Console** (`AdminPanel`).
   - Enter your hospital's name (e.g., *"Apex City Hospital"*) and click **Create Hospital**.
   - Note the generated 6-to-8 character **Hospital ID** (e.g., `HOSP_8K3X`).

3. **Register Staff Members**:
   - Staff members can now register using the generated **Hospital ID**:
     - **Receptionist**: Opens the Front Desk intake queue.
     - **Doctor**: Automatically creates a record in `doctors/` for appointment booking.
     - **Pharmacist**: Accesses real-time medicine fulfillment.
     - **Hospital Admin**: Views executive footfall reports and downloads CSV audit logs.

---

## 🌐 Deployment Guide (Vercel & Firebase Hosting)

### Deploying to Vercel (Recommended)
This repository includes a pre-configured `vercel.json` with SPA route rewrites:
1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Framework Preset: **Vite**.
4. Click **Deploy**. Vercel will build and serve your application globally on its Edge CDN.

### Deploying to Firebase Hosting
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and build the project:
   ```bash
   firebase login
   npm run build
   ```
3. Deploy hosting and Firestore rules:
   ```bash
   firebase deploy
   ```

---

## 📄 License & Authorship

Developed and maintained by **MD SHAKIL AKHTAR** ([@tech-shakil](https://github.com/tech-shakil)).

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.
