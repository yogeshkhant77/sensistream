# 🎬 SensiStream - Complete Project Documentation

A production-ready full-stack video upload, processing, and streaming platform with real-time sensitivity analysis and role-based access control.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [Installation Guide](#installation-guide)
7. [Quick Start](#quick-start)
8. [API Documentation](#api-documentation)
9. [Role-Based Access Control](#role-based-access-control)
10. [Video Processing Pipeline](#video-processing-pipeline)
11. [Real-Time Progress Tracking](#real-time-progress-tracking)
12. [Video Streaming System](#video-streaming-system)
13. [Deployment Guide](#deployment-guide)
14. [Database Schema](#database-schema)
15. [Environment Configuration](#environment-configuration)

---

## Project Overview

**SensiStream** is a comprehensive video management platform that enables users to:

- Upload and manage videos with drag-and-drop interface
- Real-time processing with sensitivity analysis
- Stream videos with role-based access control
- Track upload, processing, and playback progress in real-time
- Manage users and roles through an admin dashboard

**Project Statistics:**

- 50+ total files
- 5,000+ lines of code
- 6 reusable React components
- 6 full-page React components
- 13+ API endpoints
- 2 database models (User, Video)
- 11 CSS modules (no Tailwind)
- 4 Socket.io real-time events

---

## Tech Stack

### Backend

- **Runtime**: Node.js (v16+ LTS recommended)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Real-time Communication**: Socket.io
- **Password Hashing**: bcryptjs
- **Video Processing**: FFmpeg (optional)
- **Validation**: Custom middleware & Express validators

### Frontend

- **Library**: React 18+
- **Bundler**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Real-time**: Socket.io-client
- **Styling**: CSS Modules (no external UI frameworks)
- **State Management**: React Context API

### Infrastructure

- **Development**: Local environment
- **Production Ready**: Docker-compatible
- **Database Hosting**: MongoDB Atlas support
- **File Storage**: Local disk or AWS S3 CDN

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │   Services   │     │
│  │ - Dashboard  │  │ - Navbar     │  │ - API Client │     │
│  │ - Upload     │  │ - Modal      │  │ - Socket.io  │     │
│  │ - Library    │  │ - Badge      │  │              │     │
│  │ - Users      │  │ - VideoPlayer│  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────┬──────────────────────────────────────┘
                      │ HTTPS + WebSocket
┌─────────────────────┴──────────────────────────────────────┐
│                  Backend (Node.js + Express)               │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────┐    │
│  │   Routes      │  │ Controllers  │  │ Middleware  │    │
│  │ - /auth       │  │ - Auth       │  │ - JWT Auth  │    │
│  │ - /videos     │  │ - Videos     │  │ - RBAC      │    │
│  │ - /users      │  │ - Users      │  │ - Error Hdlr│    │
│  └───────────────┘  └──────────────┘  └─────────────┘    │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Socket.io Server                       │   │
│  │  - Upload Progress  - Processing Updates           │   │
│  │  - Playback Sync    - Real-time Notifications      │   │
│  └────────────────────────────────────────────────────┘   │
└──────────┬─────────────────────────┬──────────────────────┘
           │                         │
        ┌──▼──────┐          ┌──────▼──────┐
        │ MongoDB  │          │ File Storage │
        │ Database │          │ (Local/S3)   │
        └──────────┘          └──────────────┘
```

---

## Project Structure

```
pulse1/
│
├── README.md                          # Original project README
├── PROJECT_DOCUMENTATION.md           # This comprehensive guide
│
├── backend/
│   ├── config/
│   │   ├── database.js               # MongoDB connection setup
│   │   └── environment.js            # Environment variable loader
│   │
│   ├── models/
│   │   ├── User.js                   # User schema (auth, roles)
│   │   ├── Video.js                  # Video schema (metadata, status)
│   │   └── Progress.js               # Upload/processing progress tracking
│   │
│   ├── middleware/
│   │   ├── auth.js                   # JWT authentication
│   │   ├── roleCheck.js              # Role-based authorization
│   │   └── errorHandler.js           # Global error handling
│   │
│   ├── controllers/
│   │   ├── authController.js         # Register, Login, Current User
│   │   ├── videoController.js        # Upload, List, Delete, Stats
│   │   ├── videoStreamController.js  # HTTP 206 streaming, qualities
│   │   └── userController.js         # Get Users, Update Role/Status, Delete
│   │
│   ├── routes/
│   │   ├── auth.js                   # Authentication endpoints
│   │   ├── videos.js                 # Video management endpoints
│   │   └── users.js                  # User management endpoints
│   │
│   ├── services/
│   │   ├── videoCompressionService.js # FFmpeg integration
│   │   └── storageService.js         # Storage abstraction (Local/S3)
│   │
│   ├── socket/
│   │   └── index.js                  # Socket.io event handlers
│   │
│   ├── uploads/                       # Video file storage directory
│   ├── server.js                      # Express & Socket.io entry point
│   ├── package.json                   # Backend dependencies
│   └── .env                          # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                   # Main router component
│   │   ├── main.jsx                  # React entry point
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global auth state management
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                # Axios client with interceptors
│   │   │   └── socket.js             # Socket.io client initialization
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx             # User login (public)
│   │   │   ├── Register.jsx          # User registration (public)
│   │   │   ├── Dashboard.jsx         # Main dashboard (protected)
│   │   │   ├── Upload.jsx            # Video upload (Editor/Admin)
│   │   │   ├── Library.jsx           # Video library & search
│   │   │   ├── VideoDetails.jsx      # Video player & details
│   │   │   └── Users.jsx             # Admin user management
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Navigation & user menu
│   │   │   ├── Card.jsx              # Reusable card layout
│   │   │   ├── Button.jsx            # Styled button component
│   │   │   ├── Input.jsx             # Form input component
│   │   │   ├── Modal.jsx             # Dialog modal component
│   │   │   ├── Badge.jsx             # Status badge component
│   │   │   ├── ProtectedRoute.jsx    # Route guard component
│   │   │   ├── VideoPlayer.jsx       # HTML5 video player
│   │   │   └── ProcessingProgress.jsx # Processing progress component
│   │   │
│   │   ├── hooks/                    # Custom React hooks (extensible)
│   │   │
│   │   ├── styles/
│   │   │   ├── global.css            # Global styles & animations
│   │   │   ├── Auth.module.css       # Login/Register styles
│   │   │   ├── Dashboard.module.css  # Dashboard styles
│   │   │   ├── Upload.module.css     # Upload form styles
│   │   │   ├── Library.module.css    # Video library styles
│   │   │   ├── Users.module.css      # User management styles
│   │   │   ├── Navbar.module.css     # Navigation styles
│   │   │   ├── Card.module.css       # Card component styles
│   │   │   ├── Button.module.css     # Button styles
│   │   │   ├── Modal.module.css      # Modal dialog styles
│   │   │   ├── Badge.module.css      # Badge styles
│   │   │   ├── Input.module.css      # Input field styles
│   │   │   └── ProcessingProgress.module.css # Progress tracking styles
│   │   │
│   │   ├── socket/
│   │   │   └── socket.js             # Socket.io event listeners
│   │   │
│   │   ├── index.html                # HTML entry point
│   │   └── main.jsx                  # React root render
│   │
│   ├── vite.config.js                # Vite configuration
│   ├── package.json                  # Frontend dependencies
│   └── .env                          # Environment variables
│
└── [Test & Setup Scripts]
    ├── test-stream.js                # Stream testing
    ├── test-auth.js                  # Authentication testing
    ├── setup-test-data.js            # Create test data
    └── ... (other utility scripts)
```

---

## Core Features

### 1. Authentication & Authorization

#### User Registration

- **Endpoint**: `POST /api/auth/register`
- **Validation**:
  - First name & last name required
  - Email uniqueness checked
  - Password minimum 6 characters
- **Default Role**: Viewer
- **Response**: User object with JWT token

#### User Login

- **Endpoint**: `POST /api/auth/login`
- **Authentication**: Email & password validation with bcryptjs
- **JWT Token**: Valid for 7 days
- **Response**: User object with authentication token

#### Current User Info

- **Endpoint**: `GET /api/auth/me`
- **Authentication**: JWT required
- **Response**: Current user's full profile

#### Password Security

- Hashing: bcryptjs with 10 salt rounds
- Comparison: Secure bcrypt.compare()
- Never stored in plain text

---

### 2. Role-Based Access Control (RBAC)

#### Role Hierarchy

```
Admin (Full Access)
  ├── Upload videos
  ├── Manage all videos
  ├── Manage users
  ├── View analytics
  └── Access admin dashboard

Editor (Content Creator)
  ├── Upload videos
  ├── Edit/delete own videos
  ├── View all videos
  └── Cannot manage users

Viewer (Content Consumer)
  ├── View/watch videos only
  └── Cannot upload or delete
```

#### Permission Matrix

| Feature        | Admin | Editor | Viewer |
| -------------- | ----- | ------ | ------ |
| Upload Video   | ✅    | ✅     | ❌     |
| Edit Own       | ✅    | ✅     | ❌     |
| Edit Others    | ✅    | ❌     | ❌     |
| Delete Own     | ✅    | ✅     | ❌     |
| Delete Others  | ✅    | ❌     | ❌     |
| View Videos    | ✅    | ✅     | ✅     |
| Stream Video   | ✅    | ✅     | ✅     |
| Manage Users   | ✅    | ❌     | ❌     |
| View Analytics | ✅    | ❌     | ❌     |

#### Implementation

- **Middleware**: `middleware/roleCheck.js`
- **Location**: Applied on routes requiring specific roles
- **Enforcement**: Both frontend (UI) and backend (API)
- **Response**: 403 Forbidden if insufficient permissions

---

### 3. Dashboard

#### Statistics Cards

- **Total Videos**: Count of all user's videos
- **Safe Videos**: Count of non-flagged videos
- **Flagged Videos**: Count of sensitivity-flagged videos
- **Real-time Updates**: Via Socket.io

#### Dashboard Components

- Personalized welcome message with user's first name
- Recent videos preview (last 3 uploaded)
- Quick upload call-to-action button
- Responsive grid layout

#### API Endpoint

- `GET /api/videos/stats` - Fetch dashboard statistics
- **Authentication**: JWT required
- **Response**: `{ total, safe, flagged }`

---

### 4. Video Upload

#### Upload Interface

- **Drag-and-Drop**: Visual feedback during drag-over
- **File Selection**: Click to browse alternative
- **File Preview**: Shows selected file name and size

#### Supported Formats

- MP4, MKV, AVI, MOV, WEBM
- Validated on both frontend and backend
- MIME-type checking on server

#### Upload Limits

- **Max File Size**: 500MB (configurable via `MAX_FILE_SIZE`)
- **Encoding**: multipart/form-data
- **Timeout**: 30 minutes (configurable)

#### Metadata Storage

- **Title**: Required field
- **Description**: Optional
- **Owner**: Automatically set to logged-in user
- **Filename & Size**: Auto-captured from upload
- **Initial Status**: "Processing"

#### Role Requirements

- **Editor & Admin**: Can upload
- **Viewer**: Cannot upload
- **Route Protection**: `roleCheck(['Editor', 'Admin'])`

#### Progress Tracking

- Real-time upload percentage display
- Byte-level tracking (bytesUploaded / totalBytes)
- Socket.io events: `uploadProgress` and `uploadComplete`
- Cancellable uploads with abort support

---

### 5. Video Processing Pipeline

#### Processing Stages

1. **Upload Validation** - File integrity check
2. **Format Detection** - MIME type & codec analysis
3. **Quality Analysis** - Content safety analysis
4. **Compression** - Multi-quality encoding (1080p, 720p, 480p)
5. **Thumbnail Generation** - Auto-extraction
6. **Metadata Extraction** - Duration, dimensions, etc.
7. **Status Update** - Mark as Safe or Flagged
8. **Notification** - Alert user of completion
9. **Storage** - Persist to database & disk
10. **Cleanup** - Remove temporary files

#### Status Values

- **Processing**: Active encoding in progress
- **Safe**: Content analysis passed
- **Flagged**: Sensitivity detected (keyword match)
- **Error**: Processing failed

#### Real-time Updates

- Socket.io event: `processingUpdate`
- Percentage and stage information
- Error messages if processing fails

---

### 6. Video Library

#### Library Display

- **List View**: All user's videos with metadata
- **Status Badges**: Visual indicators (Safe/Flagged/Processing)
- **Video Cards**: Title, thumbnail, upload date, size

#### Search & Filter

- **Search**: By video title (case-insensitive)
- **Filter by Status**: Safe, Flagged, or Processing
- **Sort Options**: By date, title, or status

#### Video Management

- **Delete**: With confirmation modal
- **View Details**: Open in video player
- **Watch History**: Track resume points
- **Metadata Display**: Date uploaded, file size, duration

#### API Endpoints

- `GET /api/videos/my-videos` - List user's videos
- `GET /api/videos?search=title&status=safe` - Search & filter
- `DELETE /api/videos/:id` - Delete video
- `GET /api/videos/:id` - Video details

---

### 7. Video Streaming

#### HTTP Streaming Protocol

- **HTTP 206 Partial Content**: Efficient range request handling
- **Byte-Range Support**: Skip, pause, resume functionality
- **Content-Type Detection**: Automatic MIME-type serving

#### Quality Selection

- **Available Qualities**: 1080p, 720p, 480p (if available)
- **Bandwidth Adaptation**: User selects quality
- **Fallback**: Serves original if compressed unavailable

#### Access Control

- **Owner Only**: Non-admins can only stream own videos
- **Admin Access**: Admins can stream any video
- **Processing Block**: Cannot stream while processing
- **Status Check**: Allows streaming regardless of Safe/Flagged

#### Video Player Features

- **Play/Pause**: Standard controls
- **Seek/Scrub**: Drag timeline to skip
- **Volume Control**: Adjustable audio level
- **Playback Speed**: 0.5x to 2x speeds
- **Fullscreen**: Toggle fullscreen mode
- **Quality Dropdown**: Switch video quality
- **Loading Indicator**: Show buffering state

#### APIs

- `GET /api/videos/:id/stream` - Stream video file (206 Partial)
- `GET /api/videos/:id/qualities` - Available qualities
- `GET /api/videos/:id/metadata` - Video info & duration
- Range header parsing for byte-accurate streaming

---

### 8. User Management (Admin Only)

#### Admin Features

- **View All Users**: List all system users
- **Manage Roles**: Promote/demote between Viewer → Editor → Admin
- **Activate/Deactivate**: Toggle user account status
- **Delete Users**: Remove user from system
- **User Info**: Join date, last login, current role, status

#### User Display

- **Table View**: Sortable columns
- **User Actions**: Role change, activate/deactivate, delete
- **Confirmation Dialogs**: Prevent accidental changes
- **Real-time Updates**: Socket.io notifications

#### API Endpoints

- `GET /api/users` - List all users (Admin only)
- `PATCH /api/users/:id/role` - Update user role
- `PATCH /api/users/:id/status` - Toggle active status
- `DELETE /api/users/:id` - Delete user

---

## Installation Guide

### System Requirements

| Requirement | Minimum | Recommended   |
| ----------- | ------- | ------------- |
| Node.js     | 16.0.0  | 18.0.0+ (LTS) |
| npm         | 7.0.0   | 9.0.0+        |
| RAM         | 4GB     | 8GB+          |
| Disk Space  | 2GB     | 5GB+          |
| MongoDB     | 4.0     | 5.0+          |
| Git         | -       | Latest        |

### Step 1: Node.js Installation

**Windows:**

1. Visit https://nodejs.org/
2. Download LTS version
3. Run installer with default options
4. Restart your computer

**macOS:**

```bash
brew install node
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install nodejs npm
```

**Verify Installation:**

```bash
node --version    # Should show v16.0.0+
npm --version     # Should show 7.0.0+
```

### Step 2: MongoDB Setup

#### Option A: Local MongoDB Installation

**Windows:**

1. Download from https://www.mongodb.com/try/download/community
2. Run installer, select custom path
3. Choose "Install MongoDB as a Service"
4. Verify: `mongod --version`

**macOS:**

```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**

```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster (free tier available)
3. Create database user with password
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
5. Add your IP to whitelist (or allow all: 0.0.0.0/0)

**Verify Connection:**

```bash
mongo "mongodb://localhost:27017"  # Local
# or
mongo "mongodb+srv://user:pass@cluster.mongodb.net/dbname"  # Atlas
```

### Step 3: Clone/Extract Project

```bash
# If using Git
git clone <repository-url> pulse1
cd pulse1

# Or extract ZIP file
# Navigate to pulse1 folder
```

### Step 4: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (use provided .env.example as template)
# Edit .env and configure:
# - MONGODB_URI
# - JWT_SECRET
# - PORT (default 5000)
# - NODE_ENV (development/production)

# Test database connection
npm run test:db

# Start server
npm run dev
```

**Expected Output:**

```
✅ SensiStream server running on http://localhost:5000
📡 Environment: development
✨ Socket.io server ready
```

### Step 5: Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env file
# Edit .env and configure:
# - VITE_API_URL=http://localhost:5000

# Start development server
npm run dev
```

**Expected Output:**

```
  VITE v4.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Quick Start

### 5-Minute Setup

**Terminal 1 - Backend:**

```bash
cd backend
npm install
npm run dev
# Wait for: "✅ Server running on port 5000"
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install
npm run dev
# Navigate to http://localhost:5173
```

**Access Application:**

- Open browser: http://localhost:5173
- **Register**: Create test account (e.g., test@example.com)
- **Login**: Use credentials
- **Upload**: Click "Upload Video" to test

### Test Data Setup

```bash
# Create sample users and videos
cd backend
npm run setup-test-data

# Output:
# ✅ Created 5 test users
# ✅ Created 10 test videos
# ✅ Ready for testing
```

---

## API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "Viewer",
    "createdAt": "2024-01-30T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "user": { ... }
}
```

---

### Video Endpoints

#### Upload Video

```http
POST /api/videos/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

title=My Video
description=Video description
videoFile=<binary>
```

**Response:**

```json
{
  "success": true,
  "video": {
    "_id": "video_id",
    "title": "My Video",
    "owner": "user_id",
    "status": "Processing",
    "uploadedAt": "2024-01-30T10:00:00Z"
  }
}
```

#### Get My Videos

```http
GET /api/videos/my-videos?page=1&limit=10&search=title&status=safe
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "videos": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

#### Stream Video

```http
GET /api/videos/:id/stream?quality=720p
Authorization: Bearer {token}
Range: bytes=0-1024
```

**Response:**

- HTTP 206 Partial Content
- Binary video data
- Content-Range header

#### Get Available Qualities

```http
GET /api/videos/:id/qualities
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "qualities": [
    { "resolution": "1080p", "size": 500000000 },
    { "resolution": "720p", "size": 250000000 },
    { "resolution": "480p", "size": 100000000 }
  ]
}
```

#### Delete Video

```http
DELETE /api/videos/:id
Authorization: Bearer {token}
```

#### Get Dashboard Stats

```http
GET /api/videos/stats
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "stats": {
    "total": 25,
    "safe": 20,
    "flagged": 5
  }
}
```

---

### User Management Endpoints (Admin Only)

#### Get All Users

```http
GET /api/users?page=1&limit=10
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "users": [
    {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "Editor",
      "isActive": true,
      "createdAt": "2024-01-30T10:00:00Z"
    }
  ]
}
```

#### Update User Role

```http
PATCH /api/users/:id/role
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "role": "Editor"  // Viewer, Editor, or Admin
}
```

#### Toggle User Status

```http
PATCH /api/users/:id/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "isActive": false
}
```

#### Delete User

```http
DELETE /api/users/:id
Authorization: Bearer {admin_token}
```

---

## Role-Based Access Control

### RBAC Implementation Details

#### Frontend Protection

- **ProtectedRoute Component**: Guards all private routes
- **Role Check**: Validates user role before rendering
- **Auto-Redirect**: Sends to login if not authenticated
- **Conditional Rendering**: Shows/hides UI based on role

#### Backend Protection

- **Auth Middleware**: Validates JWT on every request
- **Role Middleware**: Enforces role requirements
- **Resource Ownership**: Checks ownership for edit/delete
- **Admin Checks**: Validates admin access for admin endpoints

#### Enforcement Rules

**Upload Feature:**

```javascript
// Route protection
router.post(
  "/upload",
  authenticate,
  roleCheck(["Editor", "Admin"]),
  uploadHandler,
);

// Result: Viewers cannot access upload endpoint
// Returns: 403 Forbidden with clear message
```

**User Management:**

```javascript
// Admin-only protection
router.get("/users", authenticate, roleCheck(["Admin"]), getUsersHandler);

// Result: Only admins see user management panel
// Frontend: Menu hidden, route inaccessible
// Backend: 403 error if attempted
```

**Video Streaming:**

```javascript
// Owner or Admin access
if (video.owner.toString() !== user._id.toString() && user.role !== "Admin") {
  return res.status(403).json({ error: "Access denied" });
}

// Result: Users can only stream own videos or are admins
```

---

## Video Processing Pipeline

### Processing Flow

```
1. File Upload
   ↓
2. Validation
   ├─ File size check
   ├─ Format validation
   └─ MIME type check
   ↓
3. Storage
   └─ Save to /uploads
   ↓
4. Analysis
   ├─ Content scanning
   ├─ Keyword detection
   └─ Sensitivity scoring
   ↓
5. Status Update
   ├─ Set to Safe (no issues)
   ├─ Set to Flagged (issues found)
   └─ Update database
   ↓
6. Optional Compression (with FFmpeg)
   ├─ Create 1080p version
   ├─ Create 720p version
   ├─ Create 480p version
   └─ Generate thumbnail
   ↓
7. Completion
   └─ Notify user via Socket.io
```

### Status Flow Diagram

```
Processing → Safe/Flagged → Complete
     ↓
  (Progress % updates)
```

### Real-time Updates

Users receive Socket.io events during processing:

```javascript
// Every 10% of processing
socket.on("processingUpdate", (data) => {
  // {
  //   videoId: 'video_id',
  //   stage: 2,      // Current stage (1-10)
  //   progress: 20,  // Percentage (0-100)
  //   status: 'Analyzing content...'
  // }
});

// When complete
socket.on("processingComplete", (data) => {
  // {
  //   videoId: 'video_id',
  //   status: 'Safe',  // Safe or Flagged
  //   message: 'Processing completed!'
  // }
});
```

---

## Real-Time Progress Tracking

### Upload Progress Tracking

**How It Works:**

1. Frontend sends file via XMLHttpRequest
2. Track `progress` event: `bytesUploaded / totalBytes`
3. Emit to Socket.io: `uploadProgress` event
4. Backend broadcasts to user's other connections
5. Save progress to database for resumability

**Frontend Code:**

```javascript
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener("progress", (e) => {
  if (e.lengthComputable) {
    const percentComplete = (e.loaded / e.total) * 100;
    socket.emit("uploadProgress", {
      videoId,
      progress: percentComplete,
    });
  }
});
```

**Display in UI:**

- Progress bar showing percentage
- Current speed (MB/s)
- Estimated time remaining
- Ability to pause/cancel

### Processing Progress Tracking

**10-Stage Pipeline:**

1. Upload validation (0-10%)
2. Format detection (10-20%)
3. Content analysis (20-40%)
4. Quality assessment (40-50%)
5. 1080p encoding (50-60%)
6. 720p encoding (60-75%)
7. 480p encoding (75-85%)
8. Thumbnail extraction (85-90%)
9. Metadata extraction (90-95%)
10. Database update (95-100%)

**Real-time Delivery:**

```javascript
// Server sends progress every 5 seconds
socket.to(userId).emit("processingUpdate", {
  videoId: "id",
  stage: 5, // Current stage
  progress: 50, // Overall percentage
  status: "Encoding to 1080p...",
});
```

### Playback Progress Tracking

**Tracked Metrics:**

- Current playback position (seconds)
- Total watched duration
- Resume point for next session
- Watch completion (100% watched)
- Multi-device sync

**Storage:**

```javascript
// Saved to Progress collection
{
  userId: 'user_id',
  videoId: 'video_id',
  currentPosition: 120,      // Seconds
  totalWatched: 600,         // Seconds
  duration: 900,             // Total video length
  watchedAt: 'timestamp',
  completed: false
}
```

---

## Video Streaming System

### HTTP Range Requests

**Client Request:**

```http
GET /api/videos/:id/stream?quality=720p
Range: bytes=0-1024
```

**Server Response:**

```http
HTTP/1.1 206 Partial Content
Content-Type: video/mp4
Content-Range: bytes 0-1024/52428800
Content-Length: 1025

[binary video data]
```

**Advantages:**

- Skip to any part of video
- Pause and resume
- Browser caching support
- Efficient bandwidth usage

### Quality Selection

**Available Qualities (if encoded):**

- 1080p: Full HD (high bandwidth)
- 720p: HD (moderate bandwidth)
- 480p: SD (low bandwidth)

**User Controls:**

```javascript
// Dropdown selector in VideoPlayer
const [quality, setQuality] = useState('720p')

const handleQualityChange = (newQuality) => {
  // Fetch new quality stream
  const response = await fetch(`/api/videos/${id}/stream?quality=${newQuality}`)
  // Restart video at current position
}
```

### Storage Options

#### Local Storage (Default)

- **Path**: `backend/uploads/`
- **Advantages**: Simple setup, no dependencies
- **Disadvantages**: Limited scalability

#### AWS S3 + CloudFront (Production)

- **Benefits**: CDN distribution, global scalability
- **Signed URLs**: Time-limited secure access
- **CloudFront**: Caches videos near users

**Switch Storage:**

```javascript
// In storageService.js
const STORAGE_TYPE = process.env.STORAGE_TYPE || "local"; // 'local' or 's3'
```

---

## Deployment Guide

### Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] MongoDB Atlas cluster created
- [ ] SSL certificates obtained (HTTPS)
- [ ] Domain name secured
- [ ] Deployment platform selected
- [ ] Monitoring/alerts configured
- [ ] Backups strategy planned

### Backend Production Configuration

**Update `backend/.env` for production:**

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sensistream?retryWrites=true&w=majority

# Security
JWT_SECRET=aB3xY9kLmN2qPr5sT8uV1wX4yZ7cDeF0gHjIkMnOpQrStUvWxYzAbCdEfGhIjKlM
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=524288000
UPLOAD_DIR=/var/uploads

# CORS
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/sensistream/server.log
```

### Frontend Production Configuration

**Update `frontend/.env` for production:**

```env
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=wss://api.yourdomain.com
```

### Deployment Platforms

#### Option 1: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create backend app
cd backend
heroku create sensistream-api

# Set environment variables
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your-secret-key

# Deploy
git push heroku main
```

#### Option 2: AWS EC2

```bash
# 1. Launch EC2 instance (Ubuntu 20.04)
# 2. SSH into instance
ssh -i key.pem ubuntu@instance-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# 4. Clone repository
git clone <repo-url>
cd pulse1

# 5. Install PM2 for process management
npm install -g pm2

# 6. Start services
pm2 start backend/server.js --name "sensistream-api"
pm2 start frontend --name "sensistream-ui"

# 7. Configure nginx as reverse proxy
sudo apt install nginx
# ... configure /etc/nginx/sites-available/default
sudo systemctl start nginx
```

#### Option 3: Docker Containerization

**Backend Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ .

EXPOSE 5000

CMD ["npm", "start"]
```

**Build and run:**

```bash
docker build -t sensistream-api .
docker run -p 5000:5000 --env-file .env sensistream-api
```

### SSL/HTTPS Setup

**Using Let's Encrypt:**

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Monitoring & Logging

**Log Aggregation:**

- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **CloudWatch**: AWS logs collection
- **Datadog**: APM and monitoring
- **Sentry**: Error tracking

**Health Checks:**

```javascript
// Add health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});
```

---

## Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  firstName: String,          // Required
  lastName: String,           // Required
  email: String,              // Required, unique
  password: String,           // Hashed with bcrypt
  role: String,               // 'Viewer', 'Editor', 'Admin'
  isActive: Boolean,          // Default: true
  profileImage: String,       // URL to profile photo
  joinedAt: Date,             // Auto timestamp
  lastLogin: Date,            // Last login time
  createdAt: Date,            // Auto timestamp
  updatedAt: Date             // Auto timestamp
}
```

### Video Model

```javascript
{
  _id: ObjectId,
  title: String,              // Required
  description: String,        // Optional
  owner: ObjectId,            // Reference to User
  filename: String,           // Original filename
  mimetype: String,           // video/mp4, etc.
  filesize: Number,           // Bytes
  duration: Number,           // Seconds (from FFmpeg)
  status: String,             // 'Processing', 'Safe', 'Flagged', 'Error'
  thumbnail: String,          // URL or path
  qualities: [
    {
      resolution: String,     // '1080p', '720p', '480p'
      size: Number,           // File size in bytes
      path: String            // File path
    }
  ],
  uploadedAt: Date,           // Upload timestamp
  processedAt: Date,          // Processing complete timestamp
  createdAt: Date,            // Auto timestamp
  updatedAt: Date             // Auto timestamp
}
```

### Progress Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  videoId: ObjectId,          // Reference to Video
  type: String,               // 'upload', 'processing', 'playback'
  currentProgress: Number,    // 0-100 percentage
  currentPosition: Number,    // Current second (for playback)
  totalSize: Number,          // Total bytes (for upload)
  uploadedSize: Number,       // Bytes uploaded
  stage: Number,              // 1-10 for processing
  status: String,             // 'in-progress', 'completed', 'failed'
  startedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Environment Configuration

### Backend `.env` Template

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection
MONGODB_URI=mongodb://localhost:27017/sensistream

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=7d

# File Upload Settings
MAX_FILE_SIZE=524288000                    # 500MB in bytes
UPLOAD_DIR=./uploads

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Storage Configuration
STORAGE_TYPE=local                         # 'local' or 's3'
# S3_BUCKET=your-bucket-name
# S3_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your-key
# AWS_SECRET_ACCESS_KEY=your-secret

# Logging
LOG_LEVEL=debug
```

### Frontend `.env` Template

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Environment Variables Reference

| Variable        | Description     | Default                   | Examples                |
| --------------- | --------------- | ------------------------- | ----------------------- |
| `PORT`          | Server port     | 5000                      | 3000, 8080, 5000        |
| `NODE_ENV`      | Environment     | development               | development, production |
| `MONGODB_URI`   | Database URL    | mongodb://localhost:27017 | MongoDB Atlas URI       |
| `JWT_SECRET`    | Secret key      | (required)                | 32+ character string    |
| `JWT_EXPIRE`    | Token expiry    | 7d                        | 7d, 30d, 24h            |
| `MAX_FILE_SIZE` | Upload limit    | 500MB                     | Bytes (5MB - 1GB)       |
| `FRONTEND_URL`  | Frontend origin | http://localhost:5173     | https://domain.com      |
| `STORAGE_TYPE`  | Storage backend | local                     | local, s3               |

---

## Development Workflow

### Running Locally

**Terminal 1 - Backend:**

```bash
cd backend
npm install          # First time only
npm run dev          # Starts with nodemon
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install          # First time only
npm run dev          # Starts Vite dev server
```

### Testing

**API Testing:**

```bash
# Using provided test scripts
npm run test:auth    # Test authentication
npm run test:stream  # Test video streaming
npm run test:db      # Test database connection
```

### Building for Production

**Backend:**

```bash
cd backend
npm run build        # If configured
npm start            # Production start
```

**Frontend:**

```bash
cd frontend
npm run build        # Vite build to dist/
npm run preview      # Preview production build
```

---

## Support & Troubleshooting

### Common Issues

**MongoDB Connection Failed**

```
Solution: Check MONGODB_URI in .env
- Verify connection string format
- Check network access (whitelist IP for Atlas)
- Ensure MongoDB service is running
```

**CORS Errors**

```
Solution: Check FRONTEND_URL and CORS configuration
- Ensure FRONTEND_URL matches frontend origin
- Add frontend URL to Express CORS settings
```

**Upload Fails**

```
Solution: Check file size and upload directory
- Verify file is under MAX_FILE_SIZE limit
- Ensure /uploads directory exists and is writable
- Check disk space availability
```

**Socket.io Connection Issues**

```
Solution: Verify Socket.io configuration
- Check VITE_SOCKET_URL matches backend URL
- Ensure WebSocket support on hosting provider
- Check firewall rules
```

---

## Summary

SensiStream is a comprehensive, production-ready video platform featuring:

✅ Complete user authentication with JWT and bcrypt
✅ Role-based access control (Admin, Editor, Viewer)
✅ Real-time video upload and processing tracking
✅ HTTP 206 video streaming with quality selection
✅ Admin user management dashboard
✅ Responsive frontend with React and Vite
✅ Scalable backend with Node.js and MongoDB
✅ Real-time communication via Socket.io
✅ Comprehensive error handling
✅ Production-ready deployment guides

---

**Last Updated**: January 30, 2026
**Version**: 1.0
**Maintained By**: Development Team
