# LearnHub Client Application

LearnHub is a modern, responsive online learning portal built with **React**, **Vite**, **TypeScript**, and **TailwindCSS**. It provides students with a clean interface to watch video lessons, and administrators with a secure admin dashboard to upload and manage lessons using direct-signed uploads to **Cloudinary**.

---

## 🛠 Tech Stack & Architecture

- **Frontend Framework:** React (Vite-powered, TypeScript)
- **Styling:** TailwindCSS
- **State Management & Data Fetching:** TanStack React Query (for caching and background synchronization)
- **API Client:** Axios (configured with base URLs and credential interceptors in [axios.ts](file:///d:/recat/LearningPortal/client/src/api/axios.ts))
- **Icons:** Lucide React

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Running instance of the backend server (default port: `5000`)

### Installation & Local Run
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL (typically [http://localhost:5173](http://localhost:5173)) in your browser.

---

## 🛡 Administration & Video Management

To upload, manage, or delete lessons in LearnHub, user accounts must have the `admin` role. 

### 🔑 Demo Admin Credentials
For testing and demonstration, a default admin account can be seeded into the database:
- **Email:** `admin@learnhub.com`
- **Password:** `admin@123`
---



### 2. How to Add and Publish Video Lessons
Once you log in with an account that has `admin` privileges:

1. Click on the **Admin Panel** link visible in the navigation header ([Navbar.tsx](file:///d:/recat/LearningPortal/client/src/components/Navbar.tsx)), or navigate directly to [http://localhost:5173/admin](http://localhost:5173/admin).
2. Fill out the **Upload Video** form on the left:
   - **Video Title:** Enter a clear title for the lesson (e.g. *Learn React Hooks*).
   - **Description:** Provide a detailed description of the contents covered.
   - **Video File:** Choose the video file (e.g., `.mp4`, `.webm` formats, up to 100MB).
   - **Thumbnail Image:** Select a cover image (e.g., `.jpg`, `.png`).
3. Click the **Publish Lesson** button.

#### What happens behind the scenes?
To optimize performance and avoid loading the backend server with heavy file transfers, the application uses **Signed Direct Uploads**:
1. **Signature Token:** The client requests a secure upload token and signature from the backend endpoint (`GET /api/admin/cloudinary-signature`).
2. **Direct to Cloudinary:** 
   - The thumbnail file is uploaded directly from the browser to the Cloudinary image upload API.
   - The video file is uploaded directly to the Cloudinary video upload API.
   - *A live progress bar monitors the upload progress (10% allocated to thumbnail upload, 90% allocated to video upload).*
3. **Database Registry:** Once both files are uploaded, the client sends a `POST` request to the backend `/api/admin/videos` containing the video title, description, secure URLs (HTTPS), duration, and Cloudinary public IDs.
4. **Re-fetch:** The client automatically invalidates queries to refresh the lessons list.

---

### 3. How to Delete Video Lessons
Administrators can easily remove videos from both the app and Cloudinary:
1. Locate the lesson under **Managed Lessons** on the right side of the Admin Panel page.
2. Click the **Trash Can (Delete)** icon on the target video.
3. Confirm the deletion popup.
4. **Cleanup Action:** The backend endpoint `DELETE /api/admin/videos/:id` will delete the record from the MongoDB collection and contact the Cloudinary API to permanently delete both the video and thumbnail assets.
