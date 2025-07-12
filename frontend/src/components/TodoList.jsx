import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function TodoList() {
    const [todos, setTodos] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState("");
    const [newDueDate, setNewDueDate] = useState("");
    const [addTodoError, setAddTodoError] = useState("");

    const { token, user } = useAuth(); // Get token and user from AuthContext

    // Function to fetch todos
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
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error("Invalid server response");
            }

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch to-dos");
            }

            setTodos(data);
        } catch (err) {
            setError(err.message || "Error fetching tasks");
            setTodos([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and re-fetch on token/user change
    useEffect(() => {
        fetchTodos();
    }, [token, user]);

    // Handle adding a new todo
    const handleAddTodo = async (e) => {
        e.preventDefault();
        setAddTodoError("");

        if (!newTask.trim() || !newDueDate) {
            setAddTodoError("Task and due date are required.");
            return;
        }

        if (!token || !user) {
            setAddTodoError("Unauthorized: Please log in again.");
            return;
        }

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
                fetchTodos(); // Re-fetch todos to update the list
            }
        } catch (err) {
            console.error("Error adding todo:", err);
            setAddTodoError("Network error. Could not add task.");
        }
    };

    // Handle deleting a todo
    const handleDeleteTodo = async (todoId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }
        if (!token || !user) {
            setError("Unauthorized: Please log in again.");
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos/${todoId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                let msg = "Failed to delete task.";
                try {
                    msg = (await res.json()).error || msg;
                } catch { }
                throw new Error(msg);
            }
            fetchTodos(); // Re-fetch todos to update the list
        } catch (err) {
            console.error("Error deleting todo:", err);
            setError(err.message || "Error deleting task.");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">🧵 To-Do List</h2>

            {error && (
                <div className="text-red-600 bg-red-100 border border-red-300 rounded p-3 mb-4">
                    {error}
                </div>
            )}

            {/* Add New Todo Form */}
            <div className="bg-white shadow rounded p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Add New Task</h3>
                <form onSubmit={handleAddTodo} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Task description"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                    />
                    <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                        Add Task
                    </button>
                </form>
                {addTodoError && <p className="text-red-600 text-sm mt-2">{addTodoError}</p>}
            </div>

            {loading ? (
                <p className="text-gray-600">Loading tasks...</p>
            ) : (
                <div className="overflow-x-auto bg-white shadow rounded">
                    <table className="min-w-full text-sm text-left border-collapse">
                        <thead className="bg-indigo-100 text-gray-800">
                            <tr>
                                <th className="px-4 py-2 border">Task</th>
                                <th className="px-4 py-2 border">Due Date</th>
                                <th className="px-4 py-2 border">Status</th>
                                <th className="px-4 py-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todos.length === 0 && !error ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-gray-500">
                                        ✅ No tasks in your to-do list!
                                    </td>
                                </tr>
                            ) : (
                                todos.map((todo) => (
                                    <tr key={todo.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-2 border">{todo.task}</td>
                                        <td className="px-4 py-2 border">{todo.due_date}</td>
                                        <td className="px-4 py-2 border">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                ${todo.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                  todo.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 border">
                                            <button
                                                onClick={() => handleDeleteTodo(todo.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                            {/* You can add a "Mark as Complete" button here if needed */}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
