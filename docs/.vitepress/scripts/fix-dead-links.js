/**
 * fix-dead-links.js
 *
 * Escanea todos los archivos .md del proyecto VitePress, extrae los enlaces
 * relativos y crea placeholders automáticos para los que apunten a páginas
 * Markdown que aún no existen.
 *
 * Reglas de exclusión (no se crean placeholders para):
 *   - URLs externas (http://, https://, mailto:)
 *   - Enlaces a anclas internas (#seccion)
 *   - Imágenes (![alt](url))
 *   - Archivos con extensión no documentación (.png, .svg, .drawio, etc.)
 *   - Enlaces que apunten fuera de la raíz docs/
 *   - Archivos que ya existen (nunca sobreescribe)
 *   - Contenido dentro de backticks (código inline)
 *
 * Resolución de enlaces (igual que VitePress):
 *   - ./page        → page.md  o  page/index.md
 *   - ./page.md     → page.md
 *   - ./page/       → page/index.md  o  page.md
 *   - ../page       → page.md  o  page/index.md
 *
 * Uso:
 *   node .vitepress/scripts/fix-dead-links.js
 */

import { readdir, readFile, writeFile, mkdir, access, stat } from "node:fs/promises";
import { resolve, dirname, basename, relative, join, extname } from "node:path";

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

const docsRoot = resolve(import.meta.dirname, "..", "..");

/** Extensiones que NO son documentación — se ignoran al analizar enlaces. */
const NON_DOC_EXTENSIONS = new Set([
  // Imágenes
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico", ".bmp", ".tiff",
  // Diagramas / diseño
  ".drawio", ".figma", ".sketch", ".psd", ".ai", ".eps",
  // Documentos
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".odt", ".ods", ".odp",
  // Archivos comprimidos
  ".zip", ".tar", ".gz", ".rar", ".7z", ".bz2", ".xz",
  // Media
  ".mp3", ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".ogg", ".wav",
  // Datos / config
  ".csv", ".json", ".xml", ".yaml", ".yml", ".toml", ".ini", ".env", ".lock",
  // Código / otros
  ".log", ".txt", ".rtf", ".bin", ".exe", ".dll", ".so", ".dylib",
]);

/** Carpetas que se excluyen del escaneo recursivo. */
const SKIP_DIRS = new Set(["node_modules", ".vitepress", ".git", "dist"]);

/** Regex para capturar enlaces Markdown: [texto](url) y ![texto](url) */
const MARKDOWN_LINK_RE = /!?\[([^\]]*)\]\(([^)]+)\)/g;

// ---------------------------------------------------------------------------
// Funciones auxiliares
// ---------------------------------------------------------------------------

/**
 * Comprueba si un archivo existe (wrapper de access).
 */
async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Busca recursivamente todos los archivos .md dentro de `dir`,
 * excluyendo carpetas en SKIP_DIRS.
 */
async function findMarkdownFiles(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await findMarkdownFiles(fullPath)));
    } else if (entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Extrae todos los enlaces Markdown de un archivo.
 * Elimina contenido dentro de backticks para evitar falsos positivos
 * como [type](scope) en ejemplos de commit messages.
 * Devuelve un array de objetos { url, isImage }.
 */
function extractLinks(content) {
  // Eliminar contenido dentro de backticks (simples y dobles)
  const stripped = content
    .replace(/``[\s\S]*?``/g, "")   // código inline doble backtick
    .replace(/`[^`\n]*`/g, "");      // código inline simple backtick (sin cruzar líneas)

  const links = [];
  let match;

  while ((match = MARKDOWN_LINK_RE.exec(stripped)) !== null) {
    const raw = match[0];
    const url = match[2].trim();
    const isImage = raw.startsWith("!");
    links.push({ url, isImage });
  }

  return links;
}

/**
 * Normaliza la URL de un enlace quitando anclas, query strings
 * y slashes finales innecesarios.
 */
function normalizeUrl(url) {
  return url
    .split("#")[0]        // quitar ancla
    .split("?")[0]        // quitar query string
    .replace(/\/+$/, ""); // quitar trailing slashes
}

/**
 * Indica si la extensión del enlace apunta a un archivo no documentación.
 */
function isNonDocExtension(cleanUrl) {
  const ext = extname(cleanUrl).toLowerCase();
  return ext !== "" && NON_DOC_EXTENSIONS.has(ext);
}

/**
 * Resuelve un enlace relativo contra la ubicación del archivo que lo contiene,
 * siguiendo la misma lógica que VitePress.
 *
 * Devuelve la ruta absoluta del archivo .md que debería existir, o null si:
 *   - El enlace ya resuelve a un archivo existente (no se necesita placeholder)
 *   - El enlace apunta a un archivo no-documentación existente
 *   - El enlace apunta fuera de docs/
 */
async function resolveVitePressLink(fromFile, linkUrl) {
  const clean = normalizeUrl(linkUrl);
  if (!clean) return null;

  const fromDir = dirname(fromFile);
  const resolved = resolve(fromDir, clean);

  // --- Caso 1: URL con extensión .md → ruta directa ---
  if (clean.endsWith(".md")) {
    if (await fileExists(resolved)) return null;
    return resolved;
  }

  // --- Caso 2: URL con trailing slash → priorizar index.md ---
  if (linkUrl.endsWith("/")) {
    const idxPath = join(resolved, "index.md");
    if (await fileExists(idxPath)) return null;

    const mdPath = resolved + ".md";
    if (await fileExists(mdPath)) return null;

    return idxPath;
  }

  // --- Caso 3: URL sin extensión → probar path.md, luego path/index.md ---

  const mdPath = resolved + ".md";
  if (await fileExists(mdPath)) return null;

  const idxPath = join(resolved, "index.md");
  if (await fileExists(idxPath)) return null;

  // Si el path sin extensión es un archivo real (no markdown) → no crear placeholder
  try {
    const s = await stat(resolved);
    if (s.isFile()) return null;
  } catch {
    /* no existe */
  }

  return mdPath;
}

/**
 * Genera un título legible a partir del nombre de archivo.
 *   "contracts/index"  → "Contracts / Index"
 *   "roadmap-ota-ble"  → "Roadmap Ota Ble"
 */
function titleFromFilename(filePath) {
  const name = basename(filePath, ".md");
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// ---------------------------------------------------------------------------
// Función principal
// ---------------------------------------------------------------------------

async function fixDeadLinks() {
  console.log("Escaneando archivos .md...\n");

  const mdFiles = await findMarkdownFiles(docsRoot);

  let linksChecked = 0;
  let filesCreated = 0;
  let linksIgnored = 0;
  const createdPaths = new Set();

  for (const mdFile of mdFiles) {
    const content = await readFile(mdFile, "utf-8");
    const links = extractLinks(content);

    for (const link of links) {
      linksChecked++;

      // --- Filtros de exclusión ---

      if (link.isImage) {
        linksIgnored++;
        continue;
      }

      if (/^(https?:\/\/|mailto:)/i.test(link.url)) {
        linksIgnored++;
        continue;
      }

      if (link.url.startsWith("#")) {
        linksIgnored++;
        continue;
      }

      const clean = normalizeUrl(link.url);
      if (isNonDocExtension(clean)) {
        linksIgnored++;
        continue;
      }

      // --- Resolución ---

      const target = await resolveVitePressLink(mdFile, link.url);

      if (!target) {
        linksIgnored++;
        continue;
      }

      // Verificar que está dentro de docs/
      const relToDocs = relative(docsRoot, target);
      if (relToDocs.startsWith("..")) {
        linksIgnored++;
        continue;
      }

      // Ya creado en esta ejecución
      if (createdPaths.has(target)) {
        linksIgnored++;
        continue;
      }

      // Doble verificación: ¿existe ya el archivo?
      if (await fileExists(target)) {
        linksIgnored++;
        continue;
      }

      // --- Crear placeholder ---

      await mkdir(dirname(target), { recursive: true });

      const title = titleFromFilename(target);
      const placeholder = [
        "---",
        `title: ${title}`,
        "---",
        "",
        `# ${title}`,
        "",
        "🚧 Página en construcción.",
        "",
      ].join("\n");

      await writeFile(target, placeholder, "utf-8");
      createdPaths.add(target);
      filesCreated++;

      console.log(`  ✓ ${relToDocs}`);
    }
  }

  // --- Resumen ---
  console.log("");
  console.log("─".repeat(50));
  console.log(`  Enlaces revisados:    ${linksChecked}`);
  console.log(`  Enlaces ignorados:    ${linksIgnored}`);
  console.log(`  Placeholders creados: ${filesCreated}`);
  console.log("─".repeat(50));
}

// ---------------------------------------------------------------------------
// Ejecutar
// ---------------------------------------------------------------------------
fixDeadLinks().catch((err) => {
  console.error("Error al generar placeholders:", err);
  process.exit(1);
});
