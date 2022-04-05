// Função que implementrá a lógica de acesso a página onde não precisa estar logado

import {
	GetServerSideProps,
	GetServerSidePropsContext,
	GetServerSidePropsResult,
} from "next";
import { parseCookies } from "nookies";

export function withSSRGuest<P>(fn: GetServerSideProps<P>): GetServerSideProps {
	// High Order function
	return async (
		ctx: GetServerSidePropsContext
	): Promise<GetServerSidePropsResult<P>> => {
		// Pega os cookies
		// Como estamos no lado do servidor, passamos agora ele no 1º parâmetro
		const cookies = parseCookies(ctx);

		// Caso o cookie seja HTTP ONLY, será acessível apenas no lado do server

		// Caso exista os cookies, redireciono para dashboard
		if (cookies["nextauth.token"]) {
			return {
				redirect: {
					destination: "/dashboard",
					permanent: false,
				},
			};
		}

		return await fn(ctx);
	};
}
