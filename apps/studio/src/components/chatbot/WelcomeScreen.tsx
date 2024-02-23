import {
	Lightning as LightningIcon,
	Sun as SunIcon,
	Warning as WarningIcon,
} from "@phosphor-icons/react";
import { Label } from "~/components/ui/label";
import EngineSelector from "./ModelSelector";

const WELCOME_SCREEN_ITEMS = [
	{
		icon: <SunIcon className="mb-2" />,
		heading: "Examples",
		descriptions: [
			`What's the node factory for the @HIGHLIGHTED_BEFORE`,
			"Transform @BEFORE to @AFTER",
		],
	},
	{
		icon: <LightningIcon className="mb-2" />,
		heading: "Capabilities",
		descriptions: [
			"Trained on numerous jscodeshift codemods",
			"You can refer to all or some highlighted code snippets in the studio",
			"Utilizes compiler error to recursively generate better codemods",
		],
	},
	{
		icon: <WarningIcon className="mb-2" />,
		heading: "Limitations",
		descriptions: ["May occasionally generate incorrect codemod snippets"],
	},
];

const WelcomeScreen = () => (
	<div className="mx-auto flex h-full flex-col overflow-x-auto px-4 pb-[200px] pt-4">
		<div className="mb-10 ml-auto w-1/3">
			<EngineSelector />
		</div>

		<div className="flex w-full justify-between">
			{WELCOME_SCREEN_ITEMS.map(({ icon, heading, descriptions }) => (
				<div key={heading} className="flex flex-col items-center">
					{icon}
					<h1 className="mb-3">{heading}</h1>
					{descriptions.map((description, index) => (
						<Label
							key={index}
							className="h-15 mb-3 w-[96%] break-words rounded-md border bg-gray-200 px-4 py-4 text-center text-xs font-light dark:bg-zinc-700"
						>
							{description}
						</Label>
					))}
				</div>
			))}
		</div>
	</div>
);

WelcomeScreen.displayName = "WelcomeScreen";

export default WelcomeScreen;
