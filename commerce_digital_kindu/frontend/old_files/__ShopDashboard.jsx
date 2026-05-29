import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import AuthContext from '../AuthContext'

const formatApiError = (error) => {
  const raw = error.response?.data?.detail || error.response?.data || error.message
  if (typeof raw === 'string') return raw
  if (typeof raw === 'object' && raw !== null) {
    return Object.entries(raw)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
      .join(' | ')
  }
  return String(raw)
}

function ShopDashboard() {
  const { currentUser } = useContext(AuthContext)
  const [merchant, setMerchant] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [message, setMessage] = useState('')
  const [activeSection, setActiveSection] = useState('orders')
  const [shopForm, setShopForm] = useState({ name: '', description: '', address: '', opening_hours: '', logo: null })
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', item_type: 'product', category: 'autre', photo: null, photos: [] })
  const [editingProduct, setEditingProduct] = useState(null)

  const addStagedPhoto = (file) => {
    if (!file) return
    setProductForm((prev) => ({
      ...prev,
      photos: [...prev.photos, file],
    }))
  }

  const removeStagedPhoto = (index) => {
    setProductForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  const handlePhotoInput = (event) => {
    const file = event.target.files[0]
    if (file) {
      addStagedPhoto(file)
    }
    event.target.value = ''
  }

  const deleteProductImage = async (imageId) => {
    if (!window.confirm('Supprimer cette photo du produit ?')) {
      return
    }
    try {
      await api.delete(`/shops/products/images/${imageId}/`)
      setMessage('Photo supprimée avec succès.')
      if (merchant?.id) {
        loadProducts(merchant.id)
      }
      if (editingProduct) {
        setEditingProduct((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            images: prev.images?.filter((img) => img.id !== imageId) || [],
          }
        })
      }
    } catch (error) {
      setMessage(`Impossible de supprimer la photo : ${formatApiError(error)}`)
    }
  }

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
    if (!shopForm.name || !shopForm.address) {
      setMessage('Le nom et l’adresse de la boutique sont obligatoires.')
      return
    }
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
      setMessage(`Impossible de créer la vitrine : ${formatApiError(error)}`)
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
      const priceValue = String(productForm.price).replace(',', '.')
      formData.append('name', productForm.name)
      formData.append('description', productForm.description)
      formData.append('price', priceValue)
      formData.append('stock', productForm.stock)
      formData.append('shop', merchant.id)
      formData.append('item_type', productForm.item_type)
      formData.append('category', productForm.category)
      if (productForm.photo) {
        formData.append('photo', productForm.photo)
      }
      productForm.photos.forEach((file) => {
        formData.append('photos', file)
      })
      await api.post('/shops/products/', formData)
      setMessage('Produit ou service ajouté.')
      setProductForm({ name: '', description: '', price: '', stock: '', item_type: 'product', category: 'autre', photo: null, photos: [] })
      loadProducts(merchant.id)
    } catch (error) {
      setMessage(`Impossible d’ajouter le produit : ${formatApiError(error)}`)
    }
  }

  const updateProduct = async (event) => {
    event.preventDefault()
    if (!merchant || !editingProduct) {
      setMessage('Aucun produit sélectionné pour la modification.')
      return
    }
    try {
      const formData = new FormData()
      const priceValue = String(productForm.price).replace(',', '.')
      formData.append('name', productForm.name)
      formData.append('description', productForm.description)
      formData.append('price', priceValue)
      formData.append('stock', productForm.stock)
      formData.append('item_type', productForm.item_type)
      formData.append('category', productForm.category)
      if (productForm.photo) {
        formData.append('photo', productForm.photo)
      }
      productForm.photos.forEach((file) => {
        formData.append('photos', file)
      })
      await api.patch(`/shops/products/${editingProduct.id}/`, formData)
      setMessage('Produit ou service modifié.')
      setEditingProduct(null)
      setProductForm({ name: '', description: '', price: '', stock: '', item_type: 'product', category: 'autre', photo: null, photos: [] })
      loadProducts(merchant.id)
    } catch (error) {
      setMessage(`Impossible de modifier le produit : ${formatApiError(error)}`)
    }
  }

  const resetProductForm = () => {
    setEditingProduct(null)
    setProductForm({ name: '', description: '', price: '', stock: '', item_type: 'product', category: 'autre', photo: null, photos: [] })
  }

  const editProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      item_type: product.item_type || 'product',
      category: product.category || 'autre',
      photo: null,
      photos: [],
    })
    setActiveSection('product')
  }


  const deleteProduct = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await api.delete(`/shops/products/${productId}/`)
        setMessage('Produit supprimé avec succès.')
        loadProducts(merchant.id)
      } catch (error) {
        setMessage(`Impossible de supprimer le produit : ${formatApiError(error)}`)
      }
    }
  }
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">Espace Entrepreneur</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">Gère ta boutique et suis tes ventes</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Publie tes produits, reçois des commandes et améliore ton chiffre d’affaires local.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-slate-50 p-4 text-slate-700">
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

      {merchant && (
        <section className="rounded-[2rem] bg-white p-6 shadow-2xl">
          <div className="flex items-start gap-6">
            {merchant.logo && (
              /* logo fourni par l'API (url complète) */
              <img src={merchant.logo} alt={merchant.name} className="w-24 h-24 rounded-md object-cover" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Ma boutique — {merchant.name}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{merchant.description || 'Aucune description fournie.'}</p>
              {merchant.address && <p className="mt-2 text-sm text-slate-500">Adresse : {merchant.address}</p>}
            </div>
          </div>
        </section>
      )}

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
      ) : null}

      {merchant && (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tableau de bord</p>
                <h2 className="text-xl font-semibold text-slate-900">Navigation</h2>
              </div>
              <button
                type="button"
                onClick={() => { setActiveSection('product'); resetProductForm() }}
                className={`w-full rounded-3xl px-4 py-4 text-left text-sm font-semibold transition ${
                  activeSection === 'product' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Ajouter un produit/service
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('published')}
                className={`w-full rounded-3xl px-4 py-4 text-left text-sm font-semibold transition ${
                  activeSection === 'published' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Articles publiés
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('orders')}
                className={`w-full rounded-3xl px-4 py-4 text-left text-sm font-semibold transition ${
                  activeSection === 'orders' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Commandes client
              </button>
            </div>
          </aside>

          <div className="space-y-6">
            {activeSection === 'product' && (
              <section className="rounded-[2rem] bg-white p-6 shadow-2xl">
                <h3 className="text-2xl font-semibold text-slate-900 mb-5">
                  {editingProduct ? 'Modifier un produit ou service' : 'Ajouter un produit ou service'}
                </h3>
                {editingProduct && (editingProduct.photo_url || (editingProduct.images && editingProduct.images.length > 0)) && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700">Image actuelle</p>
                    <img
                      src={editingProduct.photo_url || (editingProduct.images && editingProduct.images[0]?.photo_url)}
                      alt={editingProduct.name}
                      className="mt-2 w-40 h-40 rounded-md object-cover"
                    />
                  </div>
                )}
                <form className="space-y-5" onSubmit={editingProduct ? updateProduct : createProduct}>
                  <input
                    type="text"
                    placeholder="Nom du produit ou service"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    value={productForm.name}
                    onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                  />
                  <textarea
                    placeholder="Description du produit ou service"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    value={productForm.description}
                    onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <select
                      value={productForm.item_type}
                      onChange={(event) => setProductForm({ ...productForm, item_type: event.target.value })}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    >
                      <option value="product">Produit</option>
                      <option value="service">Service</option>
                    </select>
                    <select
                      value={productForm.category}
                      onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    >
                      <option value="autre">Autre</option>
                      <option value="aliment">Aliment</option>
                      <option value="vetement">Vêtement</option>
                      <option value="nettoyage">Produit de nettoyage</option>
                      <option value="beaute">Beauté</option>
                    </select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      min="0"
                      placeholder="Prix (Franc CFA)"
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      value={productForm.price}
                      onChange={(event) => setProductForm({ ...productForm, price: String(event.target.value).replace(',', '.') })}
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
                  <label className="text-sm font-medium text-slate-700">Photo principale</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900"
                    onChange={(event) => setProductForm({ ...productForm, photo: event.target.files[0] })}
                  />
                  {productForm.photo && (
                    <div className="mt-3 flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <span>{productForm.photo.name}</span>
                      <button
                        type="button"
                        className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        onClick={() => setProductForm({ ...productForm, photo: null })}
                      >
                        Supprimer
                      </button>
                    </div>
                  )}

                  <label className="text-sm font-medium text-slate-700">Ajouter une photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900"
                    onChange={handlePhotoInput}
                  />
                  {productForm.photos.length > 0 && (
                    <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="text-sm font-semibold text-slate-700">Photos ajoutées</p>
                      <div className="grid gap-3">
                        {productForm.photos.map((file, index) => (
                          <div key={index} className="flex items-center justify-between rounded-3xl bg-white px-4 py-3">
                            <span className="truncate">{file.name}</span>
                            <button
                              type="button"
                              className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                              onClick={() => removeStagedPhoto(index)}
                            >
                              Supprimer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {editingProduct && editingProduct.images?.length > 0 && (
                    <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="text-sm font-semibold text-slate-700">Photos existantes</p>
                      <div className="grid gap-3">
                        {editingProduct.images.map((image) => (
                          <div key={image.id} className="flex items-center justify-between rounded-3xl bg-white px-4 py-3">
                            <span className="truncate">Photo #{image.id}</span>
                            <button
                              type="button"
                              className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                              onClick={() => deleteProductImage(image.id)}
                            >
                              Supprimer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={resetProductForm}
                        className="rounded-full border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
                      >
                        Annuler
                      </button>
                    )}
                    <button className="rounded-full bg-slate-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-800">
                      {editingProduct ? 'Enregistrer la modification' : 'Ajouter le produit / service'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeSection === 'published' && (
              <section className="rounded-[2rem] bg-white p-6 shadow-2xl">
                <h3 className="text-2xl font-semibold text-slate-900 mb-5">Articles publiés</h3>
                {products.length === 0 ? (
                  <p className="text-slate-500">Aucun produit ou service publié pour l'instant.</p>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="rounded-[1.75rem] border border-slate-200 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-4">
                            {(product.photo_url || (product.images && product.images.length > 0)) && (
                              <img
                                src={product.photo_url || (product.images && product.images[0]?.photo_url)}
                                alt={product.name}
                                className="w-28 h-28 rounded-md object-cover"
                              />
                            )}
                            <div>
                              <h4 className="text-lg font-semibold text-slate-900">
                                <Link to={`/product/${product.id}`} className="hover:text-sky-600">
                                  {product.name}
                                </Link>
                              </h4>
                              <p className="mt-1 text-sm text-slate-600">{product.item_type === 'service' ? 'Service' : 'Produit'} • {product.category || 'Autre'}</p>
                              <p className="mt-2 text-sm text-slate-600">{product.description}</p>
                            </div>
                          </div>
                          <div className="space-y-3 text-right">
                            <div>
                              <p className="text-sm text-slate-500">Prix</p>
                              <p className="text-lg font-semibold text-slate-900">{product.price} FC</p>
                              {product.item_type === 'product' && (
                                <p className="text-sm text-slate-600">Stock disponible : {product.stock}</p>
                              )}
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => editProduct(product)}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                              >
                                Modifier
                              </button>
                              <Link
                                to={`/product/${product.id}`}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                              >
                                Voir le détail
                              </Link>
                              <button
                                type="button"
                                onClick={() => deleteProduct(product.id)}
                                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                              >
                                Supprimer
                              </button>
                            </div>
                            {product.is_featured && (
                              <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700">En vedette</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeSection === 'orders' && (
              <section className="rounded-[2rem] bg-white p-6 shadow-2xl">
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
                        {order.items?.length > 0 && (
                          <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                            <p className="font-semibold text-slate-900">Articles de la commande</p>
                            <div className="mt-3 space-y-2">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between gap-4">
                                  <span>{item.product_details?.name || item.product}</span>
                                  <span className="text-slate-600">x{item.quantity}</span>
                                  <span className="font-semibold text-slate-900">{item.unit_price} FC</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {order.delivery_person_details && (
                          <p className="mt-4 text-sm text-slate-600">Livreur : {order.delivery_person_details.username}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ShopDashboard
