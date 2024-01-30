import { VSCodeLink } from '@vscode/webview-ui-toolkit/react';
import { ReactComponent as SlackIcon } from '../assets/slack.svg';
import { ReactComponent as YoutubeIcon } from '../assets/youtube.svg';
import intuitaLogo from './../assets/intuita_square128.png';
import styles from './style.module.css';

const IntuitaIcon = (
	<img className={styles.icon} src={intuitaLogo} alt="intuita-logo" />
);

const EXTERNAL_LINKS = [
	{
		id: 'featureRequest',
		text: 'Feature requests',
		url: 'https://feedback.intuita.io/feature-requests-and-bugs',
		icon: IntuitaIcon,
	},
	{
		id: 'codemodRequest',
		text: 'Codemod requests',
		url: 'https://feedback.intuita.io/codemod-requests',
		icon: IntuitaIcon,
	},
	{
		id: 'docs',
		text: 'Docs',
		url: 'https://docs.intuita.io/docs/intro',
		icon: IntuitaIcon,
	},
	{
		id: 'youtube',
		text: 'Youtube channel',
		url: 'https://www.youtube.com/channel/UCAORbHiie6y5yVaAUL-1nHA',
		icon: <YoutubeIcon className={styles.icon} />,
	},
	{
		id: 'slack',
		text: 'Chat with us on Slack',
		url: 'https://join.slack.com/t/intuita-inc/shared_invite/zt-1untfdpwh-XWuFslRz0D8cGbmjymd3Bw',
		icon: (
			<SlackIcon
				className={styles.icon}
				style={{
					width: '15px',
					height: '15px',
					marginLeft: '-2px',
					marginRight: '2px',
				}}
			/>
		),
	},
];

export const CommunityTab = () => (
	<div className={styles.container}>
		{EXTERNAL_LINKS.map(({ text, url, id, icon }) => {
			return (
				<VSCodeLink className={styles.link} href={url}>
					<span slot="start">{icon}</span>
					<span
						style={{
							...(id !== 'slack' && {
								marginLeft: '5px',
							}),
						}}
					>
						{text}
					</span>
				</VSCodeLink>
			);
		})}
	</div>
);
