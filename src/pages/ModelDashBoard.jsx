import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function ModelDashboard() {
  const [jobs, setJobs] = useState([]);
  const token = localStorage.getItem("token");
  const [modelEmail, setModelEmail] = useState("");
  const [expenses, setExpenses] = useState({});
  const [newExpenses, setNewExpenses] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchJobsForModel();
    fetchExpenses();
  }, []);

  async function fetchJobsForModel() {
  try {
    const decoded = jwtDecode(token);
    setModelEmail(decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]);

    const res = await fetch(`http://localhost:8080/api/Jobs`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) throw new Error("Kunne ikke hente jobs");

    const data = await res.json();
    setJobs(data);
  } catch (err) {
    console.error("Fejl ved hentning af jobs:", err.message);
  }
}

async function addExpense(jobId) {
  const decoded = jwtDecode(token);
  const expense = {
    jobId: jobId,
    modelId: decoded.ModelId,
    date: new Date().toISOString(),
    text: newExpenses[jobId]?.text || "",
    amount: parseFloat(newExpenses[jobId]?.amount || 0)
  };

  try {
    const res = await fetch("http://localhost:8080/api/Expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(expense)
    });

    if (!res.ok) throw new Error("Kunne ikke tilføje udgift");

    setNewExpenses({ ...newExpenses, [jobId]: { text: "", amount: "" } });
    fetchExpenses(); // Genindlæser udgifter
  } catch (err) {
    console.error("Fejl ved tilføjelse af udgift:", err.message);
  }
}

async function deleteExpense(expenseId) {
  try {
    const res = await fetch(`http://localhost:8080/api/Expenses/${expenseId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Kunne ikke slette udgiften");

    // Genindlæser udgifter
    fetchExpenses();
  } catch (err) {
    console.error("Fejl ved sletning af udgift:", err.message);
  }
}


async function fetchExpenses() {
  try {
    const decoded = jwtDecode(token);
    const modelId = decoded.ModelId;

    const res = await fetch(`http://localhost:8080/api/Expenses/model/${modelId}`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Kunne ikke hente udgifter");

    const data = await res.json();

    // Sorterer udgifter per job
    const grouped = {};
    data.forEach((e) => {
      if (!grouped[e.jobId]) grouped[e.jobId] = [];
      grouped[e.jobId].push(e);
    });

    setExpenses(grouped);
  } catch (err) {
    console.error("Fejl ved hentning af udgifter:", err.message);
  }
}




  return (
    <div style={{ 
      padding: "2rem",
      maxWidth: "800px",
      margin: "2rem auto",
      border: "1px solid #ccc",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      backgroundColor: "grey"
      }}>
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
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
        >
          Log ud
        </button>
      <h2 style={{ borderBottom: "2px solid #007bff", paddingBottom: "0.5rem" }}>
        Model Dashboard
      </h2>
      {modelEmail && <p>Logget ind som: <strong>{modelEmail}</strong></p>}
      <h3>Dine jobs:</h3>
      <ul>
        {jobs.length === 0 && <p>Ingen jobs endnu.</p>}
        {jobs.map((job) => (
          <li key={job.jobId}>
            <strong>{job.customer}</strong> — {job.location}
            <br />
            Start: {new Date(job.startDate).toLocaleDateString()} — {job.days} dag(e)

            {expenses[job.jobId] && expenses[job.jobId].length > 0 && (
              <>
              <ul>
                {expenses[job.jobId].map((e) => (
                  <li key={e.expenseId}>
                    {e.text} — {e.amount} kr.
                    <button
                      onClick={() => deleteExpense(e.expenseId)}
                      style={{
                        padding: "0.5rem 1rem",
                        marginTop: "0.5rem",
                        border: "none",
                        backgroundColor: "red",
                        color: "white",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Fjern
                    </button>
                  </li>
                ))}
              </ul>
              <p>
                  <strong>Udgifter i alt for job:</strong>{" "}
                  {expenses[job.jobId]
                    .reduce((sum, e) => sum + parseFloat(e.amount), 0)
                    .toFixed(2)}{" "}
                  kr.
              </p>
              </>
            )}

            {/* Tilføj ny udgift */}
            <div style={{ marginTop: "0.5rem" }}>
              <input
                type="text"
                placeholder="Beskrivelse"
                value={newExpenses[job.jobId]?.text || ""}
                onChange={(e) =>
                  setNewExpenses({
                    ...newExpenses,
                    [job.jobId]: {
                      ...newExpenses[job.jobId],
                      text: e.target.value
                    }
                  })
                }
              />
              <input
                type="number"
                placeholder="Beløb"
                value={newExpenses[job.jobId]?.amount || ""}
                onChange={(e) =>
                  setNewExpenses({
                    ...newExpenses,
                    [job.jobId]: {
                      ...newExpenses[job.jobId],
                      amount: e.target.value
                    }
                  })
                }
                style={{ marginLeft: "0.5rem" }}
              />
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
              onClick={() => addExpense(job.jobId)} 
              >
                Tilføj udgift
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
