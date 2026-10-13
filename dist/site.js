// Galeria "Anatomia do projeto" (páginas de caso). Os dados ficam em <script id="gallery-data">.
const gallery = document.querySelector("[data-gallery]");
const dataNode = document.getElementById("gallery-data");
if (gallery && dataNode) {
  const items = JSON.parse(dataNode.textContent);
  const viewport = gallery.querySelector(".viewport");
  const image = gallery.querySelector("[data-image]");
  const title = gallery.querySelector("[data-title]");
  const description = gallery.querySelector("[data-desc]");
  const count = gallery.querySelector("[data-count]");
  const tabs = document.querySelector("[data-tabs]");
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const cache = new Map();
  const preload = (src) => {
    if (!src) return Promise.resolve();
    if (!cache.has(src)) {
      const picture = new Image();
      picture.decoding = "async";
      picture.src = src;
      cache.set(src, picture.decode().catch(() => undefined));
    }
    return cache.get(src);
  };
  const sources = (item) => item.photos || [item.src];
  const idle = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 400));
  // Só a tela atual e as vizinhas são carregadas; as demais entram sob demanda.
  const preloadAround = (index) => {
    if (saveData) return;
    idle(() => [index - 1, index + 1].forEach((n) => sources(items[(n + items.length) % items.length]).forEach(preload)));
  };

  gallery.setAttribute("role", "tabpanel");
  gallery.id = "gallery-panel";
  tabs.setAttribute("role", "tablist");
  title.parentElement.setAttribute("aria-live", "polite");
  title.parentElement.setAttribute("aria-atomic", "true");

  const photoSlide = document.createElement("div");
  photoSlide.className = "photo-slide";
  photoSlide.hidden = true;
  viewport.append(photoSlide);
  let current = 0;
  let request = 0;

  function show(index) {
    const item = items[index];
    image.hidden = Boolean(item.photos);
    photoSlide.hidden = !item.photos;
    if (item.photos) {
      photoSlide.replaceChildren(...item.photos.map((src, i) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = ["Profissional da Caxtros Barber", "Resultado de um corte", "Atendimento na barbearia"][i] || item.alt;
        img.decoding = "async";
        return img;
      }));
    } else {
      image.src = item.src;
      image.alt = item.alt;
    }
    title.textContent = item.title;
    description.textContent = item.desc;
    count.textContent = String(index + 1).padStart(2, "0") + " / " + String(items.length).padStart(2, "0");
    [...tabs.children].forEach((button, i) => {
      const selected = i === index;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    gallery.setAttribute("aria-labelledby", "gallery-tab-" + index);
    current = index;
    preloadAround(index);
  }

  async function select(index, focusTab = false) {
    const token = ++request;
    viewport.classList.add("is-switching");
    await Promise.all(sources(items[index]).map(preload));
    if (token !== request) return;
    show(index);
    if (focusTab) tabs.children[index].focus();
    requestAnimationFrame(() => viewport.classList.remove("is-switching"));
  }

  items.forEach((item, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.id = "gallery-tab-" + i;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "gallery-panel");
    button.textContent = item.label;
    button.addEventListener("click", () => select(i));
    if (!saveData) {
      const warm = () => sources(item).forEach(preload);
      button.addEventListener("pointerenter", warm, { once: true });
      button.addEventListener("focus", warm, { once: true });
    }
    tabs.append(button);
  });

  tabs.addEventListener("keydown", (event) => {
    const keys = { ArrowRight: 1, ArrowLeft: -1 };
    let next = null;
    if (event.key in keys) next = (current + keys[event.key] + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    if (next === null) return;
    event.preventDefault();
    select(next, true);
  });

  gallery.querySelector("[data-prev]").addEventListener("click", () => select((current + items.length - 1) % items.length));
  gallery.querySelector("[data-next]").addEventListener("click", () => select((current + 1) % items.length));
  sources(items[0]).forEach(preload);
  show(0);
}
