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
	private cols: { name: string; index: number }[] = [];
	private rows!: NodeListOf<HTMLTableRowElement>;
	private rows_array!: Array<HTMLTableRowElement>;

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
		const element = slot.assignedElements();

		this.table = element.filter((el) => {
			if (el.matches("table")) return el as HTMLTableElement;
			if (el.querySelector("table")) return el.querySelector("table") as HTMLTableElement;
			return false;
		})[0];
		console.log("🚀 ~ file: main.ts:51 ~ ActionTable ~ this.table=element.filter ~ this.table:", this.table);

		// this.table = element.matches("table") ? (element as HTMLTableElement) : (element.querySelector("table") as HTMLTableElement);
		if (!this.table) return;
		this.tbody = this.table.querySelector("tbody") as HTMLTableSectionElement;

		/* ----------------- Get Column Names and Indexes ----------------- */
		const arrow_svg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
        <path d="M9 16.172l-6.071-6.071-1.414 1.414 8.485 8.485 8.485-8.485-1.414-1.414-6.071 6.071v-16.172h-2z"></path>
        </svg>
        `;
		this.ths = this.table.querySelectorAll("th");
		if (this.ths) {
			this.ths.forEach((th) => {
				const name = th.dataset.col || th.children[0]?.getAttribute("title") || th.textContent || "";
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
		this.rows_array = Array.from(this.rows);

		/* ----------------- Sort Table Element if attribute is set ----------------- */
		if (this.sort) {
			this.sort_table(this.sort, this.direction);
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
							this.direction = "ascending";
						}
						this.sort_table(name, this.direction);
					}
				}
			},
			false
		);
	}

	private sort_table(column: string, direction: string) {
		console.log("sort_table", column, direction);
		this.sort = column;

		// Get column index from column name
		const column_index = this.cols.findIndex((c) => c.name === column);
		console.log("🚀 ~ file: main.ts:83 ~ WebComponent ~ sort_table ~ column_index:", column_index);
		console.log("🚀 ~ file: main.ts:83 ~ WebComponent ~ sort_table ~ this.rows_array:", this.rows_array);

		// Sort
		if (column_index >= 0 && this.rows_array.length > 0) {
			this.rows_array.sort((r1, r2) => {
				const c1 = r1.children[column_index] as HTMLTableCellElement;
				const c2 = r2.children[column_index] as HTMLTableCellElement;
				const v1 = c1.dataset.sort || c1.textContent || "";
				const v2 = c2.dataset.sort || c2.textContent || "";
				if (direction === "ascending") {
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
				if (th.textContent === column) {
					th.classList.add(`sort-${direction}`);
				}
			});

			this.rows_array.forEach((row) => this.tbody.appendChild(row));
		}
	}

	private render(): void {
		console.log("render action-table");

		const html = `<div><slot></slot></div>`;
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

	private addEventListeners(): void {}

	public connectedCallback(): void {
		this.render();

		this.addEventListeners();
	}

	private render(): void {
		const html = `${this.label ? `<label>${this.label}</label>` : ""}<select>${this.options
			.split(",")
			.map((option) => `<option value="${option}">${option}</option>`)}</select>`;
		const css = `<style></style>`;

		this.shadow.innerHTML = `${css}${html}`;
	}
}

customElements.define("action-table", ActionTable);
customElements.define("action-table-filter", ActionTableFilter);
