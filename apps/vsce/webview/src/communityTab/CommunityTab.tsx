import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ReactComponent as SlackIcon } from "../assets/slack.svg";
import { ReactComponent as YoutubeIcon } from "../assets/youtube.svg";
import codemodLogo from "./../assets/codemod_square128.png";
import styles from "./style.module.css";

const CodemodIcon = (
  <img className={styles.icon} src={codemodLogo} alt="codemod-logo" />
);

const EXTERNAL_LINKS = [
  {
    id: "featureRequest",
    text: "Feature requests",
    url: "https://feedback.codemod.com/feature-requests-and-bugs",
    icon: CodemodIcon,
  },
  {
    id: "codemodRequest",
    text: "Codemod requests",
    url: "https://feedback.codemod.com/codemod-requests",
    icon: CodemodIcon,
  },
  {
    id: "docs",
    text: "Docs",
    url: "https://docs.codemod.com/docs/intro",
    icon: CodemodIcon,
  },
  {
    id: "youtube",
    text: "Youtube channel",
    url: "https://www.youtube.com/channel/UCAORbHiie6y5yVaAUL-1nHA",
    icon: <YoutubeIcon className={styles.icon} />,
  },
  {
    id: "slack",
    text: "Join our Slack community",
    url: "https://join.slack.com/t/codemod-community/shared_invite/zt-2bqtla38k-QbWDh9Kwa2GFVtuGoqRwPw",
    icon: (
      <SlackIcon
        className={styles.icon}
        style={{
          width: "15px",
          height: "15px",
          marginLeft: "-2px",
          marginRight: "2px",
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
              ...(id !== "slack" && {
                marginLeft: "5px",
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
