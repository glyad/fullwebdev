const fs = require("fs-extra");
const { writeFile } = require("fs").promises;
const path = require("path");
const { spawn } = require("child_process");

const docsRoot = path.join(__dirname, "..");
const destRoot = path.join(__dirname, "..");
fs.ensureDirSync(destRoot);

/**
 * @param {string[]} args
 *
 * @returns {Promise<{output: string, errors: string}>}
 */
function pandoc(...args) {
  return new Promise((resolve) => {
    const pandocProcess = spawn("pandoc", args);

    let output = "";
    let errors = "";

    pandocProcess.stdout.setEncoding("utf8");
    pandocProcess.stdout.on("data", (data) => {
      output += data;
    });

    pandocProcess.stderr.setEncoding("utf8");
    pandocProcess.stderr.on("data", (data) => {
      errors += data;
    });

    pandocProcess.on("close", (code) => {
      resolve({ output, errors });
    });
  });
}

/**
 * @param {string} srcDir
 */
async function convertDir(srcDir) {
  fs.readdirSync(srcDir).forEach(async (fileName) => {
    const filePath = path.join(srcDir, fileName);
    const stat = await fs.lstat(filePath);
    if (stat.isDirectory()) {
      await convertDir(filePath);
    } else if (stat.isFile() && path.extname(filePath) === ".md") {
      const { output, errors } = await pandoc(filePath, "-t", "html");
      if (errors) {
        console.error(`${filePath}: ${errors}`);
        return;
      }
      const cleanOutput = output
        .replace(/>\s+</g, "><")
        .replace(/\n/g, "")
        .replace(/`/g, "\\`");
      const js = `import {html} from "lit-html"; export default () => html\`${cleanOutput}\`;`;
      const relativeRoot = path.relative(docsRoot, filePath);
      const destFilePath = path
        .join(destRoot, relativeRoot)
        .replace(/README\.md/, "index.md")
        .split(".")
        .slice(0, -1)
        .join(".")
        .concat(".js");
      await fs.createFile(destFilePath);
      await writeFile(destFilePath, js, {
        encoding: "utf8",
      });
    }
  });
}

convertDir(path.join(docsRoot, "pages"));
