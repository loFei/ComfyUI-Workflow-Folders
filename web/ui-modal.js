import { getText } from "./i18n.js";

export class Modal {
    constructor() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'wf-modal-overlay';
        this.overlay.style.display = 'none';

        this.box = document.createElement('div');
        this.box.className = 'wf-modal-box';

        this.overlay.appendChild(this.box);
        document.body.appendChild(this.overlay);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.style.display !== 'none') {
                this.hide();
                if (this.onCancel) this.onCancel();
            }
        });
    }

    async prompt(title, defaultValue = "") {
        return new Promise((resolve) => {
            this.onCancel = () => resolve(null);

            this.box.innerHTML = `
                <h3>${title}</h3>
                <input class="wf-input-group" type="text" id="wf-input" value="${defaultValue}"/>
                <div style="text-align:right;">
                    <button class="wf-btn wf-btn-cancel" id="wf-btn-cancel">${getText('cancel')}</button>
                    <button class="wf-btn wf-btn-confirm" id="wf-btn-confirm">${getText('ok')}</button>
                </div>
            `;

            this.overlay.style.display = 'flex';
            const input = this.box.querySelector('#wf-input');
            input.focus();
            input.select();

            this.box.querySelector('#wf-btn-cancel').onclick = () => {
                this.hide();
                resolve(null);
            };

            this.box.querySelector('#wf-btn-confirm').onclick = () => {
                const val = input.value.trim();
                if (!val) {
                    alert(getText('name_cannot_be_empty'));
                    return;
                }
                this.hide();
                resolve(val);
            };

            input.onkeydown = (e) => {
                if (e.key === 'Enter') this.box.querySelector('#wf-btn-confirm').click();
            };
        });
    }

    async confirm(message) {
        return new Promise((resolve) => {
            this.onCancel = () => resolve(false);

            this.box.innerHTML = `
                <h3>${getText('confirm')}</h3>
                <p>${message}</p>
                <div style="text-align:right;">
                    <button class="wf-btn wf-btn-cancel" id="wf-btn-cancel">${getText('cancel')}</button>
                    <button class="wf-btn wf-btn-danger" id="wf-btn-danger">${getText('delete')}</button>
                </div>
            `;

            this.overlay.style.display = 'flex';

            this.box.querySelector('#wf-btn-cancel').onclick = () => {
                this.hide();
                resolve(false);
            };

            this.box.querySelector('#wf-btn-danger').onclick = () => {
                this.hide();
                resolve(true);
            };
        });
    }

    hide() {
        this.overlay.style.display = 'none';
        this.box.innerHTML = '';
    }
}
