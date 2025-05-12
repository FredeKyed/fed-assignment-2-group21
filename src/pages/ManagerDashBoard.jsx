import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ManagerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ 
    customer: "", 
    startDate: new Date().toISOString().split("T")[0], 
    days: 1, 
    location: "", 
    comments: "" 
});
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([{}]);
  const [newManager, setNewManager] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [newModel, setNewModel] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    addressLine1: "",
    addressLine2: "",
    zip: "",
    city: "",
    country: "",
    birthDate: new Date().toISOString().split("T")[0],
    nationality: "",
    height: "",
    shoeSize: "",
    hairColor: "",
    eyeColor: "",
    comments: "",
    password: ""
  });

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchJobs();
    fetchModels();
  }, []);

  async function fetchJobs() {
    try {
      const res = await fetch("http://localhost:8080/api/Jobs", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch jobs");

      const jobsData = await res.json();

      const jobsWithModels = await Promise.all(
        jobsData.map(async (job) => {
            const detailRes = await fetch(`http://localhost:8080/api/Jobs/${job.jobId}`, {
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            const jobDetails = await detailRes.json();
            return { ...job, models: jobDetails.models || [] };
        })
      );

      setJobs(jobsWithModels);
    } catch (err) {
      console.error("Error fetching jobs:", err.message);
    }
  }

  async function fetchModels() {
    try {
        const res = await fetch("http://localhost:8080/api/Models", {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        if (!res.ok) throw new Error("Failed to fetch models");

        const data = await res.json();
        setModels(data);
    } catch (err) {
        console.error("Error fetching models:", err.message);
    }
  }

  async function createJob(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/Jobs", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newJob),
      });

      if (!res.ok) throw new Error("Job creation failed");

      setNewJob({ title: "", description: "" });
      fetchJobs(); // Opdater listen
    } catch (err) {
      console.error("Error creating job:", err.message);
    }
  }

  async function addModelToJob(jobId) {
    const modelId = selectedModels[jobId];
    if (!modelId) return;
  
    try {
      const res = await fetch(`http://localhost:8080/api/Jobs/${jobId}/model/${modelId}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token
        }
      });
  
      if (!res.ok) throw new Error("Failed to assign model");
      fetchJobs(); // opdatér visning
    } catch (err) {
      console.error("Error assigning model:", err.message);
    }
  }

  async function removeModelFromJob(jobId, modelId) {
    try {
      const res = await fetch(`http://localhost:8080/api/Jobs/${jobId}/model/${modelId}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token
        }
      });
  
      if (!res.ok) throw new Error("Failed to remove model from job");
  
      // Opdater jobs bagefter
      fetchJobs();
    } catch (err) {
      console.error("Error removing model:", err.message);
    }
  }
  
  async function createManager(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/Managers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(newManager)
      });
  
      if (!res.ok) throw new Error("Kunne ikke oprette manager");
  
      alert("Ny manager oprettet!");
      setNewManager({ firstName: "", lastName: "", email: "", password: "" });
    } catch (err) {
      console.error("Fejl:", err.message);
    }
  }

  async function createModel(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/Models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(newModel)
      });
  
      if (!res.ok) throw new Error("Modeloprettelse fejlede");
  
      alert("Model oprettet!");
      setNewModel({
        firstName: "", lastName: "", email: "", phoneNo: "", addressLine1: "", addressLine2: "", zip: "", city: "", country: "",
        birthDate: new Date().toISOString().split("T")[0], nationality: "", height: "", shoeSize: "", hairColor: "",
        eyeColor: "", comments: "", password: ""
      });
  
      fetchModels(); // Opdatér dropdowns
    } catch (err) {
      console.error("Fejl:", err.message);
    }
  }
  
  
  

  return (
    <div style={{ padding: "2rem" }}>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
        style={{ position: "absolute", top: "1rem", right: "1rem" }}
        >
          Log ud
        </button>
      <h2>Manager Dashboard</h2>

      <h3>Opret ny manager:</h3>
      <form onSubmit={createManager} style={{ marginBottom: "2rem" }}>
        <input
            type="text"
            placeholder="Fornavn"
            value={newManager.firstName}
            onChange={(e) =>
                setNewManager({ ...newManager, firstName: e.target.value })
            }
            required
            />
            <br />
            <input
            type="text"
            placeholder="Efternavn"
            value={newManager.lastName}
            onChange={(e) =>
              setNewManager({ ...newManager, lastName: e.target.value })
            }
            required
          />
          <br />
          <input
            type="email"
            placeholder="Email"
            value={newManager.email}
            onChange={(e) =>
              setNewManager({ ...newManager, email: e.target.value })
            }
            required
          />
          <br />
          <input
            type="password"
            placeholder="Adgangskode"
            value={newManager.password}
            onChange={(e) =>
              setNewManager({ ...newManager, password: e.target.value })
            }
            required
          />
          <br />
          <button type="submit">Opret manager</button>
      </form>

      <h3>Opret ny model:</h3>
      <form onSubmit={createModel} style={{ marginBottom: "2rem" }}>
        <input placeholder="Fornavn" value={newModel.firstName}
            onChange={(e) => setNewModel({ ...newModel, firstName: e.target.value })} required /><br />

        <input placeholder="Efternavn" value={newModel.lastName}
            onChange={(e) => setNewModel({ ...newModel, lastName: e.target.value })} required /><br />

        <input type="email" placeholder="Email" value={newModel.email}
            onChange={(e) => setNewModel({ ...newModel, email: e.target.value })} required /><br />

        <input placeholder="Telefon" value={newModel.phoneNo}
            onChange={(e) => setNewModel({ ...newModel, phoneNo: e.target.value })} /><br />

        <input placeholder="Adresse 1" value={newModel.addressLine1}
            onChange={(e) => setNewModel({ ...newModel, addressLine1: e.target.value })} /><br />

        <input placeholder="Adresse 2" value={newModel.addressLine2}
            onChange={(e) => setNewModel({ ...newModel, addressLine2: e.target.value })} /><br />

        <input placeholder="Postnummer" value={newModel.zip}
            onChange={(e) => setNewModel({ ...newModel, zip: e.target.value })} /><br />

        <input placeholder="By" value={newModel.city}
            onChange={(e) => setNewModel({ ...newModel, city: e.target.value })} /><br />

        <input placeholder="Land" value={newModel.country}
            onChange={(e) => setNewModel({ ...newModel, country: e.target.value })} /><br />

        <input type="date" value={newModel.birthDate}
            onChange={(e) => setNewModel({ ...newModel, birthDate: e.target.value })} required /><br />

        <input placeholder="Nationalitet" value={newModel.nationality}
            onChange={(e) => setNewModel({ ...newModel, nationality: e.target.value })} /><br />

        <input placeholder="Højde" value={newModel.height}
            onChange={(e) => setNewModel({ ...newModel, height: e.target.value })} /><br />

        <input placeholder="Skostørrelse" value={newModel.shoeSize}
            onChange={(e) => setNewModel({ ...newModel, shoeSize: e.target.value })} /><br />

        <input placeholder="Hårfarve" value={newModel.hairColor}
            onChange={(e) => setNewModel({ ...newModel, hairColor: e.target.value })} /><br />

        <input placeholder="Øjenfarve" value={newModel.eyeColor}
            onChange={(e) => setNewModel({ ...newModel, eyeColor: e.target.value })} /><br />

        <textarea placeholder="Kommentar" value={newModel.comments}
            onChange={(e) => setNewModel({ ...newModel, comments: e.target.value })} /><br />

        <input type="password" placeholder="Adgangskode" value={newModel.password}
            onChange={(e) => setNewModel({ ...newModel, password: e.target.value })} required /><br />

        <button type="submit">Opret model</button>
      </form>

      <h3>Opret nyt job:</h3>
        <form onSubmit={createJob} style={{ marginBottom: "1rem" }}>
              <input
              type="text"
               placeholder="Kunde"
              value={newJob.customer || ""}
               onChange={(e) => setNewJob({ ...newJob, customer: e.target.value })}
              required
             />
             <br />
             <input
              type="date"
              value={newJob.startDate}
              onChange={(e) => setNewJob({ ...newJob, startDate: e.target.value })}
              required
             />
             <br />
             <input
               type="number"
               min="1"
               placeholder="Antal dage"
              value={newJob.days}
               onChange={(e) => setNewJob({ ...newJob, days: parseInt(e.target.value) })}
              required
             />
             <br />
             <input
              type="text"
              placeholder="Lokation"
              value={newJob.location}
              onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
               required
             />
             <br />
              <textarea
              placeholder="Kommentar"
              value={newJob.comments}
               onChange={(e) => setNewJob({ ...newJob, comments: e.target.value })}
              />
             <br />
            <button type="submit">Opret job</button>
        </form>


      <h3>Alle jobs:</h3>
      <ul>
        {jobs.map((job) => (
          <li key={job.jobId}>
            <strong>{job.customer}</strong> — {job.location}
            <br />

            <select
                value={selectedModels[job.jobId] || ""}
                onChange={(e) => 
                    setSelectedModels({ ...selectedModels, [job.jobId]: e.target.value})
            }
            >
                <option value="">Vælg model</option>
                {models.map((model) => (
                    <option key={model.modelId} value={model.modelId}>
                        {model.firstName} {model.lastName}
                    </option>
                ))}
            </select>
            <button onClick={() => addModelToJob(job.jobId)}>Tilføj model</button>
            {job.models && job.models.length > 0 && (
                <ul>
                    {job.models.map((model) => (
                        <li key={model.modelId}>- {model.firstName} {model.lastName}
                        <button
                        onClick={() => removeModelFromJob(job.jobId, model.modelId)}
                        style={{ marginLeft: "0.5rem" }}
                        >
                            Fjern
                        </button>
                        </li>
                    ))}
                </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

