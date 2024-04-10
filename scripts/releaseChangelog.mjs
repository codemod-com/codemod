const CODEMOD_REPO_PULL_REQUESTS =
	"https://api.github.com/repos/codemod-com/codemod/pulls";

async function getPullRequestTitles() {
	const params = new URLSearchParams({
		state: "closed",
		sort: "created",
		direction: "desc",
		base: "main", // Optional: filter pull requests that were merged into `main` branch
	});
	const response = await fetch(`${CODEMOD_REPO_PULL_REQUESTS}?${params}`);
	// The GitHub REST API limits the number of items returned in a single response; e.g., 30 items per page
	const pullRequests = await response.json();
	const titles = pullRequests.map((pullRequest) => pullRequest.title);
	return titles;
}

function generateReleaseNotes() {
	return getPullRequestTitles().then((titles) => {
		let releaseNotes = "## Release Notes\n\n";
		titles.forEach((title) => {
			releaseNotes += `- ${title}\n`;
		});
		return releaseNotes;
	});
}

if (import.meta.url === `file://${process.argv[1]}`) {
	generateReleaseNotes()
		.then((releaseNotes) => console.log(releaseNotes))
		.catch((error) => console.error(error));
}
