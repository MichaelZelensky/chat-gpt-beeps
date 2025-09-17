(() => {
  const getAudioCtx = () => new (window.AudioContext || window.webkitAudioContext)();
  const ctx = getAudioCtx();

  const unlock = () => (ctx.state === 'suspended' ? ctx.resume() : undefined);
  const playBeep = (freq = 880, dur = 0.18, vol = 0.06, delay = 0) => {
    unlock();
    const osc = new OscillatorNode(ctx, { type: 'sine', frequency: freq });
    const gain = new GainNode(ctx, { gain: 0 });
    osc.connect(gain).connect(ctx.destination);
    const t = ctx.currentTime + delay;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur);
  };

  const playStart = () => playBeep(660, 0.12, 0.05);
  const playDone  = () => { playBeep(880, 0.14, 0.06); playBeep(1175, 0.16, 0.06, 0.18); };

  const q = (sel, root = document) => root.querySelector(sel);
  const getLastAssistant = () => {
    const nodes = document.querySelectorAll('[data-message-author-role="assistant"]');
    return nodes.length ? nodes[nodes.length - 1] : null;
  };

  const state = { node: null, lastLen: 0, lastChange: 0, active: false };
  const now = () => Date.now();
  const lenOf = el => (el?.innerText || '').length;
  const resetForNode = el => {
    state.node = el;
    state.lastLen = lenOf(el);
    state.lastChange = now();
    state.active = false;
  };

  const tick = () => {
    const el = getLastAssistant();
    if (!el) return;
    if (el !== state.node) resetForNode(el);

    const len = lenOf(el);
    const grew = len > state.lastLen;

    if (grew && !state.active) { state.active = true; playStart(); }
    if (grew) state.lastChange = now();

    const idleMs = now() - state.lastChange;
    const stopUi = !!q('button[aria-label="Stop generating"],[data-testid="stop-button"]');
    if (state.active && idleMs > 1000 && !stopUi) { state.active = false; playDone(); }

    state.lastLen = len;
  };

  const observe = () => {
    const mo = new MutationObserver(tick);
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
    const iv = setInterval(tick, 200);
    const cleanup = () => { mo.disconnect(); clearInterval(iv); };
    window.addEventListener('pagehide', cleanup, { once: true });
  };

  const prime = () => {
    // user gesture may be required once per tab; hook common interactions
    const handler = () => { ctx.resume(); document.removeEventListener('pointerdown', handler, true); };
    document.addEventListener('pointerdown', handler, true);
  };

  prime();
  observe();
})();
