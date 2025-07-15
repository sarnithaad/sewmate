import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function TodoList() {
    const [todos, setTodos] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState("");
    const [newDueDate, setNewDueDate] = useState("");
    const [addTodoError, setAddTodoError] = useState("");
    const [addingTask, setAddingTask] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const { token, user } = useAuth();

    const fetchTodos = async () => {
        if (!token || !user) {
            setError("❌ Unauthorized: No token found.");
            setLoading(false);
            setTodos([]);
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch to-dos");

            const sortedTodos = data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
            setTodos(sortedTodos);
        } catch (err) {
            setError(err.message || "Error fetching tasks");
            setTodos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, [token, user]);

    const handleAddTodo = async (e) => {
        e.preventDefault();
        setAddTodoError("");
        setSuccessMsg("");

        if (!newTask.trim() || !newDueDate) {
            setAddTodoError("Task and due date are required.");
            return;
        }

        if (!token || !user) {
            setAddTodoError("Unauthorized: Please log in again.");
            return;
        }

        setAddingTask(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ task: newTask, due_date: newDueDate })
            });

            const data = await res.json();
            if (!res.ok) {
                setAddTodoError(data.error || "Failed to add task.");
            } else {
                setNewTask("");
                setNewDueDate("");
                setSuccessMsg("✅ Task added!");
                fetchTodos();
            }
        } catch (err) {
            console.error("Error adding todo:", err);
            setAddTodoError("Network error. Could not add task.");
        } finally {
            setAddingTask(false);
            setTimeout(() => setSuccessMsg(""), 3000);
        }
    };

    const handleToggleComplete = async (todoId, currentStatus) => {
        const newStatus = currentStatus === "pending" ? "completed" : "pending";
        setError("");
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos/${todoId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update task status.");

            setSuccessMsg(`✅ Task marked as ${newStatus}`);
            fetchTodos();
        } catch (err) {
            console.error("Error updating status:", err);
            setError(err.message || "Error updating status");
        } finally {
            setTimeout(() => setSuccessMsg(""), 3000);
        }
    };

    const handleDeleteTodo = async (todoId) => {
        const confirmDelete = await new Promise((resolve) => {
            const modal = document.createElement("div");
            modal.className =
                "fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 animate-fade-in";
            modal.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center animate-zoom-in">
                    <p class="text-lg font-semibold mb-4 text-[#754F4F]">Are you sure you want to delete this task?</p>
                    <div class="flex justify-center gap-4">
                        <button id="confirm-yes" class="px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200">Yes, Delete</button>
                        <button id="confirm-no" class="px-5 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-all duration-200">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById("confirm-yes").onclick = () => {
                document.body.removeChild(modal);
                resolve(true);
            };
            document.getElementById("confirm-no").onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };
        });

        if (!confirmDelete) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos/${todoId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete task.");

            setSuccessMsg("✅ Task deleted");
            fetchTodos();
        } catch (err) {
            console.error("Delete error:", err);
            setError(err.message || "Error deleting task.");
        } finally {
            setTimeout(() => setSuccessMsg(""), 3000);
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-[#FDF0F3] to-[#F2E5E8] min-h-screen font-inter">
            <h2 className="text-4xl font-extrabold text-[#754F4F] mb-8 rounded-xl p-4 bg-white shadow-xl text-center animate-fade-in flex items-center justify-center">
                <img
                    src="https://placehold.co/50x50/D1A6AD/ffffff?text=Todo"
                    alt="To-Do List Icon"
                    className="h-12 w-12 rounded-full mr-4 shadow-md"
                />
                🧵 To-Do List
            </h2>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>}
            {successMsg && <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">{successMsg}</div>}

            {/* Add Task Form */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h3 className="text-xl font-semibold text-[#5A3F44] mb-4">📝 Add New Task</h3>
                <form onSubmit={handleAddTodo} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Task"
                        className="flex-grow p-3 rounded-lg border border-[#E0C0C6] bg-[#F9E9EC]"
                        required
                    />
                    <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="p-3 rounded-lg border border-[#E0C0C6] bg-[#F9E9EC]"
                        required
                    />
                    <button
                        type="submit"
                        disabled={addingTask}
                        className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
                            addingTask
                                ? "bg-gray-400 text-gray-700"
                                : "bg-[#D1A6AD] text-white hover:bg-[#C2949D]"
                        }`}
                    >
                        {addingTask ? "Adding..." : "Add Task"}
                    </button>
                </form>
                {addTodoError && <p className="text-red-600 mt-2">{addTodoError}</p>}
            </div>

            {/* Todo List */}
            {loading ? (
                <p className="text-center text-[#754F4F] animate-pulse">Loading tasks...</p>
            ) : todos.length === 0 ? (
                <div className="text-center py-10 text-[#754F4F] text-lg">
                    <p>🎉 No tasks in your to-do list! Time to relax.</p>
                    <img
                        src="https://placehold.co/150x150/D1A6AD/ffffff?text=Done"
                        alt="No Tasks Icon"
                        className="mx-auto mt-6 rounded-full shadow-md"
                    />
                </div>
            ) : (
                <table className="min-w-full bg-white shadow-lg rounded-xl">
                    <thead className="bg-gradient-to-r from-[#F9E9EC] to-[#F2E5E8] text-[#5A3F44]">
                        <tr>
                            <th className="px-4 py-3">Task</th>
                            <th className="px-4 py-3">Due Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {todos.map((todo) => (
                            <tr key={todo.id} className="hover:bg-[#FDF0F3]">
                                <td className="px-4 py-3">{todo.task}</td>
                                <td className="px-4 py-3">{todo.due_date}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        todo.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                    }`}>
                                        {todo.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center space-x-2">
                                    <button
                                        onClick={() => handleToggleComplete(todo.id, todo.status)}
                                        className="px-4 py-2 rounded-full bg-[#9C6672] text-white text-sm hover:bg-[#8C5D66]"
                                    >
                                        {todo.status === "pending" ? "Mark Complete" : "Mark Pending"}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTodo(todo.id)}
                                        className="px-4 py-2 rounded-full bg-red-500 text-white text-sm hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <style>
                {`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
                .animate-fade-in-up { animation: fadeInUp 0.7s ease-out forwards; }
                .animate-pulse { animation: pulse 1.5s infinite ease-in-out; }
                .animate-zoom-in { animation: zoomIn 0.3s ease-out forwards; }
                `}
            </style>
        </div>
    );
}
