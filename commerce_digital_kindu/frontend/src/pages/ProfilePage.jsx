import { useContext } from 'react'
import AuthContext from '../AuthContext'

function ProfilePage() {
  const { currentUser } = useContext(AuthContext)

  if (!currentUser) {
    return (
      <div className="rounded-[2rem] bg-white p-8 shadow-2xl">
        <h2 className="text-2xl font-semibold mb-4">Profil</h2>
        <p className="text-slate-600">Vous devez être connecté pour voir votre profil.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-[2rem] bg-white p-8 shadow-2xl">
        <div className="flex flex-col gap-4 rounded-[1.75rem] bg-slate-50 p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Mon profil</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Bonjour, {currentUser.username}</h1>
            <p className="mt-2 text-sm text-slate-500">Gère ton compte, ton rôle et tes informations personnelles.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Nom d’utilisateur</p>
              <p className="mt-3 font-semibold text-slate-900">{currentUser.username}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Rôle</p>
              <p className="mt-3 font-semibold text-slate-900">{currentUser.role}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-3 font-semibold text-slate-900">{currentUser.email}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Téléphone</p>
              <p className="mt-3 font-semibold text-slate-900">{currentUser.phone || 'Non renseigné'}</p>
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Adresse</p>
            <p className="mt-3 text-lg font-semibold">{currentUser.address || 'Non renseignée'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
