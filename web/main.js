import { ContextMenu } from './ui-context.js';
import { Modal } from './ui-modal.js';
import {
    queryClosestTreeNodeElement,
    queryNodeData,
    queryPanelElement,
    queryTreeNodeElements,
    queryTreeRootElement
} from './query.js';
import { handleAction } from './action.js';
import { api } from './api.js';
import { triggerWorkflowRefresh } from './trigger.js';

const getBaseUrl = () => {
    const url = import.meta.url;
    return url.substring(0, url.lastIndexOf('/'));
};

export function initWorkflowFolders(app) {
    console.log("[Workflow Folders] Injecting into native PrimeVue Tree...");

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = `${getBaseUrl()}/styles.css`;
    document.head.appendChild(cssLink);

    let reAttach = true;

    const modal = new Modal();
    const contextMenu = new ContextMenu(async (action, nodeData) => {
        reAttach = await handleAction(action, nodeData, modal);
    });

    function showContextMenu(e, nodeData) {
        setTimeout(() => {
            if (contextMenu && contextMenu.show) {
                contextMenu.show(e, nodeData);
            } else {
                console.error("[WF] Menu not ready");
            }
        }, 10);
    }

    function attachContextMenuListener() {
        const treeRoot = queryTreeRootElement();
        if (!treeRoot) {
            setTimeout(attachContextMenuListener, 500);
            return;
        }
        if (treeRoot.dataset.wfInjected && !reAttach) return;
        treeRoot.dataset.wfInjected = "true";

        const treeNodes = queryTreeNodeElements(treeRoot);
        if (treeNodes.length === 0) {
            return;
        }

        let attachCount = 0;
        treeNodes.forEach((treeNode, index) => {
            if (treeNode.dataset.wfInjected) return;
            treeNode.dataset.wfInjected = "true";
            console.log(`[WF] Attaching listener to Workflows Tree Root #${index + 1} (Capture Mode)...`);

            treeNode.addEventListener('contextmenu', (e) => {
                if (e.button !== 2) return;
                const node = queryClosestTreeNodeElement(e.target);
                const nodeData = queryNodeData(node);
                console.log("[WF] Data:", nodeData);

                if (nodeData && (nodeData.type === 'folder' || nodeData.type === 'file')) {
                    showContextMenu(e, nodeData);
                    e.preventDefault();
                    e.stopPropagation();
                }

            }, true);

            // Drag & Drop
            const contentEl = treeNode.querySelector('.p-tree-node-content');
            if (contentEl) {
                contentEl.setAttribute('draggable', 'true');

                contentEl.addEventListener('dragstart', (e) => {
                    const node = queryClosestTreeNodeElement(e.target);
                    const nodeData = queryNodeData(node);
                    if (!nodeData) return;
                    e.dataTransfer.setData('application/wf-path', nodeData.path);
                    e.dataTransfer.setData('application/wf-type', nodeData.type);
                    e.dataTransfer.setData('application/wf-parent', nodeData.parentPath || '');
                    e.dataTransfer.effectAllowed = 'move';
                    treeNode.classList.add('wf-dragging');
                });

                contentEl.addEventListener('dragend', () => {
                    treeNode.classList.remove('wf-dragging');
                    document.querySelectorAll('.wf-drag-over').forEach(el => el.classList.remove('wf-drag-over'));
                });

                contentEl.addEventListener('dragover', (e) => {
                    const node = queryClosestTreeNodeElement(e.target);
                    const targetData = queryNodeData(node);
                    if (targetData && targetData.type === 'folder') {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        contentEl.classList.add('wf-drag-over');
                    }
                });

                contentEl.addEventListener('dragleave', () => {
                    contentEl.classList.remove('wf-drag-over');
                });

                contentEl.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    contentEl.classList.remove('wf-drag-over');
                    const srcPath = e.dataTransfer.getData('application/wf-path');
                    const srcParent = e.dataTransfer.getData('application/wf-parent');
                    const node = queryClosestTreeNodeElement(e.target);
                    const targetData = queryNodeData(node);

                    if (!srcPath || !targetData || targetData.type !== 'folder') return;
                    if (targetData.path === srcParent) return; // already in this folder
                    if (srcPath === targetData.path) return; // dropping on itself

                    try {
                        await api.move(srcPath, targetData.path);
                        triggerWorkflowRefresh();
                    } catch (err) {
                        alert(err.message);
                    }
                });
            }

            attachCount++;
        });

        console.log(`[WF] Workflow folders ${attachCount} already injected.`);
    }

    function attachPanelContextMenuListener() {
        const panel = queryPanelElement();

        if (!panel) {
            setTimeout(attachPanelContextMenuListener, 500);
            return;
        }

        if (panel.dataset.wfInjected && !reAttach) return;
        panel.dataset.wfInjected = "true";

        panel.addEventListener('contextmenu', (e) => {
            if (e.button !== 2) return;
            const treeRoot = queryTreeRootElement();
            if (!treeRoot) {
                showContextMenu(e, undefined);
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            const clickX = e.clientX;
            const clickY = e.clientY;
            const rect = treeRoot.getBoundingClientRect();
            const inTreeRoot = (clickX >= rect.left &&
                clickX <= rect.right &&
                clickY >= rect.top &&
                clickY <= rect.bottom);
            if (!inTreeRoot) {
                showContextMenu(e, undefined);
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        console.log("[WF] Workflow panel already injected.");
    }

    attachPanelContextMenuListener();
    attachContextMenuListener();
    reAttach = false;

    const observer = new MutationObserver(() => {
        const panel = queryPanelElement();
        if (!panel?.dataset.wfInjected || reAttach) {
            attachPanelContextMenuListener();
        }

        const treeRoot = queryTreeRootElement();
        if (!treeRoot?.dataset.wfInjected || reAttach) {
            attachContextMenuListener();
        }
        reAttach = false;
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
