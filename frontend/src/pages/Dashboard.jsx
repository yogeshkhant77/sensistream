/**
 * Dashboard Page
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import { videoAPI } from "../services/api";
import styles from "../styles/Dashboard.module.css";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVideos: 0,
    safeVideos: 0,
    flaggedVideos: 0,
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, videosRes] = await Promise.all([
        videoAPI.getDashboardStats(),
        videoAPI.getUserVideos(),
      ]);

      setStats(statsRes.data.data);
      setRecentVideos(videosRes.data.data.slice(0, 3));
      setError("");
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Dashboard</h1>
              <p className={styles.subtitle}>
                Welcome back, {user?.firstName}! Here's your video overview.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => {
                console.log("📹 Upload button clicked, navigating to /upload");
                navigate("/upload");
              }}
              className={styles.uploadBtn}
            >
              ⬆️ Upload Video
            </Button>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className={styles.statsGrid}>
                <Card
                  title="TOTAL VIDEOS"
                  value={stats.totalVideos}
                  icon="📹"
                  className={styles.statCard}
                />
                <Card
                  title="SAFE VIDEOS"
                  value={stats.safeVideos}
                  icon="✅"
                  className={`${styles.statCard} ${styles.success}`}
                />
                <Card
                  title="FLAGGED VIDEOS"
                  value={stats.flaggedVideos}
                  icon="⚠️"
                  className={`${styles.statCard} ${styles.danger}`}
                />
              </div>

              {/* Recent Videos */}
              <div className={styles.recentSection}>
                <div className={styles.sectionHeader}>
                  <h2>Recent Videos</h2>
                  {recentVideos.length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={() => navigate("/library")}
                    >
                      View All
                    </Button>
                  )}
                </div>

                {recentVideos.length === 0 ? (
                  <Card className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📹</div>
                    <div className={styles.emptyTitle}>
                      No videos yet. Upload your first video to get started!
                    </div>
                    <Button onClick={() => navigate("/upload")}>
                      Upload Video
                    </Button>
                  </Card>
                ) : (
                  <div className={styles.videoList}>
                    {recentVideos.map((video) => (
                      <div key={video._id} className={styles.videoItem}>
                        <div className={styles.videoInfo}>
                          <h3 className={styles.videoTitle}>{video.title}</h3>
                          <div className={styles.videoMeta}>
                            <span>
                              {new Date(video.createdAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`${styles.status} ${styles[video.status]}`}
                            >
                              {video.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
