import type { ActionTable } from "./action-table";
import { FiltersObject } from "./types";

export class ActionTableFilters extends HTMLElement {
	constructor() {
		super();
		this.addEventListeners();
	}

	private actionTable = this.closest("action-table") as ActionTable;

	/* -------------------------------------------------------------------------- */
	/*                             Connected Callback                             */
	/* -------------------------------------------------------------------------- */
	public connectedCallback(): void {
		// Grab current filters from action-table
		const filters: FiltersObject = this.actionTable.filters;

		// 4.1 If filters are not empty, set the select/checkbox/radio elements
		if (Object.keys(filters).length > 0) {
			this.setFilterElements(filters);
		}
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
		/* ------------ Event Listeners for select/checkbox/radio ------------ */
		this.addEventListener("change", (e) => {
			const el = e.target;
			if (el instanceof HTMLSelectElement || el instanceof HTMLInputElement) {
				const exclusive = el.hasAttribute("exclusive") || !!el.closest("[exclusive]");
				const regex = el.hasAttribute("regex") || !!el.closest("[regex]");
				const columnName = el.name.toLowerCase();
				if (el instanceof HTMLSelectElement) {
					this.toggleHighlight(el);
					const selectedOptions = Array.from(el.selectedOptions).map((option) => option.value);
					this.dispatch({ [columnName]: { values: selectedOptions, exclusive, regex } });
				}
				if (el instanceof HTMLInputElement) {
					if (el.type === "checkbox") {
						// Casting to HTMLInputElement because we know it's a checkbox from selector
						const checkboxes = this.querySelectorAll("input[type=checkbox][name=" + el.name + "]") as NodeListOf<HTMLInputElement>;
						const checkboxValues = Array.from(checkboxes)
							.filter((e) => {
								return e.checked;
							})
							.map((checkbox) => checkbox.value);

						this.dispatch({ [columnName]: { values: checkboxValues, exclusive, regex } });
					}
					if (el.type === "radio") {
						this.dispatch({ [columnName]: { values: [el.value], exclusive, regex } });
					}
				}
			}
		});

		const searchInputs = this.querySelectorAll("input[type='search']") as NodeListOf<HTMLInputElement>;

		searchInputs.forEach((el) => {
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

			const event = el.dataset.event || "input";
			el.addEventListener(event, () => {
				const debouncedFilter = debounce(() => this.dispatch({ [el.name]: { values: [el.value] } }));
				debouncedFilter();
				this.dispatch({ [el.name]: { values: [el.value] } });
			});
		});

		/* ------------------------------- Text Input ------------------------------- */

		/* ------------------------------ Reset Button ------------------------------ */
		const resetButton = this.querySelector("button[type=reset]");
		resetButton?.addEventListener("click", () => {
			this.resetAllFilterElements();
			this.dispatch();
		});

		/* ----------------- Reset Event Filters from action-table ----------------- */
		// This is fired when the reset button is clicked in the tfoot section
		this.actionTable.addEventListener("action-table-filters-reset", () => {
			this.resetAllFilterElements();
		});
	}

	private dispatch(detail?: FiltersObject) {
		// return no detail to reset filters on table
		console.log("dispatch", detail);
		this.dispatchEvent(
			new CustomEvent<FiltersObject>("action-table-filter", {
				detail,
				bubbles: true,
			})
		);
	}

	/* -------------------------------------------------------------------------- */
	/*                  Public Method: reset all filter elements                  */
	/* -------------------------------------------------------------------------- */

	public resetAllFilterElements() {
		// Casting to types as we know what it is from selector
		const filterElements = this.querySelectorAll("select, input[type=checkbox], input[type=radio], input[type=search]") as NodeListOf<HTMLSelectElement | HTMLInputElement>;

		filterElements.forEach((el) => {
			if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
				if (el.value === "") {
					el.checked = true;
				} else {
					el.checked = false;
				}
			}
			if (el instanceof HTMLSelectElement || (el instanceof HTMLInputElement && el.type === "search")) {
				el.value = "";
				this.toggleHighlight(el);
			}
		});
	}

	/* -------------------------------------------------------------------------- */
	/*                  Public Method: set filter elements                        */
	/* -------------------------------------------------------------------------- */
	/* ------------------ If no args are passed then it resets ------------------ */

	public setFilterElements(filters: FiltersObject) {
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
		// Casting to types as we know what it is from selector

		const filterElements = this.querySelectorAll("select, input[type=checkbox], input[type=radio], input[type=search]") as NodeListOf<HTMLSelectElement | HTMLInputElement>;

		console.log("setFilterElement", columnName, values);

		filterElements.forEach((el) => {
			if (el.name.toLowerCase() !== columnName) return;

			if (el instanceof HTMLSelectElement) {
				el.value = values[0] || "";
				this.toggleHighlight(el);
			}
			if (el instanceof HTMLInputElement) {
				if (el.type === "checkbox") {
					if (values.includes(el.value)) {
						el.checked = true;
					}
				}
				if (el.type === "radio") {
					if (el.value === values[0] || "") {
						el.checked = true;
					}
				}
				if (el.type === "search") {
					el.value = values[0] || "";
					this.toggleHighlight(el);
				}
			}
		});
	}
}

customElements.define("action-table-filters", ActionTableFilters);

// Import filter components
import "./action-table-filter-menu";
import "./action-table-filter-switch";
