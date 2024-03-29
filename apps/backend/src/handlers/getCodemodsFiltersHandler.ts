import { CustomHandler } from "../customHandler.js";

export const getCodemodsFiltersHandler: CustomHandler<{
	useCaseFilters: {
		name: string | null;
		count: number;
	}[];
	ownerFilters: {
		name: string;
		count: number;
	}[];
	frameworkFilters: {
		name: string;
		count: number;
	}[];
}> = async (dependencies) => {
	return dependencies.codemodService.getCodemodsFilters();
};
