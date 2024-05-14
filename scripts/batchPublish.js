const fs = require("fs");
const { exec } = require("child_process");

function iterateFolders(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${folderPath}: ${err}`);
      return;
    }

    files.forEach((file) => {
      const fullPath = `${folderPath}/${file}`;
      fs.stat(fullPath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats for ${fullPath}: ${err}`);
          return;
        }

        if (stats.isDirectory()) {
          console.log(`Navigating to directory: ${fullPath}`);
          exec(
            "codemod build && codemod publish",
            { cwd: fullPath },
            (error, stdout, stderr) => {
              if (error) {
                console.error(`Error running command in ${fullPath}: ${error}`);
                return;
              }
              console.log(`stdout from ${fullPath}:`, stdout);
              console.error(`stderr from ${fullPath}:`, stderr);
            },
          );
        }
      });
    });
  });
}

// Read folder path from command-line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: node script.js <folderPath>");
  process.exit(1);
}

// Resolve relative paths
const folderPath = args[0];
const resolvedPath = require("path").resolve(folderPath);

iterateFolders(resolvedPath);
