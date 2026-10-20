// KaTeX за Sätteri – новия Markdown процесор по подразбиране в Astro 7.
// Sätteri разпознава $...$ и $$...$$ (features.math) и ги оставя като
// <code class="math-inline"> / <pre><code class="math-display">. Тук ги заменяме с HTML от KaTeX
// по време на билда и маркираме страницата (frontmatter.hasMath), за да се зареди CSS-ът само там.
import katex from "katex";
import { defineHastPlugin } from "satteri";

const classesOf = (node) => {
  const c = node.properties?.className ?? [];
  return Array.isArray(c) ? c : String(c).split(/\s+/);
};

const render = (tex, displayMode) =>
  katex.renderToString(tex, { displayMode, throwOnError: false, strict: "ignore", output: "htmlAndMathml" });

export const katexPlugin = defineHastPlugin({
  name: "katex",
  element: [
    {
      // $$ ... $$ → <pre><code class="language-math math-display">
      filter: ["pre"],
      visit(node, ctx) {
        const code = node.children?.find((c) => c.type === "element" && c.tagName === "code");
        if (!code || !classesOf(code).includes("math-display")) return;
        ctx.replaceNode(node, { type: "raw", value: render(ctx.textContent(code), true) });
        markMath(ctx);
      },
    },
    {
      // $ ... $ → <code class="language-math math-inline">
      filter: ["code"],
      visit(node, ctx) {
        if (!classesOf(node).includes("math-inline")) return;
        ctx.replaceNode(node, { type: "raw", value: render(ctx.textContent(node), false) });
        markMath(ctx);
      },
    },
  ],
});

function markMath(ctx) {
  const fm = ctx.data?.astro?.frontmatter;
  if (fm) fm.hasMath = true;
}
