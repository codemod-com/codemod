import { useTheme } from "@/app/context";
import ChevronRightSVG from "@/assets/icons/chevronright.svg";
import themeConfig from "@/tailwind.config";
import { Button } from "@studio/components/ui/button";
import { UserIcon } from "@studio/icons/User";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function SignInRequired() {
	const theme = useTheme();
	const router = useRouter();
	const signUserIn = () => {
		const queryParams = new URLSearchParams({ variant: "studio" }).toString();
		router.push(`/auth/sign-in?${ queryParams }`);
	};

	return (
		<div className="grid h-full absolute top-0 bottom-0 w-full sign-in-required">
			<div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full blur-sm backdrop-blur-sm"/>
			<section
				className={
					"flex items-center flex-col gap-3 p-4 w-60 text-lg relative rounded-lg place-self-center border border-solid bg-background border-gray-200 dark:border-gray-700"
				}
				style={ {
					backgroundImage:
						"linear-gradient(0deg, rgba(187, 252, 3, 0.3) 0, rgb(83 35 130 / 0%) 70%)",
				} }
			>
				<UserIcon
					stroke={
						theme.isDark
							? themeConfig.theme.extend.colors["gray-bg-light"]
							: themeConfig.theme.extend.colors["gray-dark"]
					}
				/>
				<p className="font-bold text-lg">Sign in required</p>
				<p className="font-normal text-sm text-center">
					Sign in to use AI assistant to build codemod
				</p>
				<Button
					onClick={ signUserIn }
					className="flex w-full text-white gap-2 items-center"
				>
					Sign in <Image src={ ChevronRightSVG } className="w-1.5" alt=""/>
				</Button>
			</section>
		</div>
	);
}
