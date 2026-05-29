import { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api";
import AuthContext from "../AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [shop, setShop] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Gallery
  const [activeImage, setActiveImage] = useState("");

  // Order form state
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    setOrderMessage({ type: "", text: "" });

    // Fetch product details
    api
      .get(`/shops/products/${id}/`)
      .then((res) => {
        if (!isMounted) return;
        const prodData = res.data;
        setProduct(prodData);
        setActiveImage(prodData.photo_url || "");
        setQuantity(1);

        // Fetch merchant/shop details
        if (prodData.shop) {
          api
            .get(`/shops/${prodData.shop}/`)
            .then((shopRes) => {
              if (isMounted) setShop(shopRes.data);
            })
            .catch(() => {
              if (isMounted) setShop(null);
            });
        }

        // Fetch related products (same category)
        api
          .get("/shops/products/")
          .then((allProdsRes) => {
            if (!isMounted) return;
            const filtered = allProdsRes.data
              .filter(
                (p) =>
                  p.category === prodData.category && p.id !== prodData.id,
              )
              .slice(0, 4);
            setRelatedProducts(filtered);
          })
          .catch(() => {
            if (isMounted) setRelatedProducts([]);
          });
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            "Impossible de charger les détails du produit. Veuillez réessayer.",
          );
          console.error(err);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleQuantityChange = (val) => {
    const maxStock = product?.stock || 1;
    let newQty = parseInt(val) || 1;
    if (newQty < 1) newQty = 1;
    if (newQty > maxStock) newQty = maxStock;
    setQuantity(newQty);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setOrderMessage({
        type: "error",
        text: "Vous devez être connecté pour passer une commande.",
      });
      return;
    }

    setSubmitting(true);
    setOrderMessage({ type: "", text: "" });

    try {
      const payload = {
        shop: product.shop,
        delivery_type: deliveryType,
        address: deliveryType === "delivery" ? address : "",
        items: [{ product: product.id, quantity }],
      };
      await api.post("/orders/", payload);
      setOrderMessage({
        type: "success",
        text: "Votre commande a été enregistrée avec succès ! Un livreur sera notifié.",
      });
      // Reduce local stock state temporarily
      setProduct((prev) => ({
        ...prev,
        stock: Math.max(0, prev.stock - quantity),
      }));
      setQuantity(1);
    } catch (err) {
      console.error(err);
      setOrderMessage({
        type: "error",
        text: "Erreur lors de la commande. Veuillez vérifier vos informations ou réessayer.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for category label colors
  const getCategoryStyles = (category) => {
    const cats = {
      aliment: "bg-emerald-50 text-emerald-700 border-emerald-200",
      vetement: "bg-blue-50 text-blue-700 border-blue-200",
      nettoyage: "bg-amber-50 text-amber-700 border-amber-200",
      beaute: "bg-pink-50 text-pink-700 border-pink-200",
      autre: "bg-slate-50 text-slate-700 border-slate-200",
    };
    return cats[category] || cats.autre;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      aliment: "Alimentation",
      vetement: "Habillement",
      nettoyage: "Entretien",
      beaute: "Beauté & Soins",
      autre: "Autre",
    };
    return labels[category] || "Autre";
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600"></div>
        <p className="text-sm font-medium text-slate-500">
          Chargement des détails du produit...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          Une erreur est survenue
        </h2>
        <p className="mt-2 text-slate-600">{error || "Produit introuvable"}</p>
        <div className="mt-6">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Retourner à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Fil d'Ariane (Breadcrumbs) */}
      <nav className="flex text-sm text-slate-500" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/"
              className="inline-flex items-center hover:text-sky-600"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Accueil
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-slate-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <Link to="/products" className="ml-1 hover:text-sky-600 md:ml-2">
                Produits
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-slate-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1 font-medium text-slate-800 md:ml-2">
                {product.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Main product card */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Section visuels (Gauche - col 7) */}
          <div className="p-6 md:p-8 lg:col-span-7 lg:border-r lg:border-slate-100">
            <div className="flex flex-col space-y-4">
              {/* Photo principale */}
              <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-inner sm:aspect-[4/3] md:aspect-[16/10]">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <svg
                      className="h-16 w-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Badge à la une */}
                {product.is_featured && (
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    À la une
                  </span>
                )}
              </div>

              {/* Galerie miniatures */}
              {product.images && product.images.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveImage(product.photo_url || "")}
                    className={`h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${
                      activeImage === (product.photo_url || "")
                        ? "border-sky-600 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={product.photo_url}
                      alt="Miniature principale"
                      className="h-full w-full object-cover"
                    />
                  </button>

                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImage(img.photo_url || "")}
                      className={`h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${
                        activeImage === (img.photo_url || "")
                          ? "border-sky-600 shadow-sm"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={img.photo_url}
                        alt="Miniature secondaire"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Conseils et politique */}
              <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-sky-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Garanties Kuhuza-Digital
                </h4>
                <ul className="mt-3 space-y-2 list-disc pl-5">
                  <li>Achat en direct auprès d'entrepreneurs locaux certifiés à Kindu.</li>
                  <li>Livraison flexible ou retrait en magasin sous quelques heures.</li>
                  <li>Support client de proximité pour toutes vos réclamations.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section Achat & Infos (Droite - col 5) */}
          <div className="p-6 md:p-8 lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Catégorie & Type */}
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${getCategoryStyles(
                    product.category,
                  )}`}
                >
                  {getCategoryLabel(product.category)}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">
                  {product.item_type === "service" ? "Service" : "Produit"}
                </span>
              </div>

              {/* Nom & Boutique */}
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <svg
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span>Boutique : </span>
                <Link
                  to={`/shops?id=${product.shop}`}
                  className="font-semibold text-sky-600 hover:underline"
                >
                  {product.shop_name}
                </Link>
              </div>

              {/* Prix */}
              <div className="mt-6 flex items-baseline gap-2 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-3xl font-extrabold text-slate-900">
                  {parseFloat(product.price).toLocaleString()}
                </span>
                <span className="text-lg font-bold text-slate-500">
                  {product.currency === "USD" ? "USD" : "FC"}
                </span>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-900">Description</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                  {product.description || "Aucune description fournie pour ce produit."}
                </p>
              </div>

              {/* Infos vendeur */}
              {shop && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-semibold text-slate-950 flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Coordonnées du vendeur
                  </h3>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-700">Adresse :</span>{" "}
                      {shop.address || "Kindu, RDC"}
                    </p>
                    {shop.opening_hours && (
                      <p>
                        <span className="font-semibold text-slate-700">Horaires :</span>{" "}
                        {shop.opening_hours}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Achat Form Card */}
            <div className="border-t border-slate-100 pt-6">
              {product.stock <= 0 && product.item_type === "product" ? (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-center">
                  <p className="text-sm font-bold text-red-700">Rupture de stock</p>
                  <p className="mt-1 text-xs text-red-600">
                    Ce produit n'est plus disponible pour le moment.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  {currentUser ? (
                    <form onSubmit={handleOrderSubmit} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700">
                          Quantité
                        </label>
                        {product.item_type === "product" && (
                          <span className="text-xs text-slate-500 font-medium">
                            Stock : {product.stock}
                          </span>
                        )}
                      </div>

                      {/* Selecteur quantité personnalisé */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-50"
                        >
                          <span className="text-xl font-bold">-</span>
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={quantity}
                          onChange={(e) => handleQuantityChange(e.target.value)}
                          className="h-10 w-16 rounded-xl border border-slate-200 bg-white text-center text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-50"
                        >
                          <span className="text-xl font-bold">+</span>
                        </button>
                      </div>

                      {/* Type de livraison */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700">
                          Mode de récupération
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setDeliveryType("pickup")}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                              deliveryType === "pickup"
                                ? "border-sky-500 bg-sky-50/50 text-sky-700"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <svg
                              className="h-5 w-5 mb-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            Retrait Boutique
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeliveryType("delivery")}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                              deliveryType === "delivery"
                                ? "border-sky-500 bg-sky-50/50 text-sky-700"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <svg
                              className="h-5 w-5 mb-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                            À Domicile
                          </button>
                        </div>
                      </div>

                      {/* Adresse de livraison (conditionnel avec animation) */}
                      {deliveryType === "delivery" && (
                        <div className="space-y-1 transition duration-200">
                          <label className="block text-sm font-bold text-slate-700">
                            Adresse de livraison à Kindu
                          </label>
                          <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Ex: Quartier Kasuku, Avenue Mobutu n°12, Réf. Stade de Kindu"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            rows={2}
                            required
                          />
                        </div>
                      )}

                      {/* Submit btn */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl bg-sky-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-sky-700 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                            Traitement...
                          </>
                        ) : (
                          "Confirmer ma commande"
                        )}
                      </button>

                      {/* Messages d'état */}
                      {orderMessage.text && (
                        <div
                          className={`mt-2 rounded-xl p-3.5 text-xs font-semibold leading-relaxed border ${
                            orderMessage.type === "success"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-red-50 text-red-800 border-red-200"
                          }`}
                        >
                          {orderMessage.text}
                        </div>
                      )}
                    </form>
                  ) : (
                    <div className="text-center space-y-4 py-2">
                      <p className="text-sm text-slate-600 leading-normal">
                        Connectez-vous ou inscrivez-vous pour passer votre commande
                        en ligne.
                      </p>
                      <div className="grid gap-2">
                        <Link
                          to="/auth/login"
                          className="rounded-xl bg-sky-600 py-2.5 text-sm font-bold text-white shadow transition hover:bg-sky-700"
                        >
                          Se connecter
                        </Link>
                        <Link
                          to="/auth/register"
                          className="rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                          Créer un compte
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Produits similaires */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Produits similaires dans la catégorie
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <article
                key={p.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <Link to={`/product/${p.id}`} className="flex flex-col flex-grow">
                  {/* Photo */}
                  <div className="aspect-video w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                    {p.photo_url ? (
                      <img
                        src={p.photo_url}
                        alt={p.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        Pas d'image
                      </div>
                    )}
                  </div>
                  {/* Contenu */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {p.shop_name}
                      </span>
                      <h3 className="mt-1 font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-sky-600 transition">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {p.description || "Pas de description."}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">
                        {parseFloat(p.price).toLocaleString()} FC
                      </span>
                      <span className="text-[10px] font-semibold text-sky-600 px-2 py-0.5 rounded-full bg-sky-50">
                        Détails
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
