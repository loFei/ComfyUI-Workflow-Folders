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

        this.menu.style.left = `${e.clientX}px`;
        this.menu.style.top = `${e.clientY}px`;
        this.menu.style.display = 'block';

        // Clamp so the menu never overflows the viewport (bottom/right edges)
        const mw = this.menu.offsetWidth;
        const mh = this.menu.offsetHeight;
        const pad = 8;
        let left = e.clientX;
        let top = e.clientY;
        if (left + mw > window.innerWidth - pad) {
            left = Math.max(pad, left - mw);
        }
        if (top + mh > window.innerHeight - pad) {
            top = Math.max(pad, top - mh);
        }
        this.menu.style.left = `${left}px`;
        this.menu.style.top = `${top}px`;

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
        if (node == undefined) {
            return [
                { type: 'new_folder', label: `📁 ${getText('new_folder')}` },
            ];
        }

        if (node.type === 'file') {
            return [
                { type: 'move_to', label: `📦 ${getText('move_to')}` },
                { type: 'rename', label: `✏️ ${getText('rename')}` },
                { type: 'copy', label: `📋 ${getText('copy')}` },
                { type: 'delete', label: `🗑️ ${getText('delete')}`, danger: true },
            ];
        }

        return [
            { type: 'new_folder', label: `📁 ${getText('new_folder')}` },
            { type: 'new_workflow', label: `📄 ${getText('new_workflow')}` },
            { type: 'move_to', label: `📦 ${getText('move_to')}` },
            { type: 'rename', label: `✏️ ${getText('rename')}` },
            { type: 'copy', label: `📋 ${getText('copy')}` },
            { type: 'delete', label: `🗑️ ${getText('delete')}`, danger: true },
        ];
    }
}
