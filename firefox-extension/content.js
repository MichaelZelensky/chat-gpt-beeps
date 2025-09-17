(() => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const unlock = () => (ctx.state === 'suspended' ? ctx.resume() : undefined);
  const beep = (f=880,d=0.18,v=0.06,delay=0) => {
    unlock();
    const o=new OscillatorNode(ctx,{type:'sine',frequency:f});
    const g=new GainNode(ctx,{gain:0});
    o.connect(g).connect(ctx.destination);
    const t=ctx.currentTime+delay;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(v,t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.start(t); o.stop(t+d);
  };
  const startBeep = () => beep(660,0.12,0.05);
  const doneBeep  = () => { beep(880,0.14,0.06); beep(1175,0.16,0.06,0.18); };

  // robust priming: accept many gestures; expose manual tester
  const primeOnce = () => { ctx.resume(); console.log('[beep] audio primed'); };
  const prime = () => {
    const h = () => { primeOnce(); rm(); };
    const rm = () => {
      document.removeEventListener('pointerdown', h, true);
      document.removeEventListener('keydown', h, true);
      document.removeEventListener('scroll', h, true);
      document.removeEventListener('visibilitychange', h, true);
      window.removeEventListener('focus', h, true);
    };
    document.addEventListener('pointerdown', h, true);
    document.addEventListener('keydown', h, true);
    document.addEventListener('scroll', h, true);
    document.addEventListener('visibilitychange', h, true);
    window.addEventListener('focus', h, true);
  };
  window.chatgptBeepTest = () => { primeOnce(); beep(); console.log('[beep] test'); };
  prime();

  const q = (s,r=document)=>r.querySelector(s);
  const getLastAssistant = () => { const n=document.querySelectorAll('[data-message-author-role="assistant"]'); return n.length?n[n.length-1]:null; };

  const state = { node:null, lastLen:0, lastChange:0, active:false };
  const lenOf = el => (el?.innerText||'').length;
  const now = () => Date.now();
  const resetForNode = el => { state.node=el; state.lastLen=lenOf(el); state.lastChange=now(); state.active=false; };

  const stopUIPresent = () => !!q('button[aria-label="Stop generating"],[data-testid="stop-button"]');

  const tick = () => {
    const el = getLastAssistant();
    if (!el) return;
    if (el !== state.node) resetForNode(el);
    const len = lenOf(el);
    const grew = len > state.lastLen;
    if (grew && !state.active) { state.active = true; console.log('[beep] START'); startBeep(); }
    if (grew) state.lastChange = now();
    const idle = now() - state.lastChange > 1000;
    if (state.active && idle && !stopUIPresent()) { state.active = false; console.log('[beep] DONE'); doneBeep(); }
    state.lastLen = len;
  };

  const mo = new MutationObserver(tick);
  mo.observe(document.documentElement, { childList:true, subtree:true, characterData:true, attributes:true });
  const iv = setInterval(tick, 200);
  window.stopChatGPTBeep = () => { mo.disconnect(); clearInterval(iv); };
  console.log('[beep] content loaded');
})();
