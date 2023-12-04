export class ActionTableFilterMenu extends HTMLElement {
	private shadow: ShadowRoot;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
	}

	// TODO: Add exact attribute that switches the filter to be exact match rather than includes

	static get observedAttributes(): string[] {
		return ["col", "options", "label", "switch"];
	}

	get col(): string {
		return this.getAttribute("col")?.trim().toLowerCase() || "";
	}

	get options(): string {
		return this.getAttribute("options") || "";
	}

	get label(): string {
		return this.getAttribute("label") || "";
	}

	get switch(): string {
		return this.getAttribute("switch") || "";
	}

	private addEventListeners(): void {
		// Add event listener that detects changes in the select element
		this.shadow.addEventListener("change", (event) => {
			const el = event.target as HTMLSelectElement;
			if (el.tagName === "SELECT") {
				const col = this.col;
				if (col) {
					const value = el.value;
					const detail = { col, value };
					this.dispatchEvent(new CustomEvent("action-table-filter", { detail, bubbles: true }));
					// console.log("🚀 ~ file: main.ts:200 ~ ActionTableFilter ~ this.shadow.addEventListener ~ detail:", detail);
				}
			}
		});
	}

	public resetFilter() {
		console.log(`reset filter ${this.col}`);
		const select = this.shadowRoot?.querySelector("select");
		if (select) {
			select.value = "";
		}
		const detail = { col: this.col, value: "" };
		this.dispatchEvent(new CustomEvent("action-table-filter", { detail, bubbles: true }));
	}

	public connectedCallback(): void {
		this.render();

		this.addEventListeners();
	}

	private render(): void {
		const html = `${this.label ? `<label part="label">${this.label}</label> ` : ""}<select part="select" data-col="${this.col}"><option value="">All</option>${this.options
			.split(",")
			.map((option) => `<option value="${option}">${option}</option>`)}</select>`;
		const css = `<style></style>`;

		this.shadow.innerHTML = `${css}${html}`;
	}
}

export class ActionTableFilterReset extends HTMLElement {
	private shadow: ShadowRoot;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
	}

	public connectedCallback(): void {
		this.render();
		this.addEventListeners();
	}

	private render(): void {
		const html = `<button part="reset-button"><slot>Reset Filters</slot></button>`;

		this.shadow.innerHTML = `${html}`;
	}

	private addEventListeners(): void {
		// Add event listener that detects changes in the select element
		this.shadow.addEventListener("click", () => {
			this.dispatchEvent(new CustomEvent("action-table-filter-reset", { bubbles: true }));
		});
	}
}

customElements.define("action-table-filter-menu", ActionTableFilterMenu);
customElements.define("action-table-filter-reset", ActionTableFilterReset);
