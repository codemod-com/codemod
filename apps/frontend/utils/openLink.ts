export let openLink = (link: string, target?: string): void => {
  try {
    window.open(link, target ?? "_blank");
  } catch (err) {
    console.error("Error opening link", err);
  }
};
