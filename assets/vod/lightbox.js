/* Video channel lightbox ("AI VIDEO FRESH NEWS") — stand-in for the full-screen player that Wix's video app showed.
   Loaded inside an <iframe> by the home page (site.js). The markup comes from the <template> in lightbox.html
   (copied from the original); this script fills in the chosen video and handles the buttons. */
(function () {
  'use strict';
  var V = window.VOD, vids = V.videos, base = vids[V.base];
  var tplHTML = document.getElementById('tpl').innerHTML;
  var q = new URLSearchParams(location.search);
  var state = { i: Math.max(0, Math.min(vids.length - 1, +q.get('i') || 0)), play: q.get('play') !== '0', share: false, channel: false, copied: false };
  var copyTimer = 0;

  function escT(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;'); }
  function escA(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/ /g, '&nbsp;'); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function origin() { try { return parent.location.origin; } catch (e) { return location.origin; } }
  function pageLink(v) { return origin() + '/aiaiai.ninja/' + (state.channel ? '' : '?wix-vod-video-id=' + v.shareId + '&wix-vod-comp-id=' + V.comp); }

  // the template shows video "base"; swap its texts for the chosen video (not inside the thumbnail strip)
  function retarget(html, v) {
    if (v === base) return html;
    var at = html.indexOf('<div class="UY4LJB">');
    var head = html.slice(0, at), tail = html.slice(at);
    [['lbTitle'], ['publisher'], ['duration'], ['description'], ['id'], ['shareId']].forEach(function (k) {
      k = k[0];
      head = head.split(escT(base[k])).join(escT(v[k])).split(escA(base[k])).join(escA(v[k]));
    });
    return head + tail;
  }

  function setThumb(sec, selected, playing) {
    var hook = 'video-list-thumb-wrapper' + (selected ? ' video-list-thumb-wrapper-selected' : '');
    sec.setAttribute('data-hook', hook);
    sec.className = 'WbWfav oXTL_p' + (selected ? ' nn1iuC' : '') + (selected && playing ? ' vMLTGd' : '');
    var now = $('.Mfb4J2', sec), title = $('.kn2svW', sec), btn = $('button.AX4rmo', sec);
    if (now) now.setAttribute('aria-hidden', selected && playing ? 'false' : 'true');
    if (title) title.setAttribute('aria-hidden', selected && playing ? 'true' : 'false');
    if (btn) btn.setAttribute('aria-hidden', selected && playing ? 'true' : 'false');
  }

  // share window / link field / "link copied" note — changed in place so the playing video is not reloaded
  function applyShare(root) {
    root = root || document;
    var v = vids[state.i];
    var ov = $('[data-hook="share-overlay"]', root);
    if (ov) {
      var an = ov.firstElementChild;
      ov.classList.toggle('BFuZk9', state.share); ov.setAttribute('aria-hidden', state.share ? 'false' : 'true');
      if (an) { an.classList.toggle('uQl_w3', state.share); an.setAttribute('aria-hidden', state.share ? 'false' : 'true'); }
    }
    var sel = $('[data-hook="share-select"]', root); if (sel) sel.value = state.channel ? 'channel' : 'video';
    var inp = $('input.xmF3c1', root); if (inp) inp.value = pageLink(v);
    var toast = $('[data-hook="link-copied"]', root);
    if (toast) { toast.classList.toggle('lAlNpA', state.copied); toast.setAttribute('aria-hidden', state.copied ? 'false' : 'true'); }
  }

  // arrows at the ends of the thumbnail strip: only where there is more to scroll to
  function updateArrows() {
    var strip = $('.Ka3OKk'), l = $('.ug1ey4.kveEvR'), r = $('.ug1ey4.ccVTXp');
    if (!strip || !l || !r) return;
    l.classList.toggle('EOakTd', strip.scrollLeft <= 1);
    r.classList.toggle('EOakTd', strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1);
  }

  function render() {
    var v = vids[state.i], last = vids.length - 1;
    var holder = document.createElement('div');
    holder.innerHTML = retarget(tplHTML, v);
    var root = holder.firstElementChild;
    var box = $('[data-hook="responsive-lightbox"]', root);
    // previous / next arrows
    var nav = $('[data-hook="main-item-nav"]', root);
    var prevBtn = $('[data-hook="prev-button"]', nav), nextBtn = $('[data-hook="next-button"]', nav);
    nav.innerHTML = '';
    if (state.i > 0) nav.appendChild(prevBtn);
    if (state.i < last) nav.appendChild(nextBtn);
    // cover (picture + "Přehrát video") or running player
    var cover = $('.Mz5TQM', root), playable = $('.GJq9jn', root), frame = $('iframe.I7i1mL', root);
    if (state.play) {
      box.classList.add('VEOY5D');
      if (cover) cover.parentNode.removeChild(cover);
      if (playable) playable.setAttribute('aria-hidden', 'false');
      if (frame) {
        frame.setAttribute('src', 'https://www.youtube-nocookie.com/embed/' + v.id + '?hl=cs&rel=0&autoplay=1');
        frame.setAttribute('title', v.lbTitle); frame.setAttribute('tabindex', '0');
      }
    } else {
      box.classList.remove('VEOY5D');
    }
    // thumbnail strip: which one is selected
    $$('section.WbWfav', root).forEach(function (sec, k) { setThumb(sec, k === state.i, state.play); });
    applyShare(root);
    // swap into the page, keep the strip where it was
    var old = document.getElementById('root'), keep = old ? $('.Ka3OKk', old) : null, left = keep ? keep.scrollLeft : 0;
    if (old) old.parentNode.replaceChild(root, old); else document.body.insertBefore(root, document.getElementById('tpl'));
    var strip = $('.Ka3OKk', root); if (strip) strip.scrollLeft = left;
    updateArrows();
    if (!old && state.i > 0) {                       // opened on a later video: show it in the strip
      var sec = $$('section.WbWfav', root)[state.i], s2 = $('.Ka3OKk', root);
      if (sec && s2 && sec.offsetLeft + sec.offsetWidth > s2.clientWidth) s2.scrollLeft = sec.offsetLeft - 8;
      updateArrows();
    }
  }
  function go(i, play) { state.i = i; state.play = !!play; state.copied = false; render(); }
  function close() { try { parent.postMessage({ source: 'aiaiai-vod', action: 'close' }, '*'); } catch (e) {} }
  function popup(url) { window.open(url, '_blank', 'noopener,width=640,height=520'); }

  document.addEventListener('click', function (e) {
    var t = e.target, el;
    if ((el = t.closest('[data-hook="next-button"]'))) { go(state.i + 1, false); return; }
    if ((el = t.closest('[data-hook="prev-button"]'))) { go(state.i - 1, false); return; }
    if ((el = t.closest('button.inHFz5'))) { close(); return; }
    if ((el = t.closest('button.mYzQ05'))) { state.share = true; applyShare(); return; }
    if ((el = t.closest('[data-hook="share-overlay"]'))) {
      var v = vids[state.i], link = pageLink(v), thumb = origin() + '/aiaiai.ninja/assets/vod/thumbs/' + v.id + '-max.jpg';
      if (t.closest('[data-hook="close-overlay"]')) { state.share = false; state.copied = false; applyShare(); return; }
      if (t.closest('[data-hook="facebook"]')) { popup('https://www.facebook.com/sharer/sharer.php?ref=site&display=popup&u=' + encodeURIComponent(link)); return; }
      if (t.closest('[data-hook="twitter"]')) { popup('https://twitter.com/intent/tweet?original_referer=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(v.lbTitle) + '&url=' + encodeURIComponent(link)); return; }
      if (t.closest('[data-hook="pinterest"]')) { popup('https://pinterest.com/pin/create/button/?url=' + encodeURIComponent(link) + '&media=' + encodeURIComponent(thumb) + '&description=' + encodeURIComponent(v.lbTitle)); return; }
      if (t.closest('[data-hook="tumblr"]')) { popup('https://www.tumblr.com/widgets/share/tool?posttype=photo&content=' + encodeURIComponent(thumb) + '&caption=' + encodeURIComponent(v.lbTitle) + '&canonicalUrl=' + encodeURIComponent(link)); return; }
      if (t.closest('[data-hook="link"]')) {
        var done = function () { state.copied = true; applyShare(); clearTimeout(copyTimer); copyTimer = setTimeout(function () { state.copied = false; applyShare(); }, 3000); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, done); else done();
        return;
      }
      return;
    }
    if ((el = t.closest('.Mz5TQM'))) { go(state.i, true); return; }              // cover: "Přehrát video"
    if ((el = t.closest('section.WbWfav'))) {
      var k = $$('section.WbWfav').indexOf(el);
      if (k === state.i) { if (!state.play) go(k, true); } else go(k, false);
    }
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-hook="share-select"]')) { state.channel = e.target.value === 'channel'; state.copied = false; applyShare(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (state.share) { state.share = false; state.copied = false; applyShare(); } else close(); }
  });
  document.addEventListener('scroll', updateArrows, true);
  window.addEventListener('resize', updateArrows);
  render();
  try { window.focus(); } catch (e) {}
})();
