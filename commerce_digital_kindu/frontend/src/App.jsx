import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import api from "./api";
import AuthContext from "./AuthContext";

import Header from "./components/Header";

import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import ShopsPage from "./pages/ShopsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import CreateShopPage from "./pages/dashboard/CreateShopPage";
import CreateProductPage from "./pages/dashboard/CreateProductPage";
import EditProductPage from "./pages/dashboard/EditProductPage";

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
    const access = localStorage.getItem("kuhuza_access");
    if (!access) {
      return;
    }
    api
      .get("/auth/user/")
      .then((response) => setCurrentUser(response.data))
      .catch(() => {
        localStorage.removeItem("kuhuza_access");
        localStorage.removeItem("kuhuza_refresh");
        setCurrentUser(null);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("kuhuza_access");
    localStorage.removeItem("kuhuza_refresh");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout }}>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-10">
          <div className={`page-transition ${transitionStage}`}>
            <Routes location={displayLocation}>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/shops" element={<ShopsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/dashboard/create-shop"
                element={<CreateShopPage />}
              />
              <Route
                path="/dashboard/products/new"
                element={<CreateProductPage />}
              />
              <Route
                path="/dashboard/products/:id/edit"
                element={<EditProductPage />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
