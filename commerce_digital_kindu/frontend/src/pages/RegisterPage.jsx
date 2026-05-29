import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import AuthContext from "../AuthContext";

function RegisterPage() {
  const { setCurrentUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case "username":
        if (!value.trim()) return "Le nom d'utilisateur est requis";
        if (value.length < 3) return "Au moins 3 caractères";
        if (value.length > 30) return "Maximum 30 caractères";
        if (!/^[a-zA-Z0-9_]+$/.test(value))
          return "Lettres, chiffres et underscore uniquement";
        return "";
      case "email":
        if (!value.trim()) return "L'email est requis";
        const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
        if (!emailRegex.test(value))
          return "Email invalide (ex: nom@domaine.com)";
        return "";
      case "password":
        if (!value) return "Le mot de passe est requis";
        if (value.length < 6) return "Au moins 6 caractères";
        if (value.length > 128) return "Maximum 128 caractères";
        return "";
      case "confirmPassword":
        if (!value) return "Veuillez confirmer le mot de passe";
        if (value !== form.password)
          return "Les mots de passe ne correspondent pas";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {
      username: validateField("username", form.username),
      email: validateField("email", form.email),
      password: validateField("password", form.password),
      confirmPassword: validateField("confirmPassword", form.confirmPassword),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      // On n'envoie que username, email, password (pas confirmPassword)
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
      };
      await api.post("/auth/register/", payload);
      // attempt auto-login
      try {
        const loginResp = await api.post("/auth/login/", {
          username: form.username,
          password: form.password,
        });
        const data = loginResp.data || {};
        const access = data.access || data.token || data.tokens?.access;
        const refresh =
          data.refresh || data.tokens?.refresh || data.token?.refresh;
        if (access) localStorage.setItem("kuhuza_access", access);
        if (refresh) localStorage.setItem("kuhuza_refresh", refresh);
        const user = data.user || (data.username ? data : null);
        setCurrentUser(user);
        setMessage("Compte créé et connexion automatique réussie.");
        setTimeout(() => navigate("/"), 1000);
      } catch (loginErr) {
        setMessage(
          "Compte créé. Connexion automatique échouée — veuillez vous connecter.",
        );
        setTimeout(() => navigate("/auth/login"), 2000);
      }
    } catch (error) {
      const raw =
        error.response?.data?.detail || error.response?.data || error.message;
      const backendMessage =
        typeof raw === "object" ? JSON.stringify(raw) : raw;
      setMessage(`Erreur : ${backendMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
            Inscription
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">
            Créez votre compte
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Rejoignez Kuhuza-Digital pour acheter localement. Vous pourrez créer
            votre boutique plus tard.
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
              placeholder="ex: jean_dupond"
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
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              className={`mt-3 w-full rounded-3xl border px-5 py-4 text-slate-900 outline-none transition focus:ring-4 ${
                errors.email
                  ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-200 bg-slate-50 focus:border-sky-400 focus:ring-sky-100"
              }`}
              placeholder="nom@entreprise.com"
              value={form.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-rose-600">{errors.email}</p>
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

          <div>
            <label className="text-sm font-medium text-slate-700">
              Confirmer le mot de passe <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              className={`mt-3 w-full rounded-3xl border px-5 py-4 text-slate-900 outline-none transition focus:ring-4 ${
                errors.confirmPassword
                  ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-200 bg-slate-50 focus:border-sky-400 focus:ring-sky-100"
              }`}
              placeholder="retapez votre mot de passe"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-rose-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-sky-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Création en cours..." : "S'inscrire"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-5 rounded-xl p-3 text-center text-sm ${
              message.includes("succès")
                ? "bg-green-50 text-green-700"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà un compte ?{" "}
          <Link
            to="/auth/login"
            className="font-semibold text-sky-600 hover:text-sky-700"
          >
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
