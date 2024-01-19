export class ActionTableFilterSwitch extends HTMLElement {
	constructor() {
		super();
		this.render();
	}

	public connectedCallback(): void {
		this.render();
	}

	private render(): void {
		const name = this.getAttribute("name");
		if (!name) {
			return;
		}
		const label = this.getAttribute("label") || name;
		const value = this.getAttribute("value") || "on";
		const html = `<label>
        <input type="checkbox" name="${name.toLowerCase()}" value="${value}" />
        <span>${label}</span>
      </label>`;

		this.innerHTML = `${html}`;
	}
}

customElements.define("action-table-filter-switch", ActionTableFilterSwitch);
