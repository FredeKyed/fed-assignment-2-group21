import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage";
import ManagerDashBoard from "./pages/ManagerDashBoard";
import ModelDashBoard from "./pages/ModelDashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/manager" element={<ManagerDashBoard />} />
        <Route path="/model" element={<ModelDashBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
