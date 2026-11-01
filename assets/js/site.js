/* base.js — small stand-ins for behaviour that every classic Wix site gets from Wix's own
   script. Each site adds its own extras after this (custom/<site>/site.js). */
(function () {
  'use strict';

  // Menu hover colours: Wix styles the hovered menu button through data-state="… over".
  document.querySelectorAll('.wixui-dropdown-menu__item').forEach(function (li) {
    function set(on) {
      var st = (li.getAttribute('data-state') || '').split(/\s+/).filter(function (x) { return x && x !== 'over'; });
      if (on) st.push('over');
      li.setAttribute('data-state', st.join(' '));
    }
    li.addEventListener('mouseenter', function () { set(true); });
    li.addEventListener('mouseleave', function () { set(false); });
  });

  // Videos that play by themselves on Wix (background videos, autoplay video boxes).
  document.querySelectorAll('video[autoplay]').forEach(function (v) {
    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  });

  // "Back to top" arrow on phones: appears after scrolling, takes you to the top.
  var btt = document.getElementById('BACK_TO_TOP_BUTTON');
  if (btt) {
    var show = function () {
      var on = window.scrollY > window.innerHeight * 0.5;
      btt.style.opacity = on ? '1' : '0';
      btt.style.visibility = on ? 'visible' : 'hidden';
      btt.style.transition = 'opacity .3s';
    };
    window.addEventListener('scroll', show, { passive: true });
    show();
    btt.style.cursor = 'pointer';
    btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // Links to a spot on the same page glide there, as on Wix.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a) return;
    var url = new URL(a.href, location.href);
    if (url.pathname.replace(/\/(m\.html)?$/, '') !== location.pathname.replace(/\/(m\.html)?$/, '')) return;
    var target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', url.hash);
  });
})();

/* aiaiai.ninja — behaviour that Wix's own scripts used to provide (the shared tools/base.js runs before this file).
   Plain JavaScript, no libraries. Every part is wrapped so that one failing part cannot stop the others. */
(function () {
  'use strict';
  var d = document, w = window;
  var isPhone = d.documentElement.getAttribute('data-device') === 'mobile';

  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function byId(id) { return d.getElementById(id); }
  function on(el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt); }
  function part(name, fn) { try { fn(); } catch (e) { if (w.console) console.warn('[site.js] ' + name + ':', e); } }
  function normPath(p) { return p.replace(/\/(m\.html|index\.html)$/, '').replace(/\/+$/, '') || '/'; }
  function smoothTop() { try { w.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { w.scrollTo(0, 0); } }
  function smoothTo(el) { try { w.scrollTo({ top: el.getBoundingClientRect().top + w.pageYOffset, behavior: 'smooth' }); } catch (e) { el.scrollIntoView(); } }
  function setBool(el, name, on_) { if (!el) return; if (on_) el.setAttribute(name, ''); else el.removeAttribute(name); }
  function raf(fn) { return (w.requestAnimationFrame || w.setTimeout)(fn, 16); }

  /* ------------------------------------------------------------------ phone menu (full-screen, opened by the burger icon) */
  var menuApi = { close: function () {}, isOpen: function () { return false; } };
  part('phone menu', function () {
    var menu = byId('MENU_AS_CONTAINER'), toggle = byId('MENU_AS_CONTAINER_TOGGLE');
    if (!menu || !toggle) return;
    var overlay = byId('overlay-MENU_AS_CONTAINER'), box = byId('container-MENU_AS_CONTAINER');
    var icon = $('.vlJDcR', toggle), bars = $('.pp3XSB', toggle);
    var labelClosed = toggle.getAttribute('aria-label') || 'Otevřít nabídku navigace';
    var labelOpen = 'Zavřít menu navigace';
    var open = false, running = [];
    function stopAnims() { running.forEach(function (a) { try { a.cancel(); } catch (e) {} }); running = []; }
    function animate(el, frames, opts) {
      if (!el.animate) return null;
      var a = el.animate(frames, opts); running.push(a); return a;
    }
    function setToggleState(on_) {
      [toggle, icon].forEach(function (el, i) { if (el) el.classList[on_ ? 'add' : 'remove']('d0L2ow'); });
      if (bars) bars.classList[on_ ? 'add' : 'remove']('sqDofR');
      toggle.setAttribute('aria-label', on_ ? labelOpen : labelClosed);
    }
    function openMenu() {
      if (open) return; open = true; stopAnims();
      menu.setAttribute('data-undisplayed', 'false');
      overlay.style.cssText = 'opacity:0;visibility:inherit';
      box.style.cssText = 'opacity:0;transform:translate(0px,-50px);visibility:inherit';
      void menu.offsetWidth;
      menu.classList.add('I_VSKP');
      d.body.classList.add('siteScrollingBlockedIOSFix');
      setToggleState(true);
      var fin = function () { overlay.style.cssText = 'opacity:1;visibility:inherit'; box.style.cssText = 'visibility:inherit'; };
      animate(overlay, [{ opacity: 0 }, { opacity: 1 }], { duration: 507, delay: 12, easing: 'cubic-bezier(.64,-.05,.38,1.04)', fill: 'both' });
      animate(box, [{ opacity: 0 }, { opacity: 1 }], { duration: 507, delay: 12, easing: 'cubic-bezier(.64,-.05,.38,1.04)', fill: 'both' });
      var t = animate(box, [{ transform: 'translate(0px,-50px)' }, { transform: 'translate(0px,0px)' }], { duration: 490, delay: 20, easing: 'cubic-bezier(.47,.02,.52,.93)', fill: 'both' });
      if (t) t.onfinish = function () { if (open) { stopAnims(); fin(); } }; else fin();
      var first = $('a', menu); if (first) { try { first.focus({ preventScroll: true }); } catch (e) {} }
    }
    function closeMenu(instant) {
      if (!open) return; open = false; stopAnims();
      setToggleState(false);
      var end = function () {
        if (open) return;
        stopAnims();
        menu.classList.remove('I_VSKP'); menu.setAttribute('data-undisplayed', 'true');
        overlay.removeAttribute('style'); box.removeAttribute('style');
        d.body.classList.remove('siteScrollingBlockedIOSFix');
      };
      if (instant || !menu.animate) { end(); return; }
      overlay.style.cssText = 'opacity:1;visibility:inherit'; box.style.cssText = 'visibility:inherit';
      animate(box, [{ opacity: 1 }, { opacity: 0 }], { duration: 544, easing: 'cubic-bezier(.34,1,.72,1)', fill: 'both' });
      animate(box, [{ transform: 'translate(0px,0px)' }, { transform: 'translate(0px,-57px)' }], { duration: 495, easing: 'cubic-bezier(.4,-.02,.75,.61)', fill: 'both' });
      var o = animate(overlay, [{ opacity: 1 }, { opacity: 0 }], { duration: 476, delay: 19, easing: 'cubic-bezier(.7,-.05,.89,.79)', fill: 'both' });
      var timer = setTimeout(end, 520);
      if (o) o.onfinish = function () { clearTimeout(timer); end(); };
    }
    menuApi.close = closeMenu; menuApi.isOpen = function () { return open; };
    on(toggle, 'click', function () { if (open) closeMenu(); else openMenu(); });
    on(toggle, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); } });
  });

  /* ------------------------------------------------------------------ links to the page you are already on, and anchors */
  part('links', function () {
    // "Home" while on the home page: Wix scrolled to the top instead of reloading
    on(d, 'click', function (e) {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      var tgt = a.getAttribute('target'); if (tgt && tgt !== '_self') return;
      var url; try { url = new URL(a.href, location.href); } catch (x) { return; }
      if (url.origin !== location.origin || /^\/_files\//.test(url.pathname)) return;
      if (normPath(url.pathname) !== normPath(location.pathname)) return;
      if (url.hash) return;
      e.preventDefault(); menuApi.close(); smoothTop();
    });
    // phone-menu entries that jump to a place on the home page (data-anchor) — Wix keeps the address clean, no "#…"
    on(d, 'click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-anchor]'); if (!a) return;
      var url; try { url = new URL(a.href, location.href); } catch (x) { return; }
      if (normPath(url.pathname) !== normPath(location.pathname)) return;     // other page: normal navigation, handled on arrival
      e.preventDefault(); e.stopPropagation();
      menuApi.close();
      var el = url.hash && byId(decodeURIComponent(url.hash.slice(1)));
      if (el) smoothTo(el); else smoothTop();
    }, true);
    // arriving with "#comp-…": go there once, then clean the address bar
    var h = location.hash;
    if (h && h.length > 1) {
      var go = function () {
        var el = byId(decodeURIComponent(h.slice(1)));
        if (el) el.scrollIntoView(); else if (h === '#top') w.scrollTo(0, 0); else return;
        try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      };
      if (d.readyState === 'complete') go(); else on(w, 'load', function () { setTimeout(go, 0); });
    }
    // "Skip to main content" button (visible for keyboard users)
    var skip = byId('SKIP_TO_CONTENT_BTN');
    on(skip, 'click', function () { var m = byId('PAGES_CONTAINER'); if (m) { m.focus(); m.scrollIntoView(); } });
  });

  /* ------------------------------------------------------------------ "back to top" arrow (phone) */
  part('back to top', function () {
    var old = byId('BACK_TO_TOP_BUTTON'); if (!old) return;
    var btn = old.cloneNode(true);                     // drops the simpler stand-in from tools/base.js
    btn.removeAttribute('style'); old.parentNode.replaceChild(btn, old);
    var pending = 0, hideTimer = 0, shown = false;
    function check() {
      pending = 0;
      if (shown || w.pageYOffset <= 500) return;
      shown = true; btn.classList.add('z7UpAt');
      hideTimer = setTimeout(function () { shown = false; btn.classList.remove('z7UpAt'); }, 3000);
    }
    on(w, 'scroll', function () { if (!pending) pending = setTimeout(check, 100); }, { passive: true });
    on(btn, 'click', smoothTop);
  });

  /* ------------------------------------------------------------------ video boxes + background videos */
  part('videos', function () {
    function load(v) { var s = v.getAttribute('data-lazy-src'); if (s && !v.getAttribute('src')) v.setAttribute('src', s); }
    function tryPlay(v) { load(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    var vids = $$('wix-video video');
    function sync(v) { var vis = v.__vis; if (vis && v.__want) { if (v.paused) tryPlay(v); } else if (!v.paused) v.pause(); }
    vids.forEach(function (v) {
      v.__want = v.hasAttribute('autoplay');
      v.muted = v.hasAttribute('muted');
      on(v, 'playing', function () {                   // first frame is there: fade the poster away
        var wv = v.closest('wix-video'), p = wv && $('.bgVideoposter', wv);
        if (p) p.style.opacity = '0';
        v.style.opacity = '1';
      });
    });
    if ('IntersectionObserver' in w) {
      var lazy = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { load(e.target); lazy.unobserve(e.target); } }); }, { rootMargin: '450px 0px' });
      var vis = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.__vis = e.isIntersecting; sync(e.target); }); }, { threshold: 0 });
      vids.forEach(function (v) { lazy.observe(v); vis.observe(v); });
    } else vids.forEach(function (v) { v.__vis = true; load(v); sync(v); });

    $$('.wixui-video-box').forEach(function (R) {
      var v = $('video', R); if (!v) return;
      var btn = $('.UeoHYs', R), audio = $('[data-testid="vb-audio"]', R);
      var autoplay = v.hasAttribute('autoplay');
      var hoverMode = !autoplay && v.hasAttribute('muted');   // silent clips play while the mouse is over them
      var touching = false, touchTimer = 0, audioTimer = 0, started = false;
      on(v, 'canplay', function () { R.setAttribute('data-can-play', ''); });
      on(v, 'playing', function () { started = true; });
      function pressed(on_) { if (btn) btn.setAttribute('aria-pressed', on_ ? 'true' : 'false'); }
      function play() { v.__want = true; sync(v); if (v.paused) tryPlay(v); }
      function pause() { v.__want = false; v.pause(); }
      function pin(on_) { setBool(R, 'data-playing', on_); pressed(on_); }
      function showAudio(timed) {
        R.setAttribute('data-show-audio', '');
        if (timed) { clearTimeout(audioTimer); audioTimer = setTimeout(function () { R.removeAttribute('data-show-audio'); }, 2000); }
      }
      function toggle() { if (v.__want) { pause(); pin(false); } else { v.__vis = true; play(); pin(true); } }
      on(R, 'mouseenter', function () {
        if (touching) return;
        if (!hoverMode) R.setAttribute('data-roll-in', '');
        if (hoverMode) { v.__vis = true; play(); pressed(true); }
        if (!v.paused || started) showAudio();
      });
      on(R, 'mousemove', function () { if (!touching && (!v.paused || started)) showAudio(); });
      on(R, 'mouseleave', function () {
        if (touching) return;
        R.removeAttribute('data-roll-in'); R.removeAttribute('data-show-audio');
        if (hoverMode) pause();
      });
      on(R, 'touchstart', function () {
        touching = true; R.setAttribute('data-touched', 'on');
        clearTimeout(touchTimer);
        touchTimer = setTimeout(function () { touching = false; R.setAttribute('data-touched', 'off'); }, 1400);
      }, { passive: true });
      on(R, 'click', function (e) {
        if (audio && audio.contains(e.target)) return;
        if (touching) {                                  // first tap on a running (or paused, already played) clip only shows the controls
          if ((v.__want || started) && !R.hasAttribute('data-show-audio')) { showAudio(true); return; }
          toggle(); showAudio(true); return;
        }
        toggle(); if (!v.paused || started) showAudio();
      });
      on(btn, 'keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === btn) { e.preventDefault(); btn.click(); } });
      if (audio) {
        on(audio, 'click', function (e) {
          e.stopPropagation();
          v.muted = !v.muted;
          R.setAttribute('data-audio', v.muted ? 'off' : 'on');
          audio.setAttribute('aria-pressed', v.muted ? 'true' : 'false');
          if (touching) showAudio(true);
        });
        on(audio, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); audio.click(); } });
      }
    });
  });

  /* ------------------------------------------------------------------ entrance animation of the home headline */
  part('entrance animation', function () {
    var els = $$('[data-entrance]'); if (!els.length) return;
    var started = false;
    function start() {
      if (started) return; started = true;
      els.forEach(function (el) {
        el.style.animationPlayState = 'running';
        var anims = el.getAnimations ? el.getAnimations() : [];
        var done = function () { el.setAttribute('data-motion-enter', 'done'); el.style.animationPlayState = ''; };
        if (anims.length && w.Promise) Promise.all(anims.map(function (a) { return a.finished; })).then(done, done);
        else setTimeout(done, 2100);
      });
    }
    if (d.readyState === 'complete') setTimeout(start, 200); else { on(w, 'load', function () { setTimeout(start, 200); }); setTimeout(start, 1500); }
  });

  /* ------------------------------------------------------------------ galleries (Wix Pro Gallery) */
  // hover state of a gallery picture, as Wix's gallery script switched it (the dark veil itself is drawn by the Wix CSS)
  function itemHover(it, h) {
    var content = $('.gallery-item-content', it), hover = $('.gallery-item-hover', it);
    it.classList.toggle('item-container-regular', !h); it.classList.toggle('item-container-hover', h); it.classList.toggle('simulate-hover', h);
    if (content) { content.classList.toggle('item-content-regular', !h); content.classList.toggle('item-content-hover', h); }
    if (hover) {
      hover.classList.toggle('item-overlay-regular', !h); hover.classList.toggle('item-overlay-hover', h); hover.classList.toggle('force-hover', h);
      if (isPhone && it.hasAttribute('data-fs-src')) { hover.classList.toggle('hide-hover', !h); it.classList.toggle('hide-hover', !h); }   // phone: nothing shows until the first tap
    }
  }

  part('galleries', function () {
    var ORDER = ['6', '5', '1', '3', '2', '4'];          // order of the projects in the portfolio (Previous / Next Project)
    // hover overlay with the title (portfolio overview)
    $$('.gallery-item-container').forEach(function (it) {
      var hover = $('.gallery-item-hover', it);
      var linked = it.parentNode && it.parentNode.tagName === 'A';
      var act = $('.item-action', it), title = act ? act.getAttribute('aria-label') : '';
      function set(h) { itemHover(it, h); }
      if (isPhone && it.hasAttribute('data-fs-src')) return;   // project pages on the phone: first tap = hover, second tap = open (picture viewer below)
      on(it, 'mouseenter', function () {
        set(true);
        if (hover && linked && title && !hover.firstChild) {
          var t = d.createElement('span'); t.textContent = title;
          hover.innerHTML = '<div class="gallery-item-hover-inner"><div data-hook="info-element" style="height: 100%; width: 100%;"><div class="hover-info-element" data-hook="hover-info-element" style="height: 100%; box-sizing: border-box; padding: 0px 24px;"><div class="info-element-text" dir="auto" style="align-items: center; text-align: center; display: flex; place-content: center; direction: ltr;"><div><div class="info-member info-element-title" data-hook="item-title" style="overflow: hidden; margin-bottom: 0px; visibility: inherit; -webkit-line-clamp: none;"></div></div></div><div class="info-element-social info-align-center vertical-item info-element-social-absolute" data-hook="item-social"></div></div></div></div>';
          $('.info-element-title', hover).appendChild(t);
        }
      });
      on(it, 'mouseleave', function () { set(false); });
    });
    // Previous / Next Project buttons
    var m = location.pathname.match(/\/portfolio-collections\/my-portfolio\/project-title-(\d+)/);
    if (m) {
      var i = ORDER.indexOf(m[1]);
      $$('button[aria-label="Previous Project"], button[aria-label="Next Project"]').forEach(function (b) {
        var step = b.getAttribute('aria-label') === 'Next Project' ? 1 : -1, n = ORDER[i + step];
        on(b, 'click', function () { if (n) location.href = '/aiaiai.ninja/portfolio-collections/my-portfolio/project-title-' + n; });
      });
    }
    $$('button[aria-label="Back to Portfolio"]').forEach(function (b) { on(b, 'click', function () { location.href = '/aiaiai.ninja/portfolio'; }); });

    // Wix recalculated the gallery layout in the browser; here: same rules for the three layouts used on this site
    if (isPhone) return;
    function px(st, prop) { var r = new RegExp('(?:^|;)\\s*' + prop + '\\s*:\\s*(-?[\\d.]+)px').exec(st || ''); return r ? parseFloat(r[1]) : null; }
    function inset(st) { var r = /inset\s*:\s*(\S+)\s+\S+\s+\S+\s+(\S+)/.exec(st || ''); return r ? { y: parseFloat(r[1]), x: parseFloat(r[2]) } : { y: 0, x: 0 }; }
    function snap(r) { var c = [1, 2 / 3, 3 / 2, 3 / 4, 4 / 3, 16 / 9, 9 / 16, 4 / 5, 5 / 4], b = r; c.forEach(function (x) { if (Math.abs(x - r) < 0.01) b = x; }); return b; }
    function remap(el, ow, oh, nw, nh) {
      var st = el.getAttribute('style'); if (!st) return;
      var out = st.replace(/(^|;)(\s*)(width|height|min-width|min-height)(\s*:\s*)(-?[\d.]+)px/g, function (all, a, sp, p, c, n) {
        n = parseFloat(n); var isW = /width/.test(p);
        var base = isW ? ow : oh, to = isW ? nw : nh;
        return Math.abs(n - base) < 0.51 ? a + sp + p + c + to + 'px' : all;
      });
      if (out !== st) el.setAttribute('style', out);
    }
    var galleries = $$('.pro-gallery[id^="pro-gallery-comp"]').map(function (g) {
      var items = $$('.gallery-item-container', g).map(function (el) {
        var st = el.getAttribute('style'), p = inset(st);
        return { el: el, w: px(st, 'width'), h: px(st, 'height'), x: p.x, y: p.y };
      }).filter(function (o) { return o.w && o.h; });
      if (!items.length) return null;
      var margin = $('.pro-gallery-margin-container', g), parent = $('.pro-gallery-parent-container', g);
      var holders = $$('.pro-gallery-parent-container, [id^="pro-gallery-container"], .gallery-horizontal-scroll, .pro-gallery-margin-container, .group-view', g);
      var first = margin || parent;
      var xs = []; items.forEach(function (o) { if (xs.indexOf(o.x) < 0) xs.push(o.x); }); xs.sort(function (a, b) { return a - b; });
      var rows = {}; items.forEach(function (o) { rows[o.y] = 1; });
      var gap = xs.length > 1 ? Math.round(xs[1] - xs[0] - items.filter(function (o) { return o.x === xs[0]; })[0].w) : 0;
      var sameH = items.every(function (o) { return Math.abs(o.h - items[0].h) < 2; });
      return { root: g, items: items, holders: holders, cols: xs.length, gap: gap, grid: xs.length > 1 && sameH,
        W0: px(first && first.getAttribute('style'), 'width') || items[items.length - 1].x + items[items.length - 1].w,
        H0: px(first && first.getAttribute('style'), 'height') || px(parent && parent.getAttribute('style'), 'height'),
        wrap: g.closest('[class*="ProGallery"][class*="__container"]') || g.parentNode };
    }).filter(Boolean);
    galleries.forEach(function (G) {
      G.items.forEach(function (o) { o.r = snap(o.h / o.w); o.w0 = o.w; o.h0 = o.h; });
      G.items.forEach(function (o) { $$('[style]', o.el).concat([o.el]).forEach(function (n) { n.__orig = n.getAttribute('style'); }); });
      G.holders.forEach(function (n) { n.__orig = n.getAttribute('style'); });
    });
    function restore(G) {
      G.items.forEach(function (o) { $$('[style]', o.el).concat([o.el]).forEach(function (n) { if (n.__orig != null) n.setAttribute('style', n.__orig); }); });
      G.holders.forEach(function (n) { if (n.__orig != null) n.setAttribute('style', n.__orig); });
    }
    function relayout(G) {
      var W = Math.round(G.wrap.getBoundingClientRect().width);
      if (!W || W === G.W1) return; G.W1 = W;
      if (Math.abs(W - G.W0) < 1) { restore(G); return; }          // same width as when the page was saved: keep the saved layout
      var C = G.cols, gap = G.gap, pos = [], H = 0;
      if (C === 1) {                                        // one big picture: as wide as the column, same height
        G.items.forEach(function (o) { pos.push({ x: 0, y: o.y, w: W, h: o.h0 }); H = Math.max(H, o.y + o.h0); });
      } else {
        var cw = (W - gap * (C - 1)) / C, base = Math.floor(cw), extra = Math.round(W - gap * (C - 1) - base * C);
        var widths = []; for (var c = 0; c < C; c++) widths.push(base);
        var order = C === 3 && extra === 1 ? [1] : []; for (var k = 0; k < C && order.length < extra; k++) if (order.indexOf(k) < 0) order.push(k);
        order.forEach(function (k) { widths[k]++; });
        var lefts = []; widths.reduce(function (acc, wd, k) { lefts.push(acc); return acc + wd + gap; }, 0);
        if (G.grid) {
          G.items.forEach(function (o, i) { var col = i % C, row = Math.floor(i / C), h = Math.floor(cw * o.r); pos.push({ x: lefts[col], y: row * (h + gap), w: widths[col], h: h }); });
          var last = pos[pos.length - 1]; H = last.y + last.h;
        } else {                                            // columns of different heights: next picture goes under the shortest column
          var colH = widths.map(function () { return 0; });
          G.items.forEach(function (o) {
            var col = 0; for (var k = 1; k < C; k++) if (colH[k] < colH[col]) col = k;
            var wd = widths[col], h = Math.round(wd * o.r);
            pos.push({ x: lefts[col], y: colH[col], w: wd, h: h }); colH[col] += h + gap;
          });
          H = Math.max.apply(null, colH) - gap;
        }
      }
      var W0 = G.W0, H0 = G.H0;
      G.items.forEach(function (o, i) {
        var p = pos[i], el = o.el;
        $$('[style]', el).concat([el]).forEach(function (n) {
          if (n.__orig != null) n.setAttribute('style', n.__orig);
          remap(n, o.w0, o.h0, p.w, p.h);
        });
        el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
      });
      G.holders.forEach(function (n) {
        if (n.__orig == null) return;
        n.setAttribute('style', n.__orig.replace(/(width|height|--group-width)(\s*:\s*)(-?[\d.]+)px/g, function (all, p, c, v) {
          v = parseFloat(v);
          if (p !== 'height' && W0 && Math.abs(v - W0) < 0.51) return p + c + W + 'px';
          if (p === 'height' && H0 && Math.abs(v - H0) < 0.51) return p + c + H + 'px';
          return all;
        }));
      });
    }
    function relayoutAll() { galleries.forEach(relayout); }
    relayoutAll();
    on(w, 'load', relayoutAll);
    var rt = 0; on(w, 'resize', function () { clearTimeout(rt); rt = setTimeout(function () { galleries.forEach(function (G) { G.W1 = 0; }); relayoutAll(); }, 60); });
  });

  /* ------------------------------------------------------------------ project pages: full-screen picture viewer
     Wix opened the pictures of a project in its own viewer (black screen, picture, title, arrows). The markup below is
     the one Wix built, so its stylesheet (a local copy, patch.mjs links it) draws it. Computer: click a picture, arrows or
     ←/→ for the next one, X or Esc closes. Phone: first tap darkens the picture, second tap opens, swipe, back arrow closes. */
  part('gallery viewer', function () {
    var items = $$('.gallery-item-container[data-fs-src]'); if (!items.length) return;
    items.sort(function (a, b) { return +a.getAttribute('data-idx') - +b.getAttribute('data-idx'); });
    var N = items.length, cssLink = byId('pg-viewer-css');
    var layer = null, view = null, cur = 0, opener = null, cssReady = false;
    var ios = /iPhone|iPad|iPod/.test(navigator.userAgent);

    function n3(x) { return Math.round(x * 1000) / 1000; }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
    function thumb(i) { return $('img[data-hook="gallery-item-image-img"]', items[i]); }
    function titleOf(i) { var im = thumb(i); return (im && im.getAttribute('alt')) || ''; }
    // the picture, scaled down to fit a box (never cropped), centred in it
    function fit(i, bw, bh) {
      var it = items[i], nw = +it.getAttribute('data-fs-w'), nh = +it.getAttribute('data-fs-h');
      if (!nw || !nh) { nw = parseFloat(it.style.width) || 3; nh = parseFloat(it.style.height) || 2; }
      var s = Math.min(bw / nw, bh / nh), cw = nw * s, ch = nh * s;
      return { w: n3(cw), h: n3(ch), mt: n3((bh - ch) / 2), ml: n3((bw - cw) / 2) };
    }
    function imgHTML(i, f, extra, load) {
      var src = items[i].getAttribute('data-fs-src');
      return '<picture id="multi_picture_undefined"><img alt="' + esc(titleOf(i)) + '" class="gallery-item-visible gallery-item gallery-item-preloaded" data-hook="gallery-item-image-img" data-idx="' + i + '" ' +
        (load ? 'src="' + esc(src) + '"' : 'data-src="' + esc(src) + '"') + ' loading="eager" style="width: ' + f.w + 'px; height: ' + f.h + 'px;' + (extra || '') + '"></picture>';
    }
    function near(i) { return Math.abs(i - cur) <= 1; }

    /* ---- computer ---- */
    function navbarHTML(fs) {
      var x = '<button class="fullscreen-icon fullscreen-close progallery-svg-font-icons-close-x pro-fullscreen-x-button has-custom-focus" tabindex="0" aria-label="' + (fs ? 'Exit fullscreen' : 'Exit expand mode') + '" style="opacity: 1;"><div class="icon-background"></div></button>';
      if (fs) return '<div class="fullscreen-desktop-navbar-container fullscreen"><div class="fullscreen-nav"><button class="fullscreen-icon fullscreen-close progallery-svg-font-icons-shrink-arrow pro-fullscreen-shrink-button has-custom-focus" tabindex="0" aria-label="Exit fullscreen" style="opacity: 1;"><div class="icon-background"></div></button></div><div class="fullscreen-nav">' + x + '</div></div>';
      return '<div class="fullscreen-desktop-navbar-container"><div class="fullscreen-social"><button class="fullscreen-icon has-custom-focus fullscreen-expand progallery-svg-font-icons-expand-arrow" tabindex="0" title="Open in fullscreen" style="opacity: 1;"></button></div><div class="fullscreen-nav"></div><div class="fullscreen-nav">' + x + '</div></div>';
    }
    var SVG_BACK = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="none" width="15" height="27" viewBox="0 0 15 27"><g fill-rule="evenodd"><path fill-rule="nonzero" d="M14.258 1.53L13.198.47-.061 13.728l13.259 13.258 1.06-1.06L2.061 13.728z"></path></g></svg>';
    var SVG_NEXT = '<svg fill="currentColor" stroke="none" width="15" height="27" viewBox="0 0 15 27"><g fill-rule="evenodd"><path fill-rule="nonzero" d="M.198 25.926l1.06 1.06 13.259-13.258L1.258.47.198 1.53l12.197 12.198z"></path></g></svg>';
    function arrow(next) {                               // a button inside a button: only possible through DOM calls, not as HTML text
      var b = d.createElement('button'), box = d.createElement('div'), ib = d.createElement('button');
      b.className = 'nav-arrows-container shadow '; b.setAttribute('aria-label', next ? 'Next Item' : 'Previous Item'); b.setAttribute('tabindex', '0');
      b.setAttribute('data-hook', next ? 'nav-arrow-next' : 'nav-arrow-back');
      b.setAttribute('style', 'width: 50px; height: 50px; padding: 0px; top: calc(50% - 25px); ' + (next ? 'right' : 'left') + ': -70px;');
      box.setAttribute('style', 'width: 50px; height: 50px;');
      ib.setAttribute('tabindex', '-1'); ib.className = 'pro-gallery-slider-arrow'; ib.innerHTML = next ? SVG_NEXT : SVG_BACK;
      box.appendChild(ib); b.appendChild(box); return b;
    }
    function renderArrows(root) {
      var cont = $('[id^="pro-gallery-container"]', root); if (!cont) return;
      $$('.nav-arrows-container', cont).forEach(function (a) { a.parentNode.removeChild(a); });
      if (cur > 0) cont.appendChild(arrow(false));
      if (cur < N - 1) cont.appendChild(arrow(true));
    }

    function desktopHTML() {
      var W = w.innerWidth, H = w.innerHeight;
      var pw = Math.round(W * 0.7), cw = Math.floor(W * 0.7 + 1e-6) - 180, ch = H - 148, groups = '';   // 1e-6: 1440 * 0.7 is 1007.9999…
      for (var i = 0; i < N; i++) {
        var f = fit(i, cw, ch), act = i === cur;
        groups += '<div data-hook="group-view" class="group-view group-view-' + i + '" aria-hidden="false" style="--group-top: 0px; --group-left: ' + (i * cw) + 'px; --group-width: ' + cw + 'px; --group-right: auto;">' +
          '<div data-id="image-title_' + i + '" class="item-link-wrapper" data-idx="' + i + '" data-hook="item-link-wrapper" tabindex="-1">' +
          '<div class="gallery-item-container item-container-regular has-custom-focus visible" id="pgiimagetitle_' + i + '_' + i + '" data-hash="image-title_' + i + '" data-id="image-title_' + i + '" data-idx="' + i + '" data-hook="item-container" style="overflow-y: hidden; position: absolute; inset: 0px auto auto 0px; margin: 0px; width: ' + cw + 'px; height: ' + ch + 'px; transition: opacity 0.2s; opacity: 1; display: block; pointer-events: ' + (act ? 'auto' : 'none') + '; z-index: ' + (act ? 0 : 1) + ';">' +
          '<div data-idx="' + i + '" id="item-action-image-title_' + i + '" class="item-action" tabindex="' + (act ? 0 : -1) + '" data-hook="item-action" aria-label="' + esc(titleOf(i)) + '"></div>' +
          '<div style="overflow: hidden;"><div data-hook="item-wrapper" class="gallery-item-wrapper visible cube-type-fit fade ' + (act ? 'fade-visible' : 'fade-hidden') + '" id="item-wrapper-image-title_' + i + '" style="background-color: inherit; height: ' + ch + 'px; width: ' + cw + 'px; margin: 0px;">' +
          '<div class="gallery-item-content item-content-regular image-item gallery-item-visible gallery-item gallery-item-preloaded grid-fit  " data-hook="image-item" style="width: ' + f.w + 'px; height: ' + f.h + 'px; margin-top: ' + f.mt + 'px; margin-left: ' + f.ml + 'px;">' +
          imgHTML(i, f, '', near(i)) + '</div></div></div></div></div></div>';
      }
      return '<div class="pro-fullscreen-wrapper"><div data-hook="fullscreen-view" id="fullscreen-view" class="fullscreen pro-fullscreen pro-fullscreen-inline-styles inline-styles pro-fullscreen-v2   fullscreen-bright  " role="dialog" tabindex="-1" aria-label="Gallery item, detailed view">' +
        navbarHTML(false) +
        '<div class="pro-gallery-desktop-expand"><div class="pro-gallery-slider"><div id="pro-gallery-pro-gallery-fullscreen-wrapper" class="pro-gallery"><div data-key="pro-gallery-inner-container" class="" tabindex="-1">' +
        '<div data-hook="css-scroll-indicator" data-scroll-base="0" data-scroll-top="0" style="display: none;"></div>' +
        '<div class="pro-gallery-parent-container" role="region" style="margin: 0px; width: ' + pw + 'px; height: ' + ch + 'px;">' +
        '<div id="pro-gallery-container-pro-gallery-fullscreen-wrapper" class="pro-gallery inline-styles one-row hide-scrollbars  ltr " style="height: ' + ch + 'px; width: ' + cw + 'px; overflow: visible; left: 90px; display: flex; justify-content: space-between;">' +
        '<div data-hook="gallery-column" id="gallery-horizontal-scroll-pro-gallery-fullscreen-wrapper" class="gallery-horizontal-scroll gallery-column hide-scrollbars  ltr   scroll-snap  " style="width: ' + cw + 'px; height: ' + ch + 'px; overflow-y: hidden;"><div class="gallery-horizontal-scroll-inner">' + groups + '</div></div>' +
        '</div></div><div data-key="items-styles" style="display: none;"></div></div></div></div></div>' +
        '<div class="fullscreen-side-bar pro-fullscreen-opened" aria-hidden="false" style="text-align: left; transform: scale(1);"><div class="fullscreen-side-bar-info-container"><div><div class="fullscreen-side-bar-title" tabindex="-1"><h1>' + esc(titleOf(cur)) + '</h1></div></div></div></div>' +
        '</div></div>';
    }

    /* ---- phone ---- */
    function phoneHTML() {
      var H = w.innerHeight, bh = H - 200, groups = '';
      for (var i = 0; i < N; i++) {
        var f = fit(i, 320, bh);
        groups += '<div data-hook="group-view" class="group-view group-view-' + i + '" aria-hidden="false" style="--group-top: 0px; --group-left: ' + (i * 320) + 'px; --group-width: 320px; --group-right: auto;">' +
          '<div data-id="image-title_' + i + '" class="item-link-wrapper" data-idx="' + i + '" data-hook="item-link-wrapper" tabindex="-1">' +
          '<div class="gallery-item-container item-container-regular has-custom-focus visible hide-hover pro-gallery-mobile-indicator" id="pgiimagetitle_' + i + '_' + i + '" data-hash="image-title_' + i + '" data-id="image-title_' + i + '" data-idx="' + i + '" data-hook="item-container" style="overflow-y: hidden; position: absolute; inset: 0px auto auto ' + (i * 320) + 'px; margin: 0px; width: 320px; height: ' + H + 'px; transition: opacity 0.2s; opacity: 1; display: block;">' +
          '<div data-idx="' + i + '" id="item-action-image-title_' + i + '" class="item-action" tabindex="' + (i === cur ? 0 : -1) + '" data-hook="item-action" aria-label="' + esc(titleOf(i)) + '"></div>' +
          '<div style="overflow: hidden;"><div data-hook="item-wrapper" class="gallery-item-wrapper visible cube-type-fit [object Object]" id="item-wrapper-image-title_' + i + '" style="background-color: inherit; height: ' + bh + 'px; width: 320px; margin: 0px;">' +
          '<div class="gallery-item-content item-content-regular image-item gallery-item-visible gallery-item gallery-item-preloaded grid-fit  " data-hook="image-item" style="width: ' + f.w + 'px; height: ' + f.h + 'px; margin-top: 0px; margin-left: ' + f.ml + 'px;">' +
          imgHTML(i, f, ' user-select: none;', near(i)) + '</div></div></div>' +
          '<div class="gallery-item-common-info-outer [object Object]" style="height: 200px; box-sizing: content-box;"><div class="gallery-item-common-info gallery-item-bottom-info" style="overflow: hidden; box-sizing: border-box; width: 100%; height: 200px;"><div class="pro-gallery-expand-info" style="text-align: left; height: fit-content;"><div class="fullscreen-side-bar-title"><h1>' + esc(titleOf(i)) + '</h1></div><div class="fullscreen-side-bar-description"><p></p></div></div></div></div>' +
          '</div></div></div>';
      }
      return '<div class="pro-fullscreen-wrapper"><div data-hook="fullscreen-view" id="fullscreen-view" class="fullscreen pro-fullscreen pro-fullscreen-inline-styles inline-styles pro-fullscreen-v2   fullscreen-bright  pro-fullscreen-mobile" role="dialog" tabindex="-1" aria-label="Gallery item, detailed view">' +
        '<div class="fullscreen-mobile-bar fullscreen-mobile-top pro-fullscreen-store fixed-items"><div><button class="fullscreen-close progallery-svg-font-icons-back" aria-label="Back"></button><div class="fullscreen-social"></div></div></div>' +
        '<div class="pro-gallery-mobile-expand' + (ios ? ' ios' : '') + '"><div class="pro-gallery-slider"><div id="pro-gallery-pro-gallery-fullscreen-wrapper" class="pro-gallery"><div data-key="pro-gallery-inner-container" class="" tabindex="-1">' +
        '<div data-hook="css-scroll-indicator" data-scroll-base="0" data-scroll-top="0" style="display: none;"></div>' +
        '<div class="pro-gallery-parent-container" role="region" style="margin: 0px; width: 320px; height: ' + H + 'px;">' +
        '<div id="pro-gallery-container-pro-gallery-fullscreen-wrapper" class="pro-gallery inline-styles one-row hide-scrollbars  slider  ltr " style="height: ' + H + 'px; width: 320px; display: flex; justify-content: space-between;">' +
        '<div data-hook="gallery-column" id="gallery-horizontal-scroll-pro-gallery-fullscreen-wrapper" class="gallery-horizontal-scroll gallery-column hide-scrollbars  ltr   scroll-snap  " style="width: 320px; height: ' + H + 'px; overflow-y: hidden;"><div class="gallery-horizontal-scroll-inner" style="transition: none; transform: translateX(0px);">' + groups + '</div></div>' +
        '</div></div><div data-key="items-styles" style="display: none;"></div></div></div></div></div>' +
        '<div class="fullscreen-share-screen pro-fullscreen-closed"><div class="fullscreen-share-screen-background pro-fullscreen-closed"></div><div class="fullscreen-share-screen-tab pro-fullscreen-closed"></div></div>' +
        '</div></div>';
    }

    /* ---- open / close / next ---- */
    function loadNear() {
      if (!layer) return;
      $$('img[data-src]', layer).forEach(function (im) { if (near(+im.getAttribute('data-idx'))) { im.setAttribute('src', im.getAttribute('data-src')); im.removeAttribute('data-src'); } });
    }
    function go(k) {
      k = Math.max(0, Math.min(N - 1, k)); if (!layer || k === cur) return;
      cur = k; loadNear();
      $$('.group-view', layer).forEach(function (g, i) {
        var act = i === cur, box = $('.gallery-item-container', g), wrap = $('.gallery-item-wrapper', g), act_ = $('.item-action', g);
        box.style.pointerEvents = act ? 'auto' : 'none'; box.style.zIndex = act ? 0 : 1;
        wrap.classList.toggle('fade-visible', act); wrap.classList.toggle('fade-hidden', !act);
        if (act_) act_.setAttribute('tabindex', act ? '0' : '-1');
      });
      var h1 = $('.fullscreen-side-bar-title h1', layer); if (h1) h1.textContent = titleOf(cur);
      renderArrows(layer);
    }
    function mount() {
      var old = layer;
      var host = d.createElement('div'); host.className = 'fullscreen-focus-lock';
      host.innerHTML = isPhone ? phoneHTML() : desktopHTML();
      if (old) old.parentNode.replaceChild(host, old); else d.body.appendChild(host);
      layer = host; view = $('#fullscreen-view', host);
      if (!isPhone) renderArrows(host);
      if (isPhone) {                                                   // opens on the picture that was tapped; swiping changes the current one
        var sc = $('.gallery-horizontal-scroll', host);
        if (sc) { sc.scrollLeft = cur * 320; on(sc, 'scroll', function () { var k = Math.round(sc.scrollLeft / 320); if (k !== cur && k >= 0 && k < N) { cur = k; loadNear(); } }, { passive: true }); }
      }
      if (!old) { try { view.focus({ preventScroll: true }); } catch (e) {} }
    }
    function ensureCss(cb) {
      if (!cssLink || cssReady) { cb(); return; }
      var done = false, t0 = Date.now();
      function fin() { if (done) return; done = true; cssReady = true; cb(); }
      cssLink.media = 'all';
      on(cssLink, 'load', fin); on(cssLink, 'error', fin);
      (function poll() { if (done) return; if (cssLink.sheet || Date.now() - t0 > 2500) fin(); else setTimeout(poll, 30); })();
    }
    function open(i, from) {
      if (layer) return;
      opener = from || items[i]; cur = i;
      ensureCss(function () { if (!layer) mount(); });
    }
    function close() {
      if (!layer) return;
      if (d.fullscreenElement || d.webkitFullscreenElement) { try { (d.exitFullscreen || d.webkitExitFullscreen).call(d); } catch (e) {} }
      layer.parentNode.removeChild(layer); layer = view = null;
      items.forEach(function (it) { if (it.classList.contains('simulate-hover')) itemHover(it, false); });
      var a = opener && $('.item-action', opener); if (a) { try { a.focus({ preventScroll: true }); } catch (e) {} }
    }
    function toggleFs(on_) {
      var el = d.documentElement;
      try {
        if (on_) (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
        else (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      } catch (e) {}
    }
    function syncFs() {
      if (!layer || isPhone) return;
      var nb = $('.fullscreen-desktop-navbar-container', layer), t = d.createElement('div');
      if (!nb) return;
      t.innerHTML = navbarHTML(!!(d.fullscreenElement || d.webkitFullscreenElement)); nb.parentNode.replaceChild(t.firstChild, nb);
    }

    /* ---- the pictures of the page ---- */
    items.forEach(function (it, i) {
      on(it, 'click', function (e) {
        if (!isPhone) { open(i, it); return; }
        // phone: first tap = hover (dark veil), second tap on the same picture = open; tapping another picture moves the veil
        e.preventDefault();
        if (it.classList.contains('simulate-hover')) { itemHover(it, false); open(i, it); }
        else { items.forEach(function (o) { if (o !== it && o.classList.contains('simulate-hover')) itemHover(o, false); }); itemHover(it, true); }
      });
      var act = $('.item-action', it);
      on(act, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, it); } });
    });
    on(d, 'click', function (e) {
      if (!layer || !layer.contains(e.target)) return;
      var t = e.target;
      if (t.closest('.pro-fullscreen-x-button, .fullscreen-mobile-top .fullscreen-close')) { close(); return; }
      if (t.closest('.pro-fullscreen-shrink-button')) { toggleFs(false); return; }
      if (t.closest('.fullscreen-expand')) { toggleFs(true); return; }
      if (t.closest('[data-hook="nav-arrow-next"]')) { go(cur + 1); return; }
      if (t.closest('[data-hook="nav-arrow-back"]')) { go(cur - 1); return; }
    });
    on(d, 'keydown', function (e) {
      if (!layer) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (!isPhone && e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      else if (!isPhone && e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    });
    on(d, 'fullscreenchange', syncFs); on(d, 'webkitfullscreenchange', syncFs);
    var rz = 0; on(w, 'resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (layer) mount(); }, 60); });
  });


  /* ------------------------------------------------------------------ video channel "AI VIDEO FRESH NEWS" (Wix Video app) */
  var vodApi = { open: function () {}, close: function () {}, share: function () {} };
  var channelApi = { open: function () {} };
  part('video channel lightbox', function () {
    var modal = null, lastFocus = null, VID = null;
    function close() {
      if (!modal) return;
      modal.parentNode.removeChild(modal); modal = null;
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
    }
    function open(i, play, from, mode) {
      close(); lastFocus = from || null;
      var shareOnly = mode === 'share';                    // "⋮ → Sdílet": only the share window of the channel, page stays visible behind it
      modal = d.createElement('div');
      modal.id = 'vod-lightbox-modal';
      modal.setAttribute('style', 'position:fixed;display:block;width:100%;height:100%;left:0;top:0;margin:0;z-index:2147483000;background:' + (shareOnly ? 'transparent' : '#000'));
      var f = d.createElement('iframe');
      f.title = 'AI VIDEO FRESH NEWS';
      f.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; clipboard-write; picture-in-picture');
      f.setAttribute('allowfullscreen', '');
      f.setAttribute('allowtransparency', 'true');
      f.setAttribute('style', 'display:block;width:100%;height:100%;border:0;background:transparent');
      f.src = shareOnly ? '/aiaiai.ninja/assets/vod/share.html' : '/aiaiai.ninja/assets/vod/lightbox.html?i=' + i + '&play=' + (play ? 1 : 0);
      on(f, 'load', function () { try { f.contentWindow.focus(); } catch (e) {} });
      modal.style.opacity = '0'; modal.style.transition = 'opacity .3s';
      modal.appendChild(f); d.body.appendChild(modal);
      raf(function () { raf(function () { if (modal) modal.style.opacity = '1'; }); });
    }
    vodApi.open = open; vodApi.close = close; vodApi.share = function (from) { open(0, false, from, 'share'); };
    on(w, 'message', function (e) { if (e.data && e.data.source === 'aiaiai-vod' && e.data.action === 'close') close(); });
    on(d, 'keydown', function (e) { if (e.key === 'Escape' && modal) close(); });
  });

  part('video channel', function () {
    var root = byId('comp-md30zlkz'); if (!root) return;
    var thumbs = $$('[data-hook~="video-list-thumb-wrapper"]', root);
    function indexOfThumb(el) { return thumbs.indexOf(el.closest('[data-hook~="video-list-thumb-wrapper"]')); }
    // ---- desktop: "⋮ AI VIDEO FRESH NEWS" opens a small menu with one entry, "Sdílet" (share window of the channel)
    var pop = $('[data-hook="popover-container"]', root);
    if (pop) {
      var holder = $('[data-hook="open-popover"]', pop), box = $('[data-hook="popover-content"]', pop), shown = false, popTimer = 0;
      var POP_ITEM = '<div class="x73CA1"><button type="button" data-hook="share-overlay-button" class="VfCUCg"><span class="gjRSzR"></span><span class="MXTCxw">Sdílet</span></button></div>';
      var setPop = function (on_) {
        if (!box || on_ === shown) return; shown = on_;
        var inner = box.firstElementChild;
        clearTimeout(popTimer);
        if (on_) {
          if (inner) { inner.innerHTML = POP_ITEM; inner.setAttribute('aria-hidden', 'false'); }
          box.classList.remove('P4q2QL'); box.classList.add('xeQIMo');
        } else {
          box.classList.remove('xeQIMo'); box.classList.add('P4q2QL');
          popTimer = setTimeout(function () { box.classList.remove('P4q2QL'); if (inner) inner.setAttribute('aria-hidden', 'true'); }, 320);
        }
        if (holder) holder.setAttribute('aria-expanded', on_ ? 'true' : 'false');
      };
      on(pop, 'click', function (e) {
        var sh = e.target.closest('[data-hook="share-overlay-button"]');
        if (sh) { setPop(false); vodApi.share(sh); return; }
        if (e.target.closest('[data-hook="open-popover"]')) setPop(!shown);
      });
      on(holder, 'keydown', function (e) { if (e.target === holder && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setPop(!shown); } });
      on(d, 'click', function (e) { if (shown && !pop.contains(e.target)) setPop(false); });
      on(d, 'keydown', function (e) { if (shown && e.key === 'Escape') setPop(false); });
      on(w, 'blur', function () { setTimeout(function () { if (shown && d.activeElement && d.activeElement.tagName === 'IFRAME') setPop(false); }, 0); });   // a click into an embedded player closes it too
    }
    // ---- desktop: slider with arrows
    var slides = $('[data-hook="css-slider-slides"]', root);
    if (slides) {
      var prev = $('[data-hook="css-slider-prev-button"]', root), next = $('[data-hook="css-slider-next-button"]', root);
      var pad = 4;
      var geo = function () {
        var sr = slides.getBoundingClientRect();
        return thumbs.map(function (t) { var r = t.getBoundingClientRect(); return { x: r.left - sr.left + slides.scrollLeft, l: r.left - sr.left, r: r.right - sr.left }; });
      };
      var go = function (left) { try { slides.scrollTo({ left: left, behavior: 'smooth' }); } catch (e) { slides.scrollLeft = left; } };
      var syncPrev = function () {
        if (!prev) return;
        var off = slides.scrollLeft <= 0;
        prev.classList[off ? 'add' : 'remove']('i0fmRb'); prev.setAttribute('aria-hidden', off ? 'true' : 'false'); prev.setAttribute('tabindex', off ? '-1' : '0');
        if (off) prev.setAttribute('disabled', ''); else prev.removeAttribute('disabled');
      };
      on(next, 'click', function () {
        var g = geo(), W = slides.clientWidth, k = -1;
        for (var i = 0; i < g.length; i++) if (g[i].r > W + 0.5) { k = i; break; }
        if (k < 0) return;
        go(g[k].x);
      });
      on(prev, 'click', function () {
        var g = geo(), W = slides.clientWidth, first = -1, count = 0;
        for (var i = 0; i < g.length; i++) { if (g[i].r > 0.5 && g[i].l < W - 0.5) { if (first < 0) first = i; count++; } }
        if (first < 0) return;
        go(g[Math.max(0, first - count)].x);
      });
      on(slides, 'scroll', syncPrev, { passive: true });
      syncPrev();
      thumbs.forEach(function (t, i) {
        on(t, 'click', function (e) { e.preventDefault(); vodApi.open(i, true, $('[data-hook="overlay-play-button"]', t) || t); });
      });
      // a shared link ("?wix-vod-video-id=…") opens that video straight away
      var m = /[?&]wix-vod-video-id=([0-9a-f]+)/.exec(location.search), comp = /[?&]wix-vod-comp-id=([^&]+)/.exec(location.search);
      if (m && comp && comp[1] === 'comp-md30zlkz') {
        fetch('/aiaiai.ninja/assets/vod/vod.json').then(function (r) { return r.json(); }).then(function (data) {
          var k = -1; data.videos.forEach(function (v, i) { if (v.shareId === m[1]) k = i; });
          if (k < 0) return;
          var go2 = function () { var hd = byId('SITE_HEADER'); w.scrollTo(0, Math.round(root.getBoundingClientRect().top + w.pageYOffset - (hd && getComputedStyle(hd).position === 'sticky' ? hd.offsetHeight : 0))); vodApi.open(k, true, null); };
          if (d.readyState === 'complete') go2(); else on(w, 'load', go2);
        }).catch(function () {});
      }
    }
  });


  /* ------------------------------------------------------------------ video channel on the phone: swipeable slides, dots, inline player */
  part('video channel (phone)', function () {
    var root = byId('comp-md30zlkz'); if (!root) return;
    var wrap = $('[data-index="0"]', root); if (!wrap || !$('[data-channel-layout="mobile"]', root)) return;
    var track = wrap.parentNode, slides = $$('[data-index]', root), W = 320, n = slides.length;
    var dots = $('[data-hook="navigation-dots"]', root), dotEls = dots ? $$('.kMC7nb', dots) : [];
    var main = $('[data-hook="main-ui"]', root), cover = $('[data-hook="main-cover-overlay"]', root);
    var pwa = $('[data-hook="player-with-actions"]', root), frame = $('iframe', pwa);
    var area = track.parentNode.parentNode;               // element that receives the swipe
    var idx = 0, ws = 0, drag = null, moved = false;

    function paintDots() {
      if (!dots) return;
      if (idx < ws) ws = idx; if (idx > ws + 2) ws = idx - 2;
      ws = Math.max(0, Math.min(Math.max(0, n - 3), ws));
      dots.style.left = (24 - 12 * ws) + 'px';
      dotEls.forEach(function (d, j) {
        var big = j >= ws && j <= ws + 2, mid = j === ws - 1 || j === ws + 3;
        d.className = 'kMC7nb' + (big ? ' hCOHfq y_IOFm' : mid ? ' y_IOFm' : '') + (j === idx ? ' mBKtnu' : '');
      });
    }
    function show(i, animate) {
      idx = Math.max(0, Math.min(n - 1, i));
      track.style.transition = animate ? 'transform 500ms' : 'none';
      track.style.transform = 'translateX(' + (-idx * W) + 'px)';
      slides.forEach(function (s, j) {
        if (j === idx) s.setAttribute('data-active', 'true'); else s.removeAttribute('data-active');
        $$('button, [role="button"]', s).forEach(function (b) { b.setAttribute('tabindex', j === idx ? '0' : '-1'); });
      });
      paintDots();
    }
    show(0, false);
    // swipe with the finger (or mouse)
    area.style.touchAction = 'pan-y';
    on(area, 'pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button) return;
      drag = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId, dx: 0 }; moved = false;
    });
    on(area, 'pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x;
      if (Math.abs(drag.dx) > 8) moved = true;
      if (moved) {
        var dx = drag.dx / (document.documentElement.clientWidth / W);
        var tx = -idx * W + dx;
        if ((idx === 0 && dx > 0) || (idx === n - 1 && dx < 0)) tx = -idx * W + dx / 4;   // pulling past the ends
        track.style.transition = 'none'; track.style.transform = 'translateX(' + tx + 'px)';
      }
    });
    function end(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var dx = drag.dx / (document.documentElement.clientWidth / W), dt = Date.now() - drag.t;
      drag = null;
      if (!moved) return;
      if (dx < -64) show(idx + 1, true);
      else if (dx > 64) show(idx - 1, true);
      else show(idx, true);
    }
    on(area, 'pointerup', end); on(area, 'pointercancel', end);
    on(area, 'click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);

    // inline player
    function setPlayer(on_) {
      [main, cover, pwa].forEach(function (el) { if (!el) return; });
      if (main) main.classList[on_ ? 'remove' : 'add']('euCFSc');
      if (cover) cover.classList[on_ ? 'remove' : 'add']('n36Q7M');
      if (pwa) pwa.classList[on_ ? 'remove' : 'add']('euCFSc');
    }
    function play(i) {
      var s = slides[i], id = s && s.getAttribute('data-yt'); if (!id || !frame) return;
      frame.setAttribute('src', 'https://www.youtube-nocookie.com/embed/' + id + '?hl=cs&rel=0&playsinline=1&autoplay=1');
      frame.setAttribute('tabindex', '0');
      var t = $('[data-hook="title"] .KgMm7T', s); frame.setAttribute('title', t ? t.getAttribute('title') : '');
      var strip = $('[data-hook="player-actions-strip"]', pwa);
      if (!strip) {
        strip = d.createElement('div'); strip.className = 'EtnNMI blxBGu'; strip.setAttribute('data-hook', 'player-actions-strip');
        var xIcon = ''; // icons are cloned from the menu button below
        strip.innerHTML = '<button class="KKJtfB cOMxG1 dPrw9E" aria-label="Sdílet" tabindex="0" data-hook="share-video-item-action"></button><div class="YRaaMr">|</div><button class="inHFz5 PE6o9t" tabindex="0" aria-label="Zavřít" data-hook="close-video-player-action"></button>';
        pwa.insertBefore(strip, pwa.firstChild);
        $('[data-hook="share-video-item-action"]', strip).innerHTML = SHARE_ICON;
        $('[data-hook="close-video-player-action"]', strip).innerHTML = CLOSE_ICON;
      }
      var inner = $('.GJq9jn', pwa); if (inner) inner.setAttribute('aria-hidden', 'false');
      setPlayer(true); playing = i;
    }
    function stop() {
      var strip = $('[data-hook="player-actions-strip"]', pwa); if (strip) strip.parentNode.removeChild(strip);
      var inner = $('.GJq9jn', pwa); if (inner) inner.setAttribute('aria-hidden', 'true');
      if (frame) { frame.removeAttribute('src'); frame.setAttribute('tabindex', '-1'); }
      setPlayer(false); playing = -1;
    }
    var playing = -1;
    var SHARE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14"><path fill="#FFF" fill-rule="evenodd" d="M4.125 6.216a1.98 1.98 0 0 1 .077 1.355l4.495 2.64a2.2 2.2 0 0 1 1.16-.329c1.183 0 2.143.922 2.143 2.06C12 13.077 11.04 14 9.856 14c-1.183 0-2.143-.922-2.143-2.059 0-.42.132-.81.356-1.135L3.803 8.3a2.17 2.17 0 0 1-1.661.759C.959 9.059 0 8.137 0 7s.96-2.059 2.142-2.059c.586 0 1.117.227 1.504.592l4.271-2.596a1.983 1.983 0 0 1-.204-.878C7.713.922 8.673 0 9.856 0 11.04 0 12 .922 12 2.059s-.96 2.059-2.144 2.059a2.19 2.19 0 0 1-1.424-.52L4.125 6.215z"></path></svg>';
    var CLOSE_ICON = '<div class="xqvK9r sRIzV9" role="presentation"><svg viewBox="0 0 22 22" fill="currentColor" width="1em" height="1em"><path stroke="currentColor" fill="currentColor" d="M9.996 9.29L.707 0 0 .707l9.29 9.29L0 19.285l.707.707 9.29-9.29 9.289 9.29.707-.707-9.29-9.29 9.29-9.289L19.286 0l-9.29 9.29z" transform="translate(1 1)" stroke-linecap="round" fill-rule="evenodd"></path></svg></div>';
    on(root, 'click', function (e) {
      var t = e.target;
      if (t.closest('[data-hook="overlay-play-button"], [data-hook="central-area"]')) { var s = t.closest('[data-index]'); if (s) play(+s.getAttribute('data-index')); return; }
      if (t.closest('[data-hook="close-video-player-action"]')) { stop(); return; }
      if (t.closest('[data-hook="share-video-item-action"]')) { shareVideo(playing >= 0 ? playing : idx); return; }
    });
    function shareVideo(i) {
      var v = window.__vodVideos && window.__vodVideos[i];
      var url = location.origin + '/aiaiai.ninja/' + (v ? '?wix-vod-video-id=' + v.shareId + '&wix-vod-comp-id=comp-md30zlkz' : '');
      if (navigator.share) navigator.share({ title: v ? v.lbTitle : '', url: url }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url).catch(function () {});
    }
    fetch('/aiaiai.ninja/assets/vod/vod.json').then(function (r) { return r.json(); }).then(function (data) { window.__vodVideos = data.videos; }).catch(function () {});

    // the three-dot menu on every slide
    channelApi.open = function (opts) {
      function go() { window.AIAIAI_CHANNEL.open({ parent: d.body, shareId: opts && opts.shareId }); }
      if (window.AIAIAI_CHANNEL) { go(); return; }
      var sc = d.createElement('script'); sc.src = '/aiaiai.ninja/assets/vod/mobile-overlay.js'; sc.onload = go; d.head.appendChild(sc);
    };
    var menuEl = null;
    function closeMenu() { if (menuEl && menuEl.parentNode) menuEl.parentNode.removeChild(menuEl); menuEl = null; }
    function openMenu(btn) {
      closeMenu();
      var dotsIcon = $('svg', btn).outerHTML;
      menuEl = d.createElement('div'); menuEl.className = 'DH9iB2'; menuEl.setAttribute('role', 'menu'); menuEl.setAttribute('aria-label', 'Slide Menu');
      menuEl.innerHTML = '<button data-hook="menu-close-area" class="oArwYb" tabindex="0" aria-label="Close Slide Menu"></button><div data-hook="slide-menu" class="Y6H6hN moNk2B"><button data-hook="slide-menu-button" class="pleKOO" tabindex="0" aria-label="menu" style="color: inherit;">' + dotsIcon + '</button><div class="Z8bvEp" role="menu"><button data-hook="visit-channel-menu-item" class="dTQz_I" aria-label="Navstivit Kanal" style="color: inherit;">Navstivit Kanal</button><button data-hook="share-menu-item" class="dTQz_I" aria-label="Sdilet" style="color: inherit;">Sdilet</button></div></div>';
      var pres = $('[role="presentation"]', cover); var host = pres ? pres.parentNode : cover;
      host.insertBefore(menuEl, host.firstChild);
      var f = $('[data-hook="visit-channel-menu-item"]', menuEl); if (f) { try { f.focus({ preventScroll: true }); } catch (e) {} }
    }
    // a shared link ("?wix-vod-video-id=…") opens the channel view on that video straight away, as on Wix
    var dm = /[?&]wix-vod-video-id=([0-9a-f]+)/.exec(location.search), dc = /[?&]wix-vod-comp-id=([^&]+)/.exec(location.search);
    if (dm && dc && dc[1] === 'comp-md30zlkz') channelApi.open({ shareId: dm[1] });
    on(root, 'click', function (e) {
      var t = e.target, b;
      if (menuEl && menuEl.contains(t)) {
        if (t.closest('[data-hook="menu-close-area"], [data-hook="slide-menu-button"]')) { closeMenu(); return; }
        if (t.closest('[data-hook="visit-channel-menu-item"]')) { closeMenu(); channelApi.open(); return; }
        if (t.closest('[data-hook="share-menu-item"]')) { closeMenu(); shareVideo(idx); return; }
        return;
      }
      if ((b = t.closest('[data-hook="slide-menu-button"]')) && cover.contains(b)) { openMenu(b); }
    });
  });

  /* ------------------------------------------------------------------ contact form (About page) */
  part('contact form', function () {
    var form = $('form.wixui-form'); if (!form) return;
    var email = $('input[type="email"]', form), btn = $('button', form), thanks = null;
    $$('[data-testid="richTextElement"]', form).forEach(function (n) { if (/Thanks for submitting/i.test(n.textContent)) thanks = n; });
    // the "Thanks for submitting!" line also carries the failure message (same place, red), so a visitor is never left guessing
    var note = thanks && $$('span', thanks).pop(), okText = note ? note.textContent : '';
    function say(text, bad) {
      if (!thanks) return;
      if (note) note.textContent = text;
      thanks.classList.toggle('form-failed', !!bad);
      thanks.style.setProperty('visibility', 'visible', 'important');
    }
    var fields = $$('input, textarea', form).filter(function (f) { return f.name !== 'website'; });
    function valid(f) {
      var v = f.value.trim();
      if (f.required && !v) return false;
      var pat = f.getAttribute('pattern');
      if (v && pat && !new RegExp(pat).test(v)) return false;
      return true;
    }
    function mark(f, bad) { f.setAttribute('aria-invalid', bad ? 'true' : 'false'); }
    // the red border of an invalid field is drawn by Wix's CSS once the field's frame carries this class ("shown to the visitor")
    function touched(f, on_) { var fr = f.closest('.wixui-text-input, .wixui-text-box'); if (fr) fr.classList.toggle('bcsnlz', on_); }
    fields.forEach(function (f) {
      on(f, 'blur', function () { touched(f, true); mark(f, !valid(f)); });
      on(f, 'input', function () { if (f.getAttribute('aria-invalid') === 'true' && valid(f)) mark(f, false); });
    });
    var busy = false;
    function submit(e) {
      if (e) e.preventDefault();
      if (busy) return;
      var bad = fields.filter(function (f) { var b = !valid(f); touched(f, true); mark(f, b); return b; });
      if (bad.length) { if (d.activeElement && d.activeElement.blur) d.activeElement.blur(); return; }   // no focus: the red border shows at once, no keyboard pops up on phones
      busy = true; if (btn) btn.setAttribute('aria-disabled', 'true');
      var data = new FormData(form);
      if (thanks) thanks.style.removeProperty('visibility');
      var done = function (ok, status) {
        busy = false; if (btn) btn.setAttribute('aria-disabled', 'false');
        if (ok) {
          fields.forEach(function (f) { f.value = ''; mark(f, false); touched(f, false); });
          say(okText, false);
        } else {
          say(status === 429 ? 'Please wait a moment before sending another message.' : 'Something went wrong. Please try again later.', true);
          if (w.console) console.warn('Contact form: message was not sent (' + status + ').');
        }
      };
      // only a clear "ok" from contact.php counts (a host without PHP would hand back the script text with status 200)
      if (w.fetch) fetch(form.getAttribute('action') || '/aiaiai.ninja/contact.php', { method: 'POST', body: data }).then(function (r) {
        return r.json().then(function (j) { done(!!(r.ok && j && j.ok), r.status); }, function () { done(false, r.status); });
      }, function () { done(false, 0); });
      else done(false, 0);
    }
    on(form, 'submit', submit);
    on(btn, 'click', submit);
  });
})();


/* Website editing: pressing F and R together (or opening the page with #admin at the end of the address)
   opens the login. The editor itself (/aiaiai.ninja/_admin/editor.js) is only loaded then, so visitors download nothing extra. */
(function () {
  var DEMO = true;   // preview copies (GitHub Pages) switch this on: editing can be tried there, nothing is saved
  var EDITOR = '/aiaiai.ninja/_admin/editor.js?v=3c282edb97', API = '/aiaiai.ninja/_admin/api.php';
  var down = {}, started = false;
  function start(open) {
    window.KWA_DEMO = DEMO; window.KWA_API = API;
    if (open) window.KWA_OPEN = true;
    if (window.KWA) { if (open) window.KWA.open(); return; }
    if (started) return;
    started = true;
    var s = document.createElement('script');
    s.src = EDITOR; s.async = true;
    document.head.appendChild(s);
  }
  function typing(e) {
    var t = e.composedPath ? e.composedPath()[0] : e.target;   // the real field, also inside the editor's own windows
    return t && t.nodeType === 1 && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  }
  function which(e) {
    var k = (e.key || '').toLowerCase();
    return e.code === 'KeyF' || k === 'f' ? 'f' : e.code === 'KeyR' || k === 'r' ? 'r' : '';
  }
  addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || typing(e)) return;
    var k = which(e);
    if (!k) return;
    down[k] = Date.now();
    var other = down[k === 'f' ? 'r' : 'f'];
    if (other && down[k] - other < 1500) { down = {}; e.preventDefault(); start(true); }
  }, true);
  addEventListener('keyup', function (e) { var k = which(e); if (k) delete down[k]; }, true);
  addEventListener('blur', function () { down = {}; });
  function fromAddress() {
    if (location.hash !== '#admin') return;
    history.replaceState(null, '', location.pathname + location.search);
    start(true);
  }
  addEventListener('hashchange', fromAddress);
  fromAddress();
  var on = /(?:^|;\s*)kwa=1/.test(document.cookie);
  try { if (DEMO && sessionStorage.getItem('kwa-demo')) on = true; } catch (e) {}
  if (on) start(false);
})();
