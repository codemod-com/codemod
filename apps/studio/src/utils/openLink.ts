export const openLink = (link: string): void => {
	try {
		window.open(link, "_blank");
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error("Error opening link", err);
	}
};
