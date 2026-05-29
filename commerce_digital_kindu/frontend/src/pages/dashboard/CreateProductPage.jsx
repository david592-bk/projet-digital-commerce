import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import AuthContext from "../../AuthContext";

export default function CreateProductPage() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [itemType, setItemType] = useState("product");
  const [stock, setStock] = useState(0);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLoadingShop(false);
      return;
    }

    setLoadingShop(true);
    api
      .get("/shops/me/")
      .then((response) => setShop(response.data))
      .catch(() => setShop(null))
      .finally(() => setLoadingShop(false));
  }, [currentUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!shop?.id) {
      setMessage("Vous devez d'abord créer une boutique avant de publier un produit.");
      setLoading(false);
      return;
    }

    const payload = {
      shop: shop.id,
      name,
      description,
      price: Number(price),
      category,
      item_type: itemType,
      stock: itemType === "product" ? Number(stock) : 0,
      photo_url: photoUrl,
      is_featured: isFeatured,
    };

    try {
      await api.post("/shops/products/", payload);
      navigate("/dashboard");
    } catch (error) {
      setMessage(
        "Impossible de créer le produit. Vérifiez les champs et réessayez.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Créer un produit</h1>
        <p className="mt-4 text-slate-600">
          Vous devez être connecté pour créer un produit.
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
    <div className="rounded-[2rem] bg-white p-8 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Produit
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Ajouter un nouveau produit
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Publiez un produit ou un service dans votre boutique.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
        >
          Retour au tableau de bord
        </Link>
      </div>

      {loadingShop ? (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
          Chargement de votre boutique...
        </div>
      ) : !shop ? (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
          Vous devez créer votre boutique avant de publier un produit.
          <div className="mt-4">
            <Link
              to="/dashboard/create-shop"
              className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Créer ma boutique
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nom du produit
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

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Prix (FC)
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Catégorie
              </label>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Ex: alimentation, mode, service"
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Type
              </label>
              <select
                value={itemType}
                onChange={(event) => setItemType(event.target.value)}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              >
                <option value="product">Produit</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                disabled={itemType !== "product"}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Image (URL)
            </label>
            <input
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
              placeholder="https://..."
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="featured"
              type="checkbox"
              checked={isFeatured}
              onChange={(event) => setIsFeatured(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="featured" className="text-sm text-slate-700">
              Mettre en avant ce produit
            </label>
          </div>

          {message && <p className="text-sm text-rose-600">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-sky-600 px-6 py-3 text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Publication en cours..." : "Publier le produit"}
          </button>
        </form>
      )}
    </div>
  );
}
