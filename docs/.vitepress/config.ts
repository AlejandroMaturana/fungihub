import { defineConfig } from "vitepress";

/**
 * Configuración de VitePress.
 *
 * `ignoreDeadLinks` suprime los dead links que no se pueden resolver con
 * placeholders automáticos (archivos fuera de /docs, archivos no-Markdown,
 * plantillas de ejemplo).
 */
export default defineConfig({
  ignoreDeadLinks: [
    // PROJECT_CONTEXT.md está en la raíz del repo, fuera de /docs
    /\.\.\/PROJECT_CONTEXT/,

    // protocol/VERSION es un archivo de texto plano, no Markdown
    /\/protocol\/VERSION/,

    // Archivos .drawio en diagrams/ — no son páginas VitePress
    /\.drawio$/,

    // Plantilla de RFC con placeholder NNN
    /ADR-NNN/,
  ],
});
