export const openLink = (link: string): void => {
  try {
    window.open(link, "_blank");
  } catch (err) {
    console.error("Error opening link", err);
  }
};
