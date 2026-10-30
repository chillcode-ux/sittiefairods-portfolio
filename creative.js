const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;

// scroll progress + timeline draw
const bar = document.getElementById("progress");
const tl = document.getElementById("timeline");
function progress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  if (tl) {
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
    tl.style.setProperty("--tl", reduce ? 1 : p);
  }
}
progress();
addEventListener("scroll", progress, { passive: true });
addEventListener("resize", progress);

// cursor glow, card spotlight, hero card tilt
if (fine && !reduce) {
  const glow = document.getElementById("glow");
  addEventListener("pointermove", (e) => {
    glow.style.opacity = 1;
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
  document.addEventListener("pointerleave", () => (glow.style.opacity = 0));

  document.querySelectorAll(".card").forEach((c) =>
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", `${e.clientX - r.left}px`);
      c.style.setProperty("--my", `${e.clientY - r.top}px`);
    })
  );

  const t = document.querySelector("[data-tilt]");
  if (t) {
    t.addEventListener("pointermove", (e) => {
      const r = t.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      t.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
    });
    t.addEventListener("pointerleave", () => (t.style.transform = ""));
  }
}

// count-up numbers
if (!reduce) {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = +el.dataset.count;
    el.textContent = "0";
    setTimeout(() => {
      const t0 = performance.now(), dur = 1600;
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 700);
  });
}

// floating gold dust in the hero
const cv = document.getElementById("dust");
if (cv && !reduce) {
  const ctx = cv.getContext("2d");
  let w, h, dots;
  const size = () => {
    w = cv.width = cv.offsetWidth; h = cv.height = cv.offsetHeight;
    dots = Array.from({ length: Math.round(w / 22) }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + 0.4,
      v: Math.random() * 0.25 + 0.08, a: Math.random() * Math.PI * 2,
    }));
  };
  size();
  addEventListener("resize", size);
  (function loop(t) {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.y -= d.v; d.x += Math.sin(t / 2000 + d.a) * 0.25;
      if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w; }
      ctx.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(t / 1400 + d.a));
      ctx.fillStyle = "#e6c778";
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
    }
    requestAnimationFrame(loop);
  })(0);
}
