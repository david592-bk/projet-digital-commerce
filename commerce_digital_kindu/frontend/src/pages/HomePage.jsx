import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import api from "../api";
import AuthContext from "../AuthContext";

function HomePage() {
  const { currentUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  // Filter and Sort states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  useEffect(() => {
    setLoading(true);
    api
      .get("/shops/products/", { params: { q: query } })
      .then((response) => setProducts(response.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query]);

  const featuredProducts = products.filter((product) => product.is_featured);
  const carouselItems =
    featuredProducts.length > 0 ? featuredProducts : products.slice(0, 5);

  useEffect(() => {
    if (carouselItems.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  // Category list for filters
  const categories = [
    { id: "all", label: "Tous les articles" },
    { id: "aliment", label: "Alimentation" },
    { id: "vetement", label: "Habillement" },
    { id: "nettoyage", label: "Entretien" },
    { id: "beaute", label: "Beauté & Soins" },
    { id: "service", label: "Prestations / Services" },
    { id: "autre", label: "Autres" },
  ];

  // Client-side filtering
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "service") return p.item_type === "service";
    return p.category === selectedCategory && p.item_type !== "service";
  });

  // Client-side sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "price-asc") {
      return parseFloat(a.price) - parseFloat(b.price);
    } else if (sortOrder === "price-desc") {
      return parseFloat(b.price) - parseFloat(a.price);
    }
    return 0; // Default ordering
  });

  // Get color styles for category tags
  const getCategoryTagStyles = (category, isService) => {
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

  const scrollToCatalog = () => {
    const section = document.getElementById("catalog-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. Hero Section - Redesigned with premium dark theme & radial glow */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-tr from-slate-900 via-slate-800 to-sky-950 px-6 py-12 shadow-2xl sm:px-12 sm:py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_45%)]"></div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 border border-sky-400/20 px-4.5 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-400">
              Kuhuza-Digital Kindu
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-none">
              Achetez et vendez localement en toute simplicité
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-slate-300">
              Découvrez les produits et services des commerçants de Kindu, passez commande en quelques clics, ou ouvrez votre propre boutique en ligne pour faire grandir votre activité.
            </p>
            <div className="pt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                onClick={scrollToCatalog}
                className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-sky-600 hover:scale-[1.02] active:scale-[0.98]"
              >
                Explorer le catalogue
              </button>
              {!currentUser ? (
                <Link
                  to="/auth/register"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-600 bg-slate-800/40 backdrop-blur px-7 py-4 text-sm font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white"
                >
                  Créer un compte
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-600 bg-slate-800/40 backdrop-blur px-7 py-4 text-sm font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white"
                >
                  Tableau de bord
                </Link>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {currentUser
                ? "Ravi de vous revoir ! Gérez vos commandes ou votre boutique depuis votre espace."
                : "Inscription gratuite en 2 minutes pour acheteurs, vendeurs et livreurs."}
            </p>
          </div>

          {/* Side Cards within Hero */}
          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-md w-full">
            <div className="rounded-3xl bg-white/5 backdrop-blur-md p-6 border border-white/10 shadow-sm hover:bg-white/10 transition duration-300">
              <div className="h-10 w-10 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold mb-4">
                <svg className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Pour les Acheteurs</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Accédez aux produits frais, vêtements, soins ou services de votre quartier avec retrait rapide ou livraison.
              </p>
            </div>
            <div className="rounded-3xl bg-white/5 backdrop-blur-md p-6 border border-white/10 shadow-sm hover:bg-white/10 transition duration-300">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold mb-4">
                <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4.674 12.33a3 3 0 000-5.66m0 5.66L14 18h-4l-.674-1.33m4.674-4.34A3 3 0 0010 11.66m0 5.66L10 18H6l-.674-1.33" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Pour les Vendeurs</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Créez votre vitrine, gérez vos stocks, et recevez des commandes en direct de clients locaux.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Carrousel Produits Vedettes - Premium Slider UI */}
      <section className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-xl border border-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-100 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
              Recommandé
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Produits phares de Kindu
            </h2>
          </div>
          {carouselItems.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevSlide}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 hover:border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition"
                aria-label="Diapositive précédente"
              >
                ←
              </button>
              <div className="flex gap-1.5 px-2">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeSlide ? "w-6 bg-sky-600" : "w-2 bg-slate-200"
                    }`}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleNextSlide}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 hover:border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition"
                aria-label="Diapositive suivante"
              >
                →
              </button>
            </div>
          )}
        </div>

        {carouselItems.length > 0 ? (
          <div className="mt-8 overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              {/* Image Slide */}
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-50 shadow-inner lg:col-span-6 aspect-video sm:aspect-[4/3] md:aspect-[16/10] lg:h-[380px]">
                <Link to={`/product/${carouselItems[activeSlide].id}`} className="group block h-full w-full">
                  {carouselItems[activeSlide].photo_url ? (
                    <img
                      src={carouselItems[activeSlide].photo_url}
                      alt={carouselItems[activeSlide].name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                      Image non disponible
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-center pb-6">
                    <span className="bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-4 py-2 rounded-full shadow">
                      Voir le produit →
                    </span>
                  </div>
                </Link>
              </div>

              {/* Text Info Slide */}
              <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-6 lg:pl-4">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      Boutique : {carouselItems[activeSlide].shop_name}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${getCategoryTagStyles(
                        carouselItems[activeSlide].category,
                        carouselItems[activeSlide].item_type === "service",
                      )}`}
                    >
                      {getCategoryLabel(
                        carouselItems[activeSlide].category,
                        carouselItems[activeSlide].item_type === "service",
                      )}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {carouselItems[activeSlide].name}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 line-clamp-3">
                    {carouselItems[activeSlide].description || "Aucune description fournie."}
                  </p>
                </div>

                <div className="grid gap-4 grid-cols-2 max-w-sm">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <span className="text-xs text-slate-400 font-bold uppercase">Prix</span>
                    <p className="mt-1 text-xl font-extrabold text-slate-900">
                      {parseFloat(carouselItems[activeSlide].price).toLocaleString()} FC
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <span className="text-xs text-slate-400 font-bold uppercase">Stock</span>
                    <p className="mt-1 text-xl font-extrabold text-slate-900">
                      {carouselItems[activeSlide].item_type === "service" ? "Infini" : `${carouselItems[activeSlide].stock} ex.`}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/product/${carouselItems[activeSlide].id}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-8 py-3.5 text-sm font-bold text-white shadow hover:bg-sky-700 transition hover:shadow-lg"
                  >
                    Commander & Détails
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-400">
            Aucun produit en vedette pour le moment.
          </div>
        )}
      </section>

      {/* 3. Catalog Section with Tabs, Search, and Grid */}
      <section id="catalog-section" className="grid gap-8 lg:grid-cols-12">
        {/* Left Side: Catalog Content (9 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
            {/* Title & Count */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Découvrez les offres locales
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Recherchez et filtrez par catégorie pour trouver votre bonheur.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 self-start sm:self-auto">
                {sortedProducts.length} article{sortedProducts.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Search Input and Sort Dropdown */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="relative sm:col-span-3">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un produit, une boutique..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
              <div>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
                >
                  <option value="default">Tri par défaut</option>
                  <option value="price-asc">Prix : croissant</option>
                  <option value="price-desc">Prix : décroissant</option>
                </select>
              </div>
            </div>

            {/* Category tabs (scrollable on mobile) */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-2 px-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold border transition ${
                    selectedCategory === cat.id
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center space-y-3 py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600"></div>
                <p className="text-sm font-medium text-slate-400">Mise à jour du catalogue...</p>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-400 space-y-2">
                <p className="text-base font-semibold text-slate-700">Aucun produit trouvé</p>
                <p className="text-xs text-slate-500">Essayez de modifier vos filtres ou vos termes de recherche.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
                {sortedProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Visual Section */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                      <Link to={`/product/${product.id}`} className="block h-full w-full">
                        {product.photo_url ? (
                          <img
                            src={product.photo_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-300">
                            Pas d'image
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                      </Link>

                      {/* Floating Category tag */}
                      <span
                        className={`absolute left-4 top-4 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow ${getCategoryTagStyles(
                          product.category,
                          product.item_type === "service",
                        )}`}
                      >
                        {getCategoryLabel(product.category, product.item_type === "service")}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Boutique : {product.shop_name}
                        </span>
                        <Link to={`/product/${product.id}`}>
                          <h3 className="text-base font-bold text-slate-900 line-clamp-1 hover:text-sky-600 transition">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                          {product.description || "Aucune description fournie pour le moment."}
                        </p>
                      </div>

                      {/* Foot Content */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Prix</span>
                          <span className="text-base font-extrabold text-slate-900">
                            {parseFloat(product.price).toLocaleString()} FC
                          </span>
                        </div>
                        <Link
                          to={`/product/${product.id}`}
                          className="rounded-full bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700 hover:shadow"
                        >
                          Détails & Achat
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Card: Become Merchant */}
          <div className="rounded-[2.5rem] bg-slate-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-cyan-500/10 blur-xl"></div>
            <div className="relative space-y-5">
              <span className="inline-flex rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Opportunité
              </span>
              <h3 className="text-xl font-bold tracking-tight">Vous gérez une entreprise ?</h3>
              <p className="text-xs leading-relaxed text-slate-300">
                Rejoignez la plus grande vitrine de commerce local à Kindu. Présentez vos articles, gérez les stocks, et recevez les commandes instantanément.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Commandes client simplifiées
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Visibilité accrue à Kindu
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Suivi des statistiques et ventes
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Notifications SMS & WhatsApp
                </li>
              </ul>
              <div className="pt-2">
                {!currentUser ? (
                  <Link
                    to="/become-seller"
                    className="block w-full text-center rounded-xl bg-white py-3 text-xs font-bold text-slate-950 hover:bg-slate-100 transition shadow"
                  >
                    Devenir Vendeur
                  </Link>
                ) : (
                  <Link
                    to="/dashboard/create-shop"
                    className="block w-full text-center rounded-xl bg-sky-600 py-3 text-xs font-bold text-white hover:bg-sky-500 transition shadow"
                  >
                    Créer ma boutique
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Card: Delivery service */}
          <div className="rounded-[2.5rem] bg-white p-6 border border-slate-100 shadow-xl space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16V10a2 2 0 00-2-2h-6M13 16h6" />
              </svg>
              Service de Livraison
            </h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Kuhuza-Digital intègre des livreurs locaux indépendants pour assurer des délais records. Acheteurs, choisissez "Livraison à Domicile" à la commande.
            </p>
            <div className="text-xs bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-slate-500 flex items-start gap-2">
              <svg className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span><strong>Livreurs :</strong> Inscrivez-vous comme coursier et prenez en charge des courses rémunérées.</span>
            </div>
          </div>
        </aside>
      </section>

      {/* 4. Bottom Call To Action Banner */}
      <section className="rounded-[2.5rem] bg-gradient-to-r from-sky-50 to-white p-8 sm:p-10 border border-sky-100 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Prêt à moderniser vos habitudes ?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-normal">
            Que vous soyez acheteur pour consommer local, ou commerçant pour digitaliser vos ventes, Kuhuza est conçu pour vous.
          </p>
        </div>
        <div className="shrink-0">
          {!currentUser ? (
            <Link
              to="/auth/register"
              className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-7 py-3.5 text-xs font-bold text-white shadow hover:bg-sky-700 transition"
            >
              Créer mon compte maintenant
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-7 py-3.5 text-xs font-bold text-white shadow hover:bg-sky-700 transition"
            >
              Aller sur mon tableau de bord
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
