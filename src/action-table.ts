import { ColsArray, FiltersObject, SingleFilterObject, ActionCell, ActionRow, PaginationProps } from "./types";
import type { ActionTableFilters } from "./action-table-filters";
import type { ActionTablePagination } from "./action-table-pagination";
export class ActionTable extends HTMLElement {
	constructor() {
		super();

		/* -------------------------------------------------------------------------- */
		/*                                    Init                                    */
		/* -------------------------------------------------------------------------- */
		/* ------------------- Only fires once on js initial load ------------------- */
		/* --------------- Does not require the inner DOM to be ready --------------- */

		// 1. set initial values
		this.page = 1;

		// 2. Add Event Listeners (loading them here means I don't need disconnectedCallback)
		this.addEventListeners();
	}

	public tbody!: HTMLTableSectionElement;
	public thead!: HTMLTableSectionElement;
	private tfoot!: HTMLTableSectionElement;
	public cols: ColsArray = [];
	public filters: FiltersObject = {};
	public rowsArray!: Array<ActionRow>;
	private ready = false;
	private colGroupCols!: NodeListOf<HTMLTableColElement>;
	public rowsShown = 0;

	/* -------------------------------------------------------------------------- */
	/*                                 Attributes                                 */
	/* -------------------------------------------------------------------------- */

	static get observedAttributes(): string[] {
		return ["sort", "direction", "page", "pagination"];
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

	get id(): string {
		return this.getAttribute("id") || "";
	}

	get pagination(): number {
		return Number(this.getAttribute("pagination")) || 0;
	}

	set pagination(value: number) {
		this.setAttribute("pagination", value.toString());
	}

	get page(): number {
		return Number(this.getAttribute("page")) || 1;
	}

	set page(value: number) {
		this.setAttribute("page", value.toString());
	}

	/* -------------------------------------------------------------------------- */
	/*                             Connected Callback                             */
	/* -------------------------------------------------------------------------- */
	/* ------------- Fires every time the event is added to the DOM ------------- */

	public connectedCallback(): void {
		/* -------------- Init code which requires DOM to be ready -------------- */

		console.time("Connected Callback");
		this.init();
		console.timeEnd("Connected Callback");
	}

	private async init() {
		// 1. Get table, tbody, rows, and column names in this.cols
		console.time("init");
		this.getTable();

		// 2. wait for any custom elements to to load; need this in case action-table-switch or similar elements are used
		console.timeLog("init", "2");
		// TODO: rewrite this so it is better
		// Only fires if there are custom elements as await slows it down.
		// I will need to also add await for the pagination component later though as this breaks that test
		const tbody = this.querySelector("tbody");
		if (tbody) {
			const customElementsArray = Array.from(tbody.querySelectorAll("*")).filter((el) => el.tagName.indexOf("-") !== -1);
			if (customElementsArray.length > 0) {
				await this.waitForCustomElements(tbody);
			}
		}

		// 3. Get table content
		console.timeLog("init", "3");
		this.getTableContent();

		// 4. add mutation observer to tbody
		console.timeLog("init", "4");
		this.addObserver(this.tbody);

		// 5. Add no results tfoot message
		console.timeLog("init", "5");
		this.addNoResultsTfoot();

		// 6. Get local storage for sort and filters. Overrides attributes
		console.timeLog("init", "6");
		this.getLocalStorage();
		// console.log("3. init: getLocalStorage ~ this.filters", this.filters);

		// 7. Get URL params. Overrides local storage and attributes
		console.timeLog("init", "7");
		this.getURLParams();
		// console.log("4. init: getURLParams ~ this.filters", this.filters);
		console.timeLog("init", "9");
		// 9. set ready so that attributeChangedCallback can run automatically when sort or direction is changed
		console.timeLog("init", "10");
		this.initialFilter();
		console.timeEnd("init");
	}

	/* -------------------------------------------------------------------------- */
	/*                         Attribute Changed Callback                        */
	/* -------------------------------------------------------------------------- */

	public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		// this ready is set to true after localStorage and URL Params are loaded.
		if (oldValue !== newValue && this.ready) {
			if (name === "sort" || name === "direction") {
				this.sortTable();
			}
			if (name === "page") {
				console.log("attributeChangedCallback: page", oldValue, newValue);
				this.appendRows();
			}
			// TODO: create function to change pagination for table and pagination element
			if (name === "pagination") {
				console.log("pagination", oldValue, newValue);
				// this.appendRows();
			}
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                               PRIVATE METHODS                              */
	/* -------------------------------------------------------------------------- */

	/* -------------------------------------------------------------------------- */
	/*                   Private Method: Trigger Initial Filter                   */
	/* -------------------------------------------------------------------------- */

	private async initialFilter() {
		// 1. wait for any custom elements to to load
		/* this is needed in case there are action-table-switch or similar elements in the table that need to be filtered or sorted
        /* it is also needed for setting the filter elements in the action-table-filters
        */
		console.time("initialFilter");

		// 2. Filter and sort the table now that the custom elements have loaded
		// console.timeLog("initialFilter", "2");
		if (Object.keys(this.filters).length > 0) {
			console.log("initialFilter: filters", this.filters);
			this.filterTable();
		}

		// console.timeLog("initialFilter", "3");
		console.log("initialFilter: sort", this.sort);

		if (this.sort) {
			console.log("initialFilter: sort", this.sort);

			this.sortTable();
		}

		// console.timeLog("initialFilter", "4");

		// 3. Append rows
		// Normally sortTable and filterTable do this but with ready false it won't
		this.appendRows();
		// 4. Set ready to true so sort and filter can run appendRows
		this.ready = true;

		// 5. If no rows are shown then reset the filters
		// console.timeLog("initialFilter", "5");
		if (this.rowsShown === 0) {
			this.resetFilters();
		}

		// console.timeLog("initialFilter", "6");

		// 6. if <action-table-filters> exists then trigger setFilterElements
		const actionTableFilters = this.querySelector("action-table-filters") as ActionTableFilters;
		if (actionTableFilters) {
			this.setFilterElements(actionTableFilters);
		}

		console.timeEnd("initialFilter");
	}

	private async setFilterElements(actionTableFilters: ActionTableFilters): Promise<void> {
		await customElements.whenDefined("action-table-filters");
		actionTableFilters.setFilterElements(this.filters);
	}

	/* -------------------------------------------------------------------------- */
	/*        Private Method: Wait for inner custom elements to be defined        */
	/* -------------------------------------------------------------------------- */

	// TODO: wonder if there is a better way to speed this up
	private async waitForCustomElements(node: HTMLElement = this): Promise<Element[]> {
		console.log("waitForCustomElements", node);

		console.time("waitForCustomElements");

		// 1. Get any custom elements
		const customElementsArray = Array.from(node.querySelectorAll("*")).filter((el) => el.tagName.indexOf("-") !== -1);

		console.timeLog("waitForCustomElements", "0");
		if (customElementsArray.length === 0) {
			console.timeEnd("waitForCustomElements");
			return [];
		}
		console.log("customElementsArray", customElementsArray);

		// 2. Return if empty or all custom elements are defined
		const allDefined = customElementsArray.every((element) => element && customElements.get(element.tagName.toLowerCase()));
		if (allDefined) {
			return customElementsArray;
		}
		console.timeLog("waitForCustomElements", "1");
		// 3. Create custom elements when defined Array
		const customElementsDefinedArray = customElementsArray.map((element) => customElements.whenDefined(element.tagName.toLowerCase()));
		console.timeLog("waitForCustomElements", "2");
		// 4. Create Timeout Promise
		const timeoutPromise = new Promise<Element[]>((_, reject) => setTimeout(() => reject("Timeout"), 300));
		try {
			// 5. Wait for custom elements or timeout
			await Promise.race([Promise.all(customElementsDefinedArray), timeoutPromise]);
			console.timeEnd("waitForCustomElements");
			return customElementsArray;
		} catch (error) {
			// Handle timeout error here
			// eslint-disable-next-line  no-console
			console.error("Timeout occurred while waiting for custom elements");
			return [];
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                           Filter variable methods                          */
	/* -------------------------------------------------------------------------- */

	private setFilter(columnName: string, values: string[], exclusive = false): void {
		// 1. create temporary filter object
		const filters = this.filters;
		// 2. Make sure filter actually exists as a column name and isn't search whole table special name "action-table"
		if (!this.doesColumnExist(columnName)) return;
		// 3. makes sure that the column name key exists; if not create it
		filters[columnName] = filters[columnName] || {};
		// 4. add values to filter object
		filters[columnName].values = values;
		// 5. Add exclusive if true
		if (exclusive) filters[columnName].exclusive = exclusive;
		// 6. Replace existing this.filters with new
		this.filters = filters;
		// 7. Update local storage
		this.setFiltersLocalStorage();
	}

	/* -------------------------------------------------------------------------- */
	/*                Private Method: make sure columnName is legit               */
	/* -------------------------------------------------------------------------- */

	private doesColumnExist(columnName: string): boolean {
		return this.cols.includes(columnName) || columnName === "action-table";
	}

	/* -------------------------------------------------------------------------- */
	/*              Private Method: localStorage for sort and filters             */
	/* -------------------------------------------------------------------------- */

	private getLocalStorage(): void {
		if (!this.store) return;
		// 1. Get sort and direction from local storage
		const lsActionTable = localStorage.getItem(`action-table${this.id ? `-${this.id}` : ""}`);
		if (lsActionTable) {
			const lsActionTableJSON = JSON.parse(lsActionTable) as { sort: string; direction: "ascending" | "descending" };
			this.sort = lsActionTableJSON.sort;
			this.direction = lsActionTableJSON.direction;
		}

		// 2. Get filters from localStorage
		const lsActionTableFilters = localStorage.getItem(`action-table-filters${this.id ? `-${this.id}` : ""}`);
		if (lsActionTableFilters) {
			this.filters = JSON.parse(lsActionTableFilters) as FiltersObject;
		}
	}

	/* ---------------------------- Set Local Storage --------------------------- */

	private setFiltersLocalStorage() {
		if (this.store) localStorage.setItem(`action-table-filters${this.id ? `-${this.id}` : ""}`, JSON.stringify(this.filters));
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
			// Only add key if it's not sort or direction and exists as a column name
			if (key !== "sort" && key !== "direction" && this.doesColumnExist(key)) {
				filters[key] = filters[key] || {};
				filters[key].values = [value];
			}
		}

		// if filters object is not empty, set this.filters
		if (Object.keys(filters).length > 0) {
			this.filters = filters;
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                  Private Method: add event listeners                       */
	/* -------------------------------------------------------------------------- */

	private addEventListeners(): void {
		// Sort buttons
		this.addEventListener(
			"click",
			(event) => {
				const el = event.target as HTMLInputElement;
				// only fire if event target is a button with data-col
				if (el.tagName === "BUTTON" && el.dataset.col) {
					const name = el.dataset.col;
					let direction: "ascending" | "descending" = "ascending";
					if (this.sort === name && this.direction === "ascending") {
						direction = "descending";
					}

					this.sort = name;
					this.direction = direction;
					if (this.store) localStorage.setItem(`action-table${this.id ? `-${this.id}` : ""}`, JSON.stringify({ sort: this.sort, direction: direction }));
				}
			},
			false
		);

		// Listens for checkboxes in the table since mutation observer does not support checkbox changes
		this.addEventListener("change", (event) => {
			const el = event.target as HTMLInputElement;
			// only fire if event target is a checkbox in a td; this stops it firing for filters
			if (el.closest("td") && el.type === "checkbox") {
				// get new content, sort and filter. This works for checkboxes and action-table-switch
				console.log("event change", el);
				this.getContentSortAndFilter();
			}
		});
	}

	private getContentSortAndFilter(): void {
		this.getTableContent();
		this.filterTable();
		this.sortTable();
	}

	/* -------------------------------------------------------------------------- */
	/*           Private Method: get table, tbody, rows, and column names         */
	/* -------------------------------------------------------------------------- */

	private getTable(): void {
		console.time("getTable");
		const table = this.querySelector("table") as HTMLTableElement;
		this.thead = table.querySelector("thead") as HTMLTableSectionElement;
		this.tbody = table.querySelector("tbody") as HTMLTableSectionElement;
		const rows = this.tbody.querySelectorAll("tbody tr") as NodeListOf<HTMLTableRowElement>;
		console.timeLog("getTable", "2");
		this.rowsArray = Array.from(rows) as Array<ActionRow>;
		this.rowsShown = this.rowsArray.length;
		console.timeLog("getTable", "3");
		this.getColumns(table);
		console.timeEnd("getTable");
	}

	/* -------------------------------------------------------------------------- */
	/*                 Private Method: get columns from table                      */
	/* -------------------------------------------------------------------------- */

	private getColumns(table: HTMLTableElement): ColsArray {
		console.time("getColumns");
		// 1. Get column headers
		const ths = table.querySelectorAll("th") as NodeListOf<HTMLTableCellElement>;
		const theadRow = table.querySelector("thead tr");

		const fragment = document.createDocumentFragment();

		console.timeLog("getColumns", "1");
		if (ths) {
			ths.forEach((th) => {
				// 2. Column name is based on data-col attribute or results of getCellContent() function
				let name = th.dataset.col || this.getCellContent(th);

				// 3. Remove whitespace and convert to lowercase
				name = name.trim().toLowerCase();

				if (name) {
					// 4. Add column name to cols array
					this.cols.push(name);

					// 5. Set data-col attribute for easy access later
					th.dataset.col = name;
					// 6. if the column is sortable then wrap it in a button, and add aria
					if (!th.hasAttribute("no-sort")) {
						const thClone = th.cloneNode();
						const button = document.createElement("button");
						button.dataset.col = name;
						button.innerHTML = th.innerHTML;
						thClone.appendChild(button);
						fragment.appendChild(thClone);
					} else {
						fragment.appendChild(th);
					}
				}
			});
		}

		theadRow?.replaceChildren(fragment);

		console.timeLog("getColumns", "2");

		// 7. add colGroup unless it already exists
		const colGroup = table.querySelector("colgroup");
		if (!colGroup) {
			// 7.1 create colgroup
			const colGroup = document.createElement("colgroup");
			// 7.2 add col for each column
			this.cols.forEach(() => {
				const col = document.createElement("col");
				colGroup.appendChild(col);
			});
			// 7.3 prepend colgroup
			table.prepend(colGroup);
		}
		console.timeLog("getColumns", "3");

		this.colGroupCols = this.querySelectorAll("col");
		// console.log("action-table cols", this.cols);
		// 8. Return cols array
		console.timeEnd("getColumns");
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
			// 1. Reset the filters and filterTable element
			this.resetFilters();
			// 2. if <action-table-filter> exists then trigger resetAllFilterElements
			const actionTableFilters = this.querySelector("action-table-filters") as ActionTableFilters;
			if (actionTableFilters) {
				actionTableFilters.resetAllFilterElements();
			}
		});
		tfoot.style.display = "none";
		this.tfoot = tfoot;
		this.tbody.after(this.tfoot);
	}

	/* -------------------------------------------------------------------------- */
	/*                     Private Method: get cell content                        */
	/* -------------------------------------------------------------------------- */
	private getCellContent(cell: HTMLTableCellElement): string {
		// 1. get cell content with innerText
		let cellContent: string = cell?.textContent || "";
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
	/*                        Private Method Get Table Data                       */
	/* -------------------------------------------------------------------------- */
	/* ------- Get all table content as data for quicker sorting/filtering ------ */

	private getTableContent() {
		// eslint-disable-next-line no-console
		console.time("getTableContent");
		this.rowsArray.forEach((row) => {
			// const rowObj: RowData = { node: row, columns: {} };
			// 1. grab all cells in the row
			const cells = row.querySelectorAll("td");
			this.cols.forEach((col, i) => {
				// 1. cell matching column name
				const cell = cells[i] as ActionCell;

				const cellContent = this.getCellContent(cell);
				cell.actionTable = {
					col,
					sort: cell.dataset.sort || cellContent,
					filter: cell.dataset.filter || cellContent,
				};
			});
		});
		// eslint-disable-next-line no-console
		console.timeEnd("getTableContent");
	}

	private addObserver(tbody: HTMLTableSectionElement) {
		// Goode reference for MutationObserver: https://davidwalsh.name/mutationobserver-api
		// 1. Create an observer instance
		const observer = new MutationObserver((mutations) => {
			// 1.1 sort through all mutations
			mutations.forEach((mutation) => {
				const target = mutation.target as Element;
				if (target instanceof HTMLTableCellElement || target instanceof HTMLSpanElement || target instanceof HTMLLIElement) {
					// 1.2 if mutation.target is a cell, span, or then run getTableContent, filterTable, and sortTable
					console.log("MutationObserver", target, mutation.type);
					this.getContentSortAndFilter();
				}
			});
			// }
		});
		observer.observe(tbody, { childList: true, subtree: true, attributes: true });
	}

	/* -------------------------------------------------------------------------- */
	/*                               PUBLIC METHODS                               */
	/* -------------------------------------------------------------------------- */

	/* -------------------------------------------------------------------------- */
	/*                        Public Method: reset filters                        */
	/* -------------------------------------------------------------------------- */
	/* ---------- Used by reset button in action-table-filters element ---------- */

	public resetFilters(): void {
		// remove all filters from this.col then call filterTable
		this.filters = {};
		this.setFiltersLocalStorage();
		this.filterTable();
	}

	/* -------------------------------------------------------------------------- */
	/*            Public Method: filter table on column name and value            */
	/* -------------------------------------------------------------------------- */
	/* ------------- Used by filters in action-table-filter element ------------- */
	/* ------------- Also triggered by local storage and URL params ------------- */

	public filterTable(columnName: string = "", values: string[] = [], exclusive = false, regexOpt = "i"): void {
		console.log("filterTable");

		// eslint-disable-next-line no-console
		// console.time("filterTable");
		columnName = columnName.trim().toLowerCase();
		// this.filterTable(columnName, values, exclusive, regexOpt);

		// 1. If columnName exists as a column then store filter value locally and in localStorage; otherwise filter table based on existed filter
		if (this.doesColumnExist(columnName)) {
			this.setFilter(columnName, values, exclusive);
		}

		// 2. get filter value for whole row based on special reserved name "action-table"
		const filterForWholeRow = this.filters["action-table"];

		this.rowsArray.forEach((row) => {
			// 3.1 set base display value as ""
			let hide = false;
			// 3.2 get td cells
			const cells = row.querySelectorAll("td") as NodeListOf<ActionCell>;
			// 3.3 if filter value for whole row exists then run filter against innerText of entire row content
			if (filterForWholeRow) {
				// 3.3.1 build string of all td data-filter values
				const content = Array.from(cells)
					.map((cell) => cell.actionTable.filter)
					.join(" ");

				if (this.shouldHide(filterForWholeRow, content, regexOpt)) {
					hide = true;
				}
			}
			// 3.4 if columnName is not action-table then run filter against td cell content
			cells.forEach((cell, i) => {
				const content = cell.actionTable.filter;
				const filter = this.filters[this.cols[i]];
				if (!filter) return;

				if (this.shouldHide(filter, content, regexOpt)) {
					hide = true;
				}
			});

			// 3.5 set display
			row.hideRow = hide;
		});
		// 3.6 append rows but only if action-table is ready (this stops it from firing twice on initialization)
		if (this.ready) this.appendRows(this.rowsArray);

		// console.timeEnd("filterTable");
	}

	private shouldHide(filter: SingleFilterObject, content: string, regexOpt: string): boolean {
		// console.log("shouldHide", filter, content);
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
			// console.log("show", columnName, content);
		}
		return false;
	}

	/* -------------------------------------------------------------------------- */
	/*        Public Method: sort table based on column name and direction        */
	/* -------------------------------------------------------------------------- */
	/* ----------- Used by sort header buttons and attributes callback ----------- */
	/* ------------- Also triggered by local storage and URL params ------------- */

	public sortTable(columnName = this.sort, direction = this.direction) {
		// eslint-disable-next-line no-console
		console.time("sortTable");
		columnName = columnName.toLowerCase();
		// 1. Get column index from column name
		const columnIndex = this.cols.findIndex((col) => col === columnName);
		// 2. If column exists and there are rows then sort
		if (columnIndex >= 0 && this.rowsArray.length > 0) {
			console.log(`sort by ${columnName} ${direction}`);

			console.timeLog("sortTable");
			// 1. Sort rows
			const sortedRows = this.customSort(this.rowsArray, columnIndex);

			this.colGroupCols.forEach((colGroupCol, i) => {
				if (i === columnIndex) {
					colGroupCol.classList.add("sorted");
				} else {
					colGroupCol.classList.remove("sorted");
				}
			});

			// set aria sorting direction
			// TODO: Maybe remove this.th
			const ths = this.thead.querySelectorAll(`th`) as NodeListOf<HTMLTableCellElement>;
			ths.forEach((th, i) => {
				const ariaSort = i === columnIndex ? direction : "none";
				th.setAttribute("aria-sort", ariaSort);
			});
			// append rows but only if action-table is ready (this stops it from firing twice on initialization)
			if (this.ready) this.appendRows(sortedRows);
		}
		// eslint-disable-next-line no-console
		console.timeEnd("sortTable");
	}

	/* --------------------------- Private Sort Method -------------------------- */

	private customSort(rows: ActionRow[], columnIndex: number): ActionRow[] {
		return rows.sort((r1, r2) => {
			// 1. If descending sort, swap rows
			if (this.direction === "descending") {
				const temp = r1;
				r1 = r2;
				r2 = temp;
			}

			// 2. Get content
			const c1 = r1.children[columnIndex] as ActionCell;
			const c2 = r2.children[columnIndex] as ActionCell;
			const a: string = c1.actionTable.sort;
			const b: string = c2.actionTable.sort;

			function isNumber(n: string) {
				return !isNaN(Number(n));
			}

			if (isNumber(a) && isNumber(b)) {
				const aNum = Number(a);
				const bNum = Number(b);
				if (aNum < bNum) return -1;
				if (aNum > bNum) return 1;
			}
			if (typeof a === "string" && typeof b === "string") {
				return a.localeCompare(b);
			}
			return 0;
		});
	}

	private isActivePage(i: number): boolean {
		// returns if pagination is enabled (> 0) and row is on current page.
		// For instance if the current page is 2 and pagination is 10 then is greater than 10 and less than or equal to 20
		const pagination = this.pagination;
		if (pagination === 0) return true;
		const startIndex = pagination * (this.page - 1) + 1;
		const endIndex = pagination * this.page;
		return i + 1 > startIndex && i <= endIndex;
	}

	private appendRows(rows: ActionRow[] = this.rowsArray): void {
		console.log("appendRows log");
		console.time("appendRows");

		// fragment for holding rows
		const fragment = document.createDocumentFragment();
		// temporary variable
		let newRowsShown = 0;

		// loop through rows to set hide or show
		rows.forEach((row) => {
			if (!row.hideRow) newRowsShown++;

			if (row.hideRow || !this.isActivePage(newRowsShown)) {
				row.style.display = "none";
			} else {
				row.style.display = "";
				fragment.appendChild(row);
			}
		});

		this.tfoot.style.display = newRowsShown === 0 ? "table-footer-group" : "none";

		this.tbody.prepend(fragment);

		// Pagination only stuff
		if (this.pagination > 0) {
			// temporary variable
			let newPage = this.page;
			const numberOfPages = Math.ceil(newRowsShown / this.pagination);

			// if current page is greater than the number of pages then set it to the last page; if number of pages is 0 (if no rows) then set to the first page.
			if (newPage > numberOfPages) {
				newPage = numberOfPages || 1;
			}

			// if the action-table-pagination element exists then any changes to pagination or page will setProps
			const actionTablePagination = document.querySelector("action-table-pagination") as ActionTablePagination;

			if (actionTablePagination) {
				this.setPaginationElement(actionTablePagination, this.page, newPage, this.rowsShown, newRowsShown);
			}

			this.page = newPage;
		}

		this.rowsShown = newRowsShown;

		console.timeEnd("appendRows");
	}
	private async setPaginationElement(actionTablePagination: ActionTablePagination, oldPage: number, newPage: number, oldRowsShown: number, newRowsShown: number) {
		console.log("setPaginationElement", oldPage, newPage, oldRowsShown, newRowsShown);

		await customElements.whenDefined("action-table-pagination");
		const props: PaginationProps = {};
		if (oldPage !== newPage) {
			props.page = newPage;
		}
		if (oldRowsShown !== newRowsShown) {
			props.rowsShown = newRowsShown;
		}
		if (Object.keys(props).length > 0) {
			actionTablePagination.setProps(props);
		}
	}
}

customElements.define("action-table", ActionTable);
