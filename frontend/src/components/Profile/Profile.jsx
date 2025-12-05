import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import BodyStats from "../BodyStats/BodyStats";

const Profile = () => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data[0] || {}))
      .catch(console.error);
  }, [token]);

  const startEditing = (field) => {
    setEditingField(field);
    setFieldValue(user[field] || "");
  };

  const saveField = async (field) => {
    let value = field === "password" ? passwordValue : fieldValue;

    try {
      const res = await fetch("http://localhost:5000/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ column: field, value }),
      });

      const data = await res.json();
      if (data.user) setUser(data.user);
      setEditingField(null);
      setFieldValue("");
      setPasswordValue("");
    } catch (err) {
      console.error(err);
    }
  };

  const renderField = (label, field, type = "text") => (
    <div>
      <strong>{label}: </strong>
      {editingField === field ? (
        <>
          <input
            type={type}
            value={field === "password" ? passwordValue : fieldValue}
            onChange={(e) =>
              field === "password"
                ? setPasswordValue(e.target.value)
                : setFieldValue(e.target.value)
            }
          />
          <button onClick={() => saveField(field)}>Save</button>
          <button onClick={() => setEditingField(null)}>Cancel</button>
        </>
      ) : (
        <span onClick={() => startEditing(field)} style={{ cursor: "pointer" }}>
          {field === "password_hash" ? "••••••••" : user[field] || "-"}
        </span>
      )}
    </div>
  );

  return (
    <div>
      <h2>Profile</h2>
      {renderField("Username", "username")}
      {renderField("Email", "email", "email")}
      {renderField("Password", "password_hash", "password")}
      <div>
        <BodyStats></BodyStats>
      </div>
    </div>
  );
};

export default Profile;

