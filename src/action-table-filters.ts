import { ActionTable } from "./action-table";
import { FiltersObject } from "./types";
export class ActionTableFilters extends HTMLElement {
	constructor() {
		super();
	}

	private filterElements!: NodeListOf<HTMLSelectElement | HTMLInputElement>;

	/* -------------------------------------------------------------------------- */
	/*                             Connected Callback                             */
	/* -------------------------------------------------------------------------- */
	public connectedCallback(): void {
		this.init();
	}

	/* -------------------------------------------------------------------------- */
	/*                         Private Method: async init                         */
	/* -------------------------------------------------------------------------- */

	private async init() {
		// 1. Check if the action-table-filter-menu and action-table-filter-switch exist
		await this.checkForActionTableFilterElements();
		// 2. Grab the Node List of filter elements
		this.filterElements = this.querySelectorAll("select, input[type=checkbox], input[type=radio]") as NodeListOf<HTMLSelectElement | HTMLInputElement>;
		// console.log("filterElements", this.filterElements);

		// 3. Add event listeners
		this.addEventListeners();
	}

	/* -------------------------------------------------------------------------- */
	/*              Private Method: toggle highlight for select menu              */
	/* -------------------------------------------------------------------------- */

	private toggleHighlight(el: HTMLInputElement | HTMLSelectElement): void {
		if (el.value) {
			el.classList.add("selected");
		} else {
			el.classList.remove("selected");
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                        Private: add event listeners                        */
	/* -------------------------------------------------------------------------- */

	private addEventListeners(): void {
		const actionTable = this.closest("action-table") as ActionTable;
		/* ------------ Event Listeners for manually added form elements ------------ */
		this.addEventListener("change", (e) => {
			const el = e.target as HTMLInputElement | HTMLSelectElement;
			// 1. setup filter value
			let filterValue: string | string[] = "";

			// 2. get filter value based on type
			if (el.type === "checkbox") {
				const input = el as HTMLInputElement;

				const checkboxValues = Array.from(this.filterElements)
					.filter((el) => {
						el = el as HTMLInputElement;
						if (el.type === "checkbox" && el.name === input.name) {
							return el.checked;
						}
						return false;
					})
					.map((checkbox) => checkbox.value);

				if (checkboxValues.length > 0) {
					filterValue = checkboxValues;
				}
			}
			if (el.type === "radio") {
				filterValue = el.value;
			}
			if (el.tagName.toLowerCase() === "select") {
				const select = el as HTMLSelectElement;
				const selectedOptions = Array.from(select.selectedOptions).map((option) => option.value);
				filterValue = selectedOptions;
			}
			// 3. if filter value exists, filter table and highlight

			const exclusive = !!el.closest("[exclusive]");
			actionTable.filterTable(el.name, filterValue, exclusive);
			this.toggleHighlight(el);
		});

		/* ------------------------------ Reset Button ------------------------------ */
		const resetButton = this.querySelector("button[type=reset]") as HTMLButtonElement;
		resetButton.addEventListener("click", () => {
			this.resetAllFilterElements();
			actionTable.resetFilters();
		});
	}

	private async checkForActionTableFilterElements(): Promise<boolean> {
		const actionTableFilterElements = this.querySelectorAll("action-table-filter-menu, action-table-filter-switch");
		if (actionTableFilterElements && actionTableFilterElements.length > 0) {
			await Promise.all([customElements.whenDefined("action-table-filter-menu"), customElements.whenDefined("action-table-filter-switch")]);
			return true;
		}
		return false;
	}

	/* -------------------------------------------------------------------------- */
	/*                  Public Method: reset all filter elements                  */
	/* -------------------------------------------------------------------------- */

	public resetAllFilterElements(): void {
		this.filterElements.forEach((el) => {
			if (el.type === "checkbox" || el.type === "radio") {
				const input = el as HTMLInputElement;
				if (input.value === "") {
					input.checked = true;
				} else {
					input.checked = false;
				}
			}
			if (el.tagName.toLowerCase() === "select") {
				el.value = "";
				this.toggleHighlight(el);
			}
		});
	}

	/* -------------------------------------------------------------------------- */
	/*                  Public Method: set filter elements                       */
	/* -------------------------------------------------------------------------- */
	public async setFilterElements(filters: FiltersObject) {
		await this.checkForActionTableFilterElements();
		// console.log("setFilterElements", filters);
		Object.keys(filters).forEach((key) => {
			this.setFilterElement(key, filters[key]);
		});
	}

	/* --------------------------- Set Filter element --------------------------- */

	public setFilterElement(col: string, value: string | string[]) {
		this.filterElements.forEach((el) => {
			if (el.name !== col) return;
			if (el.type === "checkbox" && Array.isArray(value)) {
				const input = el as HTMLInputElement;
				if (value.includes(input.value)) {
					console.log(input.name, input.value, value);
					input.checked = true;
				}
			}
			if (el.type === "radio" && typeof value === "string") {
				const input = el as HTMLInputElement;
				if (input.value === value) {
					input.checked = true;
				}
			}
			if (el.tagName.toLowerCase() === "select" && typeof value === "string") {
				if (el.name === col) {
					el.value = value;
				}
				this.toggleHighlight(el);
			}
		});
	}
}

customElements.define("action-table-filters", ActionTableFilters);

// Import filter components
import "./action-table-filter-menu";
import "./action-table-filter-switch";
