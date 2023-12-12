export class ActionTableFilterSwitch extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes(): string[] {
		return ["name", "label", "value"];
	}

	get name(): string {
		return this.getAttribute("name") || "";
	}

	get label(): string {
		return this.getAttribute("label") || this.name;
	}

	get value(): string {
		return this.getAttribute("value") || "on";
	}

	public connectedCallback(): void {
		this.render();
	}

	private render(): void {
		const html = `<label>
        <input type="checkbox" name="${this.name.toLowerCase()}" value="${this.value}" />
        <span>${this.label}</span>
      </label>`;

		this.innerHTML = `${html}`;
	}
}

customElements.define("action-table-filter-switch", ActionTableFilterSwitch);
