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

                if (nodeData.type == 'folder') {
                    showContextMenu(e, nodeData);
                    e.preventDefault();
                    e.stopPropagation();
                }

            }, true);
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
