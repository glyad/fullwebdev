import merge from 'deepmerge';
import { createSpaConfig, createBasicConfig } from '@open-wc/building-rollup';
import copy from 'rollup-plugin-copy';
import fs from 'fs';
import path from 'path';
import multiInput from 'rollup-plugin-multi-input';
import esmImportToUrl from 'rollup-plugin-esm-import-to-url';

// const pages = (function findPages(base, ext, files = fs.readdirSync(base), result = []) {
//   files.forEach((file) => {
//     var newbase = path.join(base, file);
//     if (fs.statSync(newbase).isDirectory()) {
//       result = findPages(newbase, ext, fs.readdirSync(newbase), result);
//     } else {
//       if (file.substr(-1 * (ext.length + 1)) == '.' + ext) {
//         result.push(newbase);
//       }
//     }
//   });
//   return result;
// })(path.resolve(__dirname, 'views'), 'js');

const developmentMode = process.env.ROLLUP_WATCH === 'true';

const imports = {
  'lit-html': 'modules/lit-html.min.js',
};

export default [
  merge(
    createSpaConfig({
      // use the outputdir option to modify where files are output
      // outputDir: 'dist',

      // if you need to support older browsers, such as IE11, set the legacyBuild
      // option to generate an additional build just for this browser
      legacyBuild: false,

      // development mode creates a non-minified build for debugging or development
      developmentMode,

      // set to true to inject the service worker registration into your index.html
      injectServiceWorker: false,

      nodeResolve: false,
    }),
    {
      // if you use createSpaConfig, you can use your index.html as entrypoint,
      // any <script type="module"> inside will be bundled by rollup
      input: './index.html',

      // alternatively, you can use your JS as entrypoint for rollup and
      // optionally set a HTML template manually
      // input: './app.js',

      plugins: [
        copy({
          targets: [
            // TODO: minify
            { src: 'styles/**/*', dest: 'dist/styles' },
            { src: 'images/**/*', dest: 'dist/images' },
            // { src: 'views/**/*.js', dest: 'dist/views' },
            { src: 'js/components/**/*.js', dest: 'dist/js' },
          ],
          // set flatten to false to preserve folder structure
          flatten: false,
        }),
        esmImportToUrl({
          imports: {
            'lit-html': 'https://localhost:8080/lit-html.js',
          },
        }),
      ],
    }
  ),
  {
    // use glob in the input
    input: ['views/**/*.js'],
    output: {
      format: 'esm',
      dir: 'dist',
    },
    plugins: [
      multiInput(),
      esmImportToUrl({
        imports: {
          'lit-html': 'https://localhost:8080/lit-html.js',
        },
      }),
    ],
  },
  {
    // use glob in the input
    input: [
      'node_modules/lit-html/lit-html.js',
      'node_modules/lit-html/directives/repeat.js',
      'node_modules/lit-html/directives/class-map.js',
    ],
    output: {
      format: 'esm',
      dir: 'dist',
    },
  },
  // ...pages.map((input) =>
  //   merge(
  //     createBasicConfig({
  //       outputDir: path.join('dist/views', path.relative(path.join(__dirname, 'views'), path.dirname(input))),
  //       babel: false,
  //       terser: false,
  //       developmentMode: true,
  //       nodeResolve: { browser: true, dedupe: ['lit-html'], jail: path.dirname(input) },
  //     }),
  //     {
  //       input,
  //     }
  //   )
  // ),
];
