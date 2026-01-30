/**
 * Upload Video Page
 * Features:
 * - Drag & drop file upload
 * - Real-time upload progress via XMLHttpRequest
 * - Real-time processing progress via Socket.io
 * - Role-based access control
 */

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import ProcessingProgress from "../components/ProcessingProgress";
import { subscribeToProcessingProgress } from "../socket/socket";
import styles from "../styles/Upload.module.css";

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedVideoId, setUploadedVideoId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const xhrRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "#e8ecff";
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = "#f0f4ff";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "#f0f4ff";
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("✅ FORM SUBMIT TRIGGERED!");

    if (!title.trim()) {
      setMessage("❌ Please enter a video title");
      setMessageType("error");
      return;
    }

    if (!file) {
      setMessage("❌ Please select a video file");
      setMessageType("error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setMessage("📤 Uploading...");
    setMessageType("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated. Please login again.");
      }

      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title);
      formData.append("description", description || "");

      console.log("📡 Uploading to: http://localhost:5000/api/videos/upload");

      // Use XMLHttpRequest for upload progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(percentComplete);
            console.log(`📊 Upload progress: ${percentComplete.toFixed(2)}%`);
          }
        });

        // Handle upload completion
        xhr.addEventListener("load", async () => {
          if (xhr.status === 201) {
            const response = JSON.parse(xhr.responseText);
            console.log("✅ Upload successful:", response);

            setUploadProgress(100);
            setUploadedVideoId(response.data._id);
            setMessage("✅ Upload complete! Processing video...");
            setMessageType("success");
            setIsUploading(false);
            setIsProcessing(true);

            resolve(response);
          } else {
            const response = JSON.parse(xhr.responseText);
            throw new Error(response.message || "Upload failed");
          }
        });

        // Handle upload error
        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        // Send request
        xhr.open("POST", "http://localhost:5000/api/videos/upload", true);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error("❌ Upload error:", error);
      setMessage(`❌ ${error.message || "Upload failed"}`);
      setMessageType("error");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
    setIsUploading(false);
    setUploadProgress(0);
    setMessage("Upload cancelled");
    setMessageType("error");
  };

  const handleProcessingComplete = () => {
    console.log("✅ Video processing complete");
    setIsProcessing(false);
    setMessage("✅ Video ready! Redirecting...");
    setMessageType("success");
    setTimeout(() => {
      navigate("/library");
    }, 2000);
  };

  // RBAC: Check if user can upload
  if (user?.role === "Viewer") {
    return (
      <div className={styles.uploadPage}>
        <Navbar />
        <main className={styles.mainContent}>
          <div className={styles.container}>
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                background: "white",
                borderRadius: "8px",
                marginTop: "40px",
              }}
            >
              <h1 style={{ color: "#d32f2f", marginBottom: "16px" }}>
                Access Denied ❌
              </h1>
              <p
                style={{
                  fontSize: "16px",
                  color: "#666",
                  marginBottom: "24px",
                }}
              >
                Viewers cannot upload videos. Only Editors and Admins can upload
                content.
              </p>
              <Button onClick={() => navigate("/library")}>
                Back to Library
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.uploadPage}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>📹 Upload Video</h1>
            <p className={styles.subtitle}>Upload and analyze video content</p>
          </div>

          {message && (
            <div
              className={styles.alert}
              style={{
                backgroundColor:
                  messageType === "error" ? "#ffe5e5" : "#e5ffe5",
                color: messageType === "error" ? "#d32f2f" : "#2e7d32",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "20px",
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Upload Progress */}
            {isUploading && (
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className={styles.progressText}>
                  {uploadProgress.toFixed(1)}%
                </span>
                <Button
                  type="button"
                  onClick={handleCancelUpload}
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#d32f2f",
                  }}
                >
                  Cancel Upload
                </Button>
              </div>
            )}

            {/* Processing Progress */}
            {isProcessing && uploadedVideoId && (
              <ProcessingProgress
                videoId={uploadedVideoId}
                onComplete={handleProcessingComplete}
              />
            )}

            {/* Title Input */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Video Title <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                disabled={isUploading || isProcessing}
              />
            </div>

            {/* Description Input */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Description (Optional)</label>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter video description"
                rows="4"
                disabled={isUploading || isProcessing}
              />
            </div>

            {/* File Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Video File <span className={styles.required}>*</span>
              </label>
              <div
                className={styles.dropZone}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("fileInput").click()}
                style={{ cursor: "pointer" }}
              >
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>⬆️</div>
                <p style={{ margin: "0 0 5px 0", fontWeight: "500" }}>
                  Click to upload or drag and drop
                </p>
                <p style={{ margin: "0", fontSize: "13px", color: "#666" }}>
                  MP4, MKV, AVI, MOV, WEBM (Max 500MB)
                </p>
                <input
                  id="fileInput"
                  type="file"
                  accept="video/mp4,video/x-matroska,video/x-msvideo,video/quicktime,video/webm,.mp4,.mkv,.avi,.mov,.webm"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
              {file && (
                <p
                  style={{
                    marginTop: "10px",
                    color: "#2e7d32",
                    fontSize: "14px",
                  }}
                >
                  ✅ Selected: {file.name} (
                  {(file.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              disabled={isUploading || isProcessing || !file || !title.trim()}
              style={{ marginTop: "10px" }}
            >
              {isUploading ? "📤 Uploading..." : "🚀 Upload Video"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Upload;
