import { setupAPIClient } from "./api";

// Quando eu precisar utilizar a api no lado do client, chamo esta api

// Já quando eu precisar utilizar a api no lado do servidor, chamo o setupAPIClient, passando o contexto
export const api = setupAPIClient();
