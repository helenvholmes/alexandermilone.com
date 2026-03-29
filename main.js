const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Gyroscope parallax on footer wordmark
(function () {
  const wordmark = document.querySelector('.footer-wordmark');
  if (!wordmark) return;

  const MAX_SHIFT = 40; // px
  const SENSITIVITY = 0.6; // degrees-to-px multiplier
  let targetX = 0;
  let currentX = 0;
  let rafId = null;

  function applyParallax(gamma) {
    // gamma: left/right tilt, -90 to 90
    const clamped = Math.max(-60, Math.min(60, gamma));
    targetX = clamped * SENSITIVITY;
    targetX = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, targetX));

    if (!rafId) {
      rafId = requestAnimationFrame(function tick() {
        currentX += (targetX - currentX) * 0.12; // lerp for smoothness
        wordmark.style.setProperty('--wordmark-x', `${currentX.toFixed(2)}px`);
        rafId = Math.abs(targetX - currentX) > 0.05
          ? requestAnimationFrame(tick)
          : null;
      });
    }
  }

  function startListening() {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null) applyParallax(e.gamma);
    });
  }

  // iOS 13+ requires permission
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    // Request on first user interaction
    document.addEventListener('touchstart', function request() {
      DeviceOrientationEvent.requestPermission()
        .then(state => { if (state === 'granted') startListening(); })
        .catch(() => {});
      document.removeEventListener('touchstart', request);
    }, { once: true });
  } else if (typeof DeviceOrientationEvent !== 'undefined') {
    startListening();
  }
})();

function createScramble(element, { speed = 45, iterations = 10 } = {}) {
  const original = element.textContent;
  let interval = null;
  let count = 0;

  function tick() {
    count++;
    if (count >= iterations) {
      clearInterval(interval);
      interval = null;
      element.textContent = original;
      return;
    }
    element.textContent = original
      .split('')
      .map(ch => (ch === ' ' || ch === ',') ? ch : CHARS[Math.floor(Math.random() * CHARS.length)])
      .join('');
  }

  return {
    start() {
      if (interval) clearInterval(interval);
      count = 0;
      interval = setInterval(tick, speed);
    },
    stop() {
      clearInterval(interval);
      interval = null;
      element.textContent = original;
    },
  };
}

document.querySelectorAll('td:first-child a').forEach(link => {
  const br = link.querySelector('br');
  if (!br) return;
  const arrow = document.createElement('span');
  arrow.className = 'arrow';
  arrow.textContent = '↗';
  br.parentNode.insertBefore(arrow, br);
});

document.querySelectorAll('table tr').forEach(row => {
  const dateCell = row.querySelector('td:last-child');
  if (!dateCell) return;
  const effect = createScramble(dateCell, { speed: 80, iterations: 7 });
  row.addEventListener('mouseenter', () => effect.start());
  row.addEventListener('mouseleave', () => effect.stop());
});
