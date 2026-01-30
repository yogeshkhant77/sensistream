/**
 * Library Page
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Input from "../components/Input";
import { videoAPI } from "../services/api";
import styles from "../styles/Library.module.css";
import viewButtonStyles from "../styles/ViewButton.module.css";
import deleteButtonStyles from "../styles/DeleteButton.module.css";
import uploadButtonStyles from "../styles/UploadButton.module.css";

const Library = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadVideos();
  }, [statusFilter, searchTerm]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getUserVideos({
        status: statusFilter,
        search: searchTerm,
      });
      setVideos(response.data.data);
      setError("");
    } catch (err) {
      setError("Failed to load videos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      setDeletingId(videoId);
      await videoAPI.deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      setError("Failed to delete video");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Check if user can delete a video (must be owner)
  const canDeleteVideo = (video) => {
    return video.owner._id === user?.id;
  };

  // Check if user can upload (not Viewer)
  const canUpload = user?.role !== "Viewer";

  const filterButtons = [
    { label: "All", value: null },
    { label: "Safe", value: "Safe" },
    { label: "Flagged", value: "Flagged" },
    { label: "Processing", value: "Processing" },
  ];

  return (
    <div className={styles.library}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Video Library</h1>
              <p className={styles.subtitle}>
                {user?.role === "Viewer"
                  ? "Watch videos uploaded by admins"
                  : "Manage and browse your uploaded videos"}
              </p>
            </div>
            {canUpload && (
              <button
                type="button"
                className={uploadButtonStyles.uploadButton}
                onClick={() => navigate("/upload")}
                style={{ width: "200px" }}
              >
                Upload Video
              </button>
            )}
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          {/* Search and Filters */}
          <div className={styles.controls}>
            <Input
              type="text"
              placeholder="Search videos by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className={styles.filterButtons}>
              {filterButtons.map((btn) => (
                <Button
                  key={btn.value}
                  variant={statusFilter === btn.value ? "primary" : "secondary"}
                  onClick={() => setStatusFilter(btn.value)}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Videos List */}
          {loading ? (
            <div className={styles.loading}>Loading videos...</div>
          ) : videos.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📹</div>
              <h2 className={styles.emptyTitle}>No videos found</h2>
              <p className={styles.emptyText}>
                Start by uploading your first video
              </p>
              <Button onClick={() => navigate("/upload")}>Upload Video</Button>
            </div>
          ) : (
            <div className={styles.videoGrid}>
              {videos.map((video) => (
                <div key={video._id} className={styles.videoCard}>
                  <div className={styles.videoHeader}>
                    <h3 className={styles.videoTitle}>{video.title}</h3>
                    <Badge status={video.status} />
                  </div>

                  {video.description && (
                    <p className={styles.videoDescription}>
                      {video.description}
                    </p>
                  )}

                  <div className={styles.videoMeta}>
                    <span>
                      📅 {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                    <span>📊 {(video.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>

                  {video.status !== "Processing" && (
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}

                  {video.status === "Processing" && (
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${video.processingProgress}%` }}
                      />
                      <span className={styles.progressText}>
                        {video.processingProgress}%
                      </span>
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/videos/${video._id}`)}
                      disabled={deletingId === video._id}
                      className={viewButtonStyles.viewButton}
                    >
                      View
                    </Button>
                    {canDeleteVideo(video) && (
                      <button
                        className={deleteButtonStyles.button}
                        onClick={() => handleDelete(video._id)}
                        disabled={deletingId === video._id}
                        type="button"
                      >
                        <span className={deleteButtonStyles.button__text}>
                          {deletingId === video._id ? "Deleting..." : "Delete"}
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Library;
