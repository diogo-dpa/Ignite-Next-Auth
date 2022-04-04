import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

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
