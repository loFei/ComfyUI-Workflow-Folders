import { getText } from "./i18n.js";

export class ContextMenu {
    constructor(onAction) {
        this.menu = document.createElement('div');
        this.menu.className = 'wf-context-menu';
        this.menu.style.display = 'none';
        this.onAction = onAction;
        this.overlay = null;

        document.addEventListener('click', () => this.hide());
        document.addEventListener('contextmenu', () => this.hide());

        document.body.appendChild(this.menu);
    }

    show(e, node) {
        this.currentNode = node;
        this.menu.innerHTML = '';

        const actions = this.getActions(node);

        actions.forEach(action => {
            const item = document.createElement('div');
            item.className = 'wf-menu-item';
            item.textContent = action.label;
            item.onclick = (ev) => {
                ev.stopPropagation();
                this.hide();
                this.onAction(action.type, node);
            };
            this.menu.appendChild(item);
        });

        this.menu.style.left = `${e.pageX}px`;
        this.menu.style.top = `${e.pageY}px`;
        this.menu.style.display = 'block';

        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'wf-context-menu-overlay';
            this.overlay.addEventListener('click', (ev) => {
                ev.stopPropagation();
                this.hide();
            });

            this.overlay.addEventListener('contextmenu', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                this.hide();
            });

            document.body.appendChild(this.overlay);
        }

        this.overlay.style.display = 'block';
    }

    hide() {
        this.menu.style.display = 'none';
        this.currentNode = null;
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    }

    getActions(node) {
        const common = [
            { type: 'new_folder', label: `📁 ${getText('new_folder')}` },
            { type: 'rename', label: `✏️ ${getText('rename')}` },
            { type: 'copy', label: `📋 ${getText('copy')}` },
            { type: 'delete', label: `🗑️ ${getText('delete')}`, danger: true }
        ];

        if (node == undefined) {
            return [common[0]];
        }

        if (node.type === 'file') {
            return common;
        }
        return common;
    }
}
