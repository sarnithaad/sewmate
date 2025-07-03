import React, { useEffect, useState } from "react";

export default function ShopkeeperDashboard() {
  const [deliveries, setDeliveries] = useState({ overdue: [], today: [], upcoming: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/bills/dashboard-deliveries", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setDeliveries(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Loading dashboard...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Delivery Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DeliveryList title="Overdue Deliveries" bills={deliveries.overdue} color="red" />
        <DeliveryList title="Today's Deliveries" bills={deliveries.today} color="green" />
        <DeliveryList title="Next 2 Days" bills={deliveries.upcoming} color="blue" />
      </div>
    </div>
  );
}

function DeliveryList({ title, bills, color }) {
  return (
    <div className={`bg-${color}-50 border-l-4 border-${color}-500 p-4 rounded`}>
      <h3 className={`text-${color}-700 font-semibold mb-2`}>{title}</h3>
      {bills.length === 0 ? (
        <div className="text-gray-500">No deliveries</div>
      ) : (
        <ul className="space-y-2">
          {bills.map(bill => (
            <li key={bill.id} className="border-b pb-1">
              <div className="font-bold">{bill.customer_name}</div>
              <div>Due: {bill.due_date}</div>
              <div>Value: ₹{bill.total_value}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
