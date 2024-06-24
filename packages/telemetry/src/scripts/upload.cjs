const { readFile } = require("node:fs/promises");
const { PostHog } = require("posthog-node");

const postHog = new PostHog("phc_nGWKWP3t1fcNFqGi6UdstXjMf0fxx7SBeohHPSS6d2Y", {
  host: "https://us.i.posthog.com",
});

const wait = async (ms) => {
  return new Promise((res) => {
    setTimeout(() => res("1"), ms);
  });
};

async function main() {
  const file = await readFile("./transformed.json", "utf8");

  const jsonData = JSON.parse(file);
  let i = 0;

  for await (e of jsonData) {
    i++;
    if (i % 50 === 0) {
      console.log(`Uploaded ${i} events...`);
      await wait(1000);
    }

    postHog.capture(e);
  }

  await postHog.shutdown();
}

main();
