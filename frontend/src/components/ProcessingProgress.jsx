/**
 * ProcessingProgress Component
 * Displays real-time video processing progress from Socket.io
 */

import React, { useState, useEffect } from "react";
import { subscribeToProcessingProgress } from "../socket/socket";
import styles from "../styles/ProcessingProgress.module.css";

const ProcessingProgress = ({ videoId, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Pending");
  const [currentQuality, setCurrentQuality] = useState(null);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToProcessingProgress((event) => {
      if (event.type === "start") {
        console.log("🎬 Processing started");
        setProgress(0);
        setStatus("Starting");
        setError("");
        setIsVisible(true);
      } else if (event.type === "progress") {
        console.log(`📊 Progress: ${event.data.progress}%`);
        setProgress(event.data.progress);
        setStatus(event.data.status || "Processing");
        setCurrentQuality(event.data.quality);
      } else if (event.type === "complete") {
        console.log("✅ Processing complete");
        setProgress(100);
        setStatus("Complete");
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 2000);
      } else if (event.type === "error") {
        console.error("❌ Processing error:", event.data.error);
        setError(event.data.error);
        setStatus("Error");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>📹 Processing Video</h3>
        <span className={styles.status}>{status}</span>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={styles.progressText}>{progress}%</span>
      </div>

      {/* Current Quality */}
      {currentQuality && (
        <div className={styles.info}>
          <span>📊 Quality: {currentQuality}</span>
        </div>
      )}

      {/* Error Message */}
      {error && <div className={styles.error}>❌ {error}</div>}

      {/* Status Message */}
      <div className={styles.message}>
        {progress < 100
          ? "Your video is being processed. This may take a few minutes..."
          : "Processing complete! Your video is ready to watch."}
      </div>
    </div>
  );
};

export default ProcessingProgress;
