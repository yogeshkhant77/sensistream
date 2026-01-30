/**
 * VideoPlayer Component
 *
 * Advanced HTML5 video player with:
 * - Multi-quality selection (1080p, 720p, 480p)
 * - HTTP range request support
 * - Pause/resume functionality
 * - Seek support
 * - Playback speed control
 * - Fullscreen mode
 * - Real-time playback progress tracking
 *
 * FEATURES:
 * 1. Loads video via backend streaming endpoint (/api/videos/:id/stream)
 * 2. Supports quality switching without reload
 * 3. Shows loading/buffering state
 * 4. Handles processing state (shows message until ready)
 * 5. Shows warnings for flagged videos
 * 6. Tracks playback progress via Socket.io
 */

import React, { useState, useEffect, useRef } from "react";
import { emitPlaybackProgress, emitVideoComplete } from "../socket/socket";
import styles from "../styles/VideoPlayer.module.css";

const VideoPlayer = ({ videoId, title, status, flags, onQualityChange }) => {
  const videoRef = useRef(null);
  const [qualities, setQualities] = useState(["original"]);
  const [selectedQuality, setSelectedQuality] = useState("720p");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverX, setHoverX] = useState(null);

  const controlsTimeoutRef = useRef(null);

  /**
   * Fetch available quality options from backend
   */
  useEffect(() => {
    const fetchQualities = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/videos/${videoId}/qualities`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await response.json();
        if (data.success) {
          setQualities(data.data.availableQualities);
          // Set best quality as default (if 720p available, use it; otherwise first available)
          const defaultQuality = data.data.availableQualities.includes("720p")
            ? "720p"
            : data.data.availableQualities[0];
          setSelectedQuality(defaultQuality);
        }
      } catch (err) {
        console.error("Failed to fetch qualities:", err);
      }
    };

    fetchQualities();
  }, [videoId]);

  /**
   * Update video source when quality changes
   * Uses HTTP range requests for efficient streaming
   * Pass token as query parameter since HTML5 <video> src can't use Authorization header
   */
  useEffect(() => {
    if (videoRef.current && videoId) {
      try {
        setIsLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required");
          return;
        }

        // Build streaming URL with quality and token parameters
        const streamUrl = `http://localhost:5000/api/videos/${videoId}/stream?quality=${selectedQuality}&token=${token}`;

        console.log(`📹 Loading ${selectedQuality} quality video`);

        // Save current playback position
        const currentPos = videoRef.current?.currentTime || 0;

        // Set new source directly - browser will handle streaming
        videoRef.current.src = streamUrl;

        // Reset loading state when video can play
        const handleCanPlay = () => {
          setIsLoading(false);
          // Try to resume from same position
          if (currentPos > 0 && videoRef.current) {
            videoRef.current.currentTime = Math.min(currentPos, duration);
          }
          videoRef.current?.removeEventListener("canplay", handleCanPlay);
        };

        videoRef.current.addEventListener("canplay", handleCanPlay);

        onQualityChange?.(selectedQuality);
      } catch (err) {
        console.error("❌ Error setting video source:", err);
        setError("Failed to load video");
        setIsLoading(false);
      }
    }
  }, [selectedQuality, videoId, duration, onQualityChange]);

  /**
   * REAL-TIME PLAYBACK PROGRESS TRACKING
   * Emits progress to backend via Socket.io every second
   */
  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (isPlaying && duration > 0) {
        // Emit progress to backend
        emitPlaybackProgress(videoId, currentTime, duration);
      }
    }, 1000); // Update every second

    return () => clearInterval(progressInterval);
  }, [videoId, currentTime, duration, isPlaying]);

  /**
   * TRACK VIDEO COMPLETION
   * Emits when video finishes
   */
  useEffect(() => {
    if (videoRef.current) {
      const handleEnded = () => {
        console.log("✅ Video completed");
        emitVideoComplete(videoId, duration);
      };

      const videoElement = videoRef.current;
      videoElement.addEventListener("ended", handleEnded);

      return () => {
        videoElement.removeEventListener("ended", handleEnded);
      };
    }
  }, [videoId, duration]);

  /**
   * Handle quality change
   * Seamlessly switches stream without interrupting playback (if possible)
   */
  const handleQualityChange = (quality) => {
    setIsLoading(true);
    setSelectedQuality(quality);
  };

  /**
   * Handle play/pause
   */
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  /**
   * Handle volume change
   */
  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  /**
   * Handle playback speed change
   */
  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  /**
   * Handle seek/scrubbing
   * Used when user clicks on progress bar or drags
   */
  const handleTimeChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  /**
   * Handle fullscreen toggle
   */
  const handleFullscreen = async () => {
    try {
      const playerContainer = document.getElementById(`player-${videoId}`);
      if (!isFullscreen) {
        if (playerContainer.requestFullscreen) {
          await playerContainer.requestFullscreen();
        } else if (playerContainer.webkitRequestFullscreen) {
          await playerContainer.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  /**
   * Auto-hide controls on mouse inactivity (when fullscreen)
   */
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    if (isFullscreen && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  /**
   * Format time for display
   */
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if video is processing
  const isProcessing = status === "Processing";
  const isFlagged = status === "Flagged";

  return (
    <div
      id={`player-${videoId}`}
      className={styles.playerContainer}
      onMouseMove={handleMouseMove}
    >
      {/* Status Messages */}
      {isFlagged && (
        <div className={styles.warningBanner}>
          <span>
            ⚠️ This video has been flagged. Viewer discretion advised.
          </span>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>
          <span>❌ {error}</span>
        </div>
      )}

      {/* Video Player */}
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          className={styles.video}
          poster={
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23000' width='400' height='225'/%3E%3C/svg%3E"
          }
          disabled={isProcessing}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onError={() => setError("Failed to load video")}
          controlsList="nodownload"
        />

        {/* Loading Indicator */}
        {isLoading && (
          <div className={styles.loadingIndicator}>
            <div className={styles.spinner}></div>
          </div>
        )}

        {/* Controls */}
        <div
          className={`${styles.controls} ${showControls || !isPlaying ? styles.visible : ""}`}
        >
          {/* Progress Bar - Always Visible */}
          <div
            className={styles.progressContainer}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              const time = percent * duration;
              setHoverTime(time);
              setHoverX(percent * 100);
            }}
            onMouseLeave={() => {
              setHoverTime(null);
              setHoverX(null);
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              const newTime = percent * duration;
              if (videoRef.current && !isProcessing) {
                videoRef.current.currentTime = newTime;
              }
            }}
          >
            <div className={styles.progressBarBackground}>
              <div
                className={styles.progressBarFill}
                style={{
                  width:
                    duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                }}
              />
              <div
                className={styles.progressBarDot}
                style={{
                  left:
                    duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                }}
              />
            </div>
            {/* Hover Tooltip */}
            {hoverTime !== null && (
              <div
                className={styles.progressTooltip}
                style={{ left: `${hoverX}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className={styles.bottomControls}>
            {/* Left Side: Play/Pause + Time */}
            <div className={styles.leftControls}>
              <button
                className={styles.controlBtn}
                onClick={handlePlayPause}
                disabled={isProcessing}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>

              <div className={styles.timeDisplay}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right Side: Volume + Speed + Quality + Fullscreen */}
            <div className={styles.rightControls}>
              {/* Volume Control */}
              <div className={styles.volumeControl}>
                <span className={styles.volumeIcon}>🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className={styles.volumeSlider}
                  title="Volume"
                />
              </div>

              {/* Playback Speed */}
              <select
                value={playbackRate}
                onChange={(e) =>
                  handlePlaybackRateChange(parseFloat(e.target.value))
                }
                className={styles.speedSelect}
                title="Playback Speed"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              {/* Quality Selection */}
              {qualities.length > 1 && (
                <select
                  value={selectedQuality}
                  onChange={(e) => handleQualityChange(e.target.value)}
                  className={styles.qualitySelect}
                  title="Video Quality"
                >
                  {qualities.map((q) => (
                    <option key={q} value={q}>
                      {q === "original" ? "Original" : q}
                    </option>
                  ))}
                </select>
              )}

              {/* Fullscreen */}
              <button
                className={styles.controlBtn}
                onClick={handleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? "🗗" : "⛶"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className={styles.videoInfo}>
        <h2>{title}</h2>
      </div>
    </div>
  );
};

export default VideoPlayer;
