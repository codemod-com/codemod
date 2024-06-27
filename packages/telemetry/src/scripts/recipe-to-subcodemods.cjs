const fs = require("node:fs");
const csv = require("csv-parser");

const NAMES = new Map();
const SUB_CODEMODS_BY_RECIPE = {
  "react/19/migration-recipe": [
    "react/19/replace-reactdom-render",
    "react/19/replace-string-ref",
    "react/19/replace-act-import",
    "react/19/replace-use-form-state",
    "react/prop-types-typescript",
  ],
  "msw/2/upgrade-recipe": [
    "msw/2/imports",
    "msw/2/type-args",
    "msw/2/request-changes",
    "msw/2/ctx-fetch",
    "msw/2/req-passthrough",
    "msw/2/response-usages",
    "msw/2/callback-signature",
    "msw/2/lifecycle-events-signature",
    "msw/2/print-handler",
  ],
  "mocha/vitest/recipe": [
    "mocha/vitest/migrate-config",
    "mocha/vitest/migrate-test",
  ],
  "next/13/app-router-recipe": [
    "next/13/replace-next-router",
    "next/13/replace-next-head",
    "next/13/remove-get-static-props",
    "next/13/app-directory-boilerplate",
  ],
  "react/19/improvements-recipe": [
    "react/19/remove-context-provider",
    "react/19/remove-forward-ref",
    "react/19/use-context-hook",
  ],
  "react/19/migration-recipe (from user machine)": [
    "react/19/replace-reactdom-render",
    "react/19/replace-string-ref",
    "react/19/replace-act-import",
    "react/19/replace-use-form-state",
    "react/prop-types-typescript",
  ],
  "python/orjson/recipe": [
    "python/orjson/json.dumps",
    "python/orjson/json.load",
    "python/orjson/json.loads",
    "python/orjson/dumps-add-UTC_Z",
    "python/orjson/sentry-import-replacement",
  ],
};

const subCodemodEvents = [];
const jsonArray = [];

fs.createReadStream("./output.csv")
  .pipe(csv())
  .on("data", (data) => jsonArray.push(data))
  .on("end", () => {
    jsonArray.forEach((json) => {
      const name = json["*.properties.codemodName"];
      const totalFileCount = json["*.properties.fileCount"];
      const recipeName = json["*.properties.recipeName"];
      const executionId = json["*.properties.executionId"];
      const distinctId = json["person.distinct_id"];

      const eventName = json.event;
      const timestamp = json.timestamp;

      const subCodemodNames = SUB_CODEMODS_BY_RECIPE[name];

      // if recipeEvent is already in new format, ignore
      if (!subCodemodNames || (recipeName && recipeName === name)) {
        return;
      }

      subCodemodEvents.push(
        ...subCodemodNames.map((subCodemodName) => ({
          event: eventName,
          distinctId,
          timestamp,
          properties: {
            codemodName: subCodemodName,
            executionId,
            fileCount: Math.round(totalFileCount / subCodemodNames.length),
            recipeName: name,
          },
        })),
      );

      const count = NAMES.get(name);

      NAMES.set(
        name,
        count === undefined
          ? subCodemodNames.length
          : count + subCodemodNames.length,
      );
    });

    fs.writeFile(
      "transformed.json",
      JSON.stringify(subCodemodEvents),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing the file:", err);
          return;
        }
        console.log(
          "Transformation successful! Check output.json for the result.",
        );
      },
    );

    console.info(`Generated ${subCodemodEvents.length} events`);
    console.info(`Events by recipe: ${NAMES.entries()}`);
  });
