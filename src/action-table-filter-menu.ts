export class ActionTableFilterMenu extends HTMLElement {
	private shadow: ShadowRoot;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
	}

	// TODO: Add exact attribute that switches the filter to be exact match rather than includes

	static get observedAttributes(): string[] {
		return ["col", "options"];
	}

	get col(): string {
		return this.getAttribute("col")?.trim().toLowerCase() || "";
	}

	get options(): string {
		return this.getAttribute("options") || "";
	}

	set options(value: string) {
		this.setAttribute("options", value);
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
				}
			}
		});
	}

	public resetFilter() {
		const select = this.shadowRoot?.querySelector("select");
		if (select) {
			select.value = "";
		}
	}

	public findOptions(col: string): void {
		col = col.toLowerCase();
		const ths = this.closest("action-table")?.querySelectorAll("table thead th") as NodeListOf<HTMLTableCellElement>;
		const col_index = Array.from(ths).findIndex((th) => th.dataset.col?.toLowerCase() === col || th.innerText.toLowerCase() === col);
		if (col_index === -1) {
			return;
		}
		const cells = this.closest("action-table")?.querySelectorAll(`table tbody td:nth-child(${col_index + 1})`) as NodeListOf<HTMLTableCellElement>;
		const subItems = this.closest("action-table")?.querySelectorAll(`table tbody td:nth-child(${col_index + 1}) > *`) as NodeListOf<HTMLElement>;
		let options: string[] = [];
		if (subItems && subItems.length > 0) {
			options = Array.from(subItems).map((item) => item.innerText);
		} else {
			options = Array.from(cells).map((cell) => cell.innerText);
		}
		console.log("🚀 ~ file: action-table-filter.ts:64 ~ ActionTableFilterMenu ~ findOptions ~ columnContent:", options);
		this.options = Array.from(new Set(options)).join(",");
	}

	public connectedCallback(): void {
		if (!this.options) this.findOptions(this.col);
		this.render();
		this.addEventListeners();
	}

	private render(): void {
		const css = `<style>
        label {
            display: inline-block;
            margin-inline-end: 0.5em;
        }
        </style>`;
		const html = `<label part="label"><slot>Filter by ${this.col}</slot></label><select part="select" name="filter-${this.col}" data-col="${
			this.col
		}"><option value="">All</option>${this.options.split(",").map((option) => `<option value="${option}">${option}</option>`)}</select>`;

		this.shadow.innerHTML = `${css}${html}`;
	}
}

customElements.define("action-table-filter-menu", ActionTableFilterMenu);
