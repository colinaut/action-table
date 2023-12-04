export class ActionTable extends HTMLElement {
	constructor() {
		super();
	}

	// TODO: review if I really need all of these variables
	private tbody!: HTMLTableSectionElement;
	private ths!: NodeListOf<HTMLTableCellElement>;
	private cols: { name: string; index: number; filter?: string }[] = [];
	private rowsArray!: Array<HTMLTableRowElement>;

	/* -------------------------------------------------------------------------- */
	/*                                 Attributes                                 */
	/* -------------------------------------------------------------------------- */

	static get observedAttributes(): string[] {
		return ["sort", "direction"];
	}

	get sort(): string {
		return this.getAttribute("sort")?.trim().toLowerCase() || "";
	}
	set sort(value) {
		if (typeof value === "string") this.setAttribute("sort", value);
	}
	get direction(): string {
		return this.getAttribute("direction")?.trim().toLowerCase() || "ascending";
	}
	set direction(value) {
		if (typeof value === "string") this.setAttribute("direction", value);
	}

	public connectedCallback(): void {
		const table = this.querySelector("table") as HTMLTableElement;

		this.tbody = table.querySelector("tbody") as HTMLTableSectionElement;

		this.getColumns(table);

		const rows = this.tbody.querySelectorAll("tbody tr") as NodeListOf<HTMLTableRowElement>;
		this.rowsArray = Array.from(rows);

		/* ----------------- Sort Table Element if attribute is set ----------------- */
		if (this.sort) {
			this.sortTable();
		}

		this.addEventListeners();
	}

	private getColumns(table: HTMLTableElement): Array<{ name: string; index: number; filter?: string }> {
		this.ths = table.querySelectorAll("th");
		if (this.ths) {
			this.ths.forEach((th) => {
				// Column name is based on data-col attribute or title attribute of first child or text content of th or first child text content
				let name = th.dataset.col || th.children[0]?.getAttribute("title") || th.textContent || th.children[0]?.textContent || "";
				name = name.trim().toLowerCase();
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
		return this.cols;
	}

	public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		console.log("changed", name, oldValue, newValue);
	}

	private addEventListeners(): void {
		this.addEventListener(
			"click",
			(event) => {
				const el = event.target as HTMLTableCellElement;
				if (el.tagName === "TH") {
					let name = el.dataset.col || el.children[0]?.getAttribute("title") || el.textContent || "";
					name = name.trim().toLowerCase();
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
		this.addEventListener("action-table-filter", (event) => {
			const { col, value } = (<CustomEvent>event).detail;
			console.log(`Filter ${col} to ${value}`);
			this.filterTable(col, value);
		});

		this.addEventListener("action-table-filter-reset", () => {
			this.resetFilters();
		});
	}

	public resetFilters(): void {
		// remove all filters from this.col then call filterTable
		this.cols.forEach((col) => {
			col.filter = "";
		});
		this.filterTable();
		// find all action-table-filter elements and call resetFilter
		interface ActionTableFilter extends HTMLElement {
			resetFilter(options?: { dispatch: boolean }): void;
		}
		const filterMenus = this.querySelectorAll("action-table-filter-menu, action-table-filter-switch") as NodeListOf<ActionTableFilter>;

		filterMenus?.forEach((el) => {
			el.resetFilter({ dispatch: false });
		});
	}

	public filterTable(col = "", value = "") {
		col = col?.trim().toLowerCase();
		if (typeof value === "string") {
			value = value.trim();
		}
		// Add filter to cols array
		// if value = "" that resets the filter for that column
		this.cols = this.cols.map((c) => {
			if (c.name === col) {
				c.filter = value;
			}
			return c;
		});

		// Filter based on filter value
		this.rowsArray.forEach((row) => {
			row.style.display = "";
			const cells = row.children as HTMLCollectionOf<HTMLElement>;
			this.cols.forEach((col) => {
				let content = cells[col.index].textContent || cells[col.index].dataset.sort || "";
				content = content?.trim();

				if (col.filter && typeof col.filter === "string") {
					const regex = new RegExp(col.filter, "i");
					if (regex.test(content)) {
						// row.style.display = "table-row";
					} else {
						row.style.display = "none";
					}
				} else if (col.filter && Array.isArray(col.filter)) {
					const filterArray = col.filter as string[];
					let regexString = "(";
					filterArray.forEach((value, i) => {
						regexString += `${value}`;
						regexString += i < filterArray.length - 1 ? "|" : "";
					});
					regexString += ")";
					const regex = new RegExp(regexString, "i");
					if (regex.test(content)) {
						// row.style.display = "table-row";
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
		cellContent = Number(cellContent) ? Number(cellContent) : cellContent;
		return cellContent;
	}

	sortTable(sort = this.sort, direction = this.direction) {
		sort = sort?.trim().toLowerCase();
		direction = direction?.trim().toLowerCase();
		// Get column index from column name
		const column_index = this.cols.findIndex((c) => c.name === sort);
		// Sort
		if (column_index >= 0 && this.rowsArray.length > 0) {
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
				if (th.textContent?.trim().toLowerCase() === sort) {
					th.classList.add(`sort-${direction}`);
				}
			});

			this.rowsArray.forEach((row) => this.tbody.appendChild(row));
		}
	}
}

customElements.define("action-table", ActionTable);
