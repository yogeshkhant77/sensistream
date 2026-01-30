/**
 * User Management Page (Admin Only)
 */

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { userAPI } from "../services/api";
import styles from "../styles/Users.module.css";

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
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() =>
                            setEditingId(
                              editingId === user._id ? null : user._id,
                            )
                          }
                          disabled={updatingId === user._id}
                        >
                          {editingId === user._id ? "✓ Done" : "✏️ Edit"}
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() => handleDelete(user._id)}
                          disabled={updatingId === user._id}
                        >
                          🗑️ Delete
                        </Button>
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
