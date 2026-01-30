/**
 * Navbar Component
 * Navigation bar with user menu
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Navbar.module.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/dashboard" className={styles.logo}>
          <div className={styles.logoIcon}>📹</div>
          <span>SensiStream</span>
        </Link>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          <Link to="/dashboard" className={styles.link}>
            Dashboard
          </Link>
          <Link to="/upload" className={styles.link}>
            Upload
          </Link>
          <Link to="/library" className={styles.link}>
            Library
          </Link>
          {user?.role === "Admin" && (
            <Link to="/users" className={styles.link}>
              Users
            </Link>
          )}
        </div>

        {/* User Menu */}
        <div className={styles.userMenu}>
          <button
            className={styles.userButton}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={styles.avatar}>{user?.firstName?.charAt(0)}</span>
            <span className={styles.userName}>{user?.firstName}</span>
          </button>

          {menuOpen && (
            <div className={styles.dropdown}>
              <div className={styles.userInfo}>
                <div className={styles.userEmail}>{user?.email}</div>
                <div className={styles.userRole}>{user?.role}</div>
              </div>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
