import { ColsArray, FiltersObject } from "./types";
import { ActionTableSwitch } from "./action-table-switch";
import { ActionTableFilters } from "./action-table-filters";
export class ActionTable extends HTMLElement {
	constructor() {
		super();
	}

	private tbody!: HTMLTableSectionElement;
	private tfoot!: HTMLTableSectionElement;
	private ths!: NodeListOf<HTMLTableCellElement>;
	public cols: ColsArray = [];
	public filters: FiltersObject = {};
	private rowsArray!: Array<HTMLTableRowElement>;

	/* -------------------------------------------------------------------------- */
	/*                                 Attributes                                 */
	/* -------------------------------------------------------------------------- */

	static get observedAttributes(): string[] {
		return ["sort", "direction", "store", "params"];
	}

	// sort attribute to set the sort column

	get sort(): string {
		return this.getAttribute("sort")?.trim().toLowerCase() || "";
	}
	set sort(value: string) {
		this.setAttribute("sort", value);
	}

	// direction attribute to set the sort direction
	get direction(): "ascending" | "descending" {
		const direction = this.getAttribute("direction")?.trim().toLowerCase();
		if (direction === "ascending" || direction === "descending") {
			return direction;
		}
		return "ascending";
	}
	set direction(value: "ascending" | "descending") {
		this.setAttribute("direction", value);
	}

	// store attribute to trigger loading and saving to sort and filters localStorage
	get store(): boolean {
		return this.hasAttribute("store");
	}

	// URLparams attribute to trigger checking URL params on load
	get URLparams(): boolean {
		return this.hasAttribute("urlparams");
	}

	/* -------------------------------------------------------------------------- */
	/*                             Connected Callback                             */
	/* -------------------------------------------------------------------------- */

	public connectedCallback(): void {
		// 1. Get local storage for sort and filters. Overrides attributes
		this.getLocalStorage();

		// 2. Get URL params. Overrides local storage and attributes
		this.getURLParams();

		// 3. Get table, tbody, rows, and column names
		this.getTable();

		// 4. Add no results tfoot message
		this.addNoResultsTfoot();
		console.log("test");

		// 5. Sort & Filter Table if they have values
		if (this.sort) this.sortTable();
		if (Object.keys(this.filters).length > 0) {
			this.initialFilter();
		}

		// 6. check to see if there are any rows; if so reset filters
		if (this.rowsShown.length === 0) {
			this.resetFilters();
			this.resetAllFilterElements();
		}

		// 7. Add Event Listeners
		this.addEventListeners();
	}

	private async checkForActionTableFilters(): Promise<ActionTableFilters | void> {
		const selector = "action-table-filters";
		const actionTableFilters = this.querySelector(selector) as ActionTableFilters;
		if (actionTableFilters) {
			await customElements.whenDefined(selector);
			return actionTableFilters;
		}
		return;
	}

	private async initialFilter() {
		this.filterTable();
		const actionTableFilters = await this.checkForActionTableFilters();
		if (actionTableFilters) {
			actionTableFilters.setFilterElements(this.filters);
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                         Attribute Changed Callback                        */
	/* -------------------------------------------------------------------------- */

	public attributeChangedCallback(name: string) {
		if (name === "sort" || name === "direction") {
			this.sortTable();
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                               PRIVATE METHODS                              */
	/* -------------------------------------------------------------------------- */

	/* -------------------------------------------------------------------------- */
	/*            Private Method: get localStorage for sort and filters           */
	/* -------------------------------------------------------------------------- */

	private getLocalStorage(): void {
		if (!this.store) return;
		// 1. Get sort and direction from local storage

		const lsActionTable = localStorage.getItem("action-table");
		if (lsActionTable) {
			const lsActionTableJSON = JSON.parse(lsActionTable) as { sort: string; direction: "ascending" | "descending" };
			this.sort = lsActionTableJSON.sort;
			this.direction = lsActionTableJSON.direction;
		}

		// 2. Get filters from localStorage
		const lsActionTableFilters = localStorage.getItem("action-table-filters");
		if (lsActionTableFilters) {
			this.filters = JSON.parse(lsActionTableFilters) as FiltersObject;
		}
	}

	/* -------------------------------------------------------------------------- */
	/*         Private Method: get URLSearchParams for sort and filters           */
	/* -------------------------------------------------------------------------- */

	private getURLParams(): void {
		if (!this.URLparams) return;
		const params = new URLSearchParams(window.location.search);
		if (params.size === 0) {
			return;
		}
		// Get sort and direction from URL
		this.sort = params.get("sort") || this.sort;
		const direction = params.get("direction");
		if (direction === "ascending" || direction === "descending") {
			this.direction = direction;
		}

		// sort through remaining params for filters to create a filters object
		const filters: FiltersObject = {};
		for (const [key, value] of params.entries()) {
			if (key !== "sort" && key !== "direction") {
				filters[key] = value;
			}
		}

		// if filters object is not empty, set this.filters
		if (Object.keys(filters).length > 0) {
			this.filters = filters;
		}

		console.log(params, this.filters);
	}

	/* -------------------------------------------------------------------------- */
	/*           Private Method: get table, tbody, rows, and column names         */
	/* -------------------------------------------------------------------------- */

	private getTable(): void {
		const table = this.querySelector("table") as HTMLTableElement;
		this.tbody = table.querySelector("tbody") as HTMLTableSectionElement;
		const rows = this.tbody.querySelectorAll("tbody tr") as NodeListOf<HTMLTableRowElement>;
		this.rowsArray = Array.from(rows);
		this.getColumns(table);
	}

	/* -------------------------------------------------------------------------- */
	/*                 Private Method: get columns from table                      */
	/* -------------------------------------------------------------------------- */

	private getColumns(table: HTMLTableElement): ColsArray {
		this.ths = table.querySelectorAll("th");
		if (this.ths) {
			this.ths.forEach((th) => {
				// Column name is based on data-col attribute or innerText
				let name = th.dataset.col || th.innerText || "";
				name = name.trim().toLowerCase();
				if (name) {
					this.cols.push({ name: name });
					// if the column is sortable then set it as sortable, wrap it in a button, and add aria
					if (!th.hasAttribute("no-sort")) {
						th.innerHTML = `<button data-col="${name}">${th.innerHTML}</button>`;
					}
				}
			});
		}
		// console.log("action-table cols", this.cols);
		return this.cols;
	}

	/* -------------------------------------------------------------------------- */
	/*               Private Method: add a No Results tfoot message               */
	/* -------------------------------------------------------------------------- */

	private addNoResultsTfoot() {
		const tfoot = document.createElement("tfoot");
		tfoot.classList.add("no-results");
		tfoot.innerHTML = `<tr><td colspan="${this.cols.length}"><p>No Results</p> <p><button>Reset Filters</button></p></td></tr>`;
		tfoot.addEventListener("click", (e) => {
			const button = e.target as HTMLButtonElement;
			if (button.tagName !== "BUTTON") return;
			this.resetFilters();
			this.resetAllFilterElements();
			this.showTfoot(false);
		});
		this.tfoot = tfoot;
		this.showTfoot(false);
		this.tbody.after(this.tfoot);
	}

	/* ----------------------------- Hide/Show TFOOT ---------------------------- */
	private showTfoot(show = true) {
		if (this.tfoot) {
			this.tfoot.style.display = show ? "table-footer-group" : "none";
		}
	}

	/* -------------------------------------------------------------------------- */
	/*        Private Method: reset all action-table-filters elements             */
	/* -------------------------------------------------------------------------- */

	private async resetAllFilterElements() {
		const actionTableFilters = await this.checkForActionTableFilters();
		if (actionTableFilters) {
			actionTableFilters.resetAllFilterElements();
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                  Private Method: add event listeners                        */
	/* -------------------------------------------------------------------------- */

	private addEventListeners(): void {
		this.addEventListener(
			"click",
			(event) => {
				const el = event.target as HTMLTableCellElement;
				if (el.tagName === "BUTTON") {
					if (el.dataset.sortable === "false") return;
					let name = el.dataset.col;
					if (name) {
						if (this.sort === name && this.direction === "ascending") {
							this.direction = "descending";
						} else {
							this.sort = name;
							this.direction = "ascending";
						}
						this.sortTable();
						if (this.store) localStorage.setItem("action-table", JSON.stringify({ sort: this.sort, direction: this.direction }));
					}
				}
			},
			false
		);
	}

	private setFiltersLocalStorage() {
		if (this.store) localStorage.setItem("action-table-filters", JSON.stringify(this.filters));
	}

	/* -------------------------------------------------------------------------- */
	/*                               PUBLIC METHODS                               */
	/* -------------------------------------------------------------------------- */

	/* -------------------------------------------------------------------------- */
	/*                        Public Method: reset filters                        */
	/* -------------------------------------------------------------------------- */

	public resetFilters(): void {
		// remove all filters from this.col then call filterTable
		this.filters = {};
		this.setFiltersLocalStorage();
		this.filterTable();
		this.showTfoot(false);
	}

	/* -------------------------------------------------------------------------- */
	/*            Public Method: filter table on column name and value            */
	/* -------------------------------------------------------------------------- */
	public filterTable(col: string = "", value: string | string[] = "", exclusive = false, regexOpt = "i"): void {
		col = col.trim().toLowerCase();

		// If col then store filter value locally and in localStorage
		if (col !== "") {
			this.filters[col] = value;
			this.setFiltersLocalStorage();
		}

		// Filter based on filter value
		this.rowsArray.forEach((row) => {
			row.style.display = "";
			const cells = row.children as HTMLCollectionOf<HTMLTableCellElement>;
			Array.from(cells).forEach((cell, i) => {
				const content = this.dataset.filter || this.getCellContent(cell);
				const col = this.cols[i];
				const filterValue = this.filters[col.name];
				if (!filterValue) return;
				// console.log("🚀 ~ filterValue:", col.name, filterValue);

				if (typeof filterValue === "string") {
					const regex = new RegExp(filterValue, regexOpt);
					if (!regex.test(content)) {
						// console.log("hide", col.name, content);
						row.style.display = "none";
					}
				} else if (Array.isArray(filterValue) && filterValue.length > 0) {
					// 1. build regex from filterValues array (checkboxes and select menus send arrays)
					let regexPattern = filterValue.join("|");
					if (exclusive) {
						const regexParts = filterValue.map((str) => `(?=.*${str})`);
						regexPattern = `${regexParts.join("")}.*`;
					}
					const regex = new RegExp(regexPattern);
					// 2. check if content matches
					if (!regex.test(content)) {
						// console.log("hide", col.name, content);
						row.style.display = "none";
					}
				}
			});
		});

		if (this.rowsShown.length === 0) {
			console.error("All rows hidden!");
			this.showTfoot();
		} else {
			this.showTfoot(false);
		}
	}

	get rowsShown() {
		return this.rowsArray.filter((row) => row.style.display !== "none");
	}

	/* -------------------------------------------------------------------------- */
	/*              Public Method: get column names from headers                  */
	/* -------------------------------------------------------------------------- */
	// TODO: review if I need this to be number or string. Just string might be fine.
	public getCellContent(cell: HTMLTableCellElement): string {
		let cellContent: string = cell.dataset.sort || cell.innerText || "";
		// trim to make sure it's not just spaces
		cellContent = cellContent?.trim();

		if (!cellContent) {
			const el = cell.firstElementChild as HTMLElement;
			if (el.tagName.toLowerCase() === "svg") {
				cellContent = el.querySelector("title")?.textContent || "";
			}
			if (el.tagName.toLowerCase() === "action-table-switch") {
				const actionSwitch = el as ActionTableSwitch;
				cellContent = actionSwitch.checked || actionSwitch.hasAttribute("checked") ? "on" : "";
			}
			if (el.tagName.toLowerCase() === "input") {
				const input = el as HTMLInputElement;
				cellContent = input.checked ? input.value : "";
			}
		}
		return cellContent.trim();
	}

	/* -------------------------------------------------------------------------- */
	/*        Public Method: sort table based on column name and direction        */
	/* -------------------------------------------------------------------------- */
	public sortTable(col = this.sort, direction = this.direction) {
		col = col.toLowerCase();
		// 1. Get column index from column name
		const columnIndex = this.cols.findIndex((c) => c.name === col);
		// 2. If column exists and there are rows then sort
		if (columnIndex >= 0 && this.rowsArray.length > 0) {
			console.log(`sort by ${col} ${direction}`);

			// 1. Sort rows
			this.customSort(this.rowsArray, columnIndex);

			// 2. Update DOM
			this.rowsArray.forEach((row, i) => {
				// 2.1 Add row to tbody
				this.tbody.appendChild(row);

				// 2.1 On first row, update aria-sort on ths
				if (i < 1) {
					this.ths.forEach((th, i) => {
						if (i === columnIndex) {
							th.setAttribute("aria-sort", direction);
						} else {
							th.setAttribute("aria-sort", "none");
						}
					});
				}

				// 2.3 Add/Remove sorted class based on columnIndex
				const cells = row.querySelectorAll("td");
				cells.forEach((cell, i) => {
					if (i === columnIndex) {
						cell.classList.add("sorted");
					} else {
						cell.classList.remove("sorted");
					}
				});
			});
		}
	}

	private customSort(rows: HTMLTableRowElement[], columnIndex: number): HTMLTableRowElement[] {
		return rows.sort((r1, r2) => {
			const c1 = r1.children[columnIndex] as HTMLTableCellElement;
			const c2 = r2.children[columnIndex] as HTMLTableCellElement;
			let v1 = this.getCellContent(c1);
			let v2 = this.getCellContent(c2);

			// Set sort direction to ascending by default
			let sort = this.direction === "ascending" ? 1 : -1;

			function isNumber(s: string) {
				return !isNaN(parseFloat(s));
			}

			// 1. If both values are numbers, sort by number
			if (isNumber(v1) && isNumber(v2)) {
				// console.log("Both numbers", v1, v2);
				if (sort > 0) {
					return parseFloat(v1) - parseFloat(v2);
				}
				return parseFloat(v2) - parseFloat(v1);
			}
			// 2. If only one of the values is a number, prioritize it
			if (isNumber(v1)) {
				// console.log("Is Number", v1);
				return -sort;
			}
			if (isNumber(v2)) {
				// console.log("Is Number", v2);
				return sort;
			}

			// 3. If both values are strings, sort by string
			// console.log("both string", v1, v2);
			if (sort > 0) {
				return v1.localeCompare(v2);
			}
			return v2.localeCompare(v1);
		});
	}
}

customElements.define("action-table", ActionTable);
