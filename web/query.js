export function querySidebarElement() {
  return document.querySelector('[data-testid="workflows-sidebar"]');
}

export function queryPanelElement() {
  const sidebar = querySidebarElement();
  if (!sidebar) return null;
  return sidebar.querySelector('.comfyui-workflows-panel').parentElement;
}

export function queryBroweElement() {
  const panel = queryPanelElement();
  if (!panel) return null;
  return panel.querySelector('.comfyui-workflows-browse');
}

export function queryTreeRootElement() {
  const browe = queryBroweElement();
  if (!browe) return undefined;
  return browe.querySelector('.p-tree-root');
}

export function queryTreeNodeElements() {
  const treeRoot = queryTreeRootElement();
  if (!treeRoot) return [];
  return treeRoot.querySelectorAll('.p-tree-node');
}

export function queryClosestTreeNodeElement(element) {
  if (!element) return null;
  return element.closest('.p-tree-node');
}

export function queryNodeData(nodeElement) {
  const testIdElement = nodeElement.querySelector('[data-testid]');

  if (!testIdElement) {
    console.warn("[WF] No element with data-testid found inside node.");
    return null;
  }

  const fullTestId = testIdElement.getAttribute('data-testid');

  if (!fullTestId || !fullTestId.startsWith('tree-node-')) {
    console.warn("[WF] Invalid data-testid format:", fullTestId);
    return null;
  }

  let rawPath = fullTestId.substring('tree-node-'.length);

  if (rawPath.startsWith('root/')) {
    rawPath = rawPath.substring(5);
  } else if (rawPath === 'root') {
    rawPath = '';
  }

  const name = rawPath.includes('/')
    ? rawPath.substring(rawPath.lastIndexOf('/') + 1)
    : rawPath;

  const isLeaf = nodeElement.classList.contains('p-tree-node-leaf');
  const type = isLeaf ? 'file' : 'folder';

  let parentPath = "";
  const lastSlashIndex = rawPath.lastIndexOf('/');
  if (lastSlashIndex > -1) {
    parentPath = rawPath.substring(0, lastSlashIndex);
  }

  return {
    name: name || "Unknown",
    path: rawPath,
    type: type,
    parentPath: parentPath,
    _sourceTestId: fullTestId
  };
}


