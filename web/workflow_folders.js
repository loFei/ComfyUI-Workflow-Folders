import { initWorkflowFolders } from './main.js';

if (window.app) {
  initWorkflowFolders(window.app);
} else {
  const checkApp = setInterval(() => {
    if (window.app) {
      clearInterval(checkApp);
      initWorkflowFolders(window.app);
    }
  }, 500);
}
