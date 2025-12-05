// BodyStats.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BodyStats = () => {
  const { token } = useContext(AuthContext);
  const [bodyStats, setBodyStats] = useState([]);
  const [editingStatId, setEditingStatId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/body_stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBodyStats(data || []))
      .catch(console.error);
  }, [token]);

  const startEditingField = (statId, field, currentValue) => {
    setEditingStatId(statId);
    setEditingField(field);
    setFieldValue(currentValue || "");
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
    };

  const saveField = async (statId, field) => {
    try {
      const res = await fetch(`http://localhost:5000/body_stats/${statId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ column: field, value: fieldValue }),
      });

      const data = await res.json();
      console.log(data);

      setBodyStats((prev) =>
        prev.map((stat) =>
          stat.id === statId ? { ...stat, [field]: fieldValue } : stat
        )
      );

      setEditingStatId(null);
      setEditingField(null);
    } catch (err) {
      console.error(err);
    }
  };

  const renderField = (label, field, value, statId) => (
    <div>
      <strong>{label}: </strong>
      {editingStatId === statId && editingField === field ? (
        <>
          <input
            type={field === "date" ? "date" : "text"}
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
          />
          <button onClick={() => saveField(statId, field)}>Save</button>
          <button
            onClick={() => {
              setEditingStatId(null);
              setEditingField(null);
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <span
          onClick={() => startEditingField(statId, field, value)}
          style={{ cursor: "pointer" }}
        >
          {value || "-"}
        </span>
      )}
    </div>
  );

  return (
    <div>
      <h2>Body Stats</h2>
      {bodyStats.map((stat) => (
        <div key={stat.id} style={{ marginBottom: "1rem" }}>
          {renderField("Weight", "weight", stat.weight, stat.id)}
          {renderField("Body Fat", "body_fat", stat.body_fat, stat.id)}
          <strong>Last update:</strong> {formatDate(stat.date)}
        </div>
      ))}
    </div>
  );
};

export default BodyStats;
