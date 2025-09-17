(() => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const unlock = () => (ctx.state === 'suspended' ? ctx.resume() : undefined);
  const beepStart = () => {
    unlock();
    const o = new OscillatorNode(ctx, { type: 'sine', frequency: 660 });
    const g = new GainNode(ctx, { gain: 0 });
    o.connect(g).connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.start(t); o.stop(t + 0.12);
  };

  // prime audio once per tab
  const prime = () => {
    const h = () => { ctx.resume(); cleanup(); };
    const cleanup = () => {
      document.removeEventListener('pointerdown', h, true);
      document.removeEventListener('keydown', h, true);
    };
    document.addEventListener('pointerdown', h, true);
    document.addEventListener('keydown', h, true);
  };
  prime();

  const q = (sel, root = document) => root.querySelector(sel);
  const getLastAssistant = () => {
    const nodes = document.querySelectorAll('[data-message-author-role="assistant"]');
    return nodes.length ? nodes[nodes.length - 1] : null;
  };

  const startedFor = new WeakSet(); // mark elements we already beeped for

  // decide if this assistant block is “newly streaming”
  const isStreamingNow = () => !!q('.result-streaming') || !!q('button[aria-label="Stop generating"],[data-testid="stop-button"]');

  const tryBeepFor = (el) => {
    if (!el || startedFor.has(el)) return;
    // heuristics: if streaming UI visible OR text just began to grow from near-empty
    const textLen = (el.innerText || '').trim().length;
    if (isStreamingNow() || textLen > 20) { // 20 chars guards against history render
      startedFor.add(el);
      beepStart();
    }
  };

  // observe DOM for either streaming UI or content growth
  const mo = new MutationObserver((muts) => {
    // if stop button / streaming class showed up → beep for current last assistant
    for (const m of muts) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        if ((m.target instanceof Element) && m.target.classList.contains('result-streaming')) {
          tryBeepFor(getLastAssistant());
          return;
        }
      }
      if (m.type === 'childList') {
        // if stop button appeared anywhere
        if ([...m.addedNodes].some(n =>
          n.nodeType === 1 && (n.matches?.('button[aria-label="Stop generating"],[data-testid="stop-button"]') ||
          n.querySelector?.('button[aria-label="Stop generating"],[data-testid="stop-button"]'))
        )) {
          tryBeepFor(getLastAssistant());
          return;
        }
        // if the last assistant node mutated (first tokens arrived)
        const last = getLastAssistant();
        if (last && (m.target === last || (m.target instanceof Node && last.contains(m.target)))) {
          tryBeepFor(last);
        }
      }
      if (m.type === 'characterData') {
        const last = getLastAssistant();
        if (last && last.contains(m.target)) tryBeepFor(last);
      }
    }
  });

  mo.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class']
  });

  // expose a manual test
  window.chatgptBeepTestStart = () => beepStart();
  console.log('[beep] start-only detector active');
})();
