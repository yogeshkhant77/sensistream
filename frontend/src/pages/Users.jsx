/**
 * User Management Page (Admin Only)
 */

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { userAPI } from "../services/api";
import styles from "../styles/Users.module.css";
import deleteButtonStyles from "../styles/DeleteButton.module.css";
import editButtonStyles from "../styles/EditButton.module.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data.data);
      setError("");
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      await userAPI.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
      );
      setEditingId(null);
    } catch (err) {
      setError("Failed to update user role");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setUpdatingId(userId);
      await userAPI.updateUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u)),
      );
    } catch (err) {
      setError("Failed to update user status");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setUpdatingId(userId);
      await userAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      setError("Failed to delete user");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className={styles.usersPage}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>User Management</h1>
              <p className={styles.subtitle}>
                Manage users and their roles within your organization
              </p>
            </div>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          {/* Users Table */}
          {loading ? (
            <div className={styles.loading}>Loading users...</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>STATUS</th>
                    <th>JOINED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className={styles.userCell}>
                        <div className={styles.avatar}>
                          {user.firstName.charAt(0)}
                        </div>
                        <span className={styles.userName}>
                          {user.firstName} {user.lastName}
                        </span>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        {editingId === user._id ? (
                          <select
                            className={styles.roleSelect}
                            value={user.role}
                            onChange={(e) => {
                              handleRoleChange(user._id, e.target.value);
                            }}
                            disabled={updatingId === user._id}
                          >
                            <option value="Viewer">Viewer</option>
                            <option value="Editor">Editor</option>
                            <option value="Admin">Admin</option>
                          </select>
                        ) : (
                          <Badge status={user.role} />
                        )}
                      </td>
                      <td>
                        <Badge
                          status={user.status}
                          className={
                            user.status === "Active"
                              ? styles.active
                              : styles.inactive
                          }
                        />
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className={styles.actions}>
                        <button
                          className={editButtonStyles.Btn}
                          onClick={() =>
                            setEditingId(
                              editingId === user._id ? null : user._id,
                            )
                          }
                          disabled={updatingId === user._id}
                          type="button"
                        >
                          {editingId === user._id ? "Done" : "Edit"}
                          <svg
                            className={editButtonStyles.svg}
                            viewBox="0 0 512 512"
                          >
                            <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                          </svg>
                        </button>
                        <button
                          className={deleteButtonStyles.button}
                          onClick={() => handleDelete(user._id)}
                          disabled={updatingId === user._id}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Users;
