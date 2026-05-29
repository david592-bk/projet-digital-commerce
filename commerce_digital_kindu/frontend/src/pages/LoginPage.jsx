import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import AuthContext from "../AuthContext";

function LoginPage() {
  const { setCurrentUser } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Nom d'utilisateur requis";
    if (!form.password) newErrors.password = "Mot de passe requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await api.post("/auth/login/", {
        username: form.username,
        password: form.password,
      });
      // backend returns { access, refresh, user }
      const data = response.data || {};
      const access = data.access || data.token || data.tokens?.access;
      const refresh =
        data.refresh || data.tokens?.refresh || data.token?.refresh;
      if (access) localStorage.setItem("kuhuza_access", access);
      if (refresh) localStorage.setItem("kuhuza_refresh", refresh);
      const user = data.user || (data.username ? data : null);
      setCurrentUser(user);
      setMessage(`Connecté en tant que ${user?.username || "utilisateur"}`);
      // Redirect after short delay to show success message
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      if (!error.response) {
        setMessage(`Erreur réseau : Vérifiez que le serveur est démarré.`);
        return;
      }
      const raw =
        error.response?.data?.detail || error.response?.data || error.message;
      const backendMessage =
        typeof raw === "object" ? JSON.stringify(raw) : raw;
      setMessage(`Échec de la connexion : ${backendMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
            Connexion
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">
            Bon retour
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Connectez-vous à votre compte Kuhuza-Digital pour acheter ou gérer
            votre boutique.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Nom d’utilisateur <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              className={`mt-3 w-full rounded-3xl border px-5 py-4 text-slate-900 outline-none transition focus:ring-4 ${
                errors.username
                  ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-200 bg-slate-50 focus:border-sky-400 focus:ring-sky-100"
              }`}
              placeholder="Votre nom d'utilisateur"
              value={form.username}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.username && (
              <p className="mt-2 text-sm text-rose-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Mot de passe <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              className={`mt-3 w-full rounded-3xl border px-5 py-4 text-slate-900 outline-none transition focus:ring-4 ${
                errors.password
                  ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-200 bg-slate-50 focus:border-sky-400 focus:ring-sky-100"
              }`}
              placeholder="••••••"
              value={form.password}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-rose-600">{errors.password}</p>
            )}
          </div>

          <div className="text-right">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-sky-600 hover:text-sky-700"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-sky-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-5 rounded-xl p-3 text-center text-sm ${
              message.includes("Connecté")
                ? "bg-green-50 text-green-700"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Pas encore de compte ?{" "}
          <Link
            to="/auth/register"
            className="font-semibold text-sky-600 hover:text-sky-700"
          >
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
