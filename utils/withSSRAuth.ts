// Função que implementrá a lógica de acesso a página onde PRECISA estar logado

import {
	GetServerSideProps,
	GetServerSidePropsContext,
	GetServerSidePropsResult,
} from "next";
import { parseCookies } from "nookies";

export function withSSRAuth<P>(fn: GetServerSideProps<P>): GetServerSideProps {
	// High Order function
	return async (
		ctx: GetServerSidePropsContext
	): Promise<GetServerSidePropsResult<P>> => {
		// Pega os cookies
		const cookies = parseCookies(ctx);

		// Caso não exista os cookies, redireciono para home
		if (!cookies["nextauth.token"]) {
			return {
				redirect: {
					destination: "/",
					permanent: false,
				},
			};
		}

		return await fn(ctx);
	};
}
