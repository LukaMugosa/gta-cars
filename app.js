/* ==========================================================
   GTA Cars — fetches cars.json, renders featured/listing/detail
   ========================================================== */

(function () {
  const SPEC_LABELS = {
    engine: 'Motor',
    power: 'Snaga',
    displacement: 'Zapremina',
    drive: 'Pogon',
    body: 'Karoserija',
    color: 'Boja',
    doors: 'Vrata',
    seats: 'Sjedišta',
  };

  const FEATURED_COUNT = 6;

  const formatPrice = (n) => (n == null ? 'Po dogovoru' : '€' + n.toLocaleString('de-DE'));
  const formatKm = (n) => n.toLocaleString('de-DE') + ' km';
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- card ----------
  function renderCard(car) {
    const badge = car.sold
      ? `<span class="badge sold">PRODATO</span>`
      : car.badge
      ? `<span class="badge${car.badge === 'NOVO' ? ' alt' : ''}">${esc(car.badge)}</span>`
      : '';
    return `
      <article class="car${car.sold ? ' is-sold' : ''}">
        ${badge}
        <a class="car-link" href="auto.html?id=${car.id}" aria-label="${esc(car.name)} — detalji">
          <div class="car-img-wrap">
            <img loading="lazy" src="${esc(car.headImage)}" alt="${esc(car.name)}" />
          </div>
          <div class="car-body">
            <h3>${esc(car.name)}</h3>
            <ul class="car-meta">
              <li>${car.year}</li>
              <li>${formatKm(car.km)}</li>
              <li>${esc(car.transmission)}</li>
              <li>${esc(car.fuel)}</li>
            </ul>
            <div class="car-foot">
              <div class="price">${formatPrice(car.price)}</div>
              <span class="more">Detaljnije →</span>
            </div>
          </div>
        </a>
      </article>
    `;
  }

  // ---------- featured (homepage) ----------
  function renderFeatured(cars) {
    const grid = document.getElementById('featured-cars-grid');
    if (!grid) return;
    grid.innerHTML = cars.slice(0, FEATURED_COUNT).map(renderCard).join('');
  }

  // ---------- listing ----------
  function renderListing(cars) {
    const grid = document.getElementById('all-cars-grid');
    if (!grid) return;
    grid.innerHTML = cars.map(renderCard).join('');
    const count = document.getElementById('car-count');
    if (count) count.textContent = cars.length;
  }

  // ---------- detail ----------
  function renderDetail(cars) {
    const root = document.getElementById('car-detail');
    if (!root) return;

    const id = new URLSearchParams(location.search).get('id');
    const car = cars.find((c) => c.id === Number(id));

    if (!car) {
      root.innerHTML = `
        <div class="detail-missing">
          <div class="kicker">// 404</div>
          <h1>Vozilo nije pronađeno</h1>
          <p>Možda je već prodato ili link nije ispravan.</p>
          <a class="btn btn-primary" href="vozila.html">← Sva vozila</a>
        </div>`;
      document.title = 'Vozilo nije pronađeno — GTA Cars';
      return;
    }

    document.title = `${car.name} — GTA Cars Podgorica`;

    const gallery = [car.headImage, ...car.images];

    const thumbs = gallery
      .map(
        (src, i) => `
        <button type="button" class="gal-thumb${i === 0 ? ' is-active' : ''}" data-idx="${i}" aria-label="Slika ${i + 1}">
          <img loading="lazy" src="${esc(src)}" alt="" />
        </button>`
      )
      .join('');

    const specRows = Object.entries(car.specs)
      .map(
        ([k, v]) => `
        <div class="spec">
          <dt>${esc(SPEC_LABELS[k] || k)}</dt>
          <dd>${esc(String(v))}</dd>
        </div>`
      )
      .join('');

    const features = car.features
      .map((f) => `<li><span class="bullet">▰</span> ${esc(f)}</li>`)
      .join('');

    root.innerHTML = `
      <nav class="crumbs" aria-label="Navigacija">
        <a href="index.html">Početna</a>
        <span>›</span>
        <a href="vozila.html">Vozila</a>
        <span>›</span>
        <span class="crumbs-current">${esc(car.name)}</span>
      </nav>

      <div class="detail-grid">

        <section class="gallery" aria-label="Galerija slika">
          <div class="gal-stage">
            <img class="gal-main" src="${esc(gallery[0])}" alt="${esc(car.name)}" />
            <button class="gal-arrow gal-prev" type="button" aria-label="Prethodna slika">‹</button>
            <button class="gal-arrow gal-next" type="button" aria-label="Sljedeća slika">›</button>
            <div class="gal-counter"><span class="gal-i">1</span> / ${gallery.length}</div>
            ${car.sold
              ? `<span class="badge sold gal-badge">PRODATO</span>`
              : car.badge
                ? `<span class="badge${car.badge === 'NOVO' ? ' alt' : ''} gal-badge">${esc(car.badge)}</span>`
                : ''}
          </div>
          <div class="gal-thumbs">${thumbs}</div>
        </section>

        <aside class="detail-aside">
          <div class="kicker">// ${String(car.id).padStart(2, '0')} u ponudi</div>
          <h1>${esc(car.name)}</h1>
          <ul class="car-meta detail-meta">
            <li>${car.year}</li>
            <li>${formatKm(car.km)}</li>
            <li>${esc(car.transmission)}</li>
            <li>${esc(car.fuel)}</li>
          </ul>
          ${car.sold ? '<div class="sold-stamp">Prodato</div>' : ''}
          <div class="detail-price${car.sold ? ' is-sold' : ''}">${formatPrice(car.price)}</div>

          <div class="detail-cta">
            <a class="btn btn-primary" href="tel:+38267388688"><span class="arr">►</span> Pozovi</a>
            <a class="btn btn-ghost" href="https://wa.me/38267388688?text=${encodeURIComponent('Zdravo, zanima me ' + car.name)}" target="_blank" rel="noopener">WhatsApp</a>
          </div>

          <div class="detail-note">
            <span class="dot-cyan">●</span> Provjereno · Zamjena moguća
          </div>
        </aside>

        <section class="detail-body">
          <div class="detail-block">
            <div class="kicker">// Opis</div>
            <p>${esc(car.description)}</p>
          </div>

          <div class="detail-block">
            <div class="kicker">// Specifikacija</div>
            <dl class="specs-grid">${specRows}</dl>
          </div>

          <div class="detail-block">
            <div class="kicker">// Oprema</div>
            <ul class="value-list features-list">${features}</ul>
          </div>
        </section>

      </div>
    `;

    initGallery(root, gallery);
    renderRelated(cars, car);
  }

  // ---------- gallery / carousel ----------
  function initGallery(root, images) {
    const main = root.querySelector('.gal-main');
    const counter = root.querySelector('.gal-i');
    const thumbs = root.querySelectorAll('.gal-thumb');
    const prev = root.querySelector('.gal-prev');
    const next = root.querySelector('.gal-next');
    let idx = 0;

    // ---- lightbox ----
    let lb = document.querySelector('.lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', 'Galerija — uvećan prikaz');
      lb.innerHTML = `
        <button class="lb-close" type="button" aria-label="Zatvori">×</button>
        <button class="lb-arrow lb-prev" type="button" aria-label="Prethodna slika">‹</button>
        <button class="lb-arrow lb-next" type="button" aria-label="Sljedeća slika">›</button>
        <img class="lb-img" src="" alt="" />
        <div class="lb-counter"><span class="lb-i">1</span> / <span class="lb-total">1</span></div>
      `;
      document.body.appendChild(lb);
    }
    const lbImg = lb.querySelector('.lb-img');
    const lbCounter = lb.querySelector('.lb-i');
    const lbTotal = lb.querySelector('.lb-total');
    const lbClose = lb.querySelector('.lb-close');
    const lbPrev = lb.querySelector('.lb-prev');
    const lbNext = lb.querySelector('.lb-next');
    let lbOpen = false;

    function show(i) {
      idx = (i + images.length) % images.length;
      main.style.opacity = '0';
      setTimeout(() => {
        main.src = images[idx];
        main.style.opacity = '1';
      }, 120);
      counter.textContent = idx + 1;
      thumbs.forEach((t, j) => t.classList.toggle('is-active', j === idx));
      if (lbOpen) {
        lbImg.src = images[idx];
        lbCounter.textContent = idx + 1;
      }
    }

    function openLightbox() {
      lbImg.src = images[idx];
      lbImg.alt = main.alt || '';
      lbCounter.textContent = idx + 1;
      lbTotal.textContent = images.length;
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      lbOpen = true;
    }
    function closeLightbox() {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
      lbOpen = false;
    }

    prev.addEventListener('click', () => show(idx - 1));
    next.addEventListener('click', () => show(idx + 1));
    thumbs.forEach((t, j) => t.addEventListener('click', () => show(j)));

    // open lightbox on main click
    main.addEventListener('click', openLightbox);

    // lightbox controls
    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
    lbPrev.addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); });
    lbNext.addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); });
    lbImg.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lbOpen) closeLightbox();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });

    // touch swipe on inline gallery
    let startX = null;
    main.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend', (e) => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(dx < 0 ? idx + 1 : idx - 1);
      startX = null;
    });

    // touch swipe in lightbox
    let lbStartX = null;
    lbImg.addEventListener('touchstart', (e) => { lbStartX = e.touches[0].clientX; }, { passive: true });
    lbImg.addEventListener('touchend', (e) => {
      if (lbStartX == null) return;
      const dx = e.changedTouches[0].clientX - lbStartX;
      if (Math.abs(dx) > 40) show(dx < 0 ? idx + 1 : idx - 1);
      lbStartX = null;
    });
  }

  // ---------- related ----------
  function renderRelated(cars, currentCar) {
    const wrap = document.getElementById('related-grid');
    if (!wrap) return;
    const others = cars.filter((c) => c.id !== currentCar.id);
    const picks = [];
    while (picks.length < 3 && others.length) {
      picks.push(others.splice(Math.floor(Math.random() * others.length), 1)[0]);
    }
    wrap.innerHTML = picks.map(renderCard).join('');
  }

  // ---------- boot ----------
  document.addEventListener('DOMContentLoaded', () => {
    const cars = window.CARS || [];
    renderFeatured(cars);
    renderListing(cars);
    renderDetail(cars);
  });
})();
