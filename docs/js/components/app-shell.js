import { html } from "lit-html";
import { repeat } from "lit-html/directives/repeat.js";
import { classMap } from "lit-html/directives/class-map.js";
import { sidebarState } from "../sidebar";
import { routes } from "../routes";

/**
 * @typedef {{title: string, path: string, children?: NavItem[]}} NavItem
 * @typedef {{ lang: 'en' | 'fr', currentPath?: string }} RouteInfo
 * @typedef {NavItem & RouteInfo} RoutedNavItem
 * @typedef {{name?: string, path: string, title:string, file?: string, children?: {[key:string]: Route} }} Route
 * @typedef {{name?: string, path: string, title:string, file?: string, children?: Route[] }} MenuItem
 */

/**
 * @param {string} path
 *
 * @returns {Route[]}
 */
const getRoutes = (path, lang = "en") => {
  let pathElmts = path.split("/").slice(1, -1);

  // TODO: generalize
  const shouldFollow = pathElmts.length > 2 || pathElmts.includes("materials");

  if (!shouldFollow) {
    pathElmts = [lang];
  }

  /**
   * @type {{ [key:string]: Route }}
   */
  const route = pathElmts.reduce((prev, cur) => {
    const rslt = prev[cur] || (prev.children && prev.children[cur]);
    if (
      rslt.children &&
      Object.values(rslt.children).find((child) => child.children)
    ) {
      return rslt.children;
    } else {
      return prev;
    }
  }, routes);

  let menu = Object.values(route);
  if (shouldFollow) {
    // TODO: generalize
    menu = [routes[pathElmts[0]].children.introduction, ...menu];
  }

  return menu;
};

/**
 * @param {RoutedNavItem} data
 */
const navLink = (data) => {
  const classes = { "router-link-active": data.currentPath === data.path };

  return html`<div class="nav-item">
    <a href=${data.path} class="nav-link ${classMap(classes)}">
      ${data.title || data.name}
    </a>
  </div>`;
};

/**
 * @param {RoutedNavItem} data
 */
const sidebarItem = (data) => {
  if (!data.children) {
    return html`<li>${sidebarLink(data)}</li>`;
  } else if (!data.path) {
    return html`<li>
      <section class="sidebar-group collapsable depth-0">
        <p class="sidebar-heading open">
          <span>${data.title || data.name}</span>
          <span class="arrow down"></span>
        </p>
        <ul class="sidebar-links sidebar-group-items" style="">
          ${repeat(
            Object.values(data.children),
            (item) => item.path,
            (item) =>
              html`<li>
                ${sidebarLink({
                  ...item,
                  currentPath: data.currentPath,
                  lang: data.lang,
                })}
              </li>`
          )}
        </ul>
      </section>
    </li>`;
  } else {
    return html`<li>
      ${sidebarLink(data)}
      <ul class="sidebar-sub-headers">
        ${repeat(
          Object.values(data.children),
          (item) => item.path,
          (item) =>
            html`<li class="sidebar-sub-header">
              ${sidebarLink({
                ...item,
                currentPath: data.currentPath,
                lang: data.lang,
              })}
            </li>`
        )}
      </ul>
    </li>`;
  }
};

/**
 * @param {RoutedNavItem} data
 */
const sidebarLink = (data) => {
  const classes = { active: data.currentPath === data.path };

  return html`
    <a href=${data.path} class="sidebar-link ${classMap(classes)}">
      ${data.title || data.name}
    </a>
  `;
};

const sidebarButton = html`<div
  class="sidebar-button"
  @click=${() => sidebarState.toggleSidebar()}
>
  <svg
    class="icon"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
    viewBox="0 0 448 512"
  >
    <path
      fill="currentColor"
      d="M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z"
      class=""
    />
  </svg>
</div>`;

/**
 * @type {{en: NavItem[], fr: NavItem[]}}
 */
const navbar = {
  en: [
    {
      title: "Home",
      path: "/",
    },
    {
      title: "Introduction",
      path: "/introduction/",
    },
  ],
  fr: [
    {
      title: "Accueil",
      path: "/",
    },
    {
      title: "Introduction",
      path: "/introduction/",
    },
  ],
};

const githubLink = () => html` <a
  href="https://github.com/fullwebdev/fullwebdev"
  target="_blank"
  rel="noopener noreferrer"
  class="repo-link"
>
  GitHub
</a>`;

/**
 * @param {RouteInfo} data
 */
export default (data) => html` <header class="navbar">
    ${sidebarButton}
    <a class="nav-link" href="/">
      <span class="site-name">FullWeb.dev</span>
    </a>
    <div class="links" style="max-width: 1553px;">
      <nav class="nav-links can-hide">
        ${repeat(
          navbar[data.lang],
          (item) => item.path,
          (item) => navLink({ ...item, ...data })
        )}
        ${githubLink()}
      </nav>
    </div>
  </header>
  <aside class="sidebar">
    <nav class="nav-links">
      ${repeat(
        navbar[data.lang],
        (item) => item.path,
        (item) => navLink({ ...item, ...data })
      )}
      ${githubLink()}
    </nav>
    <ul class="sidebar-links">
      ${repeat(
        getRoutes(data.currentPath || "/en/", data.lang),
        (item) => item.path,
        (item) => sidebarItem({ ...item, ...data })
      )}
    </ul>
  </aside>`;