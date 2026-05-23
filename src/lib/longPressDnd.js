// Action: enables svelte-dnd-action only after a long-press.
// Use alongside `use:dndzone` by binding `dragDisabled` from this action.

export function longPressEnable(node, opts) {
  let timer = null;
  let startX = 0;
  let startY = 0;
  let moved = false;
  let delay = opts.delay ?? 100;

  function down(e) {
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
    timer = window.setTimeout(() => {
      timer = null;
      opts.onEnable();
    }, delay);
  }

  function move(e) {
    if (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8) {
      moved = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
  }

  function up() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      if (!moved) opts.onClick?.();
    }
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  node.addEventListener('pointerdown', down);
  node.addEventListener('pointermove', move);
  node.addEventListener('pointerup', up);
  node.addEventListener('pointercancel', cancel);
  node.addEventListener('pointerleave', cancel);

  return {
    destroy() {
      node.removeEventListener('pointerdown', down);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerup', up);
      node.removeEventListener('pointercancel', cancel);
      node.removeEventListener('pointerleave', cancel);
      if (timer) clearTimeout(timer);
    }
  };
}