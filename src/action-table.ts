import { ColsArray, FiltersObject, SingleFilterObject, ActionCell, ActionRow, ActionTableEventDetail, ActionTableSortStore, UpdateContentDetail } from "./types";
import "./action-table-no-results";

export class ActionTable extends HTMLElement {
	constructor() {
		super();

		/* -------------------------------------------------------------------------- */
		/*                                    Init                                    */
		/* -------------------------------------------------------------------------- */
		/* ------------------- Only fires once on js initial load ------------------- */
		/* --------------- Does not require the inner DOM to be ready --------------- */

		// 1. Get sort and direction and filters from local storage
		if (this.store) {
			// 1. Get sort and direction from local storage
			const lsActionTable = localStorage.getItem(`action-table${this.id}`);
			if (lsActionTable) {
				const lsActionTableJSON = JSON.parse(lsActionTable) as ActionTableSortStore;
				this.sort = lsActionTableJSON.sort;
				this.direction = lsActionTableJSON.direction;
			}

			// 2. Get filters from localStorage
			const lsActionTableFilters = localStorage.getItem(`action-table-filters${this.id}`);
			if (lsActionTableFilters) {
				this.filters = JSON.parse(lsActionTableFilters) as FiltersObject;
			}
		}

		// 2. Get sort and direction and filters from URL (overrides local storage)
		if (this.hasAttribute("urlparams")) {
			const params = new URLSearchParams(window.location.search);

			// sort through remaining params for filters to create a filters object
			const filters: FiltersObject = {};
			for (const [key, value] of params.entries()) {
				// Only add key if it's not sort or direction
				if (key !== "sort" && key !== "direction") {
					// check for value and if so add it to the array.
					if (filters[key]?.values) {
						filters[key].values.push(value);
					} else {
						// if not, create it
						filters[key] = filters[key] || {};
						filters[key].values = [value];
					}
				}
				if (key === "sort") {
					this.sort = value;
				}
				if (key === "direction" && (value === "ascending" || value === "descending")) {
					this.direction = value;
				}
			}

			// if filters object is not empty, set this.filters
			if (Object.keys(filters).length > 0) {
				this.setFiltersObject(filters);
			}
		}

		this.addEventListeners();
	}

	public table!: HTMLTableElement;
	public tbody!: HTMLTableSectionElement;
	public cols: ColsArray = [];
	public rows: Array<ActionRow> = [];
	public filters: FiltersObject = {};

	/* -------------------------------------------------------------------------- */
	/*                                 Attributes                                 */
	/* -------------------------------------------------------------------------- */

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

	// This is used for localStorage naming purposes
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
		value = this.checkPage(value);
		this.setAttribute("page", value.toString());
	}

	private checkPage(page: number): number {
		return Math.max(1, Math.min(page, this.numberOfPages));
	}

	private dispatch(detail: ActionTableEventDetail) {
		console.log("dispatch", detail);
		this.dispatchEvent(
			new CustomEvent<ActionTableEventDetail>("action-table", {
				detail,
			})
		);
	}

	/* -------------------------------------------------------------------------- */
	/*                             Connected Callback                             */
	/* -------------------------------------------------------------------------- */
	/* ------------- Fires every time the event is added to the DOM ------------- */

	public connectedCallback(): void {
		/* -------------- Init code which requires DOM to be ready -------------- */
		console.time("Connected Callback");

		// 1. Get table, tbody, rows, and column names in this.cols
		const table = this.querySelector("table");
		// make sure table with thead and tbody exists
		if (table && table.querySelector("thead tr th") && table.querySelector("tbody tr td")) {
			this.table = table;
			// casting type as we know it exists due to querySelector above
			this.tbody = table.querySelector("tbody") as HTMLTableSectionElement;
			this.rows = Array.from(table.querySelectorAll("tbody tr")) as Array<ActionRow>;
		} else {
			throw new Error("Could not find table with thead and tbody in action-table");
		}

		const hasFilters = Object.keys(this.filters).length > 0;

		// 2. If no filter or sort then append rows now as we don't need to know the header or cell data
		if (!hasFilters && !this.sort) {
			this.appendRows();
		} else {
			// If there are sort or filters then hide tbody; it will be shown when rows are appended later after sort and filter
			this.tbody.style.display = "none";
		}

		// 3. get column names and add sort buttons
		this.getColumns();

		// 4. Get table content
		this.getTableContent();

		// 6. if filters or sort then trigger sort and filter and append rows
		if (hasFilters || this.sort) {
			// 6.1 remove filters that are not in the table
			Object.keys(this.filters).forEach((key) => {
				if (!this.cols.some((col) => col.name === key)) {
					delete this.filters[key];
				}
			});
			// 6.2 sort, filter, and append rows
			this.sortAndFilter();
		}

		// 7. Add mutation observer to tbody
		this.addObserver();

		console.timeEnd("Connected Callback");
	}

	/* -------------------------------------------------------------------------- */
	/*                         Attribute Changed Callback                        */
	/* -------------------------------------------------------------------------- */

	static get observedAttributes(): string[] {
		return ["sort", "direction", "pagination", "page"];
	}
	public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		// only fires if the value actually changes and if the rows is not empty, which means it has grabbed the cellContent
		if (oldValue !== newValue && this.rows.length > 0) {
			if (name === "sort" || name === "direction") {
				this.sortTable();
			}
			if (name === "pagination") {
				console.log("attributeChangedCallback: pagination", oldValue, newValue);
				this.dispatch({ pagination: this.pagination });
			}
			this.appendRows();
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                               PRIVATE METHODS                              */
	/* -------------------------------------------------------------------------- */

	/* -------------------------------------------------------------------------- */
	/*                           Filter variable methods                          */
	/* -------------------------------------------------------------------------- */

	private setFiltersObject(filters: FiltersObject = {}): void {
		// If set empty it resets filters to default
		this.filters = filters;
		if (this.store) localStorage.setItem(`action-table-filters${this.id}`, JSON.stringify(this.filters));
	}

	/* ----------- Used by reset button and action-table-filter event ----------- */
	private setFilters(filters: FiltersObject = {}) {
		this.setFiltersObject(filters);
		this.filterTable();
		this.appendRows();
	}

	/* -------------------------------------------------------------------------- */
	/*                  Private Method: add event listeners                       */
	/* -------------------------------------------------------------------------- */

	private addEventListeners(): void {
		// Sort buttons
		this.addEventListener(
			"click",
			(event) => {
				const el = event.target;
				// only fire if event target is a button with data-col
				if (el instanceof HTMLButtonElement && el.dataset.col) {
					const name = el.dataset.col;
					let direction: "ascending" | "descending" = "ascending";
					if (this.sort === name && this.direction === "ascending") {
						direction = "descending";
					}

					this.sort = name;
					this.direction = direction;
					if (this.store) localStorage.setItem(`action-table${this.id}`, JSON.stringify({ sort: this.sort, direction: direction }));
				}
			},
			false
		);

		// Listens for checkboxes in the table since mutation observer does not support checkbox changes
		this.addEventListener("change", (event) => {
			const el = event.target;
			// only fire if event target is a checkbox in a td; this stops it firing for filters
			if (el instanceof HTMLInputElement && el.closest("td") && el.type === "checkbox") {
				// get new content, sort and filter. This works for checkboxes and action-table-switch
				console.log("event change", el);
				this.updateContent(el);
			}
		});

		// Listens for action-table-filter event from action-table-filters
		this.addEventListener("action-table-filter", (event) => {
			// If details is undefined then reset filters
			const filters = event.detail ? { ...this.filters, ...event.detail } : {};
			// set filters object, filter table, and append rows
			this.setFilters(filters);
		});

		// Listens for action-table-update event used by custom elements that want to announce content changes
		this.addEventListener("action-table-update", (event) => {
			const target = event.target;
			if (target instanceof Element) {
				// console.log("🥳 action-table: update event", update);
				this.updateContent(target, event.detail);
			}
		});
	}

	/* -------------------------------------------------------------------------- */
	/*                       Private Method: update content                       */
	/* -------------------------------------------------------------------------- */

	private updateContent(el: Element, update: UpdateContentDetail = {}): void {
		const cell = (el.matches("td") ? el : el.closest("td")) as ActionCell;
		if (!cell) return;
		update = typeof update === "string" ? { sort: update, filter: update } : update;
		this.setCellContent(cell, update);
		this.sortAndFilter();
	}

	/* -------------------------------------------------------------------------- */
	/*      Private Method delaying sortAndFilter until it's no longer called     */
	/* -------------------------------------------------------------------------- */

	private delayUntilNoLongerCalled(callback: () => void) {
		let timeoutId: number;
		let isCalling = false;

		function delayedCallback() {
			// Execute the callback
			callback();

			// Reset the flag variable to false
			isCalling = false;
		}

		return function () {
			// If the function is already being called, clear the previous timeout
			if (isCalling) {
				clearTimeout(timeoutId);
			} else {
				// Set the flag variable to true if the function is not already being called
				isCalling = true;
			}

			// Set a new timeout to execute the delayed callback after 100ms
			timeoutId = setTimeout(delayedCallback, 10);
		};
	}

	/* ------------------------- Delayed Sort and Filter ------------------------ */

	private sortAndFilter = this.delayUntilNoLongerCalled(() => {
		console.log("🎲 sortAndFilter", this.id);
		this.filterTable();
		this.sortTable();
		this.appendRows();
		// If tbody is hidden then this is the initial render
		if (this.tbody.matches("[style*=none]")) {
			// if there are no rows then automatically reset filters
			if (this.rowsVisible === 0) {
				console.error("no results found on initial render");
				this.setFilters();
				this.dispatchEvent(new Event("action-table-filters-reset"));
			}
			// show tbody
			this.tbody.style.display = "";
		}
	});

	/* -------------------------------------------------------------------------- */
	/*                 Private Method: get columns from table                      */
	/* -------------------------------------------------------------------------- */

	private getColumns(): void {
		console.time("getColumns");
		// 1. Get column headers
		// casting type as we know what it is from selector
		const ths = this.table.querySelectorAll("thead th") as NodeListOf<HTMLTableCellElement>;

		ths.forEach((th) => {
			// 2. Column name is based on data-col attribute or results of getCellContent() function
			const name = (th.dataset.col || this.getCellContent(th)).trim().toLowerCase();
			const order = th.dataset.order ? th.dataset.order.split(",") : undefined;

			// 4. Add column name to cols array
			this.cols.push({ name, order });

			// 5. if the column is sortable then wrap it in a button, and add aria
			if (!th.hasAttribute("no-sort")) {
				const button = document.createElement("button");
				button.dataset.col = name;
				button.type = "button";
				button.innerHTML = th.innerHTML;
				th.replaceChildren(button);
			}
		});

		// 7. add colGroup unless it already exists
		if (!this.table.querySelector("colgroup")) {
			// 7.1 create colgroup
			const colGroup = document.createElement("colgroup");
			// 7.2 add col for each column
			ths.forEach(() => {
				const col = document.createElement("col");
				colGroup.appendChild(col);
			});
			// 7.3 prepend colgroup
			this.table.prepend(colGroup);
		}
		// console.log("action-table cols", this.cols);
		// 8. Return cols array
		console.timeEnd("getColumns");
	}

	/* -------------------------------------------------------------------------- */
	/*                     Private Method: get cell content                        */
	/* -------------------------------------------------------------------------- */
	private getCellContent(cell: HTMLTableCellElement | ActionCell): string {
		// 1. get cell content with innerText; set to empty string if null
		let cellContent: string = (cell.textContent || "").trim();

		// 3. if there is no cell content then check...
		if (!cellContent) {
			// 3.1 if there is an svg then get title; otherwise return empty string
			const svg = cell.querySelector("svg");
			if (svg instanceof SVGElement) {
				cellContent = svg.querySelector("title")?.textContent || cellContent;
			}
			// 3.2 if checkbox element then get value if checked
			const checkbox = cell.querySelector("input[type=checkbox]");
			if (checkbox instanceof HTMLInputElement && checkbox.checked) {
				cellContent = checkbox.value;
				if ("actionTable" in cell) {
					// this is needed so all row search ignores checkbox values
					cell.actionTable = { ...cell.actionTable, checked: true };
				}
			}
			// 3.3 if custom element with shadowRoot then get text content from shadowRoot
			const customElement = cell.querySelector(":defined");
			if (customElement?.shadowRoot) {
				cellContent = customElement.shadowRoot.textContent || cellContent;
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

		this.rows.forEach((row) => {
			// const rowObj: RowData = { node: row, columns: {} };
			// 1. grab all cells in the row
			const cells = row.querySelectorAll("td") as NodeListOf<ActionCell>;
			cells.forEach((cell, i) => {
				// 1. get matching column name
				const col = this.cols[i];
				this.setCellContent(cell, { col: col.name });
			});
		});
		// eslint-disable-next-line no-console
		console.timeEnd("getTableContent");
	}

	/* ------------------------------------------------------------------------- */
	/*              Private Method: Set Cell Content in td attribute              */
	/* -------------------------------------------------------------------------- */

	private setCellContent(cell: ActionCell, update: { col?: string; sort?: string; filter?: string } = {}) {
		const cellContent = this.getCellContent(cell);
		cell.actionTable = { ...cell.actionTable, sort: cell.dataset.sort || cellContent, filter: cell.dataset.filter || cellContent, ...update };
	}

	/* -------------------------------------------------------------------------- */
	/*                        Private Method: Add Observer                        */
	/* -------------------------------------------------------------------------- */

	private addObserver() {
		// Good reference for MutationObserver: https://davidwalsh.name/mutationobserver-api
		// 1. Create an observer instance
		const observer = new MutationObserver((mutations) => {
			// Make sure it only gets content once if there are several changes at the same time
			// 1.1 sort through all mutations
			mutations.forEach((mutation) => {
				const target = mutation.target;
				if (target instanceof Element) {
					if (target instanceof HTMLTableSectionElement || target instanceof HTMLTableRowElement) return;
					// console.log("MutationObserver", target, mutation.type);
					this.updateContent(target);
					this.sortAndFilter();
				}
				// Ignore tbody changes which happens whenever a new row is added with sort
			});
		});
		observer.observe(this.tbody, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-sort", "data-filter"] });
	}

	/* -------------------------------------------------------------------------- */
	/*            Private Method: filter table on column name and value            */
	/* -------------------------------------------------------------------------- */
	/* ------------- Used by filters in action-table-filter element ------------- */
	/* ------------- Also triggered by local storage and URL params ------------- */

	// TODO: remove args
	private filterTable(): void {
		console.log("filterTable", this.filters);

		// eslint-disable-next-line no-console
		console.time("filterTable");

		// 1. Save current state of numberOfPages
		const currentNumberOfPages = this.numberOfPages;
		const currentRowsVisible = this.rowsVisible;

		// 2. get filter value for whole row based on special reserved name "action-table"
		const filterForWholeRow = this.filters["action-table"];

		this.rows.forEach((row) => {
			// 3.1 set base display value as ""
			let hide = false;
			// 3.2 get td cells
			const cells = row.querySelectorAll("td") as NodeListOf<ActionCell>;
			// 3.3 if filter value for whole row exists then run filter against innerText of entire row content
			if (filterForWholeRow) {
				// 3.3.1 build string of all td data-filter values, ignoring checkboxes
				const content = Array.from(cells)
					.map((cell) => (cell.actionTable.checked ? "" : cell.actionTable.filter))
					.join(" ");

				if (this.shouldHide(filterForWholeRow, content)) {
					hide = true;
				}
			}
			// 3.4 if columnName is not action-table then run filter against td cell content
			cells.forEach((cell, i) => {
				const filter = this.filters[this.cols[i].name];
				if (!filter) return;

				if (this.shouldHide(filter, cell.actionTable.filter)) {
					hide = true;
				}
			});

			// 3.5 set display
			row.hideRow = hide;
		});

		// 4. If number of pages changed, update pagination
		console.log("currentNumberOfPages", currentNumberOfPages, this.numberOfPages);

		if (this.numberOfPages !== currentNumberOfPages) {
			this.dispatch({ numberOfPages: this.numberOfPages });
		}
		if (this.rowsVisible !== currentRowsVisible) {
			this.dispatch({ rowsVisible: this.rowsVisible });
		}
		console.timeEnd("filterTable");
	}

	private shouldHide(filter: SingleFilterObject, content: string): boolean {
		// console.log("shouldHide", filter, content);
		if (filter.values && filter.values.length > 0) {
			// 1. build regex from filterValues array (checkboxes and select menus send arrays)
			if (filter.regex) {
				let regexPattern = filter.values.join("|");
				if (filter.exclusive) {
					const regexParts = filter.values.map((str) => `(?=.*${str})`);
					regexPattern = `${regexParts.join("")}.*`;
				}
				const regex = new RegExp(regexPattern, "i");

				// 2. check if content matches
				return !regex.test(content);
			}
			if (filter.range) {
				const [min, max] = filter.values;
				// TODO: Maybe allow for alphabetical ranges?
				if (!isNaN(Number(min)) && !isNaN(Number(max))) return Number(content) < Number(min) || Number(content) > Number(max);
			}
			// console.log("show", columnName, content);
			if (filter.exclusive) {
				return !filter.values.every((v) => content.toLowerCase().includes(v.toLowerCase()));
			}
			if (filter.exact) {
				return !filter.values.some((v) => content === v);
			}
			return !filter.values.some((v) => content.toLowerCase().includes(v.toLowerCase()));
		}
		return false;
	}

	/* -------------------------------------------------------------------------- */
	/*        Private Method: sort table based on column name and direction        */
	/* -------------------------------------------------------------------------- */
	/* ----------- Used by sort header buttons and attributes callback ----------- */
	/* ------------- Also triggered by local storage and URL params ------------- */

	private sortTable(columnName = this.sort, direction = this.direction) {
		// eslint-disable-next-line no-console
		console.time("sortTable");
		columnName = columnName.toLowerCase();
		// 1. Get column index from column name
		const columnIndex = this.cols.findIndex((col) => col.name === columnName);

		// 2. If column exists and there are rows then sort
		if (columnIndex >= 0 && this.rows.length > 0) {
			console.log(`sort by ${columnName} ${direction}`);

			// 1 Get sort order for column if it exists
			const sortOrder = this.cols[columnIndex].order;
			// helper function to return sort order index for row sort
			const checkSortOrder = (value: string) => {
				return sortOrder?.includes(value) ? sortOrder.indexOf(value).toString() : value;
			};

			// 2. Sort rows
			this.rows.sort((r1, r2) => {
				// 1. If descending sort, swap rows
				if (this.direction === "descending") {
					const temp = r1;
					r1 = r2;
					r2 = temp;
				}

				// 2. Get content from stored actionTable.sort; If it matches value in sort order exists then return index
				const a: string = checkSortOrder((r1.children[columnIndex] as ActionCell).actionTable.sort);
				const b: string = checkSortOrder((r2.children[columnIndex] as ActionCell).actionTable.sort);

				return this.alphaNumSort(a, b);
			});

			// 3. Add sorted class to columns
			const colGroupCols = this.querySelectorAll("col");
			colGroupCols.forEach((colGroupCol, i) => {
				if (i === columnIndex) {
					colGroupCol.classList.add("sorted");
				} else {
					colGroupCol.classList.remove("sorted");
				}
			});

			// 3. set aria sorting direction
			const ths = this.table.querySelectorAll("thead th");
			ths.forEach((th, i) => {
				const ariaSort = i === columnIndex ? direction : "none";
				th.setAttribute("aria-sort", ariaSort);
			});
		}
		// eslint-disable-next-line no-console
		console.timeEnd("sortTable");
	}

	/* --------------------------- Public Sort Method --------------------------- */
	// Also used by action-table-filter-menu.js when building options menu

	public alphaNumSort(a: string, b: string): number {
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
	}

	/* -------------------------------------------------------------------------- */
	/*                         Private Method: Append Rows                        */
	/* -------------------------------------------------------------------------- */
	/* --------- Sets row visibility based on sort,filter and pagination -------- */

	private appendRows(): void {
		console.time("appendRows");

		// Helper function for hiding rows based on pagination
		const isActivePage = (i: number): boolean => {
			// returns if pagination is enabled (> 0) and row is on current page.
			// For instance if the current page is 2 and pagination is 10 then is greater than 10 and less than or equal to 20
			const { pagination, page } = this;
			return pagination === 0 || (i >= pagination * (page - 1) + 1 && i <= pagination * page);
		};

		// fragment for holding rows
		const fragment = document.createDocumentFragment();
		// This includes both rows hidden by filter and by pagination
		let currentRowsVisible = 0;

		// loop through rows to set hide or show
		this.rows.forEach((row) => {
			let display = "none";
			// if row not hidden by filter
			if (!row.hideRow) {
				// increment current rows
				currentRowsVisible++;
				// if row not hidden by pagination
				if (isActivePage(currentRowsVisible)) {
					// set display to show and add row to fragment
					display = "";
					fragment.appendChild(row);
				}
			}
			row.style.display = display;
		});

		// prepend fragment to tbody

		this.tbody.prepend(fragment);

		console.timeEnd("appendRows");

		if (this.pagination > 0) {
			// If page is greater than number of pages, set page to number of pages
			const page = this.checkPage(this.page);
			if (page !== this.page) {
				// update this.page
				this.page = page;
				// Dispatch current page
				this.dispatch({ page: page });
			}
		}
	}

	get rowsVisible(): number {
		return this.rows.filter((row) => !row.hideRow).length;
	}

	get numberOfPages(): number {
		return this.pagination > 0 ? Math.ceil(this.rowsVisible / this.pagination) : 1;
	}
}

customElements.define("action-table", ActionTable);
