import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import TaskModal from "../components/TaskModal";

const STATUS_DOT = {
  PENDING: "#d4d4d4",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#22c55e",
  CANCELLED: "#e5e5e5",
};

const STATUS_LABEL = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const PRIORITY_LABEL = {
  LOW: "Low",
  MEDIUM: "Med",
  HIGH: "High",
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
    showSuccess("Task created");
    fetchTasks();
  };

  const handleUpdate = async (data) => {
    await api.put(`/tasks/${editingTask.id}`, data);
    showSuccess("Task updated");
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
          <h1>Tasks</h1>
          <p className="page-subtitle">{user.name}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          New task
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 12 }}>{success}</div>}

      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
        >
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">No tasks yet. Create your first one.</div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-item">
              <span
                className="status-dot"
                style={{ background: STATUS_DOT[task.status] }}
                title={STATUS_LABEL[task.status]}
              />
              <div className="task-main">
                <div className={`task-title ${task.status === "COMPLETED" ? "done" : ""}`}>
                  {task.title}
                </div>
                {(task.description || (user.role === "ADMIN" && task.user)) && (
                  <div className="task-sub">
                    {task.description && (
                      <span className="task-desc-inline">{task.description}</span>
                    )}
                    {user.role === "ADMIN" && task.user && (
                      <span className="task-owner-tag">{task.user.name}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="task-right">
                <span className="priority-label">{PRIORITY_LABEL[task.priority]}</span>
                <div className="task-actions-row">
                  <button onClick={() => openEdit(task)} className="btn-ghost">Edit</button>
                  <button onClick={() => handleDelete(task.id)} className="btn-ghost danger">Delete</button>
                </div>
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
            Previous
          </button>
          <span>{pagination.page} of {pagination.pages}</span>
          <button
            disabled={filters.page >= pagination.pages}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            className="btn btn-outline btn-sm"
          >
            Next
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
