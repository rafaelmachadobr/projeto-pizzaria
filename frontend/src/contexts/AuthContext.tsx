import { createContext, ReactNode, useState, useEffect } from "react";

import { api } from "../services/apiClient";

import { destroyCookie, setCookie, parseCookies } from "nookies";
import Router from "next/router";

import { toast } from "react-toastify";

type AuthContextData = {
  user: UserProps;
  isAuthenticated: boolean;
  singIn: (credentials: SingInProps) => Promise<void>;
  singOut: () => void;
  singUp: (credentials: SingUpProps) => Promise<void>;
};

type UserProps = {
  id: string;
  name: string;
  email: string;
};

type SingInProps = {
  email: string;
  password: string;
};

type SingUpProps = {
  name: string;
  email: string;
  password: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export function singOut() {
  try {
    destroyCookie(undefined, "@nextauth.token");
    Router.push("/");
  } catch {
    console.log("erro ao desligar");
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps>();
  const isAuthenticated = !!user;

  useEffect(() => {
    const { "@nextauth.token": token } = parseCookies();

    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { id, name, email } = response.data;

          setUser({
            id,
            name,
            email,
          });
        })
        .catch(() => {
          singOut();
        });
    }
  }, []);

  async function singIn({ email, password }: SingInProps) {
    try {
      const response = await api.post("/session", {
        email,
        password,
      });

      const { id, name, token } = response.data;

      setCookie(undefined, "@nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      setUser({
        id,
        name,
        email,
      });

      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      toast.success("Logado com sucesso!");

      Router.push("/dashboard");
    } catch (err) {
      toast.error("Erro ao acessar!");
      console.log("Erro ao acessar: ", err);
    }
  }

  async function singUp({ name, email, password }: SingUpProps) {
    try {
      const response = await api.post("/users", {
        name,
        email,
        password,
      });

      toast.success("Conta criada com sucesso!");

      Router.push("/");
    } catch (err) {
      toast.error("Erro ao cadastrar!");
      console.log("erro ao cadastrar ", err);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, singIn, singOut, singUp }}
    >
      {children}
    </AuthContext.Provider>
  );
}
