import React, { useEffect, useState } from "react";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState("");

  const shopkeeper = JSON.parse(localStorage.getItem("shopkeeper") || "{}");
  const shopkeeperId = shopkeeper.id;

  useEffect(() => {
    if (!shopkeeperId) {
      setError("Shopkeeper not found.");
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/api/todos/${shopkeeperId}`)
      .then(async res => {
        if (!res.ok) {
          let msg = "Failed to fetch todo tasks";
          try {
            msg = (await res.json()).error || msg;
          } catch {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then(setTodos)
      .catch(err => setError(err.message || "Error loading todos"));
  }, [shopkeeperId]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">🧵 To-Do List</h2>

      {error && (
        <div className="text-red-600 bg-red-100 border border-red-300 rounded p-3 mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-indigo-100 text-gray-800">
            <tr>
              <th className="px-4 py-2 border">Bill No</th>
              <th className="px-4 py-2 border">Customer</th>
              <th className="px-4 py-2 border">Current Task</th>
              <th className="px-4 py-2 border">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {todos.length === 0 && !error ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  ✅ All tasks are packed or delivered!
                </td>
              </tr>
            ) : (
              todos.map(todo => (
                <tr key={todo.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 border">{todo.bill_number}</td>
                  <td className="px-4 py-2 border">{todo.customer_name}</td>
                  <td className="px-4 py-2 border">{todo.task}</td>
                  <td className="px-4 py-2 border">{todo.due_date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
