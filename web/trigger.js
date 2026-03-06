export function triggerWorkflowRefresh() {
  console.log("[WF] Attempting to trigger manual refresh...");

  const refreshBtn = document.querySelector('button i.icon-\\[lucide--refresh-cw\\]')?.closest('button');

  if (!refreshBtn) {
    const sidebar = document.querySelector('[data-testid="workflows-sidebar"]');
    if (sidebar) {
      refreshBtn = sidebar.querySelector('button[aria-label*="刷新"], button[aria-label*="Refresh"], button .icon-\\[lucide--refresh-cw\\]')?.closest('button');
    }
  }

  if (refreshBtn) {
    console.log("[WF] Refresh button found:", refreshBtn);

    refreshBtn.focus();

    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      buttons: 1
    });

    const result = refreshBtn.dispatchEvent(clickEvent);

    if (result) {
      console.log("[WF] Refresh event dispatched successfully.");
    } else {
      console.warn("[WF] Refresh event was prevented by some listener.");
    }

    return true;
  } else {
    console.warn("[WF] Refresh button NOT found. Retrying in 1 second...");
    setTimeout(triggerWorkflowRefresh, 1000);
    return false;
  }
}
