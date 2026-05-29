import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import AuthContext from "../../AuthContext";

export default function DashboardPage() {
  const { currentUser } = useContext(AuthContext);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!currentUser) {
      setLoadingShop(false);
      return;
    }

    setLoadingShop(true);
    setErrorMessage("");
    api
      .get("/shops/me/")
      .then((response) => setShop(response.data))
      .catch(() => {
        setShop(null);
        setErrorMessage("Impossible de charger vos informations de boutique.");
      })
      .finally(() => setLoadingShop(false));
  }, [currentUser]);

  useEffect(() => {
    if (!shop?.id) {
      setProducts([]);
      return;
    }

    setLoadingProducts(true);
    api
      .get("/shops/products/", { params: { shop: shop.id } })
      .then((response) => setProducts(response.data))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [shop]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Supprimer ce produit ?")) {
      return;
    }

    setLoadingProducts(true);
    try {
      await api.delete(`/shops/products/${productId}/`);
      setProducts((prevProducts) =>
        prevProducts.filter((item) => item.id !== productId),
      );
    } catch (error) {
      setErrorMessage(
        "Impossible de supprimer le produit. Réessayez plus tard.",
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">
          Tableau de bord
        </h1>
        <p className="mt-4 text-slate-600">
          Vous devez être connecté pour accéder à votre espace vendeur.
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

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">
              Tableau de bord
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Bienvenue, {currentUser.username}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Gérez votre boutique, vos produits et suivez votre activité.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard/create-shop"
              className="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
            >
              Créer ma boutique
            </Link>
            <Link
              to="/dashboard/products/new"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Créer un produit
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Boutique
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                {shop?.name || "Aucune boutique enregistrée"}
              </h2>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              {shop ? "Boutique active" : "Aucune boutique"}
            </div>
          </div>

          {loadingShop ? (
            <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
              Chargement de votre boutique...
            </div>
          ) : shop ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Adresse</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {shop.address || "Non renseignée"}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Horaires</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {shop.opening_hours || "Non renseignés"}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Statut</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {shop.is_active ? "En ligne" : "En attente"}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Produits</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {products.length}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
              Aucune boutique trouvée. Créez-en une pour commencer.
            </div>
          )}

          {errorMessage && (
            <p className="mt-6 rounded-[1.5rem] bg-rose-50 p-4 text-sm text-rose-700">
              {errorMessage}
            </p>
          )}
        </div>

        <aside className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Actions rapides
          </p>
          <div className="mt-6 space-y-4">
            <Link
              to="/dashboard/create-shop"
              className="block rounded-[1.5rem] bg-slate-900 px-5 py-4 text-center text-sm font-semibold text-white hover:bg-slate-800"
            >
              Créer / modifier ma boutique
            </Link>
            <button
              type="button"
              className="w-full rounded-[1.5rem] bg-slate-900 px-5 py-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Consulter les commandes
            </button>
          </div>
        </aside>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Produits
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Vos produits
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {products.length} produit{products.length > 1 ? "s" : ""}
          </p>
        </div>

        {loadingProducts ? (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            Chargement des produits...
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            Aucun produit trouvé pour cette boutique.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {product.description || "Pas de description."}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                    {product.price} FC
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-700">
                  <span className="rounded-full bg-white px-3 py-1">
                    {product.item_type === "service" ? "Service" : "Produit"}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1">
                    {product.category || "Autre"}
                  </span>
                  {product.item_type === "product" && (
                    <span className="rounded-full bg-white px-3 py-1">
                      {product.stock} en stock
                    </span>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/dashboard/products/${product.id}/edit`}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Modifier
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
