import React, { useEffect, useState } from "react";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState("");

  // Get shopkeeper ID from localStorage
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
          let msg = "Failed to fetch todos";
          try { msg = (await res.json()).error || msg; } catch {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then(setTodos)
      .catch(err => setError(err.message || "Error loading todos"));
  }, [shopkeeperId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Todo List</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <table className="min-w-full border">
        <thead>
          <tr>
            <th>Bill No</th>
            <th>Customer</th>
            <th>Task</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {todos.length === 0 && !error && (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 py-4">
                No tasks found.
              </td>
            </tr>
          )}
          {todos.map(todo => (
            <tr key={todo.id}>
              <td>{todo.bill_number}</td>
              <td>{todo.customer_name}</td>
              <td>{todo.task}</td>
              <td>{todo.due_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
