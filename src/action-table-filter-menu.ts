import type { ActionTable } from "./action-table";
export class ActionTableFilterMenu extends HTMLElement {
	constructor() {
		super();
	}

	private options: string[] = [];

	private findOptions(columnName: string): void {
		// 1. Set column name to lowercase
		columnName = columnName.toLowerCase();

		// 2. Get action table; of not found, return
		const actionTable = this.closest("action-table") as ActionTable;

		// 3. Get cols and tbody from actionTable
		const cols = actionTable.cols;
		const tbody = actionTable.tbody;

		// 4. Find column index based on column name in header data-col attribute; if not found, return
		const columnIndex = cols.findIndex((col) => col.name === columnName);
		if (columnIndex === -1) {
			return;
		}

		// 6. Get all cells in column
		const columnTDs = `td:nth-child(${columnIndex + 1})`;
		const cells = tbody.querySelectorAll(columnTDs) as NodeListOf<HTMLTableCellElement>;
		// 7. Create array of options
		let options: string[] = [];

		// 8. Review all cells for filter values
		Array.from(cells).forEach((cell) => {
			const subItems = cell.querySelectorAll(`span, ul > li`) as NodeListOf<HTMLElement>;
			if (subItems?.length > 0) {
				// 8.3 If subitems exist, get all options in subitems
				const subOptions = Array.from(subItems).map((item) => item.textContent || "");
				options = options.concat(subOptions);
			} else {
				// 8.4 If subitems do not exist, get filter value of cell
				options.push(actionTable.getCellValues(cell).filter);
			}
		});

		// 8. Make array of all unique options
		options = Array.from(new Set(options));

		const sortOrder = cols[columnIndex].order;
		function checkSortOrder(value: string) {
			return sortOrder?.includes(value) ? sortOrder.indexOf(value).toString() : value;
		}

		// 9. Sort options using action table alpha numeric sort
		options.sort((a, b) => {
			a = checkSortOrder(a);
			b = checkSortOrder(b);
			return actionTable.alphaNumSort(a, b);
		});
		// 10. reverse order if descending
		if (this.hasAttribute("descending")) options.reverse();
		// 11. Set options
		this.options = options;
	}

	// Using connectedCallback because options may need to be rerendered when added to the DOM
	public connectedCallback(): void {
		const columnName = this.getAttribute("name");
		// name is required
		if (!columnName) return;
		// If options are not specified then find them
		if (this.hasAttribute("options")) {
			this.options = this.getAttribute("options")?.split(",") || [];
		} else {
			this.findOptions(columnName);
		}
		this.render(columnName);
	}

	private render(columnName: string): void {
		if (this.options.length < 1) return;
		// Get options from custom element attributes
		const type = (this.getAttribute("type") as "select" | "checkbox" | "radio") || "select";
		if (type !== "checkbox" && this.options.length < 2) return;
		const label = this.getAttribute("label") || columnName;
		const multiple = this.hasAttribute("multiple") ? "multiple" : "";
		const all = this.getAttribute("all") || "All";

		// Build element
		let start = "";
		let end = "";
		const mainLabel = type === "select" ? `<label for="filter-${columnName}">${label}</label>` : `<span class="filter-label">${label}</span>`;
		// is this is a select menu then add start and end wrapper and an All option
		if (type === "select") {
			start = `<select id="filter-${columnName}" name="${columnName}" ${multiple}><option value="">${all}</option>`;
			end = `</select>`;
		}
		// If this is a radio button then add an all option
		if (type === "radio") {
			start = `<label><input name="${columnName}" type="radio" value="" checked>${all}</label>`;
		}
		// add select options, radio buttons, or checkboxes from options
		const html = `${mainLabel}${start}${this.options
			.map((option) => {
				if (type === "select") return `<option value="${option}">${option}</option>`;
				if (type === "radio" || type === "checkbox") return `<label><input type="${type}" name="${columnName}" value="${option}" />${option}</label>`;
				return "";
			})
			.join("")}${end}`;

		// Add to inner HTML
		this.innerHTML = `${html}`;
	}
}

customElements.define("action-table-filter-menu", ActionTableFilterMenu);
