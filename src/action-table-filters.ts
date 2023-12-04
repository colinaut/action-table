export class ActionTableFilters extends HTMLElement {
	constructor() {
		super();
	}
	private filters!: NodeListOf<HTMLSelectElement | HTMLInputElement>;
	public connectedCallback(): void {
		this.filters = this.querySelectorAll("select, input[type=checkbox], input[type=radio]") as NodeListOf<HTMLSelectElement | HTMLInputElement>;
		// console.log("🚀 ~ file: action-table-filters.ts:9 ~ ActionTableFilters ~ connectedCallback ~ this.filters:", this.filters);
		this.addEventListeners();
	}

	public resetAllFilters(): void {
		this.filters.forEach((filter) => {
			if (filter.type === "checkbox") {
				const input = filter as HTMLInputElement;
				input.checked = false;
			}
			if (filter.type === "radio") {
				const input = filter as HTMLInputElement;
				if ((input.value = "")) {
					input.checked = true;
				} else {
					input.checked = false;
				}
			}
			if (filter.tagName.toLowerCase() === "select") {
				filter.value = "";
			}
		});
	}

	private addEventListeners(): void {
		// Add event listener that detects changes in the select element

		this.filters?.forEach((el) => {
			console.log("el:", el);
			// TODO: allow multiple checkboxes for an array of filters
			if (el.type === "checkbox") {
				const input = el as HTMLInputElement;
				input.addEventListener("change", () => {
					let detail = { col: input.name, value: input.value };
					if (!input.checked) {
						detail = { col: input.name, value: "" };
					}
					this.dispatchEvent(new CustomEvent("action-table-filter", { detail, bubbles: true }));
				});
			}
			if (el.type === "radio") {
				el.addEventListener("change", () => {
					const detail = { col: el.name, value: el.value };
					this.dispatchEvent(new CustomEvent("action-table-filter", { detail, bubbles: true }));
				});
			}
			if (el.tagName.toLowerCase() === "select") {
				el.addEventListener("change", () => {
					const detail = { col: el.name, value: el.value };
					this.dispatchEvent(new CustomEvent("action-table-filter", { detail, bubbles: true }));
				});
			}
		});
		const resetButton = this.querySelector("button[type=reset]") as HTMLButtonElement;
		resetButton?.addEventListener("click", () => {
			this.dispatchEvent(new CustomEvent("action-table-filter-reset", { bubbles: true }));
		});

		// add listener for action-table-filter-reset event
		this.addEventListener("action-table-filter-reset", () => {
			this.resetAllFilters();
		});
	}
}

customElements.define("action-table-filters", ActionTableFilters);
