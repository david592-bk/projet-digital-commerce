import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { MOCK_SHOPS } from "../mockData";

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/shops/", { params: { q: query } })
      .then((response) => {
        const data = response.data;
        setShops(data.length > 0 ? data : MOCK_SHOPS);
      })
      .catch(() => setShops(MOCK_SHOPS))
      .finally(() => setLoading(false));
  }, [query]);

  const displayedShops = query
    ? shops.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(query.toLowerCase()) ||
          (s.description || "").toLowerCase().includes(query.toLowerCase()) ||
          (s.category || "").toLowerCase().includes(query.toLowerCase())
      )
    : shops;

  const categoryColors = {
    Alimentation: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Habillement: "bg-blue-50 text-blue-700 border-blue-200",
    "Beauté & Soins": "bg-pink-50 text-pink-700 border-pink-200",
    Électronique: "bg-violet-50 text-violet-700 border-violet-200",
    Santé: "bg-red-50 text-red-700 border-red-200",
    Restauration: "bg-orange-50 text-orange-700 border-orange-200",
  };

  const getCategoryStyle = (cat) =>
    categoryColors[cat] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div className="space-y-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <section className="rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 px-6 py-10 sm:px-10 sm:py-14 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_50%)]"></div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-400/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Commerce local
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Boutiques de Kindu
            </h1>
            <p className="text-sm text-slate-300 max-w-md">
              Parcourez les commerces locaux et découvrez leurs offres uniques.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold text-white self-start sm:self-auto">
            {displayedShops.length} boutique{displayedShops.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Search */}
        <div className="relative mt-8">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une boutique..."
            className="w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur px-5 py-4 pl-12 text-sm text-white placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:bg-white/20 focus:ring-4 focus:ring-emerald-500/20"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </section>

      {/* Shops Grid */}
      <section>
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
            <p className="text-sm font-medium text-slate-400">Chargement des boutiques...</p>
          </div>
        ) : displayedShops.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-16 text-center space-y-2">
            <p className="text-base font-semibold text-slate-700">Aucune boutique trouvée</p>
            <p className="text-xs text-slate-500">Essayez de modifier vos termes de recherche.</p>
          </div>
        ) : (
          <>
            {/* Mock notice */}
            {displayedShops[0]?.is_mock && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-800">
                <svg className="h-5 w-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong>Aperçu démonstratif :</strong> Ces boutiques sont des exemples. Inscrivez-vous comme vendeur pour créer la vôtre !
                </span>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedShops.map((shop) => (
                <article
                  key={shop.id}
                  className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Cover image */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    {shop.logo_url ? (
                      <img
                        src={shop.logo_url}
                        alt={shop.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* Category badge */}
                    {shop.category && (
                      <span
                        className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow ${getCategoryStyle(shop.category)}`}
                      >
                        {shop.category}
                      </span>
                    )}

                    {/* Shop name overlay */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <h2 className="text-base font-extrabold text-white line-clamp-1 drop-shadow">
                        {shop.name}
                      </h2>
                      {shop.city && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {shop.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                    <p className="text-xs leading-relaxed text-slate-500 line-clamp-3">
                      {shop.description || "Aucune description disponible."}
                    </p>

                    {(shop.opening_hours || shop.address) && (
                      <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        {shop.address && (
                          <p className="flex items-start gap-1.5">
                            <svg className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="line-clamp-1">{shop.address}</span>
                          </p>
                        )}
                        {shop.opening_hours && (
                          <p className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {shop.opening_hours}
                          </p>
                        )}
                      </div>
                    )}

                    <Link
                      to={`/shops?id=${shop.id}`}
                      className="block w-full text-center rounded-2xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                      Voir la boutique →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* CTA to become seller */}
            <div className="mt-8 rounded-3xl bg-gradient-to-r from-slate-900 to-sky-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold">Vous avez une boutique à Kindu ?</h3>
                <p className="text-xs text-slate-300">Rejoignez la plateforme et commencez à recevoir des commandes en ligne.</p>
              </div>
              <Link
                to="/become-seller"
                className="shrink-0 rounded-2xl bg-white px-6 py-3 text-xs font-bold text-slate-900 shadow hover:bg-slate-100 transition text-center"
              >
                Créer ma boutique gratuite
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
