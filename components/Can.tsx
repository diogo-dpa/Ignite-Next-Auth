import { ReactNode } from "react";
import { useCan } from "../hooks/useCan";

interface CanProps {
	children: ReactNode;
	permissions?: string[];
	roles?: string[];
}

export function Can({ children, permissions, roles }: CanProps) {
	const userCanSeeComponent = useCan({
		permissions,
		roles,
	});

	// Caso o usuário não possa ver o componente, retorna nulo
	if (!userCanSeeComponent) {
		return null;
	}

	return <>{children}</>;
}
