// BodyStats.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { formatDate } from "../../util/FormatDate";
import "./BodyStats.css";

const BodyStats = () => {
  const { token } = useContext(AuthContext);
  const [bodyStats, setBodyStats] = useState([]);
  const [newBodyStat, setNewBodyStat] = useState({
    weight: 0,
    body_fat: 0,
  });
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    fetchBodyStats();
  }, [token]);

  const fetchBodyStats = () => {
    fetch("http://localhost:5000/body_stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBodyStats(data || []))
      .catch(console.error);
  };

  const handleFlag = () => {
    setFlag(!flag);
  };

  const addWeighIn = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/body_stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBodyStat),
      });

      if (!response.ok) throw new Error("Failed to add body stat");

      await response.json();

      fetchBodyStats();

      setNewBodyStat({ weight: 0, body_fat: 0 });
      handleFlag();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="body-stats-wrapper">
      <div className="body-stats-container">
        <h2>Body Stats</h2>

        {/* TABLE WRAPPER */}
        <div className="table-wrapper">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Body Fat</th>
              </tr>
            </thead>

            <tbody>
              {bodyStats.map((e) => (
                <tr key={e.id}>
                  <td>{formatDate(e.date)}</td>
                  <td>{e.weight} kg</td>
                  <td>{e.body_fat}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ADD FORM */}
        {flag && (
          <form className="stats-form" onSubmit={addWeighIn}>
            <label htmlFor="">
              Weight:
              <input
                type="number"
                name="weight"
                placeholder="Weight (kg)"
                className="form-input"
                value={newBodyStat.weight}
                onChange={(e) =>
                  setNewBodyStat({ ...newBodyStat, weight: e.target.value })
                }
              />
            </label>

            <label htmlFor="">
              Body Fat:
              <input
                type="number"
                name="body_fat"
                placeholder="Body Fat (%)"
                className="form-input"
                value={newBodyStat.body_fat}
                onChange={(e) =>
                  setNewBodyStat({ ...newBodyStat, body_fat: e.target.value })
                }
              />
            </label>

            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>
        )}

        {flag ? (
          <button onClick={handleFlag} className="toggle-btn">
            Cancel
          </button>
        ) : (
          <button onClick={handleFlag} className="toggle-btn">
            Add Weigh-in
          </button>
        )}
      </div>
    </div>
  );
};

export default BodyStats;
