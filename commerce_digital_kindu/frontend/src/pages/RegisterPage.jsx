import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'buyer' })
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await api.post('/auth/register/', form)
      setMessage('Compte créé avec succès. Vous pouvez maintenant vous connecter.')
      navigate('/auth/login')
    } catch (error) {
      const backendMessage = error.response?.data?.detail || error.response?.data || error.message
      setMessage(`Erreur lors de l’inscription : ${backendMessage}`)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-[2rem] bg-white p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-600">Inscription</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Crée ton compte Kindu</h1>
          <p className="mt-3 text-sm text-slate-500">Choisis ton rôle et commence à vendre, commander ou livrer.</p>
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
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          <div>
            <label className="text-sm font-medium text-slate-700">Rôle</label>
            <select
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="buyer">Acheteur</option>
              <option value="merchant">Entrepreneur</option>
              <option value="delivery">Livreur</option>
            </select>
          </div>
          <button className="w-full rounded-full bg-slate-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-800">
            S’inscrire
          </button>
        </form>
        {message && <p className="mt-5 text-sm text-rose-600">{message}</p>}
      </div>
    </div>
  )
}

export default RegisterPage
