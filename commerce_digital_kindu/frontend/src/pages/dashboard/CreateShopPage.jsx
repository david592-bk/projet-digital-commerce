import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import AuthContext from "../../AuthContext";

export default function CreateShopPage() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    return (
      <div className="rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">
          Créer ma boutique
        </h1>
        <p className="mt-4 text-slate-600">
          Vous devez être connecté pour créer une boutique.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/auth/login"
            className="rounded-full bg-sky-600 px-6 py-3 text-white shadow-sm hover:bg-sky-700"
          >
            Se connecter
          </Link>
          <Link
            to="/auth/register"
            className="rounded-full border border-slate-200 px-6 py-3 text-slate-700 hover:bg-slate-50"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/shops/", {
        name,
        description,
        address,
        opening_hours: openingHours,
        is_active: isActive,
      });
      navigate("/dashboard");
    } catch (error) {
      setMessage(
        "Impossible de créer la boutique. Vérifiez vos informations et réessayez.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Boutique
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Créer ma boutique
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Remplissez les informations de votre boutique pour commencer à
            vendre.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
        >
          Retour au tableau de bord
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nom de la boutique
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Adresse
          </label>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            required
            className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Horaires
          </label>
          <input
            value={openingHours}
            onChange={(event) => setOpeningHours(event.target.value)}
            placeholder="Ex: 8h-18h"
            className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            id="active"
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <label htmlFor="active" className="text-sm text-slate-700">
            Mettre la boutique en ligne immédiatement
          </label>
        </div>

        {message && <p className="text-sm text-rose-600">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-sky-600 px-6 py-3 text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Création en cours..." : "Créer la boutique"}
        </button>
      </form>
    </div>
  );
}
