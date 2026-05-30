import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { MOCK_PRODUCTS } from "../mockData";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/shops/products/", { params: { q: query } })
      .then((response) => {
        const data = response.data;
        setProducts(data.length > 0 ? data : MOCK_PRODUCTS);
      })
      .catch(() => setProducts(MOCK_PRODUCTS))
      .finally(() => setLoading(false));
  }, [query]);

  const displayedProducts = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.shop_name || "").toLowerCase().includes(query.toLowerCase()) ||
          (p.description || "").toLowerCase().includes(query.toLowerCase())
      )
    : products;

  const getCategoryStyles = (category, isService) => {
    if (isService) return "bg-sky-50 text-sky-700 border-sky-200";
    const cats = {
      aliment: "bg-emerald-50 text-emerald-700 border-emerald-200",
      vetement: "bg-blue-50 text-blue-700 border-blue-200",
      nettoyage: "bg-amber-50 text-amber-700 border-amber-200",
      beaute: "bg-pink-50 text-pink-700 border-pink-200",
      autre: "bg-slate-50 text-slate-700 border-slate-200",
    };
    return cats[category] || cats.autre;
  };

  const getCategoryLabel = (category, isService) => {
    if (isService) return "Service";
    const labels = {
      aliment: "Alimentation",
      vetement: "Habillement",
      nettoyage: "Entretien",
      beaute: "Beauté & Soins",
      autre: "Autre",
    };
    return labels[category] || "Autre";
  };

  return (
    <div className="space-y-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <section className="rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-sky-950 px-6 py-10 sm:px-10 sm:py-14 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_50%)]"></div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-sky-500/10 border border-sky-400/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-400">
              Catalogue public
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Tous les Produits
            </h1>
            <p className="text-sm text-slate-300 max-w-md">
              Découvrez les produits et services des boutiques locales de Kindu.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold text-white self-start sm:self-auto">
            {displayedProducts.length} article{displayedProducts.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Search */}
        <div className="relative mt-8">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit ou une boutique..."
            className="w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur px-5 py-4 pl-12 text-sm text-white placeholder-slate-400 outline-none transition focus:border-sky-400 focus:bg-white/20 focus:ring-4 focus:ring-sky-500/20"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </section>

      {/* Products Grid */}
      <section>
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600"></div>
            <p className="text-sm font-medium text-slate-400">Chargement des produits...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-16 text-center space-y-2">
            <p className="text-base font-semibold text-slate-700">Aucun produit trouvé</p>
            <p className="text-xs text-slate-500">Essayez de modifier vos termes de recherche.</p>
          </div>
        ) : (
          <>
            {/* Mock notice */}
            {displayedProducts[0]?.is_mock && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-800">
                <svg className="h-5 w-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong>Aperçu démonstratif :</strong> Ces produits sont des exemples. Inscrivez-vous comme vendeur pour publier les vôtres !
                </span>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayedProducts.map((product) => (
                <Link
                  to={`/product/${product.id}`}
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                    {product.photo_url ? (
                      <img
                        src={product.photo_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    <span
                      className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow ${getCategoryStyles(
                        product.category,
                        product.item_type === "service"
                      )}`}
                    >
                      {getCategoryLabel(product.category, product.item_type === "service")}
                    </span>
                    {product.is_featured && (
                      <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                        ⭐ À la une
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {product.shop_name}
                      </span>
                      <h2 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-sky-600 transition">
                        {product.name}
                      </h2>
                      <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                        {product.description || "Aucune description fournie."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Prix</span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {parseFloat(product.price).toLocaleString()} FC
                        </span>
                      </div>
                      <span className="rounded-full bg-sky-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm">
                        Voir détails →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
