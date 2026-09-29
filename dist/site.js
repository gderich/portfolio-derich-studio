const gallery = document.querySelector("[data-gallery]");
if (gallery) {
  const items = JSON.parse(gallery.dataset.gallery);
  const viewport = gallery.querySelector(".viewport");
  const image = gallery.querySelector("[data-image]");
  const title = gallery.querySelector("[data-title]");
  const description = gallery.querySelector("[data-desc]");
  const count = gallery.querySelector("[data-count]");
  const tabs = document.querySelector("[data-tabs]");
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
  items.forEach(item => sources(item).forEach(preload));
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
    [...tabs.children].forEach((button, i) => button.setAttribute("aria-selected", i === index ? "true" : "false"));
    current = index;
  }
  async function select(index) {
    const token = ++request;
    viewport.classList.add("is-switching");
    await Promise.all(sources(items[index]).map(preload));
    if (token !== request) return;
    show(index);
    requestAnimationFrame(() => viewport.classList.remove("is-switching"));
  }
  items.forEach((item, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    button.addEventListener("click", () => select(i));
    tabs.append(button);
  });
  gallery.querySelector("[data-prev]").addEventListener("click", () => select((current + items.length - 1) % items.length));
  gallery.querySelector("[data-next]").addEventListener("click", () => select((current + 1) % items.length));
  show(0);
}
