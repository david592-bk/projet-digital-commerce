import { useEffect, useState } from "react";
import api from "../api";

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/shops/", { params: { q: query } })
      .then((response) => setShops(response.data))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Boutiques publiques
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Boutiques
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Parcourez les commerces locaux et découvrez leurs offres.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {shops.length} boutique{shops.length > 1 ? "s" : ""}
          </div>
        </div>

        <div className="mt-6">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une boutique..."
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {loading ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
              Chargement des boutiques...
            </div>
          ) : shops.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
              Aucune boutique trouvée.
            </div>
          ) : (
            shops.map((shop) => (
              <article
                key={shop.id}
                className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="grid gap-4 p-5 sm:grid-cols-[120px_1fr]">
                  <div className="h-28 w-full overflow-hidden rounded-[1.5rem] bg-slate-100">
                    {shop.logo_url ? (
                      <img
                        src={shop.logo_url}
                        alt={shop.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        Logo indisponible
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {shop.name || "Boutique"}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {shop.description || "Aucune description disponible."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {shop.city && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                          {shop.city}
                        </span>
                      )}
                      {shop.category && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                          {shop.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start justify-between gap-4 text-right sm:items-end">
                    <button
                      type="button"
                      className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      Voir la boutique
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
