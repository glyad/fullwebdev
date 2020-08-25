const rmFilePrefix = (str) => {
  const parsed = /^[0-9]+-(.*)$/.exec(str);
  return parsed ? parsed[1] : str;
};

/**
 * @param {import('../utils/tree-node').DirTree} dirTree
 * @param {(path?: string) => Promise<{ [key: string ] : any} | null>} [asyncViewData]
 */
async function dirToRoutes(dirTree, asyncViewData) {
  /**
   * @param {string[]} pathStack
   */
  const recurse = async (pathStack) => {
    let menu = { children: {} };

    const root = pathStack.reduce((prev, cur) => prev[cur], dirTree);

    if (typeof root === "string" || root["name"]) {
      return;
    }

    if (root["index.js"]) {
      menu.path = "/" + pathStack.map(rmFilePrefix).join("/") + "/";
      menu.realPath = "/" + pathStack.join("/") + "/";
      menu.file = `/views${menu.realPath}index.js`;
    }

    for (let [name, node] of Object.entries(root)) {
      if (name === "index.js") {
        if (asyncViewData && menu.path) {
          const data = await asyncViewData(menu.realPath);
          Object.assign(menu, data);
        }
      } else {
        let entry = { name };

        const subNode = await recurse(pathStack.concat(name));
        if (subNode) {
          const submenu = subNode.children;
          if (submenu && Object.entries(submenu).length > 0) {
            entry.children = submenu;
          }
        }

        const realPathElms = [...pathStack, name];
        const pathElms = realPathElms.map(rmFilePrefix);

        const potentialPath = "/" + pathElms.join("/");
        const potentialRealPath = "/" + realPathElms.join("/");
        let key = pathElms.slice(-1)[0];

        if (node["index.js"]) {
          entry.path = potentialPath.concat("/");
          entry.realPath = potentialRealPath.concat("/");
          entry.file = `/views${entry.realPath}index.js`;
        } else if (name.substr(-3) === ".js") {
          entry.file = `/views${potentialRealPath}`;
          entry.path = potentialPath.slice(0, -3);
          entry.realPath = potentialRealPath.slice(0, -3);
          key = entry.path.split("/").pop();
        }

        if (asyncViewData && entry.path) {
          const data = await asyncViewData(entry.realPath);
          if (data === null) {
            entry = null;
          } else {
            Object.assign(entry, data);
          }
        }

        if (entry !== null) {
          menu.children[key] = entry;
        }
      }
    }
    return menu;
  };
  const rslt = recurse([]);
  return rslt && (await rslt).children;
}

module.exports = { dirToRoutes };