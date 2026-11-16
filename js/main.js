(function () {
  'use strict';

  /* ============================================================
     SETTINGS — the three things Mae is most likely to change
     ============================================================ */

  // Optional hero background: link to a short, silent .mp4 (keep it under ~4 MB).
  // Leave empty to use the still frame.
  const HERO_VIDEO_URL = "";

  // Contact form: paste the Formspree endpoint, e.g. "https://formspree.io/f/abcdwxyz"
  // (Netlify Forms: use "/" and add data-netlify="true" + name="contact" to the <form>).
  const FORM_ENDPOINT = "";

  /* ============================================================
     THE WORK — one line per video
     ------------------------------------------------------------
     id ......... the YouTube ID (the part after "v=" or "youtu.be/")
     title ...... shown on the card and in the player
     cat ........ "Shorts" | "Documentaries" | "Trailers" | "Online content"
     year ....... optional
     roles ...... credit line
     client ..... optional, shown as "for ..." in the credit line
     blurb ...... optional; leave "" to show none
     featured ... true puts it first as the large lead card
     mature ..... true adds the "Contains mature themes" tag
     thumb ...... optional; "hqdefault" for a video that has no large thumbnail
     date ....... optional upload date "2021-06-30" (helps Google's video results)

     Titles for Trailers and Online Content were taken from YouTube and
     tidied. To pull the current YouTube titles again, open the live site,
     press F12, paste this into the Console and press Enter:

       Promise.all(WORKS_IDS.map(id =>
         fetch("https://www.youtube.com/oembed?format=json&url=https://youtu.be/" + id)
           .then(r => r.json()).then(d => id + "  " + d.title)
       )).then(lines => console.log(lines.join("\n")));
     ============================================================ */
  const WORKS = [
    // SHORTS
    { id:"GI3UKxSDj0I", title:"Prapastie", cat:"Shorts", year:"2021", roles:"Videographer · Director · Writer · Editor",
      blurb:"Made for a short film competition asking “Where do we go from here?”, a response to how the pandemic changed our lives and who we have become.", featured:true },
    { id:"PMwdl4cGnpw", title:"The Slut I Am", cat:"Shorts", roles:"Director · Writer · Editor", mature:true,
      blurb:"The culmination of the project “That Evil Cunt”: interviews, photos and film exploring four people’s relationship to their sexuality, born from an essay of the same name." },
    { id:"XH2qRTDVZ64", title:"The Principles of the Honourable Harvest", cat:"Shorts", roles:"Director · Videographer · Editor",
      blurb:"The first short film she ever edited: building an edible garden and tending it by the principles in Robin Wall Kimmerer’s Braiding Sweetgrass." },

    // DOCUMENTARIES
    { id:"2_eX2rK1Tt0", title:"Song of Many Tongues", cat:"Documentaries", roles:"Editor", thumb:"hqdefault",
      blurb:"Cut from 8 hours of behind-the-scenes footage of the Grand Union Orchestra’s anniversary event; a love letter to Tony, its conductor and leader of 40 years." },
    { id:"H-8UIDlapWY", title:"Who Cares?", cat:"Documentaries", year:"2022", roles:"Director · Videographer · Editor",
      blurb:"A documentary on Goldsmiths, University of London after years of restructuring and strikes: how people cared for each other while care in universities was being reduced." },

    // TRAILERS
    { id:"uDjAal-GgDA", title:"The Poetry Brothel London", cat:"Trailers", year:"July 2022", roles:"Videographer · Editor", blurb:"" },
    { id:"HG_aN4tzcFs", title:"The Poetry Brothel London", cat:"Trailers", year:"September 2022", roles:"Videographer · Editor", blurb:"" },
    { id:"Z2fMysMho7A", title:"The Bloody Poets", cat:"Trailers", year:"April 2024", roles:"Videographer · Editor", blurb:"" },

    // ONLINE CONTENT
    { id:"TEkgX_PJ0GQ", title:"5-Minute Body Mindfulness Meditation", cat:"Online content", client:"Make Time Count", roles:"Videographer · Editor", blurb:"" },
    { id:"mt5Bj88nP8Y", title:"Talk to Your Body: A Guided Mindfulness Exercise", cat:"Online content", client:"Make Time Count", roles:"Videographer · Editor", blurb:"" },
    { id:"i0g7pakJUJg", title:"How to Love Yourself: A Guided Body-Positivity Exercise", cat:"Online content", client:"Make Time Count", roles:"Editor", blurb:"" },
    { id:"FAdU13JaKM0", title:"Daily Planning Routine: The Grid Method", cat:"Online content", client:"Make Time Count", roles:"Editor", blurb:"" },
    { id:"t5g8tLZDOuQ", title:"How to Organise Your Life, Study and Self-Care", cat:"Online content", client:"Make Time Count", roles:"Editor", blurb:"" },
    { id:"DftoNwmYRsw", title:"5 Tips for the Best Start to a Successful Year", cat:"Online content", client:"Make Time Count", roles:"Editor", blurb:"" },
    { id:"p4ev4xPnndY", title:"Let Your Inner Light Shine: A Short Guided Reflection", cat:"Online content", client:"Make Time Count", roles:"Editor", blurb:"" },
    { id:"0HAy9xZ6hpM", title:"Design the Life You Want: A Guided Clarity Exercise", cat:"Online content", client:"Make Time Count", roles:"Editor", blurb:"" },
    { id:"kgpBN4-eIr4", title:"How to Connect with Others When You Feel You Don’t Belong", cat:"Online content", client:"Make Time Count", roles:"Editor", blurb:"" },
    { id:"ZDeGF5ML2UM", title:"Beat Perfectionism: Tools to Silence Your Inner Critic", cat:"Online content", client:"Make Time Count", roles:"Editor", blurb:"" },
  ];

  const CATEGORIES = ["All", "Shorts", "Documentaries", "Trailers", "Online content"];
  const LARGE_CATS = ["Shorts", "Documentaries"]; // shown as large editorial cards with the blurb

  /* ============================================================
     Nothing below here needs editing
     ============================================================ */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  // De-duplicate by video ID (the same video listed twice is shown once)
  const seen = new Set();
  const works = WORKS.filter((w) => w && w.id && !seen.has(w.id) && seen.add(w.id));
  window.WORKS_IDS = works.map((w) => w.id); // used by the title helper documented above

  const thumb = (id, size) => 'https://img.youtube.com/vi/' + id + '/' + (size || 'maxresdefault') + '.jpg';
  const creditLine = (w) => {
    const tail = [w.client ? 'for ' + w.client : '', w.year || ''].filter(Boolean).join(', ');
    return [w.roles, tail].filter(Boolean).join(' — ');
  };
  const PLAY_ICON = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 1.5v15l13-7.5z" fill="currentColor"/></svg>';

  /* ---------- Thumbnail fallback ----------
     maxresdefault does not exist for every video. YouTube answers either
     with a 404 (error event) or with a 120px grey placeholder (load event),
     so both are checked. */
  function fallbackThumb(img) {
    if (img.dataset.fallback) return;
    img.dataset.fallback = '1';
    img.src = thumb(img.dataset.id, 'hqdefault');
  }
  document.addEventListener('error', (e) => {
    if (e.target.matches && e.target.matches('img[data-id]')) fallbackThumb(e.target);
  }, true);
  document.addEventListener('load', (e) => {
    const t = e.target;
    if (t.matches && t.matches('img[data-id]') && t.naturalWidth && t.naturalWidth <= 120) fallbackThumb(t);
  }, true);

  /* ---------- Scroll reveals ---------- */
  const revealObserver = ('IntersectionObserver' in window && !reducedMotion)
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('is-visible'); revealObserver.unobserve(en.target); }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' })
    : null;
  function watchReveals(root) {
    (root || document).querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      if (revealObserver) revealObserver.observe(el); else el.classList.add('is-visible');
    });
  }

  /* ---------- Work grid ---------- */
  const gridFeature = $('#grid-feature');
  const gridCompact = $('#grid-compact');
  const gridDivider = $('#grid-divider');
  const grids = $('#grids');
  const filtersEl = $('#filters');
  const filterStatus = $('#filter-status');
  let currentFilter = 'All';
  let currentList = [];

  function cardHTML(w, index, large, layout, order) {
    const tags = '<span class="tag">' + esc(w.cat) + '</span>' +
      (w.mature ? '<span class="tag tag--mature">Contains mature themes</span>' : '');
    const blurb = (large && w.blurb) ? '<p class="card__blurb">' + esc(w.blurb) + '</p>' : '';
    return '' +
      '<li class="reveal ' + layout + '" style="--i:' + Math.min(order, 5) + '">' +
        '<article class="card">' +
          '<button class="card__btn" type="button" data-play="' + index + '" aria-label="Play ' + esc(w.title) + (w.year ? ', ' + esc(w.year) : '') + '">' +
            '<span class="frame"><span class="frame__img">' +
              '<img src="' + thumb(w.id, w.thumb) + '" data-id="' + esc(w.id) + '" alt="" width="1280" height="720" loading="lazy" decoding="async">' +
              '<span class="play' + (large ? '' : ' play--sm') + '">' + PLAY_ICON + '</span>' +
            '</span></span>' +
          '</button>' +
          '<div class="card__body">' +
            '<div class="card__tags">' + tags + '</div>' +
            '<h3 class="card__title">' + esc(w.title) + '</h3>' +
            '<p class="mono card__credit">' + esc(creditLine(w)) + '</p>' +
            blurb +
          '</div>' +
        '</article>' +
      '</li>';
  }

  function render() {
    const list = works.filter((w) => currentFilter === 'All' || w.cat === currentFilter);
    const large = list.filter((w) => LARGE_CATS.includes(w.cat));
    const compact = list.filter((w) => !LARGE_CATS.includes(w.cat));

    // Featured film leads; a film with mature themes is never the first card.
    large.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    if (large.length > 1 && large[0].mature) {
      const swap = large.findIndex((w) => !w.mature);
      if (swap > 0) large.unshift(large.splice(swap, 1)[0]);
    }

    currentList = large.concat(compact);

    // Editorial layout: an odd count gets a full-width lead, the rest pair up 7/5 then 5/7.
    const hasLead = large.length % 2 === 1;
    gridFeature.innerHTML = large.map((w, i) => {
      let layout = 'work--lead';
      if (!(hasLead && i === 0)) {
        const n = hasLead ? i - 1 : i;
        const pair = Math.floor(n / 2), first = n % 2 === 0;
        layout = (pair % 2 === 0) === first ? 'work--wide' : 'work--narrow';
      }
      return cardHTML(w, i, true, layout, i % 2);
    }).join('');
    gridCompact.innerHTML = compact.map((w, i) => cardHTML(w, large.length + i, false, '', i % 3)).join('');

    gridFeature.hidden = !large.length;
    gridCompact.hidden = !compact.length;
    gridDivider.hidden = !(large.length && compact.length);
    watchReveals(grids);
  }

  function setFilter(cat) {
    if (cat === currentFilter) return;
    currentFilter = cat;
    filtersEl.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === cat)));
    grids.classList.add('is-switching');
    window.setTimeout(() => {
      render();
      grids.classList.remove('is-switching');
      filterStatus.textContent = 'Showing ' + currentList.length + (currentList.length === 1 ? ' film' : ' films') + (cat === 'All' ? '' : ' in ' + cat);
    }, reducedMotion ? 0 : 240);
  }

  filtersEl.innerHTML = CATEGORIES
    .filter((cat) => cat === 'All' || works.some((w) => w.cat === cat))
    .map((cat) => {
      const n = cat === 'All' ? works.length : works.filter((w) => w.cat === cat).length;
      return '<button class="chip" type="button" data-cat="' + esc(cat) + '" aria-pressed="' + (cat === 'All') + '">' +
        esc(cat) + '<span class="chip__n" aria-hidden="true">' + n + '</span></button>';
    }).join('');
  filtersEl.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) setFilter(chip.dataset.cat);
  });
  grids.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-play]');
    if (btn) openPlayer(currentList, Number(btn.dataset.play), btn);
  });

  /* ---------- Video modal ---------- */
  const player = $('#player');
  const playerVideo = $('#player-video');
  const playerTitle = $('#player-title');
  const playerCredit = $('#player-credit');
  const playerBlurb = $('#player-blurb');
  const playerYt = $('#player-yt');
  const playerNav = $('#player-nav');
  const playerCount = $('#player-count');
  let playerList = [], playerIndex = 0, playerTrigger = null;

  function showVideo(i) {
    const n = playerList.length;
    playerIndex = (i + n) % n;
    const w = playerList[playerIndex];

    // The iframe is only ever created here, on demand. Never preloaded.
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(w.id) + '?autoplay=1&rel=0&modestbranding=1';
    iframe.title = w.title;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    playerVideo.replaceChildren(iframe);

    playerTitle.textContent = w.title;
    playerCredit.textContent = creditLine(w);
    playerBlurb.textContent = w.blurb || '';
    playerYt.href = 'https://youtu.be/' + encodeURIComponent(w.id);
    playerYt.setAttribute('aria-label', 'Open ' + w.title + ' on YouTube (opens in a new tab)');
    playerNav.hidden = n < 2;
    playerCount.textContent = String(playerIndex + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
  }

  function openPlayer(list, index, trigger) {
    if (!list.length) return;
    playerList = list;
    playerTrigger = trigger || null;
    showVideo(index);
    document.documentElement.classList.add('is-locked');
    if (typeof player.showModal === 'function') player.showModal(); else player.setAttribute('open', '');
    $('#player-close').focus();
  }

  function closePlayer() {
    if (typeof player.close === 'function' && player.open) player.close(); else { player.removeAttribute('open'); onPlayerClosed(); }
  }
  function onPlayerClosed() {
    playerVideo.replaceChildren(); // destroy the iframe so audio stops
    document.documentElement.classList.remove('is-locked');
    if (playerTrigger && document.contains(playerTrigger)) playerTrigger.focus();
    playerTrigger = null;
  }

  player.addEventListener('close', onPlayerClosed);            // also fires on Esc
  player.addEventListener('click', (e) => { if (e.target === player) closePlayer(); }); // backdrop
  $('#player-close').addEventListener('click', closePlayer);
  $('#player-prev').addEventListener('click', () => showVideo(playerIndex - 1));
  $('#player-next').addEventListener('click', () => showVideo(playerIndex + 1));
  player.addEventListener('keydown', (e) => {
    if (playerList.length < 2) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); showVideo(playerIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); showVideo(playerIndex + 1); }
  });

  /* ---------- Hero ---------- */
  const heroMedia = $('#hero-media');
  if (HERO_VIDEO_URL && !reducedMotion) {
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.poster = heroMedia.querySelector('img').src;
    v.src = HERO_VIDEO_URL;
    v.addEventListener('canplay', () => heroMedia.replaceChildren(v), { once: true });
    v.load();
  }
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));

  /* ---------- Header: scrolled state, mobile menu, active link ---------- */
  const header = $('#site-header');
  const navToggle = $('#nav-toggle');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  function setMenu(open) {
    header.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.textContent = open ? 'Close' : 'Menu';
  }
  navToggle.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
  $('#site-nav').addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) { setMenu(false); navToggle.focus(); }
  });
  window.matchMedia('(min-width: 720px)').addEventListener('change', () => setMenu(false));

  if ('IntersectionObserver' in window) {
    const links = {};
    document.querySelectorAll('.nav__link').forEach((a) => { links[a.getAttribute('href').slice(1)] = a; });
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const link = links[en.target.id];
        if (!link) return;
        if (en.isIntersecting) {
          Object.values(links).forEach((a) => a.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        } else if (link.getAttribute('aria-current')) {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach((id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Contact form ---------- */
  const form = $('#contact-form');
  const formStatus = $('#form-status');
  const submitBtn = $('#form-submit');
  const rules = {
    'f-name': (v) => v.trim() ? '' : 'Please add your name.',
    'f-email': (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please add a valid email address.',
    'f-type': (v) => v ? '' : 'Please choose a project type.',
    'f-message': (v) => v.trim().length >= 10 ? '' : 'Please tell me a little about the project.',
  };
  function validateField(id) {
    const el = document.getElementById(id);
    const msg = rules[id](el.value);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    document.getElementById(id + '-err').textContent = msg;
    return !msg;
  }
  Object.keys(rules).forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('blur', () => { if (el.value || el.getAttribute('aria-invalid') === 'true') validateField(id); });
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') validateField(id); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = Object.keys(rules).filter((id) => !validateField(id));
    if (invalid.length) {
      formStatus.textContent = 'Please check the highlighted fields.';
      document.getElementById(invalid[0]).focus();
      return;
    }
    if (!FORM_ENDPOINT) {
      formStatus.textContent = 'The form is not connected yet. Please use the email address instead.';
      return;
    }
    submitBtn.disabled = true;
    formStatus.textContent = 'Sending…';
    fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then((res) => { if (!res.ok) throw new Error('Request failed'); })
      .then(() => {
        const done = document.createElement('div');
        done.className = 'form__done';
        done.setAttribute('role', 'status');
        done.tabIndex = -1;
        done.innerHTML = '<p class="mono">Message sent</p><h3>Thank you</h3><p>Your message is on its way. I will reply as soon as I can.</p>';
        $('#form-wrap').replaceChildren(done);
        done.focus();
      })
      .catch(() => {
        submitBtn.disabled = false;
        formStatus.textContent = 'Something went wrong and the message was not sent. Please try again, or use the email address instead.';
      });
  });

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- VideoObject schema, generated from WORKS ---------- */
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': works.map((w) => Object.assign({
      '@type': 'VideoObject',
      name: w.title,
      description: w.blurb || (w.title + ' — ' + creditLine(w)),
      thumbnailUrl: thumb(w.id, 'hqdefault'),
      embedUrl: 'https://www.youtube-nocookie.com/embed/' + w.id,
      contentUrl: 'https://youtu.be/' + w.id,
      genre: w.cat,
      creator: { '@id': '#mae' },
    }, w.date ? { uploadDate: w.date } : {})),
  });
  document.head.appendChild(ld);

  /* ---------- Go ---------- */
  render();
  watchReveals(document);
})();
