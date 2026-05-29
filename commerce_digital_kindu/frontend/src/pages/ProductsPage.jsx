import { useEffect, useState } from "react";
import api from "../api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/shops/products/", { params: { q: query } })
      .then((response) => setProducts(response.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Catalogue public
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Produits
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Découvrez les produits disponibles dans les boutiques locales.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {products.length} produit{products.length > 1 ? "s" : ""}
          </div>
        </div>

        <div className="mt-6">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un produit ou une boutique..."
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {loading ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
              Chargement des produits...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
              Aucun produit trouvé.
            </div>
          ) : (
            products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="grid gap-4 p-5 sm:grid-cols-[120px_1fr]">
                  <div className="h-28 w-full overflow-hidden rounded-[1.5rem] bg-slate-100">
                    {product.photo_url ? (
                      <img
                        src={product.photo_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        Pas d’image
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {product.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {product.description || "Description indisponible."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                        {product.shop_name || "Boutique"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                        {product.item_type === "service"
                          ? "Service"
                          : "Produit"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                        {product.category || "Autre"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start justify-between gap-4 text-right sm:items-end">
                    <p className="text-lg font-semibold text-slate-900">
                      {product.price} FC
                    </p>
                    <button
                      type="button"
                      className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      Voir le produit
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
