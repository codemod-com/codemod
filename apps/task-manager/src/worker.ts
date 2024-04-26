import "dotenv/config";

import { spawn } from "node:child_process";
import fs, { promises as fsPromises } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "bullmq";
import Redis from "ioredis";
import { Auth } from "./services/Auth";
import { GithubProvider } from "./services/GithubProvider";
import { environment } from "./util";

const redis = new Redis({
  host: String(environment.REDIS_HOST),
  port: Number(environment.REDIS_PORT),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getSourceControlProvider = (
  provider: "github",
  oAuthToken: string,
  repo: string,
) => {
  switch (provider) {
    case "github": {
      return new GithubProvider(oAuthToken, repo);
    }
  }
};

const auth = new Auth(environment.CLERK_SECRET_KEY as string);

function runCodemodCli(
  command: string,
  args: Array<string>,
  jobId: string | undefined,
) {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(command, args);

    proc.stdout.on("data", async (data) => {
      const pattern = /Processed \d+ files out of \d+/;
      const message = `${data.toString().trim()}`;
      const match = message.match(pattern);

      if (match) {
        await redis.set(
          `job:${jobId}:status`,
          JSON.stringify({
            status: "progress",
            message: match[0],
          }),
        );
      }
    });

    proc.stderr.on("data", async (data) => {
      console.error(`stderr: ${data}`);
      const message = `${data.toString().trim()}`;
      await redis.set(
        `job:${jobId}:status`,
        JSON.stringify({
          status: "progress",
          message,
        }),
      );
    });

    proc.on("close", (code) => {
      if (code === 0) {
        console.log(`child process exited with code ${code}`);
        resolve();
      } else {
        reject(new Error(`child process exited with code ${code}`));
      }
    });
  });
}

async function codemodRun({
  jobId,
  userId,
  source,
  engine,
  repo,
  codemodName,
}: {
  jobId: string | undefined;
  userId: string;
  source: string;
  engine: string;
  repo: string;
  codemodName: string;
}): Promise<void> {
  try {
    const oAuthToken = await auth.getOAuthToken(userId, "github");
    const branchName = `codemod-${codemodName.toLowerCase()}-${Date.now()}`;
    const basePath = path.resolve("resources", "sources");
    const filePath = path.join(basePath, `${codemodName}.cjs`);

    await redis.set(
      `job:${jobId}:status`,
      JSON.stringify({
        status: "progress",
        message: "waiting for execution to start",
      }),
    );

    const sourceControlProvider = getSourceControlProvider(
      "github",
      oAuthToken,
      repo,
    );

    await sourceControlProvider.cloneRepository();
    await sourceControlProvider.createBranch(branchName);

    await redis.set(
      `job:${jobId}:status`,
      JSON.stringify({
        status: "progress",
        message: "fetching repo",
      }),
    );

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }
    fs.writeFileSync(filePath, source, "utf8");

    const sourcePath = path.resolve(
      __dirname,
      `../resources/sources/${codemodName}.cjs`,
    );

    const targetPath = path.resolve(
      __dirname,
      `../resources/repos/${sourceControlProvider.repoName}`,
    );

    await runCodemodCli(
      "npx",
      [
        "codemod",
        `--source='${sourcePath}'`,
        `--codemodEngine='${engine}'`,
        "--fileLimit",
        `"100000"`,
        `--target='${targetPath}'`,
        "--skip-install",
      ],
      jobId,
    );

    await sourceControlProvider.commitChanges("Apply codemod changes");
    await sourceControlProvider.pushChanges(branchName);

    const pr = await sourceControlProvider.createPullRequest({
      title: `Codemod changes for ${codemodName}`,
      head: branchName,
      base: "main",
      body: `Applying changes from codemod ${codemodName}.`,
    });

    await redis.set(
      `job:${jobId}:status`,
      JSON.stringify({
        status: "done",
        link: pr.url,
      }),
    );

    await fsPromises.unlink(sourcePath);
    await fsPromises.rmdir(targetPath, { recursive: true });
  } catch (error) {
    await redis.set(
      `job:${jobId}:status`,
      JSON.stringify({
        status: "done",
        link: (error as Error).message,
      }),
    );
  }
}

const worker = new Worker(
  environment.TASK_MANAGER_QUEUE_NAME ?? "",
  async (job) => {
    switch (job.name) {
      case "codemodRun": {
        const { userId, source, engine, repo, codemodName } = job.data;

        await codemodRun({
          jobId: job.id,
          userId,
          source,
          engine,
          repo,
          codemodName,
        });

        break;
      }

      default:
        break;
    }
  },
  {
    connection: {
      host: String(environment.REDIS_HOST),
      port: Number(environment.REDIS_PORT),
    },
  },
);

worker.on("completed", (job) => {
  console.log(`task ${job.id} completed`);
});
