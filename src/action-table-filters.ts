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
				if (input.value === "") {
					input.checked = true;
				}
			}
			if (filter.tagName.toLowerCase() === "select") {
				filter.value = "";
			}
		});
		// find all action-table-filter elements and call resetFilter
		interface ActionTableFilter extends HTMLElement {
			resetFilter(options?: { dispatch: boolean }): void;
		}
		const filterMenus = this.querySelectorAll("action-table-filter-menu, action-table-filter-switch") as NodeListOf<ActionTableFilter>;

		filterMenus?.forEach((el) => {
			el.resetFilter();
		});
	}

	private addEventListeners(): void {
		this.filters?.forEach((el) => {
			if (el.type === "checkbox") {
				const input = el as HTMLInputElement;
				input.addEventListener("change", () => {
					const checkboxValues = Array.from(this.filters)
						.filter((filter) => {
							if (filter.type === "checkbox") {
								const checkbox = filter as HTMLInputElement;
								return checkbox.type === "checkbox" && checkbox.name === input.name && checkbox.checked;
							} else {
								return false;
							}
						})
						.map((checkbox) => checkbox.value);

					let detail = { col: input.name, value: checkboxValues };

					this.dispatchEvent(new CustomEvent("action-table-filter", { detail, bubbles: true }));
				});
			}
			if (el.type === "radio") {
				el.addEventListener("change", () => {
					const detail = { col: el.name, value: el.value };
					this.dispatchEvent(new CustomEvent("action-table-filter", { detail, bubbles: true }));
					console.log("🚀 ~ file: action-table-filters.ts:68 ~ ActionTableFilters ~ el.addEventListener ~ detail:", detail);
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
import "./action-table-filter-menu";
import "./action-table-filter-switch";
