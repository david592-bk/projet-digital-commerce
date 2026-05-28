import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [deliveryType, setDeliveryType] = useState('pickup')
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get(`/shops/products/${id}/`)
      .then((response) => setProduct(response.data))
      .catch(() => setMessage('Impossible de charger le produit.'))
  }, [id])

  const submitOrder = async (event) => {
    event.preventDefault()
    if (!product) return
    try {
      const payload = {
        shop: product.shop,
        delivery_type: deliveryType,
        address: deliveryType === 'delivery' ? address : '',
        items: [{ product: product.id, quantity }],
      }
      await api.post('/orders/', payload)
      setMessage('Commande envoyée avec succès.')
    } catch (error) {
      setMessage('Impossible de créer la commande. Vérifiez votre connexion et essayez de nouveau.')
    }
  }

  if (!product) {
    return <div className="rounded-[2rem] bg-white p-8 shadow-xl">Chargement du produit...</div>
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-xl">
        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className="overflow-hidden rounded-[2rem] bg-slate-100">
            {product.photo_url ? (
              <img src={product.photo_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-96 items-center justify-center text-slate-500">Aucune image disponible</div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.2em] text-sky-600">Produit</p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{product.name}</h1>
              <p className="mt-4 text-lg leading-8 text-slate-600">{product.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Prix</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{product.price} FC</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Stock</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{product.stock}</p>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-slate-100 p-5 text-slate-700">
              <p className="text-sm">Boutique</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{product.shop_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">Commander ce produit</h2>
          <p className="mt-3 text-sm text-slate-500">Simple, rapide et adapté à votre boutique locale.</p>
          <form className="mt-8 space-y-5" onSubmit={submitOrder}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Quantité</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Type de commande</label>
              <select
                value={deliveryType}
                onChange={(event) => setDeliveryType(event.target.value)}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              >
                <option value="pickup">Retrait / Réservation</option>
                <option value="delivery">Livraison à domicile</option>
              </select>
            </div>
            {deliveryType === 'delivery' && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Adresse de livraison</label>
                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </div>
            )}
            <button className="mt-4 w-full rounded-full bg-sky-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-sky-700">
              Passer la commande
            </button>
            {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
          </form>
        </div>

        <aside className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Résumé</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Produit</p>
              <p className="mt-2 text-lg font-semibold text-white">{product.name}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Boutique</p>
              <p className="mt-2 text-lg font-semibold text-white">{product.shop_name}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Monnaie</p>
              <p className="mt-2 text-lg font-semibold text-white">{product.price} FC</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ProductDetailPage
