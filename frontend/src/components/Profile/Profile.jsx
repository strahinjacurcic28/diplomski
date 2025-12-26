import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import BodyStats from "../BodyStats/BodyStats";
import { formatDate } from "../../util/FormatDate";
import './Profile.css'
import { apiRequest } from "../../api/Api";
import Button from "../Button/Button";

const Profile = () => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    fetchUser();
  }, [token]);
  
  const fetchUser = async () => {
    setLoading(true);
    try {
      const userData = await apiRequest("/users", "GET", null, token);
      setUser(userData);

    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (field) => {
    setEditingField(field);
    if (field === "password_hash") {
      setPasswordValue("");
    } else {
      setFieldValue(user[field] || "");
    }
  };

  const saveField = async (field) => {
    let value = field === "password_hash" ? passwordValue : fieldValue;

    try {
      const data = await apiRequest("/users", "PUT", { column: field, value }, token);
      if (data.user) {
        fetchUser();
      } else if (data[field] !== undefined) {
        setUser(prev => ({ ...prev, [field]: data[field] }));
      } 
      
      setEditingField(null);
      setFieldValue("");
      setPasswordValue("");
      console.log(user)
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const renderField = (label, field, type = "text") => (
    <div className="profile-field">
      <strong>{label}: </strong>
      {editingField === field ? (
        <>
          <input
            type={type}
            value={field === "password_hash" ? passwordValue : fieldValue}
            onChange={(e) =>
              field === "password_hash"
                ? setPasswordValue(e.target.value)
                : setFieldValue(e.target.value)
            }
          />
          <Button handleClick={() => saveField(field)} variant="update-profile">Save</Button>
          <Button handleClick={() => setEditingField(null)} variant="update-profile">Cancel</Button>
        </>
      ) : (
        <span onClick={() => startEditing(field)} style={{ cursor: "pointer" }}>
          {field === "password_hash" ? "••••••••" : (user[field] || "-")}
        </span>
      )}
    </div>
  );

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <h2>Profile</h2>
        {loading ? (
          <p>Loading profile...</p>
        ) : (
          <>
            {renderField("Username", "username")}
            {renderField("Email", "email", "email")}
            {renderField("Password", "password_hash", "password")}
            <p><strong>Gender: </strong>{user.gender ? user.gender : "-"} </p>
            <p><strong>Member since:</strong> {formatDate(user.created_at)}</p>
            <BodyStats />
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;