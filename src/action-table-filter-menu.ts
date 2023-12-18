import { ActionTable } from "./action-table";

export class ActionTableFilterMenu extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes(): string[] {
		return ["name", "options", "label", "type", "exclusive", "multiple"];
	}

	get name(): string {
		return this.getAttribute("name") || "";
	}

	get options(): string[] {
		return this.getAttribute("options")?.split(",") || [];
	}

	set options(value: string[]) {
		this.setAttribute("options", value.join(","));
	}

	get label(): string {
		return this.getAttribute("label") || this.name;
	}

	get type(): "select" | "checkbox" | "radio" {
		return (this.getAttribute("type") as "select" | "checkbox" | "radio") || "select";
	}

	get multiple(): "multiple" | "" {
		return this.hasAttribute("multiple") ? "multiple" : "";
	}

	public findOptions(columnName: string): void {
		// 1. Set column name to lowercase
		columnName = columnName.toLowerCase();
		// 2. Get action table; of not found, return
		const actionTable = this.closest("action-table") as ActionTable;

		// 3. Get cols and tbody from actionTable
		const cols = actionTable.cols;
		const tbody = actionTable.tbody;

		// 4. Find column index based on column name in header data-col attribute; if not found, return
		const columnIndex = cols.indexOf(columnName);
		if (columnIndex === -1) {
			return;
		}

		// 6. Get all cells in column
		const columnTDs = `td:nth-child(${columnIndex + 1})`;
		const cells = tbody.querySelectorAll(columnTDs) as NodeListOf<HTMLTableCellElement>;

		// 6. Get all spans or li in column
		const subItems = tbody.querySelectorAll(`${columnTDs} > span, ${columnTDs} > ul > li`) as NodeListOf<HTMLElement>;

		// 7. Get all options
		let options: string[] = [];
		if (subItems && subItems.length > 0) {
			// 7.1 If subitems exist, get all options in subitems
			options = Array.from(subItems).map((item) => item.innerText);
		} else {
			// 7.2 else get data-filter or innerText
			options = Array.from(cells).map((cell) => cell.dataset.filter || cell.innerText);
		}

		// 8. Make array of all unique options
		this.options = Array.from(new Set(options));
	}

	public connectedCallback(): void {
		if (this.options.length < 1) {
			this.findOptions(this.name);
		}
		this.render();
	}

	private render(): void {
		if (this.options.length < 1) return;
		const columnName = this.name.toLowerCase();
		const mainLabel = this.type === "select" ? `<label for="filter-${columnName}">${this.label}</label>` : `<span class="filter-label">${this.label}</span>`;
		let start = "";
		let end = "";
		if (this.type === "select") {
			start = `<select id="filter-${columnName}" name="${columnName}" ${this.multiple}><option value="">All</option>`;
			end = `</select>`;
		}
		if (this.type === "radio") {
			start = `<label><input name="${columnName}" type="radio" value="" checked>All</label>`;
		}
		const html = `${mainLabel}${start}${this.options
			.map((option) => {
				if (this.type === "select") return `<option value="${option}">${option}</option>`;
				if (this.type === "radio" || this.type === "checkbox") return `<label><input type="${this.type}" name="${columnName}" value="${option}" />${option}</label>`;
				return "";
			})
			.join("")}${end}`;

		this.innerHTML = `${html}`;
	}
}

customElements.define("action-table-filter-menu", ActionTableFilterMenu);
