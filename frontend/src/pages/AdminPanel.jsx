import { useState, useEffect } from "react";
import api from "../api/axios";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/admin/users?page=${p}&limit=10`);
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(page); }, [page]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setSuccess(`Role updated to ${newRole}`);
      setTimeout(() => setSuccess(""), 3000);
      fetchUsers(page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Admin Panel</h1>
          <p className="page-subtitle">Manage users and roles</p>
        </div>
        <div className="stat-badge">
          {pagination.total || 0} total users
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Tasks</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="td-name">{user.name}</td>
                  <td className="td-email">{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role === "ADMIN" ? "role-admin" : "role-user"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user._count.tasks}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-outline btn-sm">
            ← Prev
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="btn btn-outline btn-sm">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
