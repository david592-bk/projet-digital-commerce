import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import AuthContext from '../AuthContext'

function ShopDashboard() {
  const { currentUser } = useContext(AuthContext)
  const [merchant, setMerchant] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [message, setMessage] = useState('')
  const [shopForm, setShopForm] = useState({ name: '', description: '', address: '', opening_hours: '', logo: null })
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', photo: null })

  const loadMerchant = async () => {
    try {
      const response = await api.get('/shops/me/')
      setMerchant(response.data)
    } catch (error) {
      setMerchant(null)
    }
  }

  const loadProducts = async (shopId) => {
    if (!shopId) return
    try {
      const response = await api.get('/shops/products/', { params: { shop: shopId } })
      setProducts(response.data)
    } catch (error) {
      setProducts([])
    }
  }

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders/')
      setOrders(response.data)
    } catch (error) {
      setOrders([])
    }
  }

  useEffect(() => {
    loadMerchant()
    loadOrders()
  }, [])

  useEffect(() => {
    if (merchant && merchant.id) {
      loadProducts(merchant.id)
    }
  }, [merchant])

  if (!currentUser) {
    return (
      <div className="space-y-6 rounded-[2rem] bg-white p-8 shadow-2xl">
        <h2 className="text-3xl font-semibold text-slate-900">Espace Entrepreneur</h2>
        <p className="mt-4 text-slate-600">
          Pour accéder au tableau de bord entrepreneur, connectez-vous ou inscrivez-vous avec un compte entrepreneur.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/auth/login"
            className="rounded-full bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Se connecter
          </Link>
          <Link
            to="/auth/register"
            className="rounded-full border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Inscription entrepreneur
          </Link>
        </div>
      </div>
    )
  }

  if (currentUser.role !== 'merchant') {
    return (
      <div className="space-y-6 rounded-[2rem] bg-white p-8 shadow-2xl">
        <h2 className="text-3xl font-semibold text-slate-900">Espace Entrepreneur</h2>
        <p className="mt-4 text-slate-600">
          Votre compte actuel n’est pas un compte entrepreneur. Créez un compte entrepreneur pour gérer votre boutique.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/auth/register"
            className="rounded-full bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Inscription entrepreneur
          </Link>
          <Link
            to="/auth/login"
            className="rounded-full border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Se connecter avec un compte entrepreneur
          </Link>
        </div>
      </div>
    )
  }

  const createShop = async (event) => {
    event.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', shopForm.name)
      formData.append('description', shopForm.description)
      formData.append('address', shopForm.address)
      formData.append('opening_hours', shopForm.opening_hours)
      if (shopForm.logo) {
        formData.append('logo', shopForm.logo)
      }
      await api.post('/shops/', formData)
      setMessage('Vitrine créée avec succès.')
      setShopForm({ name: '', description: '', address: '', opening_hours: '', logo: null })
      loadMerchant()
    } catch (error) {
      setMessage('Impossible de créer la vitrine. Vérifiez vos informations.')
    }
  }

  const createProduct = async (event) => {
    event.preventDefault()
    if (!merchant) {
      setMessage('Créez d’abord votre boutique.')
      return
    }
    try {
      const formData = new FormData()
      formData.append('name', productForm.name)
      formData.append('description', productForm.description)
      formData.append('price', productForm.price)
      formData.append('stock', productForm.stock)
      formData.append('shop', merchant.id)
      if (productForm.photo) {
        formData.append('photo', productForm.photo)
      }
      await api.post('/shops/products/', formData)
      setMessage('Produit ajouté.')
      setProductForm({ name: '', description: '', price: '', stock: '', photo: null })
      loadProducts(merchant.id)
    } catch (error) {
      setMessage('Impossible d’ajouter le produit. Vérifiez les informations.')
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">Espace Entrepreneur</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">Gère ta boutique et suis tes ventes</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Publie tes produits, reçois des commandes et améliore ton chiffre d’affaires local.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-slate-50 p-5 text-slate-700">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Produits</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{products.length}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-5 text-slate-700">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Commandes</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{orders.length}</p>
            </div>
          </div>
        </div>
        {message && <p className="mt-5 text-sm text-slate-600">{message}</p>}
      </section>

      {!merchant ? (
        <section className="rounded-[2rem] bg-white p-8 shadow-2xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Commence ta vitrine</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Fais découvrir tes produits aux clients locaux en quelques minutes.</p>
            </div>
            <form className="space-y-4" onSubmit={createShop}>
              <input
                type="text"
                placeholder="Nom de la boutique"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                value={shopForm.name}
                onChange={(event) => setShopForm({ ...shopForm, name: event.target.value })}
              />
              <textarea
                placeholder="Description"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                value={shopForm.description}
                onChange={(event) => setShopForm({ ...shopForm, description: event.target.value })}
              />
              <input
                type="text"
                placeholder="Adresse physique"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                value={shopForm.address}
                onChange={(event) => setShopForm({ ...shopForm, address: event.target.value })}
              />
              <input
                type="text"
                placeholder="Horaires"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                value={shopForm.opening_hours}
                onChange={(event) => setShopForm({ ...shopForm, opening_hours: event.target.value })}
              />
              <label className="text-sm font-medium text-slate-700">Logo de la boutique</label>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900"
                onChange={(event) => setShopForm({ ...shopForm, logo: event.target.files[0] })}
              />
              <button className="w-full rounded-full bg-sky-600 px-6 py-4 text-white font-semibold transition hover:bg-sky-700">
                Créer la vitrine
              </button>
            </form>
          </div>
        </section>
      ) : (
        <section className="rounded-[2rem] bg-white p-8 shadow-2xl">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {merchant.logo_url && (
                  <img src={merchant.logo_url} alt={`${merchant.name} logo`} className="h-20 w-20 rounded-3xl object-cover" />
                )}
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Boutique</p>
                  <h2 className="text-3xl font-semibold text-slate-900">{merchant.name}</h2>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-600">{merchant.description}</p>
            </div>
            <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 p-5 text-slate-700">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Adresse</p>
                <p className="mt-2 text-sm text-slate-900">{merchant.address}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Horaires</p>
                <p className="mt-2 text-sm text-slate-900">{merchant.opening_hours}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {merchant && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] bg-white p-8 shadow-2xl">
            <h3 className="text-2xl font-semibold text-slate-900 mb-5">Ajouter un produit</h3>
            <form className="space-y-5" onSubmit={createProduct}>
              <input
                type="text"
                placeholder="Nom du produit"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                value={productForm.name}
                onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
              />
              <textarea
                placeholder="Description du produit"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                value={productForm.description}
                onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Prix"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  value={productForm.price}
                  onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  value={productForm.stock}
                  onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                />
              </div>
              <label className="text-sm font-medium text-slate-700">Photo du produit</label>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900"
                onChange={(event) => setProductForm({ ...productForm, photo: event.target.files[0] })}
              />
              <button className="w-full rounded-full bg-slate-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-800">
                Ajouter le produit
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-2xl">
            <h3 className="text-2xl font-semibold text-slate-900 mb-5">Commandes client</h3>
            {orders.length === 0 ? (
              <p className="text-slate-500">Aucune commande pour l'instant.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-[1.75rem] border border-slate-200 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">Commande #{order.id}</h4>
                        <p className="mt-1 text-sm text-slate-600">Client : {order.buyer_details?.username || order.buyer}</p>
                        <p className="text-sm text-slate-600">Type : {order.delivery_type}</p>
                      </div>
                      <div className="space-y-2 text-right">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{order.status}</span>
                        <p className="text-sm text-slate-600">Total : {order.total_amount} FC</p>
                      </div>
                    </div>
                    {order.delivery_person_details && (
                      <p className="mt-4 text-sm text-slate-600">Livreur : {order.delivery_person_details.username}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default ShopDashboard
