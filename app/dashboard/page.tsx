"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSession, signOut } from "next-auth/react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import dayjs from "dayjs";

interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
}

type FilterType = "all" | "pending" | "completed" | "overdue";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const session = await getSession();
    if (!session) {
      window.location.href = "/login";
      return;
    }
    fetchTasks();
  };

  const fetchTasks = async () => {
    setLoading(true);
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data || []);
    setLoading(false);
  };

  const addTask = async () => {
    if (!title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dueDate }),
    });
    const data = await res.json();
    if (data.success) {
      setTasks((prev) => [
        ...prev,
        { _id: data.taskId, title, completed: false, dueDate },
      ]);
      setTitle("");
      setDueDate("");
    }
  };

  const toggleComplete = async (task: Task) => {
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task._id, completed: !task.completed }),
    });
    const data = await res.json();
    if (data.success) {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === task._id ? { ...t, completed: !t.completed } : t
        )
      );
    }
  };

  const deleteTask = async (task: Task) => {
    const res = await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task._id }),
    });
    const data = await res.json();
    if (data.success) fetchTasks();
  };

  const saveEdit = async () => {
    if (!editTask) return;
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editTask._id, title: editTitle, dueDate: editDueDate }),
    });
    const data = await res.json();
    if (data.success) {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === editTask._id ? { ...t, title: editTitle, dueDate: editDueDate } : t
        )
      );
      closeEditModal();
    }
  };

  const openEditModal = (task: Task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDueDate(task.dueDate || "");
  };

  const closeEditModal = () => {
    setEditTask(null);
    setEditTitle("");
    setEditDueDate("");
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const calculateProgress = () =>
    tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const getStatusColor = (task: Task) => {
    if (task.completed) return "bg-green-100 text-green-700";
    if (task.dueDate && dayjs().isAfter(dayjs(task.dueDate)))
      return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const filteredTasks = tasks
    .filter((task) => {
      switch (filter) {
        case "completed":
          return task.completed;
        case "pending":
          return !task.completed && (!task.dueDate || dayjs().isBefore(dayjs(task.dueDate)));
        case "overdue":
          return !task.completed && task.dueDate && dayjs().isAfter(dayjs(task.dueDate));
        default:
          return true;
      }
    })
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return dayjs(a.dueDate).isAfter(dayjs(b.dueDate)) ? 1 : -1;
    });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(filteredTasks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setTasks(reordered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">My Tasks</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>Progress: {calculateProgress()}%</span>
            <span>
              Completed: {completedCount} / Total: {tasks.length}
            </span>
          </div>
          <div className="w-full h-4 bg-gray-300 rounded-full">
            <div
              className="h-4 bg-green-500 rounded-full transition-all"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(["all", "pending", "completed", "overdue"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1 rounded-lg font-medium transition ${
                filter === f ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Add Task */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={addTask}
            disabled={!title.trim()}
            className={`bg-purple-600 text-white px-4 rounded-lg hover:bg-purple-700 transition ${
              !title.trim() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Add
          </button>
        </div>

        {/* Task List */}
        {loading ? (
          <p className="text-center text-gray-500">Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p className="text-center text-gray-500">No tasks found</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <AnimatePresence>
                    {filteredTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className={`flex justify-between items-center p-4 mb-3 border rounded-xl shadow transition ${getStatusColor(
                              task
                            )}`}
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => toggleComplete(task)}
                                  className="w-5 h-5 accent-purple-600"
                                />
                                <span
                                  className={`text-lg font-medium ${
                                    task.completed ? "line-through text-gray-400" : ""
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>
                              {task.dueDate && (
                                <span className="text-sm text-gray-600">
                                  Due: {dayjs(task.dueDate).format("DD MMM YYYY")}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(task)}
                                className="text-blue-600 font-semibold hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteTask(task)}
                                className="text-red-600 font-semibold hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </AnimatePresence>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Edit Task Modal */}
      {editTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
