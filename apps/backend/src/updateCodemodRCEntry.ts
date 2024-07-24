import "dotenv/config";

import { randomBytes } from "node:crypto";
import fs from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { type CodemodConfig, TarService, sleep } from "@codemod-com/utilities";
import { environment } from "./util.js";

(async () => {
  const tarService = new TarService(fs);

  try {
    const client = new S3Client({
      credentials: {
        accessKeyId: environment.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: environment.AWS_SECRET_ACCESS_KEY ?? "",
      },
      region: "us-west-1",
    });

    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: "codemod-public",
      }),
      { requestTimeout: 5000 },
    );

    await Promise.all(
      (response.Contents ?? []).map(async (object) => {
        if (!object.Key?.includes("codemod.tar.gz")) {
          return;
        }

        console.log("UPLOADING: ", object.Key);

        const downloadResult = await client.send(
          new GetObjectCommand({
            Bucket: "codemod-public",
            Key: object.Key,
          }),
        );

        const archiveBuffer = Buffer.from(
          await downloadResult.Body?.transformToByteArray()!,
        );

        const unpackPath = join(
          homedir(),
          ".codemod",
          "script-temp",
          randomBytes(8).toString("hex"),
        );
        await fs.promises.mkdir(unpackPath, { recursive: true });
        await tarService.unpack(unpackPath, archiveBuffer);

        const codemodRcContents = await fs.promises.readFile(
          join(unpackPath, ".codemodrc.json"),
          { encoding: "utf-8" },
        );

        const codemodRc = JSON.parse(codemodRcContents) as CodemodConfig & {
          build?: { output?: string; input?: string };
        };

        if (codemodRc.build) {
          delete codemodRc.build;
        }

        codemodRc.entry = "index.cjs";

        const files = [
          {
            name: ".codemodrc.json",
            data: Buffer.from(JSON.stringify(codemodRc, null, 2)),
          },
          {
            name: "index.cjs",
            data: await fs.promises.readFile(join(unpackPath, "index.cjs")),
          },
        ];

        try {
          const descMd = await fs.promises.readFile(
            join(unpackPath, "description.md"),
          );
          files.push({
            name: "README.md",
            data: descMd,
          });
        } catch (err) {
          //
        }

        const uploadResult = await client.send(
          new PutObjectCommand({
            Bucket: "codemod-public",
            Key: object.Key,
          }),
        );

        if (uploadResult.$metadata.httpStatusCode !== 200) {
          console.error("FAILED TO UPLOAD: ", object.Key);
        } else {
          console.log("UPLOADED: ", object.Key);
          console.log("CODEMODRC: ");
          console.dir(codemodRc, { depth: 10 });
        }

        await sleep(10000);

        await fs.promises.rmdir(join(homedir(), ".codemod", "script-temp"), {
          recursive: true,
        });
      }),
    );
  } catch (err) {
    console.error(err);
  }
})();
