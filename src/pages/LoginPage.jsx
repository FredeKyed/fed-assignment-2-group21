import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(""); 
  
    try {
      const res = await fetch("http://localhost:8080/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
  
      if (!res.ok) {
        setLoginError("Forkert email eller adgangskode.");
        return;
      }
  
      const token = await res.text();
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);
  
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  
      if (role === "Manager") {
        navigate("/manager");
      } else if (role === "Model") {
        navigate("/model");
      } else {
        setLoginError("Ukendt rolle. Adgang nægtet.");
      }
  
    } catch (err) {
      console.error("Login error:", err.message, err);
      setLoginError("Der opstod en fejl ved login.");
    }
  }
  

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ borderBottom: "2px solid #007bff", paddingBottom: "0.5rem" }}>
        Login
      </h2>
      {loginError && (
        <p style={{ color: "red", marginBottom: "1rem" }}>{loginError}</p>
      )}
      <form onSubmit={handleLogin}>
        <div>
          <input
          style={{
            padding: "0.5rem",
            width: "100%",
            maxWidth: "400px",
            marginBottom: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <input
          style={{
            padding: "0.5rem",
            width: "100%",
            maxWidth: "400px",
            marginBottom: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button
        style={{
          padding: "0.5rem 1rem",
          marginTop: "0.5rem",
          border: "none",
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "4px",
          cursor: "pointer"
        }}
        type="submit">Login</button>
      </form>
    </div>
  );
}
