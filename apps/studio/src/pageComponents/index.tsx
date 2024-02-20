import UserAuthStorage from "~/auth/AuthStorage";
import { Label } from "~/components/ui/label";
import New5PaneSetup from "./main/5PaneSetup";
import { useInputs } from "./useInputs";

const MainPageContent = () => {
	const isMobile =
		typeof window !== "undefined" &&
		/iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(
			navigator.userAgent,
		);

	useInputs();

	if (isMobile) {
		return (
			<div className="flex h-[100vh] w-full flex-col items-center justify-center p-7">
				<Label className="text-center font-light leading-5">
					Codemod Studio is designed for desktop usage.
				</Label>
				<Label className="mb-5 text-center font-light leading-5">
					Check out this brief demo video below to learn more about Codemod
					Studio.
				</Label>
				<iframe
					title="Codemod Studio Demo"
					src="https://www.loom.com/embed/06ba23e8d91a4535943c0ce494e90820?sid=539fecab-cc75-4a33-bedf-48736cda7550"
					allowFullScreen
					// width="100%"
					height="40%"
					style={{ borderRadius: "5%" }}
				/>
			</div>
		);
	}

	return <New5PaneSetup />;
};

export const MainPage = () => (
	<>
		<UserAuthStorage />
		<MainPageContent />
	</>
);
