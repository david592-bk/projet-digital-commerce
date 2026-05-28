import { useEffect, useState } from 'react'
import api from '../api'

function DeliveryDashboard() {
  const [orders, setOrders] = useState([])
  const [message, setMessage] = useState('')

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders/')
      setOrders(response.data)
    } catch (error) {
      setMessage('Impossible de charger les commandes. Assurez-vous d’être connecté.')
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/`, { status })
      setMessage('Statut mis à jour.')
      loadOrders()
    } catch (error) {
      setMessage('Impossible de mettre à jour le statut de la commande.')
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-600">Espace Livreur</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">Gère tes livraisons avec clarté</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Accepte les courses, modifie le statut et confirme le paiement sur place.</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-5 text-slate-700">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Courses totales</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{orders.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Courses disponibles</h2>
            <p className="mt-2 text-sm text-slate-500">Les dernières commandes prêtes à être prises en charge.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{orders.length} course(s)</span>
        </div>
        {message && <p className="mt-4 text-sm text-rose-600">{message}</p>}
        <div className="mt-8 grid gap-5">
          {orders.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Aucune course disponible pour l’instant.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-[1fr_200px] lg:items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Commande #{order.id}</h3>
                    <p className="mt-2 text-sm text-slate-600">Boutique : {order.shop_details?.name || order.shop}</p>
                    <p className="text-sm text-slate-600">Client : {order.buyer_details?.username || order.buyer}</p>
                    <p className="text-sm text-slate-600">Adresse : {order.address || 'Retrait en boutique'}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">Total : {order.total_amount} FC</p>
                  </div>
                  <div className="space-y-3 text-right">
                    <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700">{order.status}</span>
                    {order.status === 'pending' && (
                      <button
                        type="button"
                        className="w-full rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                        onClick={() => updateStatus(order.id, 'in_transit')}
                      >
                        Prendre en charge
                      </button>
                    )}
                    {order.status === 'in_transit' && (
                      <button
                        type="button"
                        className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        onClick={() => updateStatus(order.id, 'completed')}
                      >
                        Paiement reçu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default DeliveryDashboard
