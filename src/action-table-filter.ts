export class ActionTableFilter extends HTMLElement {
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

	public connectedCallback(): void {
		this.render();

		this.addEventListeners();
	}

	private render(): void {
		const html = `${this.label ? `<label>${this.label}</label> ` : ""}<select data-col="${this.col}"><option value="">All</option>${this.options
			.split(",")
			.map((option) => `<option value="${option}">${option}</option>`)}</select>`;
		const css = `<style></style>`;

		this.shadow.innerHTML = `${css}${html}`;
	}
}

customElements.define("action-table-filter", ActionTableFilter);
