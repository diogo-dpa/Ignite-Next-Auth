// Função que implementrá a lógica de acesso a página onde PRECISA estar logado

import {
	GetServerSideProps,
	GetServerSidePropsContext,
	GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";

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

		// Teremos este comportamento para todas as rotas que for utilizar o SSRAuth
		try {
			return await fn(ctx);
		} catch (err) {
			if (err instanceof AuthTokenError) {
				// Caso der erro, apaga o token e redireciona para login
				destroyCookie(ctx, "nextauth.token");
				destroyCookie(ctx, "nextauth.refreshToken");

				return {
					redirect: {
						destination: "/",
						permanent: false,
					},
				};
			}

			return {} as GetServerSidePropsResult<P>;
		}
	};
}
