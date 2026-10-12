(() => {
  const D = window.SITE_DATA || { products: [], videos: [] };
  const grid = document.getElementById("productGrid");
  const vGrid = document.getElementById("videoGrid");

  /* products */
  function card(p) {
    const el = document.createElement("article");
    el.className = "card"; el.dataset.cat = p.category;
    el.innerHTML = `
      <div class="card-fig">
        <img loading="lazy" src="${p.image}" alt="${p.alt || p.name}">
        ${p.featured ? `<span class="card-flag">Featured</span>` : ""}
      </div>
      <div class="card-body">
        <span class="card-cat">${p.catLabel || p.category}</span>
        <h3>${p.name}</h3>
        <p>${p.desc || ""}</p>
        <div class="card-foot">
          <a class="card-link" href="${p.url || D.storeUrl}" target="_blank" rel="noopener">View collection</a>
          <span class="note">${p.id}</span>
        </div>
      </div>`;
    return el;
  }
  function renderProducts(filter = "all") {
    grid.innerHTML = "";
    D.products.filter(p => filter === "all" || p.category === filter).forEach(p => grid.appendChild(card(p)));
    if (!grid.children.length) grid.innerHTML = `<p class="note">No pieces in this category yet — add them in <code>js/site-data.js</code>.</p>`;
  }
  renderProducts();
  document.querySelectorAll("[data-filter]").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach(x => x.classList.remove("is-active"));
    b.classList.add("is-active"); renderProducts(b.dataset.filter);
  }));
  document.querySelectorAll("[data-goto-filter]").forEach(t => t.addEventListener("click", () => {
    const f = t.dataset.gotoFilter;
    document.querySelector(`[data-filter="${f}"]`)?.click();
    document.getElementById("collections").scrollIntoView({ behavior: "smooth" });
  }));

  /* videos — thumbnail is the video's own first frame, never a stock photo */
  D.videos.forEach(v => {
    const b = document.createElement("button");
    b.className = "v-card"; b.setAttribute("aria-label", `Play ${v.title}`);
    b.innerHTML = `
      <span class="v-thumb"><video src="${v.src}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture aria-hidden="true" tabindex="-1"></video>
      <span class="v-play"><span aria-hidden="true">▶</span></span></span>
      <span class="v-meta"><small>Film · ${v.ratio}</small><strong>${v.title}</strong><p>${v.desc}</p></span>`;
    b.addEventListener("click", () => openVideo(v));
    vGrid.appendChild(b);
  });

  const modal = document.getElementById("videoModal"),
        player = document.getElementById("vmPlayer"),
        vmTitle = document.getElementById("vmTitle"),
        vmDesc = document.getElementById("vmDesc");
  let lastFocus = null;
  function openVideo(v) {
    lastFocus = document.activeElement;
    vmTitle.textContent = v.title; vmDesc.textContent = v.desc || "";
    player.removeAttribute("poster"); player.src = v.src;
    modal.hidden = false; document.body.style.overflow = "hidden";
    player.play()?.catch(() => {});
    modal.querySelector(".modal-x").focus();
  }
  function closeVideo() {
    player.pause(); player.removeAttribute("src"); player.load();
    modal.hidden = true; document.body.style.overflow = "";
    lastFocus?.focus?.();
  }
  modal.querySelectorAll("[data-close]").forEach(x => x.addEventListener("click", closeVideo));

  /* image lightbox */
  const imgM = document.getElementById("imgModal"), imgPic = document.getElementById("imgModalPic");
  document.querySelectorAll("[data-lightbox]").forEach(b => b.addEventListener("click", () => {
    imgPic.src = b.dataset.lightbox; imgPic.alt = b.dataset.alt || "Enlarged image";
    imgM.hidden = false; document.body.style.overflow = "hidden";
    imgM.querySelector(".modal-x").focus();
  }));
  const closeImg = () => { imgM.hidden = true; document.body.style.overflow = ""; };
  imgM.querySelectorAll("[data-close-img]").forEach(x => x.addEventListener("click", closeImg));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { if (!modal.hidden) closeVideo(); if (!imgM.hidden) closeImg(); }
  });

  /* mobile menu */
  const menuBtn = document.getElementById("menuBtn"), nav = document.getElementById("siteNav");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open); menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false");
  }));

  /* scrollspy */
  const links = [...document.querySelectorAll(".nav-link")];
  const secs = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    }
  }), { rootMargin: "-40% 0px -55% 0px" });
  secs.forEach(s => spy.observe(s));

  /* reveal */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* newsletter (demo) */
  document.getElementById("newsForm").addEventListener("submit", e => {
    e.preventDefault();
    const em = document.getElementById("newsEmail").value.trim();
    document.getElementById("newsMsg").textContent = em ? `Thank you — ${em} is noted for the official list.` : "";
    e.target.reset();
  });
})();
