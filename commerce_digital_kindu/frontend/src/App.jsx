import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import api from "./api";
import AuthContext from "./AuthContext";

import Header from "./components/Header";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (
      location.pathname !== displayLocation.pathname ||
      location.search !== displayLocation.search
    ) {
      setTransitionStage("fadeOut");
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fadeIn");
      }, 180);
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  useEffect(() => {
    const token = localStorage.getItem("kindu_token");
    if (!token) {
      return;
    }
    api
      .get("/auth/user/")
      .then((response) => setCurrentUser(response.data))
      .catch(() => {
        localStorage.removeItem("kindu_token");
        setCurrentUser(null);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("kindu_token");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout }}>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className={`page-transition ${transitionStage}`}>
            <Routes location={displayLocation}>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
