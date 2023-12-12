export class ActionTableFilterMenu extends HTMLElement {
	constructor() {
		super();
	}

	// TODO: Add exact attribute that switches the filter to be exact match rather than includes

	static get observedAttributes(): string[] {
		return ["col", "options", "label", "type", "exclusive", "multiple"];
	}

	get col(): string {
		return this.getAttribute("col") || "";
	}

	get options(): string {
		return this.getAttribute("options") || "";
	}

	set options(value: string) {
		this.setAttribute("options", value);
	}

	get label(): string {
		return this.getAttribute("label") || this.col;
	}

	get type(): "select" | "checkbox" | "radio" {
		return (this.getAttribute("type") as "select" | "checkbox" | "radio") || "select";
	}

	get multiple(): "multiple" | "" {
		return this.hasAttribute("multiple") ? "multiple" : "";
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
			options = Array.from(subItems).map((item) => {
				if (item.matches("[type='checkbox']")) {
					const checkbox = item as HTMLInputElement;
					return checkbox.value;
				} else {
					return item.innerText;
				}
			});
		} else {
			options = Array.from(cells).map((cell) => cell.dataset.filter || cell.innerText);
		}
		this.options = Array.from(new Set(options)).join(",");
	}

	public connectedCallback(): void {
		if (!this.options) this.findOptions(this.col);
		this.render();
	}

	private render(): void {
		const colName = this.col.toLowerCase();
		const mainLabel = this.type === "select" ? `<label for="filter-${colName}">${this.label}</label>` : `<span class="filter-label">${this.label}</span>`;
		let start = "";
		let end = "";
		if (this.type === "select") {
			start = `<select id="filter-${colName}" name="${colName}" ${this.multiple}><option value="">All</option>`;
			end = `</select>`;
		}
		if (this.type === "radio") {
			start = `<label><input name="${colName}" type="radio" value="">All</label>`;
		}
		let html = `${mainLabel}${start}${this.options
			.split(",")
			.map((option) => {
				if (this.type === "select") return `<option value="${option}">${option}</option>`;
				if (this.type === "radio" || this.type === "checkbox") return `<label><input type="${this.type}" name="${colName}" value="${option}" />${option}</label>`;
				return "";
			})
			.join("")}${end}`;

		this.innerHTML = `${html}`;
	}
}

customElements.define("action-table-filter-menu", ActionTableFilterMenu);
