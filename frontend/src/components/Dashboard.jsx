import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [dueCustomers, setDueCustomers] = useState({ today: [], day: [], twoDays: [] });

  useEffect(() => {
    // Fetch from backend: /api/bills/due/:shopkeeper_id
    // Simulated data here:
    setDueCustomers({
      today: [{ name: "Priya", mobile: "9999999999" }],
      day: [{ name: "Amit", mobile: "8888888888" }],
      twoDays: [{ name: "Sara", mobile: "7777777777" }]
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Due Deliveries</h2>
      {["today", "day", "twoDays"].map(period => (
        <div key={period} className="mb-4">
          <h3 className="font-semibold capitalize">{period === "today" ? "Today" : period === "day" ? "Within a day" : "Within 2 days"}</h3>
          {dueCustomers[period].map((c, i) => (
            <div key={i} className="flex items-center space-x-2 mb-1">
              <span>{c.name} ({c.mobile})</span>
              <input type="text" placeholder="Type message..." className="border px-2 py-1 rounded" />
              <button className="bg-blue-500 text-white px-2 py-1 rounded">Send</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
