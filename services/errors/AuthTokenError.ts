// Criando uma classe de erro, conseguimos diferenciar os erros

export class AuthTokenError extends Error {
	constructor() {
		// chama a classe pai "Error"
		super("Error with authentication token");
	}
}
