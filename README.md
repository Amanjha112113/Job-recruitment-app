# RecruitmentHub - Full Stack Job Recruitment Platform

A high-performance, modern job recruitment platform designed to connect top talent with great companies. Featuring secure Google OAuth integration, real-time application tracking, and an advanced resume management system.

**Live Backend:** [https://job-recruitment-backend-oeba.onrender.com](https://job-recruitment-backend-oeba.onrender.com)

---

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
