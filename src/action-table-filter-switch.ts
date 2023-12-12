export class ActionTableFilterSwitch extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes(): string[] {
		return ["col", "label", "value"];
	}

	get col(): string {
		return this.getAttribute("col") || "";
	}

	get label(): string {
		return this.getAttribute("label") || this.col;
	}

	get value(): string {
		return this.getAttribute("value") || "on";
	}

	public connectedCallback(): void {
		this.render();
	}

	private render(): void {
		const html = `<label>
        <input type="checkbox" name="${this.col.toLowerCase()}" value="${this.value}" />
        <span>${this.label}</span>
      </label>`;

		this.innerHTML = `${html}`;
	}
}

customElements.define("action-table-filter-switch", ActionTableFilterSwitch);
