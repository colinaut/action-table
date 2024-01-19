import type { ActionTable } from "./action-table";

export class ActionTablePaginationOptions extends HTMLElement {
	constructor() {
		super();
		const actionTable = this.closest("action-table") as ActionTable;
		const { pagination } = actionTable;
		const paginationOptions = (options: number[]) => options.map((opt) => `<option ${pagination === opt ? `selected` : ``}>${opt}</option>`).join("");

		const paginationSelect =
			this.options.length > 0
				? `<label class="pagination-select"><span>${this.getAttribute("label") || "Rows per:"}</span> <select>${paginationOptions(this.options)}</select></label>`
				: "";

		this.innerHTML = paginationSelect;
		this.addEventListener("change", (e) => {
			if (e.target instanceof HTMLSelectElement) {
				const value = Number(e.target.value);
				if (!isNaN(value)) {
					actionTable.pagination = value;
				}
			}
		});
	}

	get options(): number[] {
		const options = this.getAttribute("options");
		if (options) {
			const paginationArray = options
				.split(",")
				.map((item) => Number(item))
				.filter((p) => !isNaN(p));
			if (paginationArray.length > 0) {
				return paginationArray;
			}
		}
		return [];
	}
}

customElements.define("action-table-pagination-options", ActionTablePaginationOptions);
