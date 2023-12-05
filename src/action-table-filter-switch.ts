export class ActionTableFilterSwitch extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes(): string[] {
		return ["col", "filter", "label"];
	}

	get col(): string {
		return this.getAttribute("col") || "";
	}

	get filter(): string {
		return this.getAttribute("filter") || "checked";
	}

	get label(): string {
		return this.getAttribute("label") || this.col;
	}

	public connectedCallback(): void {
		this.render();
		this.addEventListeners();
	}

	private render(): void {
		const html = `<label class="switch">
        <input type="checkbox" />
        <span>${this.label}</span>
      </label>`;

		this.innerHTML = `${html}`;
	}

	private addEventListeners(): void {
		// Add event listener that detects changes in the select element
		this.addEventListener("click", (event) => {
			const target = event.target as HTMLInputElement;
			let value = target.checked ? this.filter : "";
			let detail = { col: this.col, value };
			this.dispatchEvent(new CustomEvent("action-table-filter", { detail, bubbles: true }));
		});
	}

	public resetFilter() {
		const input = this.querySelector("input");
		if (input) {
			input.checked = false;
		}
	}
}

customElements.define("action-table-filter-switch", ActionTableFilterSwitch);
