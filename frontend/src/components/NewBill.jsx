import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import PrintableBill from "./PrintableBill";
import { useAuth } from "../context/AuthContext";

const dressTypes = [
  { value: "Chudidhar", label: "Chudidhar" },
  { value: "Blouse", label: "Blouse" },
  { value: "Frock", label: "Frock" },
  { value: "Lehanga", label: "Lehanga" },
];

const measurementsList = {
  Chudidhar: ["Full Length", "Front neck", "Back Neck", "Shoulder", "Upper Chest", "Middle Chest", "Waist", "Seat", "Sleeve Length", "Sleeve Width", "Pant Length", "Knee", "Ankle"],
  Blouse: ["Front Neck", "Dart Length", "Back Neck", "Back Length", "Shoulder", "Upper Chest", "Middle Chest", "Waist", "Sleeve Length", "Sleeve Width"],
  Frock: ["Frock Length", "Half Length", "Front neck", "Back Neck", "Shoulder", "Upper Chest", "Middle Chest", "Waist", "Seat", "Sleeve Length", "Sleeve Width"],
  Lehanga: ["Skirt Length", "Dart Length", "Front Neck", "Back Length", "Back Neck", "Shoulder", "Upper Chest", "Middle Chest", "Waist", "Seat", "Sleeve Length", "Sleeve Width"],
};

const pantOptions = ["Patiala", "Crush Legging", "Ankle Length"];

const extrasByDress = {
  Chudidhar: ["Rope", "Hangings", "Pocket", "Dupatta"],
  Blouse: ["Rope", "Hangings", "Saree", "False", "Edge", "Hand-loom Edge", "Pre-pleating"],
  Lehanga: ["Skirt", "Dupatta", "Belt", "Rope", "Hangings"],
};

export default function NewBill({ onBillSaved }) {
  const [bill, setBill] = useState({
    customer_name: "",
    mobile: "",
    dress_type: "Chudidhar",
    order_date: new Date().toISOString().split("T")[0],
    due_date: "",
    measurements: {},
    extras: [],
    total_value: 0,
  });

  const [pantType, setPantType] = useState("");
  const [selectedExtras, setSelectedExtras] = useState([]);

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [showPrint, setShowPrint] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [selectedDesignUrl, setSelectedDesignUrl] = useState("");
  const [designFetchError, setDesignFetchError] = useState("");
  const [generatedBillNumber, setGeneratedBillNumber] = useState(null);

  const { token, user } = useAuth();
  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `SewMate_Bill_${generatedBillNumber || "New"}`,
  });

  const handleChange = (field, value) => {
    setBill((prev) => ({ ...prev, [field]: value }));
  };

  const handleMeasurementInput = (name, value) => {
    setBill((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [name]: value,
      },
    }));
  };

  const calculateTotalValue = (currentExtras) => {
    return currentExtras.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  };

  const handleAddExtra = () => {
    setBill((prev) => {
      const newExtras = [...prev.extras, { name: "", price: 0 }];
      const newTotal = calculateTotalValue(newExtras);
      return {
        ...prev,
        extras: newExtras,
        total_value: newTotal,
      };
    });
  };

  const handleExtraChange = (index, field, value) => {
    setBill((prev) => {
      const updatedExtras = [...prev.extras];
      updatedExtras[index][field] = field === "price" ? parseFloat(value) || 0 : value;
      const newTotal = calculateTotalValue(updatedExtras);
      return {
        ...prev,
        extras: updatedExtras,
        total_value: newTotal,
      };
    });
  };

  const handleExtraCheckboxChange = (name) => {
    setSelectedExtras((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  useEffect(() => {
    if (!token || !user) {
      setDesignFetchError("Unauthorized: Please log in to view designs.");
      setDesigns([]);
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/api/designs?dress_type=${bill.dress_type}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDesigns(data);
          setDesignFetchError("");
        } else {
          setDesigns([]);
          setDesignFetchError("Invalid designs data received.");
        }
      })
      .catch(() => {
        setDesigns([]);
        setDesignFetchError("Error fetching designs.");
      });
  }, [token, user, bill.dress_type]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");
    setMsgType("");
    setShowPrint(false);

    if (!user || !token) {
      setMsg("Shopkeeper not authenticated. Please log in.");
      setMsgType("error");
      return;
    }

    const autoExtras = [...selectedExtras.map((name) => ({ name, price: 0 }))];

    if (bill.dress_type === "Chudidhar" && pantType) {
      autoExtras.unshift({ name: pantType, price: 0 });
    }

    const finalExtras = [...bill.extras, ...autoExtras];
    const finalTotal = calculateTotalValue(finalExtras);

    const billPayload = {
      ...bill,
      shopkeeper_id: user.id,
      design_url: selectedDesignUrl,
      extras: finalExtras,
      total_value: finalTotal,
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(billPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Failed to save bill");
        setMsgType("error");
      } else {
        setMsg("✅ Bill saved successfully!");
        setMsgType("success");
        setGeneratedBillNumber(data.bill_number);
        setShowPrint(true);
        if (onBillSaved) onBillSaved();
      }
    } catch (err) {
      setMsg("Network error. Please try again.");
      setMsgType("error");
    }
  };

  const selectedMeasurements = measurementsList[bill.dress_type] || [];
  const dynamicExtras = extrasByDress[bill.dress_type] || [];

  // 👇 Remaining JSX continues
