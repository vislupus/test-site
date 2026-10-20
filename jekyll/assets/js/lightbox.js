// Малък lightbox за галерията с вградения <dialog>. Без JavaScript връзките просто отварят снимката.
(() => {
  const links = [...document.querySelectorAll("a[data-lightbox]")];
  if (!links.length || typeof HTMLDialogElement !== "function") return;

  const dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.setAttribute("aria-label", "Преглед на снимка");
  dlg.innerHTML =
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button type="button" class="lb-prev" aria-label="Предишна снимка">‹</button>' +
    '<button type="button" class="lb-next" aria-label="Следваща снимка">›</button>' +
    '<button type="button" class="lb-close" aria-label="Затвори">×</button>';
  document.body.append(dlg);

  const img = dlg.querySelector("img");
  const cap = dlg.querySelector("figcaption");
  let index = 0;

  const show = (n) => {
    index = (n + links.length) % links.length;
    const a = links[index];
    img.src = a.href;
    img.alt = a.querySelector("img")?.alt || "";
    cap.textContent = a.dataset.caption || img.alt;
  };

  links.forEach((a, n) =>
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      show(n);
      dlg.showModal();
    })
  );
  dlg.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
  dlg.querySelector(".lb-next").addEventListener("click", () => show(index + 1));
  dlg.querySelector(".lb-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
})();
