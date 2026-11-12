/* Practikal marketing site */

/**
 * Site configuration — set these before launch.
 *  appUrl:       where "Sign in" links go (the Practikal web app).
 *  formEndpoint: optional URL that accepts a JSON POST of the demo form
 *                (e.g. a Formspree/Basin endpoint or your own API). When empty,
 *                the form falls back to opening an email to `contactEmail`.
 *  contactEmail: inbox that receives demo requests in the mailto fallback.
 */
const SITE = {
  appUrl: '',
  formEndpoint: '',
  contactEmail: '',
};

(function () {
  // App links
  document.querySelectorAll('[data-app-link]').forEach((a) => {
    if (SITE.appUrl) a.setAttribute('href', SITE.appUrl);
    else a.setAttribute('href', '#contact');
  });

  // Year
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  // Sticky header border
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const menuBtn = document.querySelector('.menu-btn');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  document.querySelectorAll('.mobile-menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 920) setMenu(false); });

  // Reveal on scroll
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  // Hero phishing demo
  const demo = document.getElementById('demo');
  const fb = document.getElementById('feedback');
  const pop = document.getElementById('xp-pop');
  const buttons = demo.querySelectorAll('[data-verdict]');
  const flags = '<ul><li>Sender domain is not your organization\'s (<b>yourbank-secure-login.co</b>)</li><li>Urgency and threat: “locked in 2 hours”</li><li>Asks you to enter credentials through a link</li></ul>';

  function answer(choice) {
    buttons.forEach((b) => { b.disabled = true; b.classList.toggle('picked', b.dataset.verdict === choice); });
    demo.classList.add('revealed');
    if (choice === 'phish') {
      fb.innerHTML = '<strong><svg width="18" height="18" style="color:#d9ff45"><use href="#i-check-c"/></svg>Correct — that\'s phishing. <span class="xp">+50 XP</span></strong>Red flags you caught:' + flags + '<button type="button" class="again">Try again ↺</button>';
      pop.classList.remove('go'); void pop.offsetWidth; pop.classList.add('go');
    } else {
      fb.innerHTML = '<strong><svg width="18" height="18" style="color:#ff8a8f"><use href="#i-alert"/></svg>Not quite — this one is phishing.</strong>In Practikal, this would add a short remediation lesson to your list. Red flags to look for:' + flags + '<button type="button" class="again">Try again ↺</button>';
    }
    fb.classList.add('show');
    fb.querySelector('.again').addEventListener('click', reset);
  }
  function reset() {
    buttons.forEach((b) => { b.disabled = false; b.classList.remove('picked'); });
    demo.classList.remove('revealed');
    fb.classList.remove('show');
    fb.innerHTML = '';
  }
  buttons.forEach((b) => b.addEventListener('click', () => answer(b.dataset.verdict)));

  // Plan buttons preselect the form
  const planSelect = document.getElementById('f-plan');
  document.querySelectorAll('[data-plan]').forEach((a) => a.addEventListener('click', () => {
    planSelect.value = a.dataset.plan;
  }));

  // Demo form
  const form = document.getElementById('demo-form');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function validate() {
    let ok = true;
    form.querySelectorAll('[required]').forEach((el) => {
      const valid = el.type === 'email' ? emailRe.test(el.value.trim()) : el.value.trim() !== '';
      el.closest('.field').classList.toggle('invalid', !valid);
      if (!valid && ok) { el.focus(); ok = false; }
    });
    return ok;
  }
  form.addEventListener('input', (e) => {
    const f = e.target.closest('.field');
    if (f && f.classList.contains('invalid')) f.classList.remove('invalid');
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      if (SITE.formEndpoint) {
        const res = await fetch(SITE.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Request failed');
      } else if (SITE.contactEmail) {
        const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
        window.location.href = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent('Practikal demo request — ' + data.organization)}&body=${encodeURIComponent(body)}`;
      } else {
        console.warn('[Practikal] Demo form is not connected: set SITE.formEndpoint or SITE.contactEmail in main.js.', data);
      }
      form.classList.add('sent');
    } catch (err) {
      btn.disabled = false;
      alert('Sorry — something went wrong sending your request. Please try again.');
    }
  });
})();
