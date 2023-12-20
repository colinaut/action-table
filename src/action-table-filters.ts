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
		this.filterElements = this.querySelectorAll("select, input[type=checkbox], input[type=radio], input[type=search]") as NodeListOf<HTMLSelectElement | HTMLInputElement>;
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
		/* ------------ Event Listeners for select/checkbox/radio ------------ */
		// TODO: review to see if there are bugs and if I can make more DRY
		this.filterElements.forEach((el) => {
			const exclusive = !!el.closest("[exclusive]");
			if (el.tagName.toLowerCase() === "select") {
				el.addEventListener("change", () => {
					this.toggleHighlight(el);
					const select = el as HTMLSelectElement;
					const selectedOptions = Array.from(select.selectedOptions).map((option) => option.value);
					actionTable.filterTable(el.name, selectedOptions, exclusive);
				});
			}
			if (el.type === "checkbox") {
				el.addEventListener("change", () => {
					const checkboxValues = Array.from(this.filterElements)
						.filter((e) => {
							e = e as HTMLInputElement;
							if (e.type === "checkbox" && e.name === el.name) {
								return e.checked;
							}
							return false;
						})
						.map((checkbox) => checkbox.value);

					actionTable.filterTable(el.name, checkboxValues, exclusive);
				});
			}
			if (el.type === "radio") {
				el.addEventListener("change", () => {
					actionTable.filterTable(el.name, [el.value]);
				});
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			function debounce<T extends (...args: any[]) => any>(func: T, timeout = 300) {
				let timer: ReturnType<typeof setTimeout>;
				return (...args: Parameters<T>) => {
					clearTimeout(timer);
					timer = setTimeout(() => {
						func(...args);
					}, timeout);
				};
			}

			if (el.type === "search") {
				const event = el.dataset.event || "input";
				el.addEventListener(event, () => {
					const debouncedFilter = debounce(() => actionTable.filterTable(el.name, [el.value]));
					debouncedFilter();
					actionTable.filterTable(el.name, [el.value]);
				});
			}
		});

		/* ------------------------------- Text Input ------------------------------- */

		/* ------------------------------ Reset Button ------------------------------ */
		const resetButton = this.querySelector("button[type=reset]") as HTMLButtonElement;
		resetButton?.addEventListener("click", () => {
			this.resetAllFilterElements();
			actionTable.resetFilters();
		});
	}

	private async checkForActionTableFilterElements(): Promise<boolean> {
		const actionTableFilterElements = this.querySelectorAll("action-table-filter-menu, action-table-filter-switch");
		const allDefined = Array.from(actionTableFilterElements).every((element) => customElements.get(element.tagName.toLowerCase()));
		if (allDefined) return true;
		if (actionTableFilterElements && actionTableFilterElements.length > 0) {
			await Promise.all([customElements.whenDefined("action-table-filter-menu"), customElements.whenDefined("action-table-filter-switch")]);
			return true;
		}
		return false;
	}

	/* -------------------------------------------------------------------------- */
	/*                  Public Method: reset all filter elements                  */
	/* -------------------------------------------------------------------------- */

	public resetAllFilterElements() {
		this.filterElements.forEach((el) => {
			if (el.type === "checkbox" || el.type === "radio") {
				const input = el as HTMLInputElement;
				if (input.value === "") {
					input.checked = true;
				} else {
					input.checked = false;
				}
			}
			if (el.tagName.toLowerCase() === "select" || el.type === "search") {
				el.value = "";
				this.toggleHighlight(el);
			}
		});
	}

	/* -------------------------------------------------------------------------- */
	/*                  Public Method: set filter elements                        */
	/* -------------------------------------------------------------------------- */
	/* ------------------ If no args are passed then it resets ------------------ */

	public async setFilterElements(filters: FiltersObject) {
		await this.checkForActionTableFilterElements();
		// 1. if there are filters then set the filters on all the elements
		if (Object.keys(filters).length > 0) {
			Object.keys(filters).forEach((key) => {
				if (!filters[key].values) return;
				this.setFilterElement(key, filters[key].values);
			});
		} else {
			// else reset all filters
			this.resetAllFilterElements();
		}
	}

	/* --------------------------- Set Filter element --------------------------- */

	public setFilterElement(columnName: string, values: string[]) {
		this.filterElements?.forEach((el) => {
			if (el.name !== columnName) return;

			if (el.type === "checkbox") {
				const input = el as HTMLInputElement;
				if (values.includes(input.value)) {
					input.checked = true;
				}
			}
			if (el.tagName.toLowerCase() === "select") {
				el.value = values[0] || "";
				this.toggleHighlight(el);
			}

			if (el.type === "radio") {
				const input = el as HTMLInputElement;
				if (input.value === values[0] || "") {
					input.checked = true;
				}
			}
			if (el.type === "search") {
				el.value = values[0] || "";
				this.toggleHighlight(el);
			}
		});
	}
}

customElements.define("action-table-filters", ActionTableFilters);

// Import filter components
import "./action-table-filter-menu";
import "./action-table-filter-switch";
