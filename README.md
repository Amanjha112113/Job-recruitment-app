# RecruitmentHub

> **Enterprise-Grade Job Recruitment Platform** — Bridging top-tier talent with industry-leading companies through seamless authentication, real-time analytics, and secure document management.

## 📊 Tech Stack & Platform Badges

[![Web Platform](https://img.shields.io/badge/Platform-Web-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web)
[![React Framework](https://img.shields.io/badge/Framework-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js Backend](https://img.shields.io/badge/Runtime-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express Server](https://img.shields.io/badge/Server-Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google OAuth](https://img.shields.io/badge/Auth-Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/identity/protocols/oauth2)
[![JWT Security](https://img.shields.io/badge/Security-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Cloudinary Storage](https://img.shields.io/badge/Storage-Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Vite Build](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Live Demo](https://img.shields.io/badge/Demo-Live-00C7B7?style=for-the-badge&logo=render&logoColor=white)](https://job-recruitment-backend-oeba.onrender.com)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Docker Ready](https://img.shields.io/badge/Container-Docker_Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](Dockerfile)

---
**Live Backend:** [https://job-recruitment-backend-oeba.onrender.com](https://job-recruitment-backend-oeba.onrender.com)

---

## 📖 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
  - [Job Seeker Features](#job-seeker-features)
  - [Recruiter Features](#recruiter-features)
- [Technology Stack](#technology-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [DevOps & Tooling](#devops--tooling)
- [Resume Management System](#resume-management-system)
  - [Zero-Local-Disk Strategy](#zero-local-disk-strategy)
  - [Secure Access Protocol](#secure-access-protocol)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Installation & Execution](#installation--execution)
- [Project Structure](#project-structure)
- [Security & Compliance](#security--compliance)
- [Testing Strategy](#testing-strategy)
- [Performance Optimization](#performance-optimization)
- [Deployment](#deployment)
- [Contributing Guidelines](#contributing-guidelines)
- [License](#license)

---

**Key Architectural Decisions:**

- **Stateless API Design:** All backend endpoints are stateless, enabling horizontal scaling
- **Token-Based Authentication:** JWT with refresh token rotation for session management
- **Streaming-First File Processing:** Zero disk I/O for resume uploads (RAM to Cloudinary direct)
- **Protected Routes Hierarchy:** Nested route protection based on user roles (SEEKER/RECRUITER)
- **Rate Limiting:** 100 requests per 15-minute window per IP address
- **Input Sanitization:** All user inputs validated via express-validator before processing

---

## ✨ Key Features

### 👨‍💼 Job Seeker Features

| Feature | Description | Technical Implementation |
|---------|-------------|--------------------------|
| **One-Click Application** | Pre-filled application forms with smart data persistence | React Hook Form + Zod validation schema |
| **Real-Time Tracking** | Visual Kanban boards for application status tracking | React Context + Optimistic UI updates |
| **Job Archive** | Historical view of deleted job postings | Aggregation pipeline with soft deletion flags |
| **Smart Bookmarking** | Save and organize job listings | MongoDB compound indexing (user_id + job_id) |
| **Google OAuth 2.0** | Passwordless authentication flow | Passport.js + Google OAuth strategy |
| **Application History** | Complete timeline of all submitted applications | Mongoose population with pagination |
| **Resume Versioning** | Maintain multiple resume versions per user | Cloudinary versioning + metadata tracking |

### 👔 Recruiter Features

| Feature | Description | Technical Implementation |
|---------|-------------|--------------------------|
| **Dynamic Job Board** | CRUD operations with real-time updates | Express REST API + Mongoose ODM |
| **Candidate Hub** | Centralized applicant management dashboard | Material-UI Data Grid + server-side pagination |
| **Secure Resume Access** | Time-limited signed URLs for document viewing | Cloudinary signed URLs (1-hour TTL) |
| **Feedback System** | Direct candidate communication channel | MongoDB embedded documents + real-time notifications |
| **Analytics Dashboard** | Real-time metrics on job posting performance | MongoDB aggregation pipelines |
| **Bulk Actions** | Batch update application statuses | MongoDB bulkWrite operations |
| **Export Functionality** | Download candidate data as CSV | json2csv + stream compression |

---

## 🛠️ Technology Stack

### Frontend

```json
{
  "framework": "React 19.0.0 (RC)",
  "buildTool": "Vite 5.0.0",
  "styling": "Tailwind CSS 4.0.0",
  "routing": "React Router DOM 7.0.0",
  "stateManagement": "Context API + useReducer",
  "formHandling": "React Hook Form 7.48.0",
  "validation": "Zod 3.22.0",
  "httpClient": "Axios 1.6.0 (with interceptors)",
  "uiComponents": "Headless UI + Heroicons",
  "charts": "Recharts 2.10.0",
  "notifications": "React Hot Toast 2.4.0"
}
## 🚀 Core Features

### For Job Seekers
- **One-Click Application:** Simplified flow to apply for jobs with pre-filled details and resume uploads.
- **Real-Time Tracking:** Visual timeline boards to track application status (Shortlisted, Interview, Selected, etc.).
- **Job Archive:** Dedicated section for applications where the recruiter has deleted the job posting.
- **Smart Bookmarking:** Save interesting job posts with a single click to apply later.
- **Google OAuth:** Secure, hassle-free authentication for faster access.

### For Recruiters
- **Dynamic Job Board:** Post, edit, and manage multiple job listings with ease.
- **Candidate Hub:** Centralized dashboard to review applicants, view cover letters, and track hiring progress.
- **Secure Candidate Insights:** View candidate resumes via temporary, secure Cloudinary links to protect privacy.
- **Feedback Loop:** Provide direct feedback to candidates directly from the dashboard.

---

## 🛠️ Technology Stack

### Frontend (Modern React Environment)
- **React 19:** Utilizing the latest React features for optimal performance.
- **Vite:** Lightning-fast build and development experience.
- **Tailwind CSS 4:** Ultra-responsive, modern design with custom branding.
- **React Router 7:** Seamless client-side navigation and protected routing.
- **Context API:** Global state management for user authentication and session handling.

### Backend (Scalable Node.js Infrastructure)
- **Node.js & Express 5:** Fast, unopinionated server-side framework.
- **MongoDB & Mongoose 9:** Robust document-oriented data management.
- **JWT & Bcrypt:** Secure token-based authentication and industry-standard password hashing.
- **Multer:** Efficient processing of multi-part form data.
- **Cloudinary:** Enterprise-grade cloud storage for candidate resumes.

---

## 📄 Resume Management Architecture

Our platform implements a "zero-local-disk" storage strategy for maximum security and scalability.

1.  **Direct Streaming:** Resumes are never saved to our server's hard drive. They are streamed directly from RAM to **Cloudinary's secure private storage**.
2.  **Access Control:** All resumes are stored in a private mode. They are not publicly accessible via static URLs.
3.  **Signed Secure Links:** When a recruiter views a resume, the system generates a **Signed URL** with a 1-hour expiration. This ensures that even if a link is shared, it self-destructs after the session.
4.  **Metadata Tracking:** Only the file identifier and name are stored in MongoDB, ensuring your database remains light and lightning-fast.

---

## 💻 Local Development

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Connection String
- Cloudinary API Credentials
- Google Cloud Console Project ID (for OAuth)

### Quick Start
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Amanjha112113/Job-recruitment-app.git
    cd Job-recruitment-app
    ```

2.  **Environment Setup:**
    Create a `.env` file in the `backend/` directory:
    ```env
    PORT=5001
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_URL=your_cloudinary_url
    GOOGLE_CLIENT_ID=your_google_id
    ```

3.  **Install & Run:**
    ```bash
    # Root directory (Frontend)
    npm install
    npm run dev

    # Backend directory
    cd backend
    npm install
    npm run dev
    ```

---

*Built with ❤️ for a better recruitment experience.*
