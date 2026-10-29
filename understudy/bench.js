// The bench: let go of a block at 1 g, where it lands and rests, or at 0 g, where it keeps drifting.
(() => {
  const block = document.getElementById("block");
  const jawA = document.getElementById("jawA");
  const jawB = document.getElementById("jawB");
  const stars = document.getElementById("stars");
  const readout = document.getElementById("readout");
  const verdict = document.getElementById("verdict");
  const release = document.getElementById("release");
  const radios = [...document.querySelectorAll(".switch button")];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const HOLD = { x: 330, y: 170 };
  const REST_Y = 262; // block centre on the bench top
  let gravity = "earth";
  let frame = 0;
  let state;

  const text = {
    held: "The arm holds a block over its target.",
    earth: "Earth, 1 g: the block lands on the target and rests. The rehearsal passes.",
    orbit: "Orbit, 0 g: the block keeps drifting off the target. The rehearsal fails. The repair loop has to patch the program to hold the block until it is constrained.",
  };

  function draw() {
    block.setAttribute("transform", `translate(${state.x.toFixed(1)} ${state.y.toFixed(1)}) rotate(${state.r.toFixed(1)})`);
    const open = state.open * 10;
    jawA.setAttribute("d", `M${318 - open} 150L${318 - open} 176`);
    jawB.setAttribute("d", `M${342 + open} 150L${342 + open} 176`);
  }

  function reset() {
    cancelAnimationFrame(frame);
    state = { x: HOLD.x, y: HOLD.y, vx: 0, vy: 0, r: 0, vr: 0, open: 0, t: 0 };
    stars.style.opacity = gravity === "orbit" ? "1" : "0";
    readout.textContent = gravity === "orbit" ? "SO-101 at 0 g" : "SO-101 at 1 g";
    verdict.textContent = text.held;
    verdict.className = "verdict";
    release.disabled = false;
    release.textContent = "Release";
    draw();
  }

  function finish() {
    verdict.textContent = text[gravity];
    verdict.className = gravity === "earth" ? "verdict pass" : "verdict fail";
    release.disabled = false;
    release.textContent = "Run it again";
  }

  function step() {
    state.t += 1;
    state.open = Math.min(1, state.open + 0.12);
    if (gravity === "earth") {
      state.vy += 0.55;
      state.y += state.vy;
      if (state.y >= REST_Y) {
        state.y = REST_Y;
        state.vy = Math.abs(state.vy) > 2 ? -state.vy * 0.22 : 0;
      }
      draw();
      if (state.vy === 0 && state.y === REST_Y) return finish();
    } else {
      state.x += state.vx;
      state.y += state.vy;
      state.r += state.vr;
      draw();
      if (state.t > 260 || state.x > 560 || state.y < -40) return finish();
    }
    frame = requestAnimationFrame(step);
  }

  function go() {
    if (release.textContent !== "Release") reset();
    release.disabled = true;
    // The arm lets go with the small velocity it had on the way in.
    state.vx = gravity === "orbit" ? 0.55 : 0;
    state.vy = gravity === "orbit" ? -0.28 : 0;
    state.vr = gravity === "orbit" ? 0.35 : 0;
    if (reduced.matches) {
      state.open = 1;
      if (gravity === "earth") state.y = REST_Y;
      else { state.x = 440; state.y = 110; state.r = 38; }
      draw();
      return finish();
    }
    frame = requestAnimationFrame(step);
  }

  radios.forEach((b) => b.addEventListener("click", () => {
    gravity = b.dataset.g;
    radios.forEach((r) => r.setAttribute("aria-checked", String(r === b)));
    reset();
  }));
  radios.forEach((b, i) => b.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = radios[(i + 1) % radios.length];
    next.focus();
    next.click();
  }));
  release.addEventListener("click", go);
  reset();
})();
