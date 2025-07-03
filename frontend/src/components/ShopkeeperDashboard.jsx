import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

export default function ShopkeeperDashboard() {
  const [deliveries, setDeliveries] = useState({ overdue: [], today: [], upcoming: [] });
  const [selectedDateBills, setSelectedDateBills] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Unauthorized: No token found");
      setLoading(false);
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/api/bills/dashboard-deliveries`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error("Invalid response from server");
        }
        if (!res.ok) throw new Error(data.error || "Failed to fetch deliveries");
        setDeliveries(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Error fetching delivery dashboard");
        setDeliveries({ overdue: [], today: [], upcoming: [] });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!token) {
      setSelectedDateBills([]);
      return;
    }

    const dateStr = selectedDate.toISOString().split("T")[0];
    fetch(`${process.env.REACT_APP_API_URL}/api/bills/by-date/${dateStr}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error("Invalid response fetching date-specific bills");
        }
        if (!res.ok) throw new Error(data.error || "Failed to fetch bills for date");
        setSelectedDateBills(Array.isArray(data) ? data : []);
      })
      .catch(() => setSelectedDateBills([]));
  }, [selectedDate, token]);

  if (loading) return <div className="p-6 text-lg">Loading dashboard...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">Delivery Dashboard</h2>

      {error && (
        <div className="mb-4 text-red-700 bg-red-100 border border-red-300 p-3 rounded">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <DeliveryList title="🚨 Overdue Deliveries" bills={deliveries.overdue} color="red" />
        <DeliveryList title="📦 Today's Deliveries" bills={deliveries.today} color="green" />
        <DeliveryList title="📅 Upcoming (Next 2 Days)" bills={deliveries.upcoming} color="blue" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h3 className="text-xl font-semibold mb-4 text-indigo-600">📌 View Deliveries by Date</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="rounded shadow-md"
          />
          <div>
            <h4 className="text-lg font-semibold mb-2 text-gray-700">
              Deliveries on {selectedDate.toDateString()}:
            </h4>
            {selectedDateBills.length === 0 ? (
              <p className="text-gray-500">No deliveries for this date.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {selectedDateBills.map(bill => (
                  <li key={bill.id} className="py-2">
                    <div className="font-medium">{bill.customer_name}</div>
                    <div className="text-sm text-gray-600">Value: ₹{bill.total_value}</div>
                    <div className="text-sm text-gray-600">Due: {bill.due_date}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliveryList({ title, bills, color }) {
  const bgColor = {
    red: "bg-red-50 border-red-500 text-red-700",
    green: "bg-green-50 border-green-500 text-green-700",
    blue: "bg-blue-50 border-blue-500 text-blue-700"
  }[color];

  return (
    <div className={`border-l-4 p-4 rounded shadow-sm ${bgColor}`}>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      {bills.length === 0 ? (
        <p className="text-gray-500">No deliveries</p>
      ) : (
        <ul className="space-y-2">
          {bills.map(bill => (
            <li key={bill.id} className="border-b pb-1 text-sm">
              <div className="font-semibold">{bill.customer_name}</div>
              <div>Due: {bill.due_date}</div>
              <div>Value: ₹{bill.total_value}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
