# SensiStream - Video Upload, Sensitivity Processing & Streaming Platform

A production-ready full-stack application for uploading, processing, and streaming videos with real-time sensitivity analysis and role-based access control.

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/b082217b-9e46-45fb-8782-a9eba562a1f1" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/28c18524-246d-40ff-a452-025b163f3096" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/8635cddf-1239-482c-bd5f-646fe66954fe" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/73b7d480-7322-41ae-9bed-d1b710c11595" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/4e30fd2b-f6a7-4457-9d23-b8b9ab004863" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/ebcdd46e-eea8-4789-8645-488bbebf8387" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/0656cc35-1ad6-4a14-a2fb-04b053bfc648" />

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Features Documentation](#features-documentation)

---

## ✨ Features

### Authentication & RBAC

- User Registration & Login with JWT authentication
- Role-based access control: **Viewer**, **Editor**, **Admin**
- Secure password hashing with bcryptjs
- Protected frontend routes & backend APIs

### Dashboard

- Statistics cards: Total Videos, Safe Videos, Flagged Videos
- Personalized welcome message
- Recent videos preview
- Quick upload CTA

### Video Upload

- Drag-and-drop file upload interface
- Supported formats: MP4, MKV, AVI, MOV, WEBM
- Max file size: 500MB
- Upload progress tracking
- Metadata storage: title, description, owner, status

### Video Processing

- Automatic post-upload validation
- Real-time processing progress via Socket.io
- Simulated sensitivity analysis (keyword-based detection)
- Status updates: Processing → Safe/Flagged
- Progress bar with live updates

### Video Streaming

- HTTP range request support for efficient streaming
- Role-based access control (owner or admin only)
- Block streaming for processing videos
- MIME-type detection

### Video Library

- List all user's videos with status badges
- Search by title
- Filter by status (Safe, Flagged, Processing)
- Delete videos with confirmation
- Video metadata display (date, size)

### User Management (Admin Only)

- View all users in the system
- Change user roles (Viewer → Editor → Admin)
- Activate/Deactivate users
- Delete users
- See user join dates and status

---

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js (Latest LTS)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Real-time**: Socket.io
- **Password Hashing**: bcryptjs
- **Validation**: Custom middleware

### Frontend

- **Library**: React 18+
- **Bundler**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Styling**: CSS Modules
- **State Management**: React Context

---

## 📁 Project Structure

```
pulse1/
│
├── backend/
│   ├── config/
│   │   ├── database.js           # MongoDB connection
│   │   └── environment.js        # Environment variables
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt hashing
│   │   └── Video.js              # Video schema with processing status
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── roleCheck.js          # Role authorization
│   │   └── errorHandler.js       # Global error handling
│   ├── controllers/
│   │   ├── authController.js     # Auth logic (register, login)
│   │   ├── videoController.js    # Video operations & processing
│   │   └── userController.js     # User management (admin)
│   ├── routes/
│   │   ├── auth.js               # Auth endpoints
│   │   ├── videos.js             # Video endpoints
│   │   └── users.js              # User management endpoints
│   ├── utils/
│   ├── uploads/                  # Temporary video storage
│   ├── server.js                 # Main Express & Socket.io server
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # Navigation bar with user menu
    │   │   ├── Card.jsx           # Reusable card component
    │   │   ├── Button.jsx         # Styled buttons
    │   │   ├── Modal.jsx          # Reusable modal dialog
    │   │   ├── Badge.jsx          # Status badges
    │   │   ├── Input.jsx          # Form input fields
    │   │   └── ProtectedRoute.jsx # Route protection
    │   ├── pages/
    │   │   ├── Login.jsx          # Login page
    │   │   ├── Register.jsx       # Registration page
    │   │   ├── Dashboard.jsx      # Main dashboard
    │   │   ├── Upload.jsx         # Video upload page
    │   │   ├── Library.jsx        # Video library & listing
    │   │   └── Users.jsx          # User management (admin)
    │   ├── services/
    │   │   ├── api.js             # Axios API instance & calls
    │   │   └── socket.js          # Socket.io client
    │   ├── context/
    │   │   └── AuthContext.jsx    # Authentication state
    │   ├── styles/
    │   │   ├── global.css         # Global styles
    │   │   ├── Navbar.module.css
    │   │   ├── Card.module.css
    │   │   ├── Button.module.css
    │   │   ├── Modal.module.css
    │   │   ├── Badge.module.css
    │   │   ├── Input.module.css
    │   │   ├── Auth.module.css
    │   │   ├── Dashboard.module.css
    │   │   ├── Upload.module.css
    │   │   ├── Library.module.css
    │   │   └── Users.module.css
    │   ├── App.jsx                # Main app router
    │   └── main.jsx               # React DOM render
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .env
```

---

## 📦 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v16+ LTS) - [Download](https://nodejs.org/)
- **MongoDB** (Local or Atlas) - [Download](https://www.mongodb.com/try/download/community) or [Atlas Cloud](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** (comes with Node.js)

### Verify Installation

```bash
node --version      # Should show v16.0.0 or higher
npm --version       # Should show 7.0.0 or higher
```

---

## 🚀 Installation & Setup

### Step 1: Clone/Navigate to Project

```bash
cd pulse1
```

### Step 2: Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` folder with:

```env
PORT=5000
NODE_ENV=development

# MongoDB URI
# For local: mongodb://localhost:27017/sensistream
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/sensistream
MONGODB_URI=mongodb://localhost:27017/sensistream

JWT_SECRET=your_secure_secret_key_change_in_production_12345
JWT_EXPIRE=7d

MAX_FILE_SIZE=524288000
UPLOAD_DIR=./uploads

FRONTEND_URL=http://localhost:5173
```

#### Start MongoDB

**On Windows (if installed locally):**

```bash
# If MongoDB is installed and running as a service, skip this
# Or use MongoDB Atlas instead
```

**Using MongoDB Atlas (Cloud):**

- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get your connection string
- Update `MONGODB_URI` in `.env`

#### Start Backend Server

```bash
npm run dev
# Or: npm start
```

Expected output:

```
✅ SensiStream server running on port 5000
📡 Environment: development
🎥 Video uploads directory: ./uploads
```

---

### Step 3: Frontend Setup

#### Open a New Terminal/Command Prompt

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` folder with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### Start Frontend Development Server

```bash
npm run dev
```

Expected output:

```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 🎯 Running the Application

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

---

## 📝 First Time Usage

### Create Admin Account (Optional)

1. Register a new account at `/register`
2. Log in at `/login`
3. Use a MongoDB client (MongoDB Compass) to change role to "Admin"

### Default Account (For Testing)

Register with any email/password:

- **Email**: test@example.com
- **Password**: password123

---

## 🔑 API Documentation

### Authentication Endpoints

#### Register User

```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "organization": "Acme Corp"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

#### Login User

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

#### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "john@example.com",
    "firstName": "John",
    "role": "Editor"
  }
}
```

### Video Endpoints

#### Upload Video

```
POST /api/videos/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- video: <file>
- title: "My Video"
- description: "Video description"

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "My Video",
    "status": "Processing",
    "processingProgress": 10
  }
}
```

#### Get User Videos

```
GET /api/videos/my-videos?status=Safe&search=title
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Video Title",
      "status": "Safe",
      "sensitivityScore": 25,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Dashboard Stats

```
GET /api/videos/dashboard/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalVideos": 5,
    "safeVideos": 3,
    "flaggedVideos": 2
  }
}
```

#### Stream Video

```
GET /api/videos/stream/:videoId
Authorization: Bearer <token>
Range: bytes=0-1023 (optional)

Response: Video file stream
```

#### Delete Video

```
DELETE /api/videos/:videoId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Video deleted successfully"
}
```

### User Management Endpoints (Admin Only)

#### Get All Users

```
GET /api/users
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "email": "user@example.com",
      "firstName": "John",
      "role": "Editor",
      "status": "Active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Update User Role

```
PATCH /api/users/:userId/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "Admin"
}

Response:
{
  "success": true,
  "message": "User role updated successfully",
  "data": { ... }
}
```

#### Update User Status

```
PATCH /api/users/:userId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Inactive"
}
```

#### Delete User

```
DELETE /api/users/:userId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 📡 Socket.io Events

### Client → Server

```javascript
// Join video processing room
socket.emit("join-video", videoId);

// Leave video processing room
socket.emit("leave-video", videoId);
```

### Server → Client

```javascript
// Processing update
socket.on("processing-update", (data) => {
  console.log(data);
  // { videoId, progress: 50, message: '...' }
});

// Processing complete
socket.on("processing-complete", (data) => {
  console.log(data);
  // { videoId, status: 'Safe', sensitivityScore: 25 }
});

// Processing error
socket.on("processing-error", (data) => {
  console.log(data);
  // { videoId, error: 'Error message' }
});
```

---

## 🎨 UI Styling Guide

The application uses a clean, modern design with:

- **Primary Color**: #4a90e2 (Blue)
- **Background**: #f5f7fa (Light Gray)
- **Cards**: White with soft shadows
- **Typography**: System fonts with varied weights
- **Spacing**: Consistent 8px base unit
- **Responsive**: Mobile-first design (768px breakpoint)

All styles are in **CSS Modules** for component scoping and no Tailwind used (per requirements).

---

## 🔒 Security Notes

### Production Deployment

1. Change `JWT_SECRET` to a secure random string
2. Set `NODE_ENV=production`
3. Use HTTPS only
4. Set CORS to specific domain
5. Enable MongoDB authentication
6. Use environment secrets manager

### Password Security

- Minimum 6 characters enforced
- Bcryptjs with salt rounds = 10
- Never stored or logged

### Token Security

- JWT expires in 7 days (configurable)
- Token stored in localStorage
- Automatic logout on token expiration
- Authorization header required for protected routes

---

## 🐛 Troubleshooting

### MongoDB Connection Error

```
Error connecting to MongoDB: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**:

- Start MongoDB service
- Or use MongoDB Atlas and update MONGODB_URI

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**:

- Kill the process using the port
- Or change PORT in .env

### CORS Errors

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution**:

- Ensure FRONTEND_URL is correct in backend .env
- Check API_BASE_URL in frontend .env

### Video Upload Fails

```
413 Payload Too Large
```

**Solution**:

- Check MAX_FILE_SIZE (default 500MB)
- Browser may have size limits

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Mongoose](https://mongoosejs.com/)
- [React Documentation](https://react.dev/)
- [Socket.io Documentation](https://socket.io/docs/)
- [JWT.io](https://jwt.io/)

---

## 📄 License

This project is provided as-is for educational and assignment purposes.

---

## 👤 Author

**SensiStream Development Team**  
Built with ❤️ for production-ready video streaming

---

## 🎯 Next Steps

1. ✅ Install and run both servers
2. ✅ Create test accounts
3. ✅ Upload test videos
4. ✅ Test all features
5. ✅ Deploy to production (configure .env)

**Happy streaming! 🚀**
