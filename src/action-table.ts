import { ColsArray, FiltersObject, SingleFilterObject } from "./types";
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

		// 5. Sort & Filter Table if they have values
		if (this.sort) this.sortTable();
		if (Object.keys(this.filters).length > 0) {
			this.initialFilter();
		}

		// 7. Add Event Listeners
		this.addEventListeners();
	}

	private async initialFilter() {
		const customEls = await this.waitForCustomElements();
		if (customEls.length > 0) {
			const actionTableFilters = customEls.find((el) => el.tagName.toLowerCase() === "action-table-filters") as ActionTableFilters;
			if (actionTableFilters) {
				actionTableFilters.setFilterElements(this.filters);
			}
		}
		this.filterTable();

		if (this.rowsShown.length === 0) {
			this.resetFilters();
			this.resetAllFilterElements();
		}
	}

	private async waitForCustomElements(): Promise<Element[]> {
		// 1. Get any custom elements
		const customElementsArray = Array.from(this.querySelectorAll("*")).filter((el) => el.tagName.indexOf("-") !== -1);

		// 2. Return if empty or all custom elements are defined
		const allDefined = customElementsArray.every((element) => element && customElements.get(element.tagName.toLowerCase()));
		if (allDefined) {
			return customElementsArray;
		}
		// 3. Create custom elements when defined Array
		const customElementsDefinedArray = customElementsArray.map((element) => customElements.whenDefined(element.tagName.toLowerCase()));
		// 4. Create Timeout Promise
		const timeoutPromise = new Promise<Element[]>((_, reject) => setTimeout(() => reject("Timeout"), 300));
		try {
			// 5. Wait for custom elements or timeout
			await Promise.race([Promise.all(customElementsDefinedArray), timeoutPromise]);
			return customElementsArray;
		} catch (error) {
			// Handle timeout error here
			console.error("Timeout occurred while waiting for custom elements");
			return [];
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
				filters[key].values = [value];
			}
		}

		// if filters object is not empty, set this.filters
		if (Object.keys(filters).length > 0) {
			this.filters = filters;
		}

		// console.log(params, this.filters);
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
		// 1. Get column headers
		this.ths = table.querySelectorAll("th");
		if (this.ths) {
			this.ths.forEach((th) => {
				// 2. Column name is based on data-col attribute or results of getCellContent() function
				let name = th.dataset.col || this.getCellContent(th);
				// 3. Remove whitespace and convert to lowercase
				name = name.trim().toLowerCase();
				if (name) {
					// 4. Add column name to cols array
					this.cols.push({ name: name });
					// 5. Set data-col attribute just in case it is
					th.dataset.col = name;
					// 6. if the column is sortable then wrap it in a button, and add aria
					if (!th.hasAttribute("no-sort")) {
						th.innerHTML = `<button data-col="${name}">${th.innerHTML}</button>`;
					}
				}
			});
		}
		// console.log("action-table cols", this.cols);
		// 7. Return cols array
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

	private resetAllFilterElements() {
		const actionTableFilters = this.querySelector("action-table-filters") as ActionTableFilters;
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
	/*                     Public Method: get cell content                        */
	/* -------------------------------------------------------------------------- */
	public getCellContent(cell: HTMLTableCellElement): string {
		// 1. get cell content with dataset or innerText
		let cellContent: string = cell.dataset.sort || cell.innerText || "";
		// 2. trim to make sure it's not just spaces
		cellContent = cellContent?.trim();

		// 3. if there is no cell content then check...
		if (!cellContent) {
			// 3.1 if there is an svg then get title; otherwise return empty string
			const svg = cell.querySelector("svg") as SVGElement;
			if (svg) {
				cellContent = svg.querySelector("title")?.textContent || "";
			}
			// 3.2 if checkbox element then get value if checked
			const checkbox = cell.querySelector("[type=checkbox]") as HTMLInputElement;
			if (checkbox?.checked) {
				cellContent = checkbox.value;
			}
		}
		return cellContent.trim();
	}

	/* -------------------------------------------------------------------------- */
	/*            Public Method: filter table on column name and value            */
	/* -------------------------------------------------------------------------- */
	public filterTable(columnName: string = "", values: string[] = [], exclusive = false, regexOpt = "i"): void {
		columnName = columnName.trim().toLowerCase();

		// 1. If col then store filter value locally and in localStorage; otherwise filter table based on existed filter
		if (columnName !== "") {
			if (!this.filters[columnName]) {
				this.filters[columnName] = { values: [] };
			}

			this.filters[columnName].values = values;

			if (exclusive) this.filters[columnName].exclusive = exclusive;
			this.setFiltersLocalStorage();
		}
		// console.log("filters", this.filters);

		// function to see test content vs filterValue
		function shouldHide(filter: SingleFilterObject, content: string): boolean {
			// console.log("shouldHide", filterValue, content);
			if (filter.values && filter.values.length > 0) {
				// 1. build regex from filterValues array (checkboxes and select menus send arrays)
				let regexPattern = filter.values.join("|");
				if (filter.exclusive) {
					const regexParts = filter.values.map((str) => `(?=.*${str})`);
					regexPattern = `${regexParts.join("")}.*`;
				}
				const regex = new RegExp(regexPattern, regexOpt);
				// 2. check if content matches
				if (!regex.test(content)) {
					// console.log("hide", columnName, content);
					return true;
				}
			}
			return false;
		}

		// 2. get filter value for whole row based on special reserved name "action-table"
		const filterForWholeRow = this.filters["action-table"];

		// 3. Filter based on filter value
		this.rowsArray.forEach((row) => {
			// 3.1 set base display value as ""
			let display = "";
			// 3.2 get td cells
			const cells = row.querySelectorAll("td") as NodeListOf<HTMLTableCellElement>;
			// 3.3 if filter value for whole row exists then run filter against innerText of entire row content
			if (filterForWholeRow) {
				if (shouldHide(filterForWholeRow, row.innerText)) {
					display = "none";
				}
			}
			// 3.4 if columnName is not action-table then run filter against td cell content
			cells.forEach((cell, i) => {
				const content = this.dataset.filter || this.getCellContent(cell);
				let filter = this.filters[this.cols[i].name];
				if (!filter) return;
				if (shouldHide(filter, content)) {
					display = "none";
				}
			});

			// 3.5 set display
			row.style.display = display;
		});

		if (this.rowsShown.length === 0) {
			console.error("All rows hidden!");
			this.showTfoot();
		} else {
			this.showTfoot(false);
		}
	}

	// Simple rowsShown getter; not an attribute
	get rowsShown() {
		return this.rowsArray.filter((row) => row.style.display !== "none");
	}

	/* -------------------------------------------------------------------------- */
	/*        Public Method: sort table based on column name and direction        */
	/* -------------------------------------------------------------------------- */
	public sortTable(columnName = this.sort, direction = this.direction) {
		columnName = columnName.toLowerCase();
		// 1. Get column index from column name
		const columnIndex = this.cols.findIndex((c) => c.name === columnName);
		// 2. If column exists and there are rows then sort
		if (columnIndex >= 0 && this.rowsArray.length > 0) {
			console.log(`sort by ${columnName} ${direction}`);

			// 1. Sort rows
			this.customSort(this.rowsArray, columnIndex);

			// 2. Update DOM
			this.rowsArray.forEach((row, i) => {
				// 2.1 Add row to tbody
				this.tbody.appendChild(row);

				// 2.1 On first row, update aria-sort on ths
				if (i < 1) {
					this.ths.forEach((th, i) => {
						const ariaSort = i === columnIndex ? direction : "none";
						th.setAttribute("aria-sort", ariaSort);
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
			// 1. If descending sort, swap rows
			if (this.direction === "descending") {
				const temp = r1;
				r1 = r2;
				r2 = temp;
			}

			// 2. Get content
			const c1 = r1.children[columnIndex] as HTMLTableCellElement;
			const c2 = r2.children[columnIndex] as HTMLTableCellElement;
			let v1 = this.getCellContent(c1);
			let v2 = this.getCellContent(c2);

			function isNumber(s: string) {
				return !isNaN(parseFloat(s));
			}

			// 1. If both values are numbers, sort by number
			if (isNumber(v1) && isNumber(v2)) {
				// console.log("Both numbers", v1, v2);
				return parseFloat(v1) - parseFloat(v2);
			}
			// 2. If only one of the values is a number, prioritize it
			if (isNumber(v1)) {
				// console.log("Is Number", v1);
				return -1;
			}
			if (isNumber(v2)) {
				// console.log("Is Number", v2);
				return 1;
			}

			// 3. If both values are strings, sort by string
			// console.log("both string", v1, v2);

			return v1.localeCompare(v2);
		});
	}
}

customElements.define("action-table", ActionTable);
