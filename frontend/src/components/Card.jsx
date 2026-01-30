/**
 * Card Component
 * Reusable card component for displaying content
 */

import React from "react";
import styles from "../styles/Card.module.css";

const Card = ({
  title,
  subtitle,
  value,
  icon,
  onClick,
  children,
  className = "",
}) => {
  return (
    <div className={`${styles.card} ${className}`} onClick={onClick}>
      {icon && <div className={styles.icon}>{icon}</div>}
      {title && <h3 className={styles.title}>{title}</h3>}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {value && <div className={styles.value}>{value}</div>}
      {children}
    </div>
  );
};

export default Card;
