import AuthButtons from "@auth/AuthButtons";
import { FirstLoginExperience } from "@features/FirstLoginExperience";
import { Button } from "@studio/components/ui/button";
import { CodemodLogo } from "@studio/icons/CodemodLogo";

export const TopBar = () => {
	return (
		<div className="flex justify-between h-[50px] w-full flex-1 bg-white p-1">
			<Button
				variant="link"
				className="text-md -ml-1 pt-3 font-light text-gray-500 dark:text-gray-300"
			>
				<a href="https://codemod.com" className="h-[25px]">
					<CodemodLogo/>
				</a>
			</Button>
			<div className="flex">
				<FirstLoginExperience/> <AuthButtons variant="studio"/>
			</div>
		</div>
	);
};
