import {
	MoonStars as MoonStarsIcon,
	SlackLogo as SlackLogoIcon,
	Sun as SunIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import AuthButtons from "~/auth/AuthButtons";
import Tooltip from "~/components/Tooltip/Tooltip";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import CustomLogoSVG from "../../assets/icons/intuita_logo.svg";
import type { AppDispatch } from "../../store";
import { selectEngine, setEngine } from "../../store/slices/snippets";
import { PublicLinkSharingButton } from "./PublicLinkSharingButton";
import { useTheme } from "./themeContext";

const enginesConfig = [
	{
		label: "jscodeshift",
		value: "jscodeshift",
		disabled: false,
	},
	{
		label: "ts-morph [beta]",
		value: "tsmorph",
		disabled: false,
	},
	{
		label: "piranha (alpha)",
		value: "piranha",
		disabled: true,
	},
];

const Header = () => {
	const engine = useSelector(selectEngine);
	const dispatch = useDispatch<AppDispatch>();
	const { toggleTheme, isDark } = useTheme();

	const onEngineChange = (value: string) => {
		if (value === "jscodeshift" || value === "tsmorph") {
			dispatch(setEngine(value));
		}
	};

	return (
		<>
			<div className="flex h-full w-full flex-1 items-center justify-end">
				<div className="flex flex-1 items-center">
					<Image src={CustomLogoSVG} className="mr-2 w-14" alt="Codemod Logo" />
					<Label className="text-2xl font-semibold">Codemod Studio</Label>
					<Button
						variant="link"
						className="text-md -ml-1 pt-3 font-light text-gray-500 dark:text-gray-300"
					>
						<a
							rel="noopener noreferrer"
							target="_blank"
							href="https://docs.codemod.com/docs/intro"
						>
							by Codemod.com
						</a>
					</Button>
				</div>
				<div className="flex items-center gap-3">
					<PublicLinkSharingButton />
					<Select onValueChange={onEngineChange} value={engine}>
						<SelectTrigger className="flex flex-1 select-none items-center font-semibold">
							<span
								className={cn(
									"mr-[0.75rem] text-xs font-light text-slate-500",
									{
										"text-slate-200": isDark,
									},
								)}
							>
								Codemod Engine:
							</span>
							<SelectValue placeholder={engine} />
						</SelectTrigger>
						<SelectContent>
							{enginesConfig.map((engineConfig, i) => (
								<SelectItem
									disabled={engineConfig.disabled}
									key={i}
									value={engineConfig.value}
									className={cn({
										"font-semibold": engine === engineConfig.value,
									})}
								>
									{engineConfig.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Tooltip
						trigger={
							<Button
								className="w-42 flex items-center justify-center"
								onClick={toggleTheme}
								size="sm"
								variant="outline"
							>
								<a
									rel="noopener noreferrer"
									target="_blank"
									href="https://join.slack.com/t/codemod-community/shared_invite/zt-2bqtla38k-QbWDh9Kwa2GFVtuGoqRwPw"
								>
									<SlackLogoIcon className="h-5 w-5" />
								</a>
							</Button>
						}
						content="Chat with codemod experts in the community"
					/>

					<Tooltip
						content='Toggle between "light" and "dark" theme'
						trigger={
							<Button
								className="w-42 flex items-center justify-center"
								onClick={toggleTheme}
								size="sm"
								variant="outline"
							>
								{isDark ? (
									<MoonStarsIcon className="h-5 w-5" />
								) : (
									<SunIcon className="h-5 w-5" />
								)}
							</Button>
						}
					/>

					<AuthButtons />
				</div>
			</div>
		</>
	);
};

export default Header;
