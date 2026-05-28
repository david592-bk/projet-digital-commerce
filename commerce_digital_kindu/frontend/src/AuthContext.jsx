import { createContext } from 'react'

const AuthContext = createContext({
  currentUser: null,
  setCurrentUser: () => {},
  logout: () => {},
})

export default AuthContext
