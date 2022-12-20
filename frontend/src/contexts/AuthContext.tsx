import { createContext, ReactNode, useState } from 'react'

import { destroyCookie } from 'nookies'
import Router from 'next/router'

type AuthContextData = {
    user: UserProps
    isAuthenticated: boolean
    singIn: (credentials: SingInProps) => Promise<void>
    singOut: () => void
}

type UserProps = {
    id: string
    name: string
    email: string
}

type SingInProps = {
    email: string
    password: string
}

type AuthProviderProps = {
    children: ReactNode
}

export const AuthContext = createContext({} as AuthContextData)

export function singOut(){
    try{
        destroyCookie(undefined, '@nextauth.token')
        Router.push('/')
    }catch{
        console.log('erro ao desligar')
    }
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProps>()
    const isAuthenticated = !!user

    async function singIn({ email, password }: SingInProps) {
        console.log(email)
        console.log(password)
    }

    return(
        <AuthContext.Provider value={{ user, isAuthenticated, singIn, singOut }}>
            {children}
        </AuthContext.Provider>
    )
}