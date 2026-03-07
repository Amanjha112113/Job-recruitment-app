# React + Vite

backend : https://job-recruitment-backend-oeba.onrender.com

# Resume Management System

This document explains the technical architecture and data flow for handling resume uploads and secure retrieval in the recruitment platform.

## Architecture Overview

The system uses a combination of local server processing, cloud media storage, and NoSQL database metadata to handle file uploads without storing gigabytes of binary data on the web server or the primary database.

- **Frontend:** React (Vite)
- **Backend:** Node.js & Express
- **File Processing:** Multer (Memory Storage)
- **Cloud Storage:** Cloudinary (Private Uploads)
- **Metadata Database:** MongoDB (Mongoose)

---

## 1. The Upload Journey

When a candidate applies for a job and selects a PDF resume:

1.  **Client-Side Preparation:** The React component (`Apply.jsx`) packages the PDF file into a `multipart/form-data` request using the `FormData` API.
2.  **Server-Side Interception:** The Express server receives the request at `POST /api/resume/upload`. The **Multer** middleware intercepts the file steam and holds it temporarily in the server's RAM (volatile memory) rather than writing to disk.
3.  **Cloudinary Streaming:** The server initializes a `cloudinary.uploader.upload_stream`. It "pipes" the file buffer from RAM directly to Cloudinary's cloud servers.
4.  **Metadata Storage:** Once Cloudinary confirms receipt, it returns a `public_id`. The server then creates a new document in the **MongoDB** `resumes` collection containing:
    -   `candidateId`: The ID of the user.
    -   `cloudinaryPublicId`: The key needed to find the file in the cloud.
    -   `fileName`: The original name of the file (e.g., `my_resume.pdf`).
    -   `uploadedAt`: Timestamp.
5.  **User Flag:** The user's profile is updated with a `resume: "uploaded"` flag to enable conditional UI rendering in the frontend.

---

## 2. Secure Retrieval (Recruiter View)

Resumes are uploaded to a **Private** folder in Cloudinary. They are not publicly accessible via a URL.

When a recruiter clicks "View Resume":

1.  **Authorization Request:** The frontend requests `GET /api/resume/:candidateId`.
2.  **Permission Check:** The backend verifies that the requesting user is either an Admin, the Candidate themselves, or a Recruiter with an active application from that candidate.
3.  **Signed URL Generation:** The server asks Cloudinary to generate a **Signed URL**. This URL includes a cryptographic signature and an expiration timestamp (currently set to **1 hour**).
4.  **Temporary Access:** The recruiter receives this unique, expiring link. They can view or download the PDF, but the link will self-destruct after the expiration time, ensuring candidate data remains protected.

---

## 3. Technology Benefits

-   **Zero Disk Usage:** The Express server never stores the file on its own hard drive, making the application horizontally scalable and "stateless."
-   **Database Performance:** MongoDB only stores small strings (IDs and names) rather than large Binary Large Objects (BLOBs), keeping queries lightning fast.
-   **Security:** By using Cloudinary's "Private" type and "Authenticated" access mode, files cannot be scraped or accessed by unauthorized users even if they guess the file ID.

