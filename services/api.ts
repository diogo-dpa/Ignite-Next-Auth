import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../context/AuthContext";

let cookies = parseCookies();
let isRefreshing = false;

// fila de requisição para axios
let failedRequestQueue: {
	// No sucesso da requisição de refresh token (acima)
	onSuccess: (token: any) => void;
	// caso tenha erro na requisicao
	onFailure: (err: AxiosError<any, any>) => void;
}[] = [];

export const api = axios.create({
	baseURL: "http://localhost:3333",
	headers: {
		Authorization: `Bearer ${cookies["nextauth.token"]}`, // seta cabeçalho com token
	},
});

//Consigo interceptar requisições e respostas
// requisição = quero interceptar antes da requisição ser feita
// resposta = quero interceptar depois da requisição ser feita

// .use() = 1º parametro -> o que fazer se a resposta der sucesso, 2º parametro -> o que fazer se a resposta der erro
api.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		// Erro de "Não autorizado"
		if (error.response?.status === 401) {
			// Como o backend retorna um codigo unico para cada erro, podemos utilizar disso para fazer o refresh tokem
			if (error.response.data?.code === "token.expired") {
				// renovar o token

				// será necessário fazer um controle de requisicoes, por meio de uma fila, para que
				// a fila espere a requisição do refreshToken ser feita e a partir daí eexcutar as outras
				// requisições com o token atualizado

				// busca os dados do cookies novamente
				cookies = parseCookies();
				const { "nextauth.refreshToken": refreshToken } = cookies;

				// O config é toda a configuração feita para o backend
				const originalConfig = error.config;

				if (!isRefreshing) {
					isRefreshing = true;

					api
						.post("/refresh", {
							refreshToken,
						})
						.then((response) => {
							const { token } = response.data;

							setCookie(undefined, "nextauth.token", token, {
								maxAge: 60 * 60 * 24 * 30, // 30 dias // quanto tempo quero armazenar
								path: "/", //quais caminhos terão acesso (no caso, todos os caminhos)
							});
							setCookie(
								undefined,
								"nextauth.refreshToken",
								response.data.refreshToken, // salva o novo refreshToken
								{
									maxAge: 60 * 60 * 24 * 30,
									path: "/",
								}
							);

							// atualiza o cabeçalho
							api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

							failedRequestQueue.forEach((request) => request.onSuccess(token));
							failedRequestQueue = [];
						})
						.catch((err) => {
							failedRequestQueue.forEach((request) => request.onFailure(err));
							failedRequestQueue = [];
						})
						.finally(() => {
							isRefreshing = false;
						});
				}

				return new Promise((resolve, reject) => {
					failedRequestQueue.push({
						// No sucesso da requisição de refresh token (acima)
						onSuccess: (token) => {
							if (!originalConfig.headers) {
								return reject();
							}

							originalConfig.headers["Authorization"] = `Bearer ${token}`;

							// Quero aguardar que isso seja executado
							resolve(api(originalConfig));
						},
						// caso tenha erro na requisicao
						onFailure: (err: AxiosError) => {
							reject(err);
						},
					});
				});
			} else {
				signOut();
			}
		}

		// Repassa o erro do axios para continuar acontecendo e ir para as "camadas superiores"
		return Promise.reject(error);
	}
);
