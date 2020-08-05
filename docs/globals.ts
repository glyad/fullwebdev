declare module "docs" {
  import { html as litHtml } from "lit-html";
  global {
    interface Window {
      html: typeof litHtml;
    }
    const html: typeof litHtml;
  }
}
