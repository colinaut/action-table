export class ActionTableFilterSwitch extends HTMLElement {
	connectedCallback(): void {
		const name = this.getAttribute("name");
		if (name) {
			this.innerHTML = `<label>
            <input type="checkbox" name="${name.toLowerCase()}" value="${this.getAttribute("value") || "on"}" />
            <span>${this.getAttribute("label") || name}</span>
          </label>`;
		}
	}
}

customElements.define("action-table-filter-switch", ActionTableFilterSwitch);
