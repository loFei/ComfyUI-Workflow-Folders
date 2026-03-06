
import { api } from './api.js';
import { ContextMenu } from './ui-context.js';
import { Modal } from './ui-modal.js';
import { triggerWorkflowRefresh } from './trigger.js';
import { simpleGenerateUUID } from './utils.js';
import { getText } from './i18n.js';

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

    const modal = new Modal();
    const contextMenu = new ContextMenu(async (action, nodeData) => {
        await handleAction(action, nodeData);
    });

    async function handleAction(actionType, nodeData) {
        try {
            const { path, name, type } = nodeData;

            if (actionType === 'new_folder') {
                const newName = await modal.prompt(getText('new_folder_name'));
                if (newName) {
                    await api.mkdir(path, newName);
                    await api.saveEmptyWorkflow(`${path}/${newName}`, simpleGenerateUUID());
                    refreshTree();
                }
            } else if (actionType === 'rename') {
                const newName = await modal.prompt(getText('rename_to'), name);
                if (newName && newName !== name) {
                    await api.rename(path, newName);
                    refreshTree();
                }
            } else if (actionType === 'copy') {
                const defaultName = type === 'file' ? name.replace(/\.json$/, '_copy.json') : name + '_copy';
                const newName = await modal.prompt(getText('copy_as'), defaultName);
                if (newName) {
                    await api.copy(path, newName);
                    refreshTree();
                }
            } else if (actionType === 'delete') {
                const confirmed = await modal.confirm(getText('delete_confirm_tip', path));
                if (confirmed) {
                    await api.delete(path);
                    refreshTree();
                }
            }
        } catch (e) {
            alert(getText('error', e.message));
        }
    }

    function refreshTree() {
        triggerWorkflowRefresh()
        console.log("[Workflow Folders] Data updated. Please refresh the sidebar manually if needed.");
    }

    function parseNodeData(nodeElement) {
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

    function attachContextMenuListener() {
        const workflowSidebar = document.querySelector('[data-testid="workflows-sidebar"]');

        if (!workflowSidebar) {
            setTimeout(attachContextMenuListener, 500);
            return;
        }

        const treeRoots = workflowSidebar.querySelectorAll('.p-tree-root');

        if (treeRoots.length === 0) {
            console.log("[WF] Waiting for .p-tree-root inside workflows-sidebar...");
            setTimeout(attachContextMenuListener, 500);
            return;
        }

        let attachedCount = 0;

        treeRoots.forEach((treeRoot, index) => {
            if (treeRoot.dataset.wfInjected) return;

            treeRoot.dataset.wfInjected = "true";
            attachedCount++;

            console.log(`[WF] Attaching listener to Workflows Tree Root #${index + 1} (Capture Mode)...`);

            treeRoot.addEventListener('contextmenu', (e) => {
                if (e.button !== 2) return;

                const nodeElement = e.target.closest('.p-tree-node');
                const nodeData = parseNodeData(nodeElement);

                // if (!nodeElement || !treeRoot.contains(nodeElement)) {
                //     return;
                // }
                //
                // console.log("[WF] Right-click captured on node:", nodeElement);
                //
                // // const directTestId = nodeElement.getAttribute('data-testid');
                // const innerDivWithTestId = nodeElement.querySelector('div[data-testid]');
                // const anyTestId = nodeElement.querySelector('[data-testid]');
                //
                // let finalTestId = null;
                // if (innerDivWithTestId) {
                //     finalTestId = innerDivWithTestId.getAttribute('data-testid');
                // } else if (anyTestId) {
                //     finalTestId = anyTestId.getAttribute('data-testid');
                // }
                //
                // const contentEl = nodeElement.querySelector('.p-tree-node-content');
                // const labelEl = contentEl?.querySelector('.node-label span') ||
                //     contentEl?.querySelector('.node-label') ||
                //     contentEl;
                // const name = labelEl?.textContent?.trim() || "Unknown";
                //
                // let path = "";
                // let type = nodeElement.classList.contains('p-tree-node-leaf') ? 'file' : 'folder';
                // let parentPath = "";
                //
                // if (finalTestId && finalTestId.startsWith('tree-node-')) {
                //     let rawPath = finalTestId.substring('tree-node-'.length);
                //     console.log("8. Raw Path (after prefix removal):", rawPath);
                //
                //     if (rawPath.startsWith('root/')) {
                //         rawPath = rawPath.substring(5);
                //         console.log("9. Cleaned Path (removed 'root/'):", rawPath);
                //     }
                //
                //     path = rawPath;
                //
                //     const lastSlash = path.lastIndexOf('/');
                //     if (lastSlash > -1) {
                //         parentPath = path.substring(0, lastSlash);
                //     }
                // } else {
                //     console.error("[WF] FAILED to get valid testId. Falling back to name only.");
                //     path = name;
                // }
                //
                // const nodeData = {
                //     name: name,
                //     path: path,
                //     type: type,
                //     parentPath,
                // };

                console.log("[WF] Data:", nodeData);

                if (nodeData.type == 'folder') {
                    setTimeout(() => {
                        if (contextMenu && contextMenu.show) {
                            contextMenu.show(e, nodeData);
                        } else {
                            console.error("[WF] Menu not ready");
                        }
                    }, 10);
                    e.preventDefault();
                    e.stopPropagation();
                }

            }, true);
        });

        if (attachedCount > 0) {
            console.log(`[WF] Successfully attached to ${attachedCount} tree root(s) in Workflows sidebar.`);
        } else {
            console.log("[WF] Trees already injected.");
        }
    }

    attachContextMenuListener();

    const observer = new MutationObserver(() => {
        if (!document.querySelector('.p-tree-root')?.dataset.wfInjected) {
            attachContextMenuListener();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
