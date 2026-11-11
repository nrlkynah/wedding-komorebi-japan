// Sakura no Chigiri: the opening, countdown, gallery, RSVP, menu and drifting sakura.
// All wedding details come from config.js.

(() => {
  const C = window.WEDDING;
  const $ = (id) => document.getElementById(id);
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => motionQuery.matches;
  const main = $('main');

  // ---------- details from config ----------

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [year, month, day] = C.date.split('-');
  // The order the two names are shown in, e.g. ['groom', 'bride'] for TANAKA & FUTABA.
  const [first, second] = (C.nameOrder || ['bride', 'groom']).map((who) => C[who]);
  const values = {
    bride: C.bride,
    groom: C.groom,
    name1: first,
    name2: second,
    couple: `${first} & ${second}`,
    initialA: first[0],
    initialB: second[0],
    tagline: C.tagline,
    dateLong: `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`,
    dateDots: `${day} · ${month} · ${year}`,
    day: String(Number(day)),
    month: MONTHS[Number(month) - 1],
    year,
    ceremonyTime: C.ceremonyTime,
    receptionTime: C.receptionTime,
    venue: C.venue,
  };
  document.querySelectorAll('[data-c]').forEach((node) => {
    node.textContent = values[node.dataset.c];
  });
  let letterIndex = 0;
  document.querySelectorAll('.names [data-c]').forEach((node) => {
    const letters = [...node.textContent].map((letter) => {
      const ch = document.createElement('span');
      ch.className = 'ch';
      ch.textContent = letter;
      ch.style.setProperty('--i', String(letterIndex++));
      return ch;
    });
    node.replaceChildren(...letters);
    letterIndex += 2;
  });
  document.title = `${values.couple} · ${values.dateLong}`;
  $('maps-link').href = C.mapsUrl;
  if (!C.isDemo) {
    document.querySelectorAll('[data-demo]').forEach((node) => node.remove());
  }

  // ---------- beginning the journey ----------

  history.scrollRestoration = 'manual';
  main.inert = true;

  $('enter').addEventListener('click', () => {
    const cover = $('cover');
    sakuraSwirl();
    document.documentElement.classList.add('entered');
    main.inert = false;
    window.scrollTo(0, 0);
    $('invitation-title').focus({ preventScroll: true });

    const finish = () => {
      cover.hidden = true;
    };
    if (reduced()) {
      finish();
    } else {
      cover.classList.add('leaving');
      setTimeout(finish, 1400);
    }
  });

  // ---------- reveal on scroll ----------

  const reveals = document.querySelectorAll('.reveal');
  if (reduced() || !('IntersectionObserver' in window)) {
    reveals.forEach((node) => node.classList.add('in'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((node) => observer.observe(node));
  }

  // ---------- countdown ----------

  const target = new Date(C.countdownTarget).getTime();
  const pad = (n) => String(n).padStart(2, '0');
  let countdownTimer = 0;

  function tickCountdown() {
    const left = target - Date.now();
    if (!(left > 0)) {
      $('units').hidden = true;
      $('cd-done').hidden = false;
      clearInterval(countdownTimer);
      return;
    }
    const seconds = Math.floor(left / 1000);
    $('cd-days').textContent = String(Math.floor(seconds / 86400));
    $('cd-hours').textContent = pad(Math.floor(seconds / 3600) % 24);
    $('cd-minutes').textContent = pad(Math.floor(seconds / 60) % 60);
    $('cd-seconds').textContent = pad(seconds % 60);
  }
  countdownTimer = setInterval(tickCountdown, 1000);
  tickCountdown();

  // ---------- menu ----------

  const head = $('site-head');
  const menuBtn = $('menu-btn');

  function setMenu(open) {
    head.classList.toggle('open', open);
    document.documentElement.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.menu-word').textContent = open ? 'Close' : 'Menu';
    main.inert = open;
  }
  menuBtn.addEventListener('click', () => setMenu(!head.classList.contains('open')));
  $('menu').addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setMenu(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && head.classList.contains('open')) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  // ---------- gallery lightbox ----------

  const lightbox = $('lightbox');
  const photos = [...document.querySelectorAll('#gallery img')];
  let current = 0;

  function showPhoto(index) {
    current = (index + photos.length) % photos.length;
    $('lb-img').src = photos[current].getAttribute('src');
    $('lb-img').alt = photos[current].alt;
    $('lb-count').textContent = `${current + 1} / ${photos.length}`;
  }

  document.querySelectorAll('#gallery button').forEach((button, index) => {
    button.addEventListener('click', () => {
      showPhoto(index);
      lightbox.showModal();
    });
  });
  $('lb-close').addEventListener('click', () => lightbox.close());
  $('lb-prev').addEventListener('click', () => showPhoto(current - 1));
  $('lb-next').addEventListener('click', () => showPhoto(current + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      lightbox.close();
    }
  });
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showPhoto(current - 1);
    if (event.key === 'ArrowRight') showPhoto(current + 1);
  });

  // Swipe between photos on a phone.
  let swipeFrom = null;
  lightbox.addEventListener('pointerdown', (event) => {
    swipeFrom = event.clientX;
  });
  lightbox.addEventListener('pointerup', (event) => {
    if (swipeFrom !== null && Math.abs(event.clientX - swipeFrom) > 50) {
      showPhoto(current + (event.clientX < swipeFrom ? 1 : -1));
    }
    swipeFrom = null;
  });

  // ---------- RSVP (demo: nothing is sent or stored) ----------

  const form = $('rsvp-form');
  const done = $('rsvp-done');

  function setError(input, messageNode, message) {
    messageNode.textContent = message;
    if (input) {
      input.setAttribute('aria-invalid', String(Boolean(message)));
    }
  }

  function attendance() {
    return form.querySelector('input[name="attendance"]:checked')?.value ?? '';
  }

  form.addEventListener('change', (event) => {
    if (event.target.name === 'attendance') {
      $('guests-field').hidden = attendance() === 'no';
      setError($('attendance'), $('err-attendance'), '');
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const answer = attendance();
    const guestsText = form.elements.guests.value.trim();
    const guests = Number(guestsText);

    const nameError = name.length < 2 ? 'Please tell us your name.' : '';
    const answerError = answer ? '' : 'Please let us know if you can join us.';
    const guestsError = answer !== 'no' && guestsText && !(Number.isInteger(guests) && guests >= 1 && guests <= 10) ? 'Please enter a number from 1 to 10.' : '';

    setError(form.elements.name, $('err-name'), nameError);
    setError($('attendance'), $('err-attendance'), answerError);
    setError(form.elements.guests, $('err-guests'), guestsError);

    if (nameError || answerError || guestsError) {
      (nameError ? form.elements.name : answerError ? form.querySelector('input[name="attendance"]') : form.elements.guests).focus();
      return;
    }

    $('done-label').textContent = `Thank you, ${name}`;
    $('done-line').textContent = answer === 'yes'
      ? 'We cannot wait to walk through the garden with you.'
      : 'You will be with us in our hearts all the same.';
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });

  $('rsvp-again').addEventListener('click', () => {
    form.reset();
    $('guests-field').hidden = false;
    form.hidden = false;
    done.hidden = true;
    form.elements.name.focus();
  });

  // ---------- gentle parallax ----------

  const depthNodes = [...document.querySelectorAll('[data-depth]')];
  let parallaxQueued = false;

  function applyParallax() {
    parallaxQueued = false;
    if (reduced()) {
      depthNodes.forEach((node) => { node.style.translate = ''; });
      return;
    }
    const middle = innerHeight / 2;
    depthNodes.forEach((node) => {
      const box = node.parentElement.getBoundingClientRect();
      if (box.bottom > -100 && box.top < innerHeight + 100) {
        const shift = (box.top + box.height / 2 - middle) * Number(node.dataset.depth);
        node.style.translate = `0 ${shift.toFixed(1)}px`;
      }
    });
  }
  addEventListener('scroll', () => {
    if (!parallaxQueued) {
      parallaxQueued = true;
      requestAnimationFrame(applyParallax);
    }
  }, { passive: true });
  applyParallax();

  // ---------- drifting sakura petals: one canvas, fewer on phones ----------

  const canvas = $('fireflies');
  const ctx = canvas.getContext('2d');
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 48;
  (() => {
    const s = sprite.getContext('2d');
    const petal = s.createLinearGradient(6, 24, 42, 24);
    petal.addColorStop(0, 'rgb(255, 238, 242)');
    petal.addColorStop(0.6, 'rgb(244, 196, 210)');
    petal.addColorStop(1, 'rgb(226, 160, 182)');
    s.fillStyle = petal;
    s.beginPath();
    s.moveTo(4, 24);
    s.bezierCurveTo(14, 4, 38, 8, 44, 24);
    s.bezierCurveTo(38, 40, 14, 44, 4, 24);
    s.fill();
  })();

  let W = 0;
  let H = 0;
  let scale = 1;
  let density = 1;
  let shown = 0;
  let flies = [];
  let last = 0;
  let frame = 0;

  const rand = (a, b) => a + Math.random() * (b - a);
  /** A soft breeze that rises every so often and dies away again. */
  const gust = (t) => 70 * Math.pow(Math.max(0, Math.sin(t * 0.31)), 6) + 8;
  const makeFly = () => ({ x: rand(0, W), y: rand(-H, H), fall: rand(16, 40), sway: rand(10, 34), swaySpeed: rand(0.4, 1), size: rand(5, 11), phase: rand(0, 6.28), spin: rand(-1.4, 1.4), flip: rand(0.8, 2.2) });

  function resize() {
    scale = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth;
    H = innerHeight;
    canvas.width = Math.round(W * scale);
    canvas.height = Math.round(H * scale);
    const capacity = (W < 768 ? 9 : 16) * 2.2;
    flies = Array.from({ length: Math.round(capacity) }, makeFly);
    if (reduced()) {
      drawStill();
    }
  }

  function drawFly(f, alpha) {
    const t = (last || 0) / 1000;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(f.x, f.y);
    ctx.rotate(f.phase + t * f.spin);
    ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.cos(t * f.flip + f.phase)));
    ctx.drawImage(sprite, -f.size, -f.size, f.size * 2, f.size * 2);
    ctx.restore();
  }

  /** With reduced motion: a few quiet points of light, not moving. */
  function drawStill() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, W, H);
    flies.slice(0, Math.round(10 * density)).forEach((f) => drawFly(f, 0.5));
  }

  function loop(now) {
    frame = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const wanted = flies.length / 2.2 * density;
    shown += (wanted - shown) * Math.min(dt * 0.9, 1);

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const t = now / 1000;
    for (let i = 0; i < Math.min(Math.ceil(shown), flies.length); i++) {
      const f = flies[i];
      f.y += f.fall * dt;
      f.x += (Math.sin(t * f.swaySpeed + f.phase) * f.sway + gust(t) * (0.6 + f.size / 12)) * dt;
      if (f.x < -30) f.x = W + 30;
      if (f.x > W + 30) f.x = -30;
      if (f.y > H + 30) { f.y = -30; f.x = rand(0, W); }
      drawFly(f, 0.82 * Math.min(1, shown - i));
    }
    updateSwirl(dt);
  }

  // ---------- beginning the journey sets a small swirl of petals free ----------

  const swirl = [];

  function sakuraSwirl() {
    if (reduced()) return;
    const count = W < 768 ? 26 : 40;
    for (let i = 0; i < count; i++) {
      swirl.push({ ...makeFly(), a: rand(0, 6.28), r: rand(4, 40), vr: rand(90, 220), va: rand(1.8, 3.2) * (Math.random() < 0.5 ? -1 : 1), cx: W / 2, cy: H * 0.68, rise: rand(40, 120), age: 0, life: rand(1.8, 2.8), size: rand(6, 12) });
    }
  }

  function updateSwirl(dt) {
    for (let i = swirl.length - 1; i >= 0; i--) {
      const p = swirl[i];
      p.age += dt;
      p.a += p.va * dt;
      p.r += p.vr * dt;
      p.cy -= p.rise * dt;
      p.x = p.cx + Math.cos(p.a) * p.r;
      p.y = p.cy + Math.sin(p.a) * p.r * 0.6;
      if (p.age > p.life) {
        swirl.splice(i, 1);
      } else {
        drawFly(p, Math.min(1, (p.life - p.age) * 1.6));
      }
    }
  }

  function startFireflies() {
    cancelAnimationFrame(frame);
    if (reduced()) {
      drawStill();
    } else if (!document.hidden) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  }

  // ---------- on desktop, the card tilts gently towards the pointer ----------

  if (matchMedia('(pointer: fine)').matches) {
    let pointerQueued = false;
    let px = 0;
    let py = 0;
    addEventListener('pointermove', (event) => {
      if (reduced()) return;
      px = event.clientX / innerWidth - 0.5;
      py = event.clientY / innerHeight - 0.5;
      if (pointerQueued) return;
      pointerQueued = true;
      requestAnimationFrame(() => {
        pointerQueued = false;
        document.documentElement.style.setProperty('--px', px.toFixed(3));
        document.documentElement.style.setProperty('--py', py.toFixed(3));
      });
    }, { passive: true });
  }

  // Each section sets how many petals are drifting.
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        density = Number(entry.target.dataset.fireflies);
        if (reduced()) {
          drawStill();
        }
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('[data-fireflies]').forEach((node) => sectionObserver.observe(node));

  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
    } else {
      startFireflies();
    }
  });
  motionQuery.addEventListener?.('change', () => {
    applyParallax();
    startFireflies();
  });

  resize();
  startFireflies();
})();
