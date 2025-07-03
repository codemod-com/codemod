const fs = require("fs");
const path = require("path");

const parts = [process.platform, process.arch];
if (process.platform === "linux") {
  const { MUSL, family } = require("detect-libc");
  if (family === MUSL) {
    parts.push("musl");
  } else if (process.arch === "arm") {
    parts.push("gnueabihf");
  } else {
    parts.push("gnu");
  }
} else if (process.platform === "win32") {
  parts.push("msvc");
}

const binary = process.platform === "win32" ? "codemod.exe" : "codemod";

let pkgPath;
try {
  pkgPath = path.dirname(
    require.resolve(`@codemod.com/cli-${parts.join("-")}/package.json`),
  );
} catch (err) {
  // Fallback for development - look for local binary
  pkgPath = path.join(__dirname, "..", "target", "release");
  if (!fs.existsSync(path.join(pkgPath, binary))) {
    pkgPath = path.join(__dirname, "..", "target", "debug");
  }
}

try {
  fs.linkSync(path.join(pkgPath, binary), path.join(__dirname, binary));
} catch (err) {
  try {
    fs.copyFileSync(path.join(pkgPath, binary), path.join(__dirname, binary));
  } catch (err) {
    console.error("Failed to install codemod binary.");
    console.error("Platform:", process.platform, process.arch);
    console.error("Expected package:", `@codemod.com/cli-${parts.join("-")}`);
    process.exit(1);
  }
}

// Make binary executable
try {
  fs.chmodSync(path.join(__dirname, binary), 0o755);
} catch (err) {
  console.warn("Warning: Could not make binary executable");
}
