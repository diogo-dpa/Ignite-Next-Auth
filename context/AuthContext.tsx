import { createContext, ReactNode, useEffect, useState } from "react";
import Router from "next/router";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import { api } from "../services/apiClient";

type User = {
	email: string;
	permissions: string[];
	roles: string[];
};

type SignInCredentials = {
	email: string;
	password: string;
};

type AuthContextData = {
	signIn(credentials: SignInCredentials): Promise<void>; // chamada a API sem retorno
	user: User | null;
	isAuthenticated: boolean;
};

type AuthProviderProps = {
	children: ReactNode; // ReactNode significa qualquer coisa
};

export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
	// deslogaremos o usuário e mandaremos para a Home
	// lembrando que isso rodará no browser
	destroyCookie(undefined, "nextauth.token");
	destroyCookie(undefined, "nextauth.refreshToken");

	// redireciona
	Router.push("/");
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const isAuthenticated = !!user; // se tiver vazio, false

	// guardar as informações somente na 1ª vez
	useEffect(() => {
		// busca token e faz requisição no backend

		// busca todos os cookies
		const { "nextauth.token": token } = parseCookies();
		if (token) {
			api
				.get("/me")
				.then((response) => {
					const { permissions, roles, email } = response.data;
					setUser({ permissions, roles, email });
					console.log(response);
				})
				.catch(() => {
					signOut();
				}); // vai cair no catch e não será erro de refresh token, pois a api já interceptará
		}
	}, []);

	async function signIn({ email, password }: SignInCredentials) {
		try {
			const response = await api.post("sessions", {
				email,
				password,
			});
			console.log(response);

			const { token, refreshToken, permissions, roles } = response.data;

			// recebe 4 parametros
			// 1º- Contexto = undefined (sempre que executar no lado do browser)
			// 2º- Nome do cookie
			// 3º- valor do token
			// 4º- Informações adicionais
			setCookie(undefined, "nextauth.token", token, {
				maxAge: 60 * 60 * 24 * 30, // 30 dias // quanto tempo quero armazenar
				path: "/", //quais caminhos terão acesso (no caso, todos os caminhos)
			});
			setCookie(undefined, "nextauth.refreshToken", refreshToken, {
				maxAge: 60 * 60 * 24 * 30,
				path: "/",
			});

			// Salvando o token e o refreshToken já são suficientes para buscar as informações do usuario no futuro

			// Pode armazenar em 3 locais

			// sessionStorage: dura enquanto a session do usuario estiver aberta
			// localStorage: dura mais que o sessionStorage, porém como estamos utilizando next, estamos utilizando o lado do servidor, o que dificulta o uso
			// cookies: Pode ser acessado tanto no lado do server quanto no client

			setUser({
				email,
				permissions,
				roles,
			});
			// É importante que quando fizer login, atualize a informação do headers
			api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

			Router.push("/dashboard");
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<AuthContext.Provider
			value={{
				signIn,
				user,
				isAuthenticated,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
