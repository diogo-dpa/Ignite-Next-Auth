import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
	const { user } = useContext(AuthContext);

	useEffect(() => {
		// em toda chamada a api, ter algum tipo de tratativa
		api
			.get("/me")
			.then((response) => console.log(response))
			.catch((error) => console.log(error));
	}, []);

	return <h1>Ola</h1>;
}

// Somente autenticado
export const getServerSideProps = withSSRAuth(async (ctx) => {
	// Para chamar o servidor por aqui, utilizando dos cookies, precisa chamar o apiClient e passar o ctx
	const apiClient = setupAPIClient(ctx);

	try {
		// refreshToken acontece pelo lado do servidor e não chega a dar tempo para o lado do cliente
		const response = await apiClient.get("/me");
	} catch (err) {
		// Caso der erro, redireciona para login

		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	return {
		props: {},
	};
});
