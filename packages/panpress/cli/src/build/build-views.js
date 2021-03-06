const path = require("path");
const fs = require("fs-extra");
const globby = require("globby");
const chokidar = require("chokidar");
const { mdToHTMLByLang } = require("./md-to-html");
const { htmlToJs } = require("./html-to-js");
const { writeToView } = require("./create-view-file");

/**
 * @param {string} filePath
 * @param {string} root
 * @param {string} outputDir
 * @param {string} [cwd]
 */
async function buildView(
  filePath,
  root,
  outputDir,
  editLink = true,
  cwd,
  extract = false
) {
  console.debug(`[build - html] from ${filePath}`);
  const htmlByLang = await mdToHTMLByLang(filePath, root, cwd, extract);
  return Promise.all(
    htmlByLang.map(async ([lang, html]) => {
      console.debug(`[build - js] from ${filePath}`);
      const js = htmlToJs(html, filePath, editLink);
      await writeToView(filePath, root, outputDir, lang, js);
    })
  );
}

/**
 * @param {string[]} globs
 * @param {string} root
 * @param {string} outputDir
 * @param {string} [cwd]
 */
async function buildDirs(globs, root, outputDir, cwd, extract = false) {
  const paths = await globby(globs, { absolute: true, cwd: root });
  return Promise.all(
    paths.map(async (filePath) => {
      const stat = await fs.lstat(filePath);
      if (stat.isFile() && path.extname(filePath) === ".md") {
        await buildView(filePath, root, outputDir, true, cwd, extract);
      } else {
        console.warn(`wrong file: `);
      }
    })
  );
}

/**
 * @param {string} rootDir
 * @param {string} outputDir
 * @param {string[]} src
 * @param {string} [cwd]
 */
async function watchOrBuild(
  watch = false,
  rootDir,
  outputDir,
  src,
  cwd,
  extract = false
) {
  await buildDirs(src, rootDir, outputDir, cwd, extract);
  if (watch) {
    console.log(`[build] watching ${rootDir}/${src}`);
    const watcher = chokidar.watch(src, { cwd: rootDir });
    const log = console.log.bind(console);
    const build = (filePath) => {
      console.log(`[build - watch] ${filePath} changed`);
      return buildView(
        path.resolve(rootDir, filePath),
        rootDir,
        outputDir,
        true,
        cwd,
        extract
      );
    };
    return new Promise((resolve) => {
      watcher
        .on("ready", () => {
          log("[build] Initial scan complete. Ready for changes");
          resolve();
        })
        .on("add", build)
        .on("change", build)
        .on("unlink", (filePath) => {
          // TODO
        })
        .on("error", (error) => log(`Watcher error: ${error}`));
    });
  }
}

module.exports = { buildDirs, buildFile: buildView, watchOrBuild };
