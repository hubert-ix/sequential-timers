export function longPressEnable(node, opts) {
  let timer = null;
  let startX = 0;
  let startY = 0;
  let moved = false;
  let longFired = false;
  let blocked = true; // start by blocking dnd
  let savedEvent = null;
  const delay = opts.delay ?? 200;

  function down(e) {
    // If this is our own re-dispatched event, let it through
    if (!blocked) return;

    moved = false;
    longFired = false;
    savedEvent = e;

    // Block dnd from seeing this pointerdown
    e.stopImmediatePropagation();

    startX = e.clientX;
    startY = e.clientY;

    timer = window.setTimeout(() => {
      timer = null;
      longFired = true;
      blocked = false;

      opts.onLongPress?.();
      navigator.vibrate?.(30);

      // Re-dispatch — dnd sees it as a fresh pointerdown while finger is still down
      node.dispatchEvent(new PointerEvent('pointerdown', {
        pointerId: savedEvent.pointerId,
        clientX: savedEvent.clientX,
        clientY: savedEvent.clientY,
        screenX: savedEvent.screenX,
        screenY: savedEvent.screenY,
        pointerType: savedEvent.pointerType,
        isPrimary: savedEvent.isPrimary,
        bubbles: true,
        cancelable: true,
        pressure: 1,
      }));

      // Re-block for next interaction
      blocked = true;
    }, delay);
  }

  function move(e) {
    if (timer && (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8)) {
      moved = true;
      clearTimeout(timer);
      timer = null;
    }
  }

  function up() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!moved && !longFired) opts.onClick?.();
    savedEvent = null;
  }

  function cancel() {
    if (timer) { clearTimeout(timer); timer = null; }
    savedEvent = null;
  }

  // Capture phase so we run before dnd's listener
  node.addEventListener('pointerdown', down, { capture: true });
  node.addEventListener('pointermove', move);
  node.addEventListener('pointerup', up);
  node.addEventListener('pointercancel', cancel);
  node.addEventListener('pointerleave', cancel);

  return {
    update(newOpts) { opts = newOpts; },
    destroy() {
      node.removeEventListener('pointerdown', down, { capture: true });
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerup', up);
      node.removeEventListener('pointercancel', cancel);
      node.removeEventListener('pointerleave', cancel);
      if (timer) clearTimeout(timer);
    }
  };
}