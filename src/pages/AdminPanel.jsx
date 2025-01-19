import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [userIdSearch, setUserIdSearch] = useState("");
  const [singleUser, setSingleUser] = useState(null);

  const token = localStorage.getItem("token");

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/users", {
        headers: { Authorization: token },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch all users:", err);
    }
  };

  const handleDeleteAllUsers = async () => {
    if (!window.confirm("Are you sure you want to delete ALL users?")) return;
    try {
      await axios.delete("http://127.0.0.1:8000/admin/users", {
        headers: { Authorization: token },
      });
      alert("All users deleted successfully.");
      setUsers([]);
    } catch (err) {
      console.error("Failed to delete all users:", err);
    }
  };

  const handleGetUserById = async (e) => {
    e.preventDefault();
    if (!userIdSearch) return;
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/admin/${userIdSearch}`,
        {
          headers: { Authorization: token },
        }
      );
      setSingleUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      alert(err.response?.data?.detail || "Error fetching user");
    }
  };

  const handleDeleteUserById = async () => {
    if (!userIdSearch) return;
    if (
      !window.confirm(`Are you sure you want to delete user ${userIdSearch}?`)
    )
      return;
    try {
      await axios.delete(`http://127.0.0.1:8000/admin/${userIdSearch}`, {
        headers: { Authorization: token },
      });
      alert("User deleted successfully.");
      setSingleUser(null);
      setUserIdSearch("");
      fetchAllUsers(); // Refresh the user list
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div>
      <h2>Admin Panel</h2>

      <h4>All Users:</h4>
      <ul className="list-group mb-3">
        {users.map((u) => (
          <li className="list-group-item" key={u.id}>
            {u.name} - {u.email} (ID: {u.id})
          </li>
        ))}
      </ul>

      <button className="btn btn-danger mb-3" onClick={handleDeleteAllUsers}>
        Delete ALL Users
      </button>

      <hr />

      <h4>Get / Delete a Single User</h4>
      <form onSubmit={handleGetUserById} className="mb-3">
        <div className="mb-3">
          <label>User ID:</label>
          <input
            className="form-control"
            value={userIdSearch}
            onChange={(e) => setUserIdSearch(e.target.value)}
            placeholder="Paste user ID here"
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Get User By ID
        </button>
      </form>

      {singleUser && (
        <div className="alert alert-info">
          <p>
            <strong>Name:</strong> {singleUser.name}
          </p>
          <p>
            <strong>Email:</strong> {singleUser.email}
          </p>
          <p>
            <strong>ID:</strong> {singleUser.id}
          </p>
          <p>
            <strong>Admin?</strong> {singleUser.is_admin ? "Yes" : "No"}
          </p>

          <button className="btn btn-danger" onClick={handleDeleteUserById}>
            Delete This User
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
