import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import AuthContext from "../AuthContext";

export default function Header() {
  const { currentUser, logout } = useContext(AuthContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo et identité */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md md:h-10 md:w-10">
                <span className="text-lg font-bold md:text-xl">K</span>
              </div>
              <span className="text-lg font-bold text-slate-900 md:text-xl">
                Kuhuza<span className="text-sky-600">-Digital</span>
              </span>
            </Link>
            <span className="hidden text-sm text-slate-400 md:inline-block">
              |
            </span>
            <p className="hidden text-sm text-slate-500 md:block">
              Achetez & vendez localement
            </p>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive("/")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Accueil
            </Link>
            <Link
              to="/products"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive("/products")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Produits
            </Link>
            <Link
              to="/shops"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive("/shops")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Boutiques
            </Link>
          </nav>

          {/* Actions (connexion / inscription / profil) */}
          <div className="hidden items-center gap-2 md:flex">
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Tableau de bord
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Connexion
                </Link>
                <Link
                  to="/auth/register"
                  className="rounded-full bg-sky-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Menu mobile déroulant */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 py-4 md:hidden">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                className="rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/products"
                className="rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Produits
              </Link>
              <Link
                to="/shops"
                className="rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Boutiques
              </Link>
              <hr className="my-2 border-slate-200" />
              {currentUser ? (
                <>
                  <Link
                    to="/dashboard"
                    className="rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-lg px-3 py-2 text-left text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/auth/login"
                    className="rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/auth/register"
                    className="rounded-lg bg-sky-600 px-3 py-2 text-center text-base font-medium text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
