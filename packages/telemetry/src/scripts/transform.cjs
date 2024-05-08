const fs = require("node:fs");
const csv = require("csv-parser");

const names = new Map();
const jsonArray = [];

const azureRoles = {
  VSCE: ["intuita-vscode-extension", "codemod-vscode-extension", "vsce"],
  CLI: ["cli"],
};

function getPosthogEventName(azureEventName) {
  const [, role, name] = azureEventName.split(".");

  if (!role || !name) {
    return null;
  }

  let posthogRole = "";
  if (azureRoles.VSCE.includes(role)) {
    posthogRole = "VSCE";
  }

  if (azureRoles.CLI.includes(role)) {
    posthogRole = "CLI";
  }

  return ["codemod", posthogRole, name].join(".");
}

fs.createReadStream("./output.csv")
  .pipe(csv())
  .on("data", (data) => jsonArray.push(data))
  .on("end", () => {
    const transformedData = jsonArray
      .map((event) => {
        const {
          name: azureEventName,
          user_Id,
          customDimensions,
          customMeasurements,
        } = event;
        const name = getPosthogEventName(azureEventName);
        if (name === null) {
          return;
        }
        const count = names.get(name);

        names.set(name, count === undefined ? 1 : count + 1);

        const { kind: k1, ...restCustomDimensions } =
          customDimensions !== "" ? JSON.parse(customDimensions) : {};
        const { kind: k2, ...restCustomMeasurements } =
          customMeasurements !== "" ? JSON.parse(customMeasurements) : {};

        return {
          event: name,
          timestamp: new Date(event[Object.keys(event)[0]]).toISOString(),
          distinctId: user_Id || "AnonymousUser",
          properties: {
            ...restCustomDimensions,
            ...restCustomMeasurements,
            cloudRole: name.split(".")[1],
          },
        };
      })
      .filter(Boolean);

    // Convert the transformed data back to JSON
    const transformedJson = JSON.stringify(transformedData, null, 2);

    console.log(names.entries(), "???");
    // Write the transformed data to a new file
    fs.writeFile("transformed.json", transformedJson, "utf8", (err) => {
      if (err) {
        console.error("Error writing the file:", err);
        return;
      }
      console.log(
        "Transformation successful! Check output.json for the result.",
      );
    });
  });
