/* Astro BizOne dealer site – no third-party scripts, no inline JS (CSP-friendly).
   All user input is handled as text only (never injected as HTML). */
(function () {
  'use strict';

  var CONFIG = {
    whatsappNumber: '60374904608',   // international format, no "+" – change if your WhatsApp number differs
    sstRate: 0.08,
    autoDebitRebate: 0.02,
    submitCooldownMs: 30000,         // simple client-side rate limit
    consentKey: 'cookie-consent-v1'
  };

  var PLANS = {
    '400':  { name: 'BizOne 400',                 fee: 400,  pax: 80,  perPax: 10, freeDec: 1 },
    '800':  { name: 'BizOne 800',                 fee: 800,  pax: 200, perPax: 8,  freeDec: 2 },
    '1200': { name: 'BizOne 1200',                fee: 1200, pax: 600, perPax: 3,  freeDec: 3 },
    '1000': { name: 'BizOne 1000 Entertainment',  fee: 1000, pax: 300, perPax: 10, freeDec: 2 }
  };
  var DECODER_FEE = 300;

  function $(id) { return document.getElementById(id); }

  /* ---------- Safe storage (works in private mode) ---------- */
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  /* ---------- Year ---------- */
  var y = $('year'); if (y) y.textContent = String(new Date().getFullYear());

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = $('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); toggle.focus();
      }
    });
  }

  /* ---------- Accessible tabs (arrow-key navigation) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = $(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  /* ---------- Plan buttons prefill the form ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-plan]');
    if (!a) return;
    var sel = $('f-plan');
    if (!sel) return;
    var want = a.getAttribute('data-plan');
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].text === want) { sel.selectedIndex = i; break; }
    }
  });

  /* ---------- Price calculator ---------- */
  function rm(n) { return 'RM' + n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function clampInt(v, min, max) { v = parseInt(v, 10); if (isNaN(v)) v = min; return Math.min(max, Math.max(min, v)); }

  var calcPlan = $('calc-plan'), calcPax = $('calc-pax'), calcDec = $('calc-dec'), calcAd = $('calc-ad');
  function calc() {
    var p = PLANS[calcPlan.value] || PLANS['800'];
    var pax = clampInt(calcPax.value, 1, 5000);
    var dec = clampInt(calcDec.value, 0, 20);
    var extraPax = Math.max(0, pax - p.pax);
    var paxCost = extraPax * p.perPax;
    var decCost = dec * DECODER_FEE;
    var sub = p.fee + paxCost + decCost;
    var rebate = calcAd.checked ? sub * CONFIG.autoDebitRebate : 0;
    var sst = (sub - rebate) * CONFIG.sstRate;
    var total = sub - rebate + sst;
    $('r-base').textContent = rm(p.fee) + ' (incl. ' + p.pax + ' pax, ' + p.freeDec + ' decoder' + (p.freeDec > 1 ? 's' : '') + ')';
    $('r-pax-label').textContent = 'Additional pax (' + extraPax + ' × RM' + p.perPax + ')';
    $('r-pax').textContent = rm(paxCost);
    $('r-dec').textContent = rm(decCost) + (dec ? ' (' + dec + ' × RM300)' : '');
    $('r-ad').textContent = rebate ? '−' + rm(rebate) : rm(0);
    $('r-sst').textContent = rm(sst);
    $('r-total').textContent = rm(total);
    var cta = $('calc-cta');
    if (cta) cta.setAttribute('data-plan', p.name);
  }
  if (calcPlan) {
    [calcPlan, calcPax, calcDec, calcAd].forEach(function (el) {
      el.addEventListener('input', calc); el.addEventListener('change', calc);
    });
    calc();
  }

  /* ---------- Channel search ---------- */
  var filter = $('ch-filter');
  if (filter) {
    var items = Array.prototype.slice.call(document.querySelectorAll('.channels .ch-list li'));
    filter.addEventListener('input', function () {
      var q = filter.value.trim().toLowerCase().slice(0, 40);
      var shown = 0;
      items.forEach(function (li) {
        var hit = !q || li.textContent.toLowerCase().indexOf(q) !== -1;
        li.classList.toggle('hide', !hit);
        if (hit) shown++;
      });
      $('ch-empty').hidden = shown !== 0;
    });
  }

  /* ---------- Contact form: validate, sanitise, send via WhatsApp ---------- */
  function clean(s, max) {
    return String(s || '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // control chars
      .replace(/[<>]/g, '')                                         // no markup
      .replace(/\s{3,}/g, '  ')
      .trim()
      .slice(0, max);
  }
  function normalisePhone(s) { return String(s || '').replace(/[\s\-()]/g, ''); }
  var PHONE_RE = /^(\+?60|0)1\d{7,9}$|^(\+?60|0)[3-9]\d{7,8}$/; // Malaysian mobile or landline

  var form = $('contact-form');
  var lastSubmit = 0;
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('form-status');
      status.className = 'form-status'; status.textContent = '';

      if ($('website').value) return;                       // honeypot – silently drop bots

      var now = Date.now();
      if (now - lastSubmit < CONFIG.submitCooldownMs) {
        status.className = 'form-status bad';
        status.textContent = 'Please wait a few seconds before sending again.';
        return;
      }

      var data = {
        name: clean($('f-name').value, 80),
        phone: normalisePhone(clean($('f-phone').value, 16)),
        business: clean($('f-biz').value, 100),
        type: clean($('f-type').value, 60),
        plan: clean($('f-plan').value, 60),
        message: clean($('f-msg').value, 500),
        marketing: $('f-mkt').checked
      };

      var errors = {};
      if (data.name.length < 2) errors['name'] = 'Please enter your name.';
      if (!PHONE_RE.test(data.phone)) errors['phone'] = 'Please enter a valid Malaysian phone number.';
      if (data.business.length < 2) errors['biz'] = 'Please enter your business name.';
      if (!data.type) errors['type'] = 'Please choose your outlet type.';
      if (!$('f-consent').checked) errors['consent'] = 'Please agree to the Privacy Policy so we can contact you.';
      if (!$('f-age').checked) errors['age'] = 'You must be 18 or older to enquire.';

      var map = { name: 'f-name', phone: 'f-phone', biz: 'f-biz', type: 'f-type', consent: 'f-consent', age: 'f-age' };
      var first = null;
      Object.keys(map).forEach(function (k) {
        var input = $(map[k]); var err = $('e-' + k);
        if (errors[k]) {
          input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', 'e-' + k);
          err.textContent = errors[k]; if (!first) first = input;
        } else {
          input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); err.textContent = '';
        }
      });
      if (first) { first.focus(); return; }

      lastSubmit = now;
      var lines = [
        'Hi, I would like an Astro BizOne quote.',
        'Name: ' + data.name,
        'Phone: ' + data.phone,
        'Business: ' + data.business,
        'Outlet type: ' + data.type,
        'Plan: ' + (data.plan || 'Not sure yet'),
        data.message ? 'Message: ' + data.message : '',
        'Marketing updates: ' + (data.marketing ? 'Yes' : 'No')
      ].filter(Boolean);
      var url = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(lines.join('\n'));
      var w = window.open(url, '_blank', 'noopener,noreferrer');
      status.className = 'form-status ok';
      status.textContent = w ? 'WhatsApp opened — just press Send. If not, call 03-7490 4608.'
                             : 'Pop-up blocked. Please call us at 03-7490 4608.';
      form.reset();
    });
  }

  /* ---------- Cookie consent (gates any future non-essential scripts) ---------- */
  var banner = $('cookie-banner');
  function applyConsent(value) {
    store.set(CONFIG.consentKey, JSON.stringify({ v: value, t: Date.now() }));
    if (banner) banner.hidden = true;
    if (value === 'all') loadOptionalScripts();
  }
  function loadOptionalScripts() {
    /* No analytics is installed. If you add one (e.g. Google Analytics), load it HERE only,
       and add its domain to the Content-Security-Policy. */
  }
  var saved = null;
  try { saved = JSON.parse(store.get(CONFIG.consentKey) || 'null'); } catch (e) { saved = null; }
  if (banner) {
    if (!saved) banner.hidden = false; else if (saved.v === 'all') loadOptionalScripts();
    $('cookie-accept').addEventListener('click', function () { applyConsent('all'); });
    $('cookie-reject').addEventListener('click', function () { applyConsent('essential'); });
  }
  var settings = $('cookie-settings');
  if (settings && banner) settings.addEventListener('click', function () { banner.hidden = false; $('cookie-reject').focus(); });
})();
