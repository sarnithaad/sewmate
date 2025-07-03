import React, { useEffect, useState } from "react";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    fetch("/api/todos/1") // Replace 1 with dynamic shopkeeper_id
      .then(res => res.json())
      .then(setTodos);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Todo List</h2>
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
