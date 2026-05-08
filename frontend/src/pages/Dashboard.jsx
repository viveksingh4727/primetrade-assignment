import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import TaskModal from "../components/TaskModal";

const STATUS_COLORS = {
  PENDING: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#10b981",
  CANCELLED: "#6b7280",
};

const PRIORITY_COLORS = {
  LOW: "#6b7280",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "", page: 1 });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.priority) params.set("priority", filters.priority);
      params.set("page", filters.page);
      const res = await api.get(`/tasks?${params}`);
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleCreate = async (data) => {
    await api.post("/tasks", data);
    showSuccess("Task created successfully");
    fetchTasks();
  };

  const handleUpdate = async (data) => {
    await api.put(`/tasks/${editingTask.id}`, data);
    showSuccess("Task updated successfully");
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      showSuccess("Task deleted");
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p className="page-subtitle">Welcome back, {user.name}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + New Task
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
        >
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found. Create your first task!</p>
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-card-header">
                <h3 className="task-title">{task.title}</h3>
                <div className="task-actions">
                  <button onClick={() => openEdit(task)} className="icon-btn" title="Edit">✏️</button>
                  <button onClick={() => handleDelete(task.id)} className="icon-btn" title="Delete">🗑️</button>
                </div>
              </div>
              {task.description && <p className="task-desc">{task.description}</p>}
              {user.role === "ADMIN" && task.user && (
                <p className="task-owner">by {task.user.name}</p>
              )}
              <div className="task-footer">
                <span className="badge" style={{ backgroundColor: STATUS_COLORS[task.status] + "20", color: STATUS_COLORS[task.status], border: `1px solid ${STATUS_COLORS[task.status]}40` }}>
                  {task.status.replace("_", " ")}
                </span>
                <span className="badge" style={{ backgroundColor: PRIORITY_COLORS[task.priority] + "20", color: PRIORITY_COLORS[task.priority], border: `1px solid ${PRIORITY_COLORS[task.priority]}40` }}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={filters.page <= 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            className="btn btn-outline btn-sm"
          >
            ← Prev
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button
            disabled={filters.page >= pagination.pages}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            className="btn btn-outline btn-sm"
          >
            Next →
          </button>
        </div>
      )}

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={editingTask ? handleUpdate : handleCreate}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
