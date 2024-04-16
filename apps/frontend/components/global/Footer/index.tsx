import NavigationLink from "@/components/global/Navigation/NavigationLink";
import FooterLogo from "@/components/shared/FooterLogo";
import { TechLogo } from "@/components/shared/Icon";
import { RichText } from "@/components/shared/RichText";
import type { FooterPayload, SanityLinkType } from "@/types";
import { capitalize } from "@/utils/strings";
import AnimatedLogo from "./AnimatedLogo";
import ThemeSwitcher from "./ThemeSwitcher";

type FooterProps = {
	data: FooterPayload;
};

type Submenu = {
	submenu: string;
	links: SanityLinkType[];
};

export default function Footer({ data }: FooterProps) {
	return (
		<div className="w-full bg-gradient-to-br from-accent from-[32%] to-[#EEFDC2] to-[87%]">
			<footer className="relative mx-auto min-h-[749px] max-w-[1312px] px-m pt-l text-primary-light lg:min-h-[545px] lg:px-2xl lg:pt-2xl">
				<div className="flex h-full flex-col gap-32">
					<div className="flex flex-col justify-between lg:flex-row">
						{/* Left / Top */}
						<div className="flex max-w-[420px] flex-col gap-s">
							<AnimatedLogo />
							<div className="flex flex-col gap-l">
								<div className="body-l">
									<RichText value={data?.footerText} />
								</div>
								{data?.socialLinks && (
									<FooterSocialLinks socialLinks={data.socialLinks} />
								)}
							</div>
						</div>

						{/* Right / Down */}
						<div className="grid grid-cols-2 gap-m py-xl lg:grid-cols-4 lg:gap-20 lg:py-0">
							{data?.footerNavigationItems.map((item, index) => (
								<FooterSubMenu
									key={index}
									submenu={item.submenu}
									links={item.links}
								/>
							))}

							<div className="mt-auto lg:mt-0">
								<ThemeSwitcher />
							</div>
						</div>
					</div>

					<div className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 px-m lg:px-2xl">
						<div className="flex w-full justify-center">
							<FooterLogo />
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}

function FooterSubMenu({ submenu, links }: Submenu) {
	return (
		<div className="flex flex-col gap-xs">
			<span className="body-s-medium font-medium text-secondary-light">
				{capitalize(submenu)}
			</span>
			{links.map((link, index) => (
				<NavigationLink key={index} href={link.href}>
					<span className="body-s-medium font-medium">{link.label}</span>
				</NavigationLink>
			))}
		</div>
	);
}

function FooterSocialLinks({
	socialLinks,
}: {
	socialLinks: FooterPayload["socialLinks"];
}) {
	return (
		<div className="flex items-center gap-m">
			{socialLinks?.map((socialLink, index) => (
				<a
					target="_blank"
					rel="noopener noreferrer"
					key={socialLink._key}
					href={socialLink?.link?.href}
				>
					<TechLogo name={socialLink?.logo} />
				</a>
			))}
		</div>
	);
}
