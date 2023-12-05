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
	set sort(value: string) {
		this.setAttribute("sort", value);
	}
	get direction(): string {
		return this.getAttribute("direction")?.trim().toLowerCase() || "ascending";
	}
	set direction(value: string) {
		this.setAttribute("direction", value);
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
				// Column name is based on data-col attribute or innerText
				let name = th.dataset.col || th.innerText || "";
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
					let name = el.dataset.col || el.innerText || "";
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
				const cell = cells[col.index] as HTMLTableCellElement;
				const content = this.getCellContent(cell).toString();
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
					console.log("🚀 ~ file: action-table.ts:170 regex:", content, regex, regex.test(content));
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

	private getCellContent(cell: HTMLTableCellElement): string | number {
		let cellContent: string | number = cell.dataset.sort || cell.innerText || "";
		// trim to make sure it's not just spaces
		cellContent = cellContent?.trim();

		if (!cellContent) {
			const el = cell.firstElementChild as HTMLElement;
			if (el.tagName.toLowerCase() === "svg") {
				cellContent = el.querySelector("title")?.textContent || "";
			}
		}
		cellContent = Number(cellContent) ? Number(cellContent) : cellContent.trim();
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
				let v1 = this.getCellContent(c1);
				let v2 = this.getCellContent(c2);

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
				if (th.dataset.sort === sort || th.innerText?.trim().toLowerCase() === sort) {
					th.classList.add(`sort-${direction}`);
				}
			});

			this.rowsArray.forEach((row) => this.tbody.appendChild(row));
		}
	}
}

customElements.define("action-table", ActionTable);
