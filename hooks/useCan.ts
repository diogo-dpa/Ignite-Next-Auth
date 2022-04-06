// Hook que retorna se o usuário pode ou não fazer algo

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

type UseCanParams = {
	permissions?: string[];
	roles?: string[];
};

export function useCan({ permissions, roles }: UseCanParams) {
	const { user, isAuthenticated } = useContext(AuthContext);

	if (!isAuthenticated) {
		return false;
	}

	if (permissions?.length && permissions?.length > 0) {
		// every verifica se todas as condições de permissions é true
		const hasAllPermissions = permissions.every((permission) => {
			return user?.permissions.includes(permission);
		});

		if (!hasAllPermissions) {
			return false;
		}
	}

	if (roles?.length && roles?.length > 0) {
		// some verifica se pelo menos 1 condição é true
		const hasAllRoles = roles.some((role) => {
			return user?.roles.includes(role);
		});

		if (!hasAllRoles) {
			return false;
		}
	}

	// se passo de tudo, tem permissão
	return true;
}
