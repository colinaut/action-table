export default class WebComponent extends HTMLElement {
	private shadow: ShadowRoot;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
	}

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
		const element = slot.assignedElements()[0];
		this.table = element.matches("table") ? (element as HTMLTableElement) : (element.querySelector("table") as HTMLTableElement);
		if (!this.table) return;
		this.tbody = this.table.querySelector("tbody") as HTMLTableSectionElement;
		this.ths = this.table.querySelectorAll("th");
		if (this.ths) {
			this.ths.forEach((th) => {
				this.cols.push({ name: th.textContent || "", index: th.cellIndex });
			});
		}
		this.rows = element.querySelectorAll("tbody tr");
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
				if (el.tagName === "TH" && el.textContent) {
					this.direction = el.textContent === this.sort ? "descending" : "ascending";
					this.sort_table(el.textContent, this.direction);
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
				const v1 = r1.children[column_index].textContent;
				const v2 = r2.children[column_index].textContent;
				if (v1 && v2) {
					if (direction === "ascending") {
						if (v1 < v2) return -1;
						if (v1 > v2) return 1;
					} else {
						if (v1 < v2) return 1;
						if (v1 > v2) return -1;
					}
				}
				return 0;
			});

			// Remove "sorted" and direction classes from all th and add for sorted column
			this.ths.forEach((th) => {
				th.classList.remove("sort-ascending");
				th.classList.remove("sort-descending");
				if (th.textContent === column) {
					th.classList.add(`table-${direction}`);
				}
			});

			this.rows_array.forEach((row) => this.tbody.appendChild(row));
		}
	}

	private render(): void {
		const html = `<div><slot></slot></div>`;
		const css = `<style></style>`;

		this.shadow.innerHTML = `${css}${html}`;
	}
}
customElements.define("action-table", WebComponent);
