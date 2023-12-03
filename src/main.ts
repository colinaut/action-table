export class ActionTable extends HTMLElement {
	private shadow: ShadowRoot;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
	}

	// TODO: review if I really need all of these variables
	private table!: HTMLTableElement;
	private tbody!: HTMLTableSectionElement;
	private ths!: NodeListOf<HTMLTableCellElement>;
	private cols: { name: string; index: number; filter?: string }[] = [];
	private rows!: NodeListOf<HTMLTableRowElement>;
	private rowsArray!: Array<HTMLTableRowElement>;
	private rowsArrayFiltered!: Array<HTMLTableRowElement>;

	/* -------------------------------------------------------------------------- */
	/*                                 Attributes                                 */
	/* -------------------------------------------------------------------------- */

	static get observedAttributes(): string[] {
		return ["sort", "direction"];
	}

	get sort(): string {
		return this.getAttribute("sort") || "";
	}
	set sort(value) {
		if (typeof value === "string") this.setAttribute("sort", value);
	}
	get direction(): string {
		return this.getAttribute("direction") || "ascending";
	}
	set direction(value) {
		if (typeof value === "string") this.setAttribute("direction", value);
	}

	public connectedCallback(): void {
		this.render();

		/* ------------------------ Grab elements from slots ------------------------ */
		const slot = this.shadowRoot?.querySelector("slot");
		if (!slot) return;
		// Detect slot changes
		// slot.addEventListener("slotchange", () => {
		// 	let nodes = slot.assignedNodes();
		// 	console.log(`Element in Slot "${slot}" changed`, nodes);
		// });
		const element = slot.assignedElements();

		this.table = element.filter((el) => {
			if (el.matches("table")) return el as HTMLTableElement;
			if (el.querySelector("table")) return el.querySelector("table") as HTMLTableElement;
			return false;
		})[0] as HTMLTableElement;
		// console.log("🚀 ~ file: main.ts:51 ~ ActionTable ~ this.table=element.filter ~ this.table:", this.table);

		this.tbody = this.table.querySelector("tbody") as HTMLTableSectionElement;

		/* ----------------- Get Column Names and Indexes ----------------- */
		this.ths = this.table.querySelectorAll("th");
		if (this.ths) {
			this.ths.forEach((th) => {
				// Column name is based on data-col attribute or title attribute of first child or text content of th or first child text content
				const name = th.dataset.col || th.children[0]?.getAttribute("title") || th.textContent || th.children[0]?.textContent || "";
				if (name) {
					this.cols.push({ name: name, index: th.cellIndex });
					const span = document.createElement("span");
					span.classList.add("sort-arrow");
					// span.innerHTML = arrow_svg;
					th.append(span);
				}
			});
		}
		console.log("action-table cols", this.cols);

		this.rows = this.table.querySelectorAll("tbody tr");
		this.rowsArray = Array.from(this.rows);
		this.rowsArrayFiltered = this.rowsArray;

		/* ----------------- Sort Table Element if attribute is set ----------------- */
		if (this.sort) {
			this.sortTable();
		}

		this.addEventListeners();
	}

	public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		// console.log("changed", name, oldValue, newValue);
	}

	private addEventListeners(): void {
		this.shadow.addEventListener(
			"click",
			(event) => {
				const el = event.target as HTMLTableCellElement;
				if (el.tagName === "TH") {
					const name = el.dataset.col || el.children[0]?.getAttribute("title") || el.textContent || "";
					if (name) {
						if (this.sort === name && this.direction === "ascending") {
							this.direction = "descending";
						} else {
							this.sort = name;
							this.direction = "ascending";
						}
						this.sortTable();
					}
				}
			},
			false
		);

		// TODO: add function to filter for numbers against a value range
		// TODO: add function to filter for dates against a date range
		// TODO: add function to filter for an array of strings so can have multiple select dropdown

		// Add listener for custom event "action-table-filter" which logs the event detail
		this.shadow.addEventListener("action-table-filter", (event) => {
			const { col, value } = (<CustomEvent>event).detail;
			console.log(`Filter ${col} to ${value}`);
			this.filterTable(col, value);
		});
	}

	private filterTable(col = "", value = "") {
		// Add filter to cols array
		// if value = "" that resets the filter for that column
		this.cols = this.cols.map((c) => {
			if (c.name.toLowerCase() === col.toLowerCase()) {
				c.filter = value;
			}
			return c;
		});

		// Filter based on filter value
		this.rowsArray.forEach((row) => {
			row.style.display = "";
			const cells = row.children as HTMLCollectionOf<HTMLElement>;
			this.cols.forEach((col) => {
				if (col.filter) {
					const content = cells[col.index].textContent?.toLowerCase() || cells[col.index].dataset.sort?.toLowerCase() || "";
					if (content.includes(col.filter.toLowerCase())) {
					} else {
						row.style.display = "none";
					}
				}
			});
		});

		this.sortTable();
	}

	private getCellSortValue(cell: HTMLTableCellElement) {
		let cellContent: string | number = cell.dataset.sort || cell.textContent || "";
		cellContent = cellContent.trim().toLowerCase();
		cellContent = Number(cellContent) ? Number(cellContent) : cellContent;
		return cellContent;
	}

	private sortTable(sort = this.sort, direction = this.direction) {
		// Get column index from column name
		const column_index = this.cols.findIndex((c) => c.name === sort);
		// Sort
		if (column_index >= 0 && this.rowsArrayFiltered.length > 0) {
			console.log(`sort by ${sort} ${direction}`);

			this.rowsArray.sort((r1, r2) => {
				const c1 = r1.children[column_index] as HTMLTableCellElement;
				const c2 = r2.children[column_index] as HTMLTableCellElement;
				let v1 = this.getCellSortValue(c1);
				let v2 = this.getCellSortValue(c2);

				if (this.direction === "ascending") {
					if (v1 < v2) return -1;
					if (v1 > v2) return 1;
				} else {
					if (v1 < v2) return 1;
					if (v1 > v2) return -1;
				}
				return 0;
			});

			// Remove "sorted" and direction classes from all th and add for sorted column
			this.ths.forEach((th) => {
				th.classList.remove("sort-ascending");
				th.classList.remove("sort-descending");
				if (th.textContent === sort) {
					th.classList.add(`sort-${direction}`);
				}
			});

			this.rowsArray.forEach((row) => this.tbody.appendChild(row));
		}
	}

	private render(): void {
		console.log("render action-table");

		const html = `<slot></slot>`;
		const css = `<style></style>`;

		this.shadow.innerHTML = `${css}${html}`;
	}
}

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
		return this.getAttribute("col") || "";
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

customElements.define("action-table", ActionTable);
customElements.define("action-table-filter", ActionTableFilter);
