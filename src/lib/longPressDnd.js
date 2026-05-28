export function longPressEnable(node, opts) {
  let timer = null;
  let startX = 0;
  let startY = 0;
  let moved = false;
  let longFired = false;
  let savedEvent = null;
  let dispatching = false; // guard for our own synthetic event only
  const delay = opts.delay ?? 200;

  function down(e) {
    if (e.button !== 0) return; // ignore right-click, middle-click, etc.
    if (dispatching) return; // let our synthetic event through, block nothing else from here
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
      opts.onLongPress?.();
      navigator.vibrate?.(30);
      dispatching = true;
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
      dispatching = false; // immediately re-block after dispatch
    }, delay);
  }

  function move(e) {
    if (timer && (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8)) {
      moved = true;
      clearTimeout(timer);
      timer = null;
    }
  }

  function up(e) {
    if (timer) { clearTimeout(timer); timer = null; }
    if (e.button !== 0) return; // ignore right-click, middle-click
    if (!moved && !longFired) {
      opts.onClick?.();
    } else if (longFired) {
      // Long press fired but user released without dragging — cancel drag mode
      opts.onRelease?.();
    }
    savedEvent = null;
    longFired = false;
  }

  function cancel() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (longFired) opts.onRelease?.();
    savedEvent = null;
    longFired = false;
  }

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