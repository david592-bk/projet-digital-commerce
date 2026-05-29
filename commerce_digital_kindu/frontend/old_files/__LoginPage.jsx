import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import AuthContext from '../AuthContext'

function LoginPage() {
  const { setCurrentUser } = useContext(AuthContext)
  const [form, setForm] = useState({ username: '', password: '' })
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const response = await api.post('/auth/login/', form)
      localStorage.setItem('kindu_token', response.data.token)
      setCurrentUser(response.data)
      setMessage(`Connecté en tant que ${response.data.username}`)
      navigate('/')
    } catch (error) {
      if (!error.response) {
        setMessage(`Échec de la connexion : Erreur réseau. Vérifiez que le backend est démarré et que l'URL API (${api.defaults.baseURL}) est correcte.`)
        return
      }
      const raw = error.response?.data?.detail || error.response?.data || error.message
      const backendMessage = typeof raw === 'object' ? JSON.stringify(raw) : raw
      setMessage(`Échec de la connexion : ${backendMessage}`)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-[2rem] bg-white p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-600">Connexion</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Bienvenue à nouveau</h1>
          <p className="mt-3 text-sm text-slate-500">Connecte-toi pour gérer tes commandes, ta boutique et tes livraisons.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Nom d’utilisateur</label>
            <input
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder="Nom d’utilisateur"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
            <input
              type="password"
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder="Mot de passe"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="w-full rounded-full bg-slate-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-800">
            Se connecter
          </button>
        </form>
        {message && <p className="mt-5 text-sm text-rose-600">{message}</p>}
      </div>
    </div>
  )
}

export default LoginPage
