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
import deleteButtonStyles from "../styles/DeleteButton.module.css";
import shareButtonStyles from "../styles/ShareButton.module.css";
import downloadButtonStyles from "../styles/DownloadButton.module.css";

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
                  <button
                    type="button"
                    className={shareButtonStyles.shareButton}
                    onClick={handleShare}
                  >
                    <span className={shareButtonStyles.button__text}>
                      Share
                    </span>
                    <span className={shareButtonStyles.button__icon}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 134 134"
                      >
                        <circle
                          strokeWidth="13"
                          stroke="white"
                          r="20.5"
                          cy="27"
                          cx="107"
                        ></circle>
                        <circle
                          strokeWidth="13"
                          stroke="white"
                          r="20.5"
                          cy="107"
                          cx="107"
                        ></circle>
                        <circle
                          strokeWidth="13"
                          stroke="white"
                          r="20.5"
                          cy="67"
                          cx="27"
                        ></circle>
                        <line
                          strokeWidth="13"
                          stroke="white"
                          y2="36.1862"
                          x2="88.0931"
                          y1="56.1862"
                          x1="48.0931"
                        ></line>
                        <line
                          strokeWidth="13"
                          stroke="white"
                          y2="97.6221"
                          x2="89.0893"
                          y1="78.1486"
                          x1="48.8304"
                        ></line>
                      </svg>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={downloadButtonStyles.button}
                    onClick={handleDownload}
                  >
                    <span className={downloadButtonStyles.button__text}>
                      Download
                    </span>
                    <span className={downloadButtonStyles.button__icon}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 35 35"
                        id="bdd05811-e15d-428c-bb53-8661459f9307"
                        data-name="Layer 2"
                      >
                        <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path>
                        <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path>
                        <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path>
                      </svg>
                    </span>
                  </button>
                  {canDelete && (
                    <button
                      className={deleteButtonStyles.button}
                      onClick={handleDelete}
                      type="button"
                      style={{ width: "150px", height: "40px" }}
                    >
                      <span className={deleteButtonStyles.button__text}>
                        Delete
                      </span>
                      <span className={deleteButtonStyles.button__icon}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="512"
                          viewBox="0 0 512 512"
                          height="512"
                        >
                          <title></title>
                          <path
                            style={{
                              fill: "none",
                              stroke: "#323232",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeWidth: "32px",
                            }}
                            d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320"
                          ></path>
                          <line
                            y2="112"
                            y1="112"
                            x2="432"
                            x1="80"
                            style={{
                              stroke: "#323232",
                              strokeLinecap: "round",
                              strokeMiterlimit: "10",
                              strokeWidth: "32px",
                            }}
                          ></line>
                          <path
                            style={{
                              fill: "none",
                              stroke: "#323232",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeWidth: "32px",
                            }}
                            d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40"
                          ></path>
                          <line
                            y2="400"
                            y1="176"
                            x2="256"
                            x1="256"
                            style={{
                              fill: "none",
                              stroke: "#323232",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeWidth: "32px",
                            }}
                          ></line>
                          <line
                            y2="400"
                            y1="176"
                            x2="192"
                            x1="184"
                            style={{
                              fill: "none",
                              stroke: "#323232",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeWidth: "32px",
                            }}
                          ></line>
                          <line
                            y2="400"
                            y1="176"
                            x2="320"
                            x1="328"
                            style={{
                              fill: "none",
                              stroke: "#323232",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeWidth: "32px",
                            }}
                          ></line>
                        </svg>
                      </span>
                    </button>
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
