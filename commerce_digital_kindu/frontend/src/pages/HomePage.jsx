import { Link } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import api from '../api'
import AuthContext from '../AuthContext'

function HomePage() {
  const { currentUser } = useContext(AuthContext)
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedMerchant, setSelectedMerchant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [deliveryType, setDeliveryType] = useState('pickup')
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    api.get('/shops/products/', { params: { q: query } })
      .then((response) => setProducts(response.data))
      .catch(() => setProducts([]))
  }, [query])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => {
        const next = current + 1
        return next >= featuredProducts.length ? 0 : next
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [products])

  const featuredProducts = products.filter((product) => product.is_featured)
  const carouselItems = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 5)

  const selectProduct = async (product) => {
    setSelectedProduct(product)
    setQuantity(1)
    setDeliveryType('pickup')
    setAddress('')
    setMessage('')

    try {
      const response = await api.get(`/shops/${product.shop}/`)
      setSelectedMerchant(response.data)
    } catch (_error) {
      setSelectedMerchant(null)
    }
  }

  const submitOrder = async (event) => {
    event.preventDefault()
    if (!selectedProduct) {
      setMessage('Sélectionnez un produit avant de commander.')
      return
    }
    try {
      const payload = {
        shop: selectedProduct.shop,
        delivery_type: deliveryType,
        address: deliveryType === 'delivery' ? address : '',
        items: [{ product: selectedProduct.id, quantity }],
      }
      await api.post('/orders/', payload)
      setMessage('Commande enregistrée avec succès. Un livreur pourra la prendre en charge.')
      setSelectedProduct(null)
      setSelectedMerchant(null)
    } catch (error) {
      setMessage('Impossible de créer la commande. Vérifiez votre connexion ou vos informations.')
    }
  }

  return (
    <div className="space-y-10 bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] bg-white px-6 py-10 shadow-xl sm:px-10 sm:py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">Kindu Local</span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Découvrez les entreprises locales de Kindu</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Une plateforme claire et moderne pour mettre en valeur les meilleurs produits locaux, réserver en boutique ou commander en cash.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              {!currentUser ? (
                <>
                  <Link
                    to="/auth/register"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
                  >
                    Inscription acheteur
                  </Link>
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Connexion
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard/shop"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
                >
                  Explorer les fonctionnalités
                </Link>
              )}
            </div>
            <p className="mt-6 max-w-xl text-sm text-slate-500">
              {currentUser
                ? 'Vous êtes connecté. Accédez à la totalité des fonctionnalités Kindu pour réserver, acheter ou vendre localement.'
                : 'Inscrivez-vous comme acheteur pour finaliser vos réservations et achats en cash.'}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Visibilité locale</p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">Booste ton entreprise</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Expose tes produits et services à une clientèle locale prête à acheter.</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Navigation fluide</p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">Trouve rapidement</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Recherche, consulte et réserve en quelques clics seulement.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Carrousel dynamique</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Produits phares de nos entreprises locales</h2>
          </div>
          <div className="flex items-center gap-2">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`h-2 w-8 rounded-full ${index === activeSlide ? 'bg-slate-900' : 'bg-slate-300'}`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {carouselItems.length > 0 ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_0.7fr] lg:items-center">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 shadow-sm">
              <button
                type="button"
                onClick={() => selectProduct(carouselItems[activeSlide])}
                className="group absolute inset-0 flex items-center justify-center bg-slate-950/0 transition hover:bg-slate-950/10"
              >
                <div className="pointer-events-none absolute inset-0" />
                {carouselItems[activeSlide].photo_url ? (
                  <img
                    src={carouselItems[activeSlide].photo_url}
                    alt={carouselItems[activeSlide].name}
                    className="h-[420px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[420px] items-center justify-center bg-slate-200 text-slate-500">Image non disponible</div>
                )}
              </button>
            </div>
            <div className="space-y-5 rounded-[1.75rem] bg-slate-100 p-8 shadow-sm">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{carouselItems[activeSlide].shop_name}</p>
                <h3 className="mt-3 text-3xl font-semibold text-slate-900">{carouselItems[activeSlide].name}</h3>
              </div>
              <p className="text-sm leading-7 text-slate-600">{carouselItems[activeSlide].description}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white p-5">
                  <p className="text-sm text-slate-500">Prix</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{carouselItems[activeSlide].price} FC</p>
                </div>
                <div className="rounded-[1.5rem] bg-white p-5">
                  <p className="text-sm text-slate-500">Stock</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{carouselItems[activeSlide].stock}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => selectProduct(carouselItems[activeSlide])}
                  className="rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
                >
                  Voir les détails
                </button>
                <p className="text-sm text-slate-500">Cliquez sur l’image pour afficher les coordonnées de l’entreprise.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
            Aucun produit en vedette pour le moment.
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Exploration de produits</h2>
              <p className="mt-2 text-sm text-slate-500">Tape un produit ou une boutique pour trouver rapidement ce dont tu as besoin.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{products.length} produits</div>
          </div>
          <div className="mt-6">
            <input
              type="search"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder="Rechercher un produit ou une boutique..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {products.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                Aucun produit trouvé.
              </div>
            ) : (
              products.map((product) => (
                <article key={product.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="grid gap-4 p-5 sm:grid-cols-[120px_1fr]">
                    <button
                      type="button"
                      onClick={() => selectProduct(product)}
                      className="h-28 w-full overflow-hidden rounded-[1.5rem] bg-slate-100"
                    >
                      {product.photo_url ? (
                        <img src={product.photo_url} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">Pas d’image</div>
                      )}
                    </button>
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{product.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{product.shop_name}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{product.stock} en stock</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-between gap-4 text-right sm:items-end">
                      <p className="text-lg font-semibold text-slate-900">{product.price} FC</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startOrder(product)}
                          className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                        >
                          Commander
                        </button>
                        <Link
                          to={`/product/${product.id}`}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          Voir
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="space-y-6 rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
          <div className="rounded-[1.75rem] bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Avantages</p>
            <h3 className="mt-4 text-xl font-semibold">Une expérience de vente moderne</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Transforme ton commerce local avec une interface simple, des publications rapides et un suivi clair de toutes les commandes.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] bg-slate-900 p-6">
              <h4 className="text-lg font-semibold">Visibilité</h4>
              <p className="mt-2 text-sm text-slate-300">Présente tes meilleurs produits dans une vitrine claire et moderne.</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-900 p-6">
              <h4 className="text-lg font-semibold">Commande fluide</h4>
              <p className="mt-2 text-sm text-slate-300">Passe de l’affichage du catalogue à la commande en quelques clics.</p>
            </div>
          </div>
        </aside>
      </section>

      {selectedProduct && (
        <section className="rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-3xl bg-slate-100 p-4">
                  {selectedProduct.photo_url ? (
                    <img src={selectedProduct.photo_url} alt={selectedProduct.name} className="h-28 w-28 rounded-3xl object-cover" />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-slate-200 text-slate-500">Image</div>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Détail produit</p>
                  <h2 className="text-3xl font-semibold text-slate-900">{selectedProduct.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{selectedProduct.shop_name}</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] bg-slate-50 p-6">
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{selectedProduct.description}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-slate-50 p-6">
                    <p className="text-sm text-slate-500">Prix</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedProduct.price} FC</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-6">
                    <p className="text-sm text-slate-500">Stock</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedProduct.stock}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 rounded-[1.75rem] bg-slate-950 p-8 text-white shadow-sm">
              <div className="rounded-[1.5rem] bg-slate-900 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Coordonnées de l’entreprise</p>
                <p className="mt-3 text-lg font-semibold text-white">{selectedMerchant?.name || selectedProduct.shop_name}</p>
                <p className="mt-2 text-sm text-slate-300">{selectedMerchant?.address || 'Adresse non disponible'}</p>
                <p className="mt-1 text-sm text-slate-300">{selectedMerchant?.opening_hours || 'Horaires non renseignés'}</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-900 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Actions</p>
                <p className="mt-3 text-sm text-slate-300">Pour accéder à toutes les fonctionnalités, connectez-vous ou créez un compte acheteur.</p>
                <div className="mt-5 grid gap-3">
                  {!currentUser ? (
                    <>
                      <Link className="rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900" to="/auth/register">
                        Inscription acheteur
                      </Link>
                      <Link className="rounded-full border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white" to="/auth/login">
                        Connexion
                      </Link>
                    </>
                  ) : (
                    <Link className="rounded-full bg-sky-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-sky-700" to="/dashboard/shop">
                      Continuer vers mon tableau de bord
                    </Link>
                  )}
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-slate-900 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Contact rapide</p>
                <p className="mt-3 text-sm text-slate-300">Pour en savoir plus, cliquez sur la photo d’un produit pour afficher les détails et l’entreprise associée.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage
