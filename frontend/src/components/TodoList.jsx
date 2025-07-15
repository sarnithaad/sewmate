import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function TodoList() {
    const [todos, setTodos] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState("");
    const [newDueDate, setNewDueDate] = useState("");
    const [addTodoError, setAddTodoError] = useState("");
    const [addingTask, setAddingTask] = useState(false); // State for adding task loading

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

        setAddingTask(true); // Set adding task loading to true
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ task: newTask, due_date: newDueDate, shopkeeper_id: user.id }) // Ensure shopkeeper_id is sent
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
        } finally {
            setAddingTask(false); // Set adding task loading to false
        }
    };

    // Handle marking a todo as complete
    const handleToggleComplete = async (todoId, currentStatus) => {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'; // Toggle status
        if (!token || !user) {
            setError("Unauthorized: Please log in again.");
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/todos/${todoId}`, {
                method: "PUT", // Assuming a PUT or PATCH endpoint for updating status
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                let msg = "Failed to update task status.";
                try {
                    msg = (await res.json()).error || msg;
                } catch { }
                throw new Error(msg);
            }
            fetchTodos(); // Re-fetch todos to update the list
        } catch (err) {
            console.error("Error updating todo status:", err);
            setError(err.message || "Error updating task status.");
        }
    };


    // Handle deleting a todo
    const handleDeleteTodo = async (todoId) => {
        // Replace window.confirm with a custom modal for better UI/UX
        const confirmDelete = await new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 animate-fade-in';
            modal.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center animate-zoom-in">
                    <p class="text-lg font-semibold mb-4 text-[#754F4F]">Are you sure you want to delete this task?</p> {/* Updated color */}
                    <div class="flex justify-center gap-4">
                        <button id="confirm-yes" class="px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200">Yes, Delete</button>
                        <button id="confirm-no" class="px-5 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-all duration-200">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('confirm-yes').onclick = () => {
                document.body.removeChild(modal);
                resolve(true);
            };
            document.getElementById('confirm-no').onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };
        });

        if (!confirmDelete) {
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
        <div className="p-6 bg-gradient-to-br from-[#FDF0F3] to-[#F2E5E8] min-h-screen font-inter"> {/* Updated colors */}
            <h2 className="text-4xl font-extrabold text-[#754F4F] mb-8 rounded-xl p-4 bg-white shadow-xl text-center animate-fade-in flex items-center justify-center"> {/* Updated colors */}
                <img
                    src="https://placehold.co/50x50/D1A6AD/ffffff?text=Todo" // Updated color
                    alt="To-Do List Icon"
                    className="h-12 w-12 rounded-full mr-4 shadow-md"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/333333?text=Err'; }}
                />
                🧵 To-Do List
            </h2>

            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6 shadow-md animate-slide-down">
                    ❌ {error}
                </div>
            )}

            {/* Add New Todo Form */}
            <div className="bg-white shadow-xl rounded-xl p-6 mb-8 animate-fade-in-up">
                <h3 className="text-xl font-semibold text-[#5A3F44] mb-4 flex items-center"> {/* Updated color */}
                    <span className="mr-2 text-2xl">📝</span> Add New Task
                </h3>
                <form onSubmit={handleAddTodo} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Task description"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="flex-grow p-3 border border-[#E0C0C6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C2949D] transition-all duration-200 shadow-sm text-[#5A3F44] bg-[#F9E9EC]" // Updated colors
                        required
                    />
                    <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="p-3 border border-[#E0C0C6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C2949D] transition-all duration-200 shadow-sm text-[#5A3F44] bg-[#F9E9EC]" // Updated colors
                        required
                    />
                    <button
                        type="submit"
                        disabled={addingTask}
                        className={`px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md
                            ${addingTask
                                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                : "bg-[#D1A6AD] text-white hover:bg-[#C2949D] focus:outline-none focus:ring-2 focus:ring-[#E0C0C6] focus:ring-opacity-75"}` // Updated colors
                        }
                    >
                        {addingTask ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                            </span>
                        ) : (
                            "Add Task"
                        )}
                    </button>
                </form>
                {addTodoError && <p className="text-red-600 text-sm mt-4 bg-red-50 p-2 rounded-md border border-red-200">{addTodoError}</p>}
            </div>

            {loading ? (
                <p className="text-[#754F4F] text-xl p-6 bg-white rounded-lg shadow-lg text-center animate-pulse">Loading tasks...</p> // Updated color
            ) : (
                <div className="overflow-x-auto bg-white shadow-xl rounded-xl animate-fade-in-up">
                    {todos.length === 0 && !error ? (
                        <div className="text-center py-10 text-[#754F4F] text-lg"> {/* Updated color */}
                            <p>🎉 No tasks in your to-do list! Time to relax.</p>
                            <img
                                src="https://placehold.co/150x150/D1A6AD/ffffff?text=Done" // Updated color
                                alt="No Tasks Icon"
                                className="mx-auto mt-6 rounded-full shadow-md"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/cccccc/333333?text=Error'; }}
                            />
                        </div>
                    ) : (
                        <table className="min-w-full text-base text-left border-collapse">
                            <thead className="bg-gradient-to-r from-[#F9E9EC] to-[#F2E5E8] text-[#5A3F44] uppercase tracking-wider"> {/* Updated colors */}
                                <tr>
                                    <th className="px-4 py-3 border-b-2 border-[#E0C0C6]">Task</th> {/* Updated color */}
                                    <th className="px-4 py-3 border-b-2 border-[#E0C0C6]">Due Date</th> {/* Updated color */}
                                    <th className="px-4 py-3 border-b-2 border-[#E0C0C6]">Status</th> {/* Updated color */}
                                    <th className="px-4 py-3 border-b-2 border-[#E0C0C6] text-center">Actions</th> {/* Updated color */}
                                </tr>
                            </thead>
                            <tbody>
                                {todos.map((todo) => (
                                    <tr key={todo.id} className="border-t border-[#E0C0C6] hover:bg-[#FDF0F3] transition-colors duration-200 ease-in-out"> {/* Updated colors */}
                                        <td className="px-4 py-3 font-medium text-[#5A3F44]">{todo.task}</td> {/* Updated color */}
                                        <td className="px-4 py-3 text-[#754F4F]">{todo.due_date}</td> {/* Updated color */}
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                                ${todo.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                todo.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center space-x-2">
                                            <button
                                                onClick={() => handleToggleComplete(todo.id, todo.status)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                                                    ${todo.status === 'pending' ? 'bg-[#9C6672] hover:bg-[#8C5D66] text-white' : 'bg-[#D1A6AD] hover:bg-[#C2949D] text-white'}`} {/* Updated colors */}
                                            >
                                                {todo.status === 'pending' ? 'Mark Complete' : 'Mark Pending'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTodo(todo.id)}
                                                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            {/* Basic CSS for animations (can be moved to index.css or a dedicated styles file) */}
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.7s ease-out forwards;
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-slide-down {
                    animation: slideDown 0.5s ease-out forwards;
                }
                .animate-pulse {
                    animation: pulse 1.5s infinite ease-in-out;
                }
                .animate-zoom-in {
                    animation: zoomIn 0.3s ease-out forwards;
                }
                `}
            </style>
        </div>
    );
}
