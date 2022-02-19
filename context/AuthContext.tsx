import { createContext, ReactNode } from "react";

type SignInCredentials = {
	email: string;
	password: string;
};

type AuthContextData = {
	signIn(credentials: SignInCredentials): Promise<void>; // chamada a API sem retorno
	isAuthenticated: boolean;
};

type AuthProviderProps = {
	children: ReactNode; // ReactNode significa qualquer coisa
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
	const isAuthenticated = false;

	async function signIn({ email, password }: SignInCredentials) {
		console.log({ email, password });
	}

	return (
		<AuthContext.Provider
			value={{
				signIn,
				isAuthenticated,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
