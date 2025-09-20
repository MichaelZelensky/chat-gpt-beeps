(() => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const unlock = () => (ctx.state === 'suspended' ? ctx.resume() : undefined);

  const playTone = (freq, dur, at = 0, gain = 0.06) => {
    unlock();
    const o = new OscillatorNode(ctx, { type: 'sine', frequency: freq });
    const g = new GainNode(ctx, { gain: 0 });
    o.connect(g).connect(ctx.destination);
    const t = ctx.currentTime + at;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur);
  };

  const beepStart = () => playTone(660, 0.12);
  const beepEnd = () => { playTone(523.25, 0.09, 0); playTone(784, 0.09, 0.12); };

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

  const isGeneratingNow = () =>
    !!q('.result-streaming') ||
    !!q('button[aria-label="Stop generating"],[data-testid="stop-button"]');

  const isSpeechReady = () =>
    !!q('button[data-testid="composer-speech-button"][aria-label="Start voice mode"]');

  const startedFor = new WeakSet();
  const tryBeepFor = (el) => {
    if (!el || startedFor.has(el)) return;
    const textLen = (el.innerText || '').trim().length;
    if (isGeneratingNow() || textLen > 20) {
      startedFor.add(el);
      beepStart();
    }
  };

  let wasGenerating = false;
  const checkTransition = () => {
    const generating = isGeneratingNow();
    if (generating && !wasGenerating) tryBeepFor(getLastAssistant());
    if (!generating && wasGenerating && (isSpeechReady() || !isGeneratingNow())) beepEnd();
    wasGenerating = generating;
  };

  const mo = new MutationObserver(() => checkTransition());
  mo.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', 'aria-label', 'data-testid']
  });

  window.chatgptBeepTestStart = () => beepStart();
  window.chatgptBeepTestEnd = () => beepEnd();
  console.log('[beep] start+end detector active');
})();
