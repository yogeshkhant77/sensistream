/**
 * VideoDetails Page
 * Displays video with streaming player
 * Shows metadata, quality options, and related videos
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import VideoPlayer from "../components/VideoPlayer";
import Button from "../components/Button";
import styles from "../styles/VideoDetails.module.css";

const VideoDetails = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("720p");
  const [relatedVideos, setRelatedVideos] = useState([]);

  /**
   * Fetch video details on component mount
   */
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/api/videos/${videoId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await response.json();
        if (data.success) {
          setVideo(data.data);
          setError("");
        } else {
          setError(data.message || "Failed to load video");
        }
      } catch (err) {
        console.error("Error fetching video:", err);
        setError("Failed to load video details");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId]);

  /**
   * Fetch related videos
   */
  useEffect(() => {
    const fetchRelatedVideos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/videos/my-videos`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await response.json();
        if (data.success) {
          const related = data.data
            .filter((v) => v._id !== videoId)
            .slice(0, 5);
          setRelatedVideos(related);
        }
      } catch (err) {
        console.error("Error fetching related videos:", err);
      }
    };

    if (videoId) {
      fetchRelatedVideos();
    }
  }, [videoId]);

  /**
   * Handle download (would require backend implementation)
   */
  const handleDownload = () => {
    alert("Download feature coming soon!");
  };

  /**
   * Handle share
   */
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/videos/${videoId}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Video link copied to clipboard!");
  };

  /**
   * Handle delete
   */
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/videos/${videoId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      if (data.success) {
        alert("Video deleted successfully");
        navigate("/library");
      } else {
        alert(data.message || "Failed to delete video");
      }
    } catch (err) {
      console.error("Error deleting video:", err);
      alert("Error deleting video");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <p>Loading video...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.mainContent}>
          <div className={styles.errorContainer}>
            <p>❌ {error}</p>
            <Button onClick={() => navigate("/library")}>
              Back to Library
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  const canDelete = video.owner._id === user?.id || user?.role === "Admin";
  const statusColor =
    video.status === "Safe"
      ? "#2e7d32"
      : video.status === "Flagged"
        ? "#d32f2f"
        : "#f57c00";

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <a href="/library">Library</a> / <span>{video.title}</span>
          </div>

          {/* Main Content */}
          <div className={styles.contentGrid}>
            {/* Video Player Section */}
            <div className={styles.playerSection}>
              <VideoPlayer
                videoId={videoId}
                title={video.title}
                status={video.status}
                flags={video.flags}
                onQualityChange={(quality) => setSelectedQuality(quality)}
              />

              {/* Video Metadata */}
              <div className={styles.metadata}>
                <h1 className={styles.title}>{video.title}</h1>

                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Status:</span>
                    <span
                      className={styles.badge}
                      style={{ backgroundColor: statusColor }}
                    >
                      {video.status}
                    </span>
                  </div>

                  {video.sensitivityScore !== undefined && (
                    <div className={styles.metaItem}>
                      <span className={styles.label}>Sensitivity Score:</span>
                      <span className={styles.value}>
                        {video.sensitivityScore}%
                      </span>
                    </div>
                  )}

                  {video.duration && (
                    <div className={styles.metaItem}>
                      <span className={styles.label}>Duration:</span>
                      <span className={styles.value}>
                        {Math.floor(video.duration / 60)}:
                        {(video.duration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>

                {video.flags && video.flags.length > 0 && (
                  <div className={styles.flagsContainer}>
                    <span className={styles.label}>Flags:</span>
                    <div className={styles.flags}>
                      {video.flags.map((flag, i) => (
                        <span key={i} className={styles.flag}>
                          ⚠️ {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {video.description && (
                  <div className={styles.description}>
                    <h3>Description</h3>
                    <p>{video.description}</p>
                  </div>
                )}

                {/* Owner Info */}
                <div className={styles.ownerInfo}>
                  <div>
                    <span className={styles.label}>Uploaded by:</span>
                    <span className={styles.value}>
                      {video.owner.firstName} {video.owner.lastName}
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>Date:</span>
                    <span className={styles.value}>
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Quality Info */}
                <div className={styles.qualityInfo}>
                  <p>
                    📹 Current Quality: <strong>{selectedQuality}</strong>
                  </p>
                  <p className={styles.hint}>
                    🎯 Tip: Change quality in the player controls based on your
                    bandwidth
                  </p>
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                  <Button onClick={handleShare} className={styles.btn}>
                    📤 Share
                  </Button>
                  <Button onClick={handleDownload} className={styles.btn}>
                    ⬇️ Download
                  </Button>
                  {canDelete && (
                    <Button
                      onClick={handleDelete}
                      className={`${styles.btn} ${styles.danger}`}
                    >
                      🗑️ Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Related Videos */}
            {relatedVideos.length > 0 && (
              <div className={styles.sidebar}>
                <h3>Related Videos</h3>
                <div className={styles.relatedList}>
                  {relatedVideos.map((v) => (
                    <div
                      key={v._id}
                      className={styles.relatedItem}
                      onClick={() => navigate(`/videos/${v._id}`)}
                    >
                      <div className={styles.relatedThumbnail}>
                        <span>▶️</span>
                      </div>
                      <div className={styles.relatedContent}>
                        <p className={styles.relatedTitle}>{v.title}</p>
                        <p className={styles.relatedStatus}>{v.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoDetails;
