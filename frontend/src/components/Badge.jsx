/**
 * Badge Component
 * Status badge for videos
 */

import React from "react";
import styles from "../styles/Badge.module.css";

const Badge = ({ status, className = "" }) => {
  const statusColors = {
    Safe: "success",
    Flagged: "danger",
    Processing: "warning",
    Active: "success",
    Inactive: "secondary",
  };

  const color = statusColors[status] || "secondary";

  return (
    <span className={`${styles.badge} ${styles[color]} ${className}`}>
      {status}
    </span>
  );
};

export default Badge;
