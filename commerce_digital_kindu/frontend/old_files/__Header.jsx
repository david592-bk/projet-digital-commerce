import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../AuthContext";

export default function Header() {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-xl font-bold text-slate-900"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white">
              K
            </span>
            Kindu Commerce
          </Link>
          <p className="mt-1 text-sm text-slate-500">
            Votre marketplace locale pour commerçants, clients et livreurs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="text-slate-700 hover:text-slate-900" to="/">
            Accueil
          </Link>
          <Link
            className="text-slate-700 hover:text-slate-900"
            to="/dashboard/shop"
          >
            Entrepreneurs
          </Link>
          <Link
            className="text-slate-700 hover:text-slate-900"
            to="/dashboard/delivery"
          >
            Livreurs
          </Link>
          {currentUser ? (
            <>
              <Link
                className="text-slate-700 hover:text-slate-900"
                to="/profile"
              >
                Mon profil
              </Link>
              <button
                type="button"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                onClick={logout}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                to="/auth/login"
              >
                Connexion
              </Link>
              <Link
                className="rounded-full bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700"
                to="/auth/register"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
