import { FiltersObject } from "./types";
import type { ActionTable } from "./action-table";

/* -------------------------------------------------------------------------- */
/*                           Action Table No Results                          */
/* -------------------------------------------------------------------------- */
/* ---------- Simple HTML element wrapper to allow reset of filters --------- */

export class ActionTableNoResults extends HTMLElement {
	constructor() {
		super();
		const actionTable = this.closest("action-table") as ActionTable;
		const { rowsVisible } = actionTable;
		if (rowsVisible === 0) {
			this.style.display = "";
		} else {
			this.style.display = "none";
		}
		this.addEventListener("click", (e) => {
			// if target is reset button
			if (e.target instanceof HTMLButtonElement && e.target.type === "reset") {
				// reset the filters on the table element
				this.dispatchEvent(
					new CustomEvent<FiltersObject>("action-table-filter", {
						bubbles: true,
					})
				);
				// reset the filters on the action-table-filters
				this.dispatchEvent(new CustomEvent<undefined>("action-table-filters-reset", { bubbles: true }));
			}
		});

		actionTable.addEventListener("action-table", (e) => {
			const detail = e.detail;
			console.log("action-table", detail);

			if (detail?.rowsVisible === 0) {
				this.style.display = "";
			} else {
				this.style.display = "none";
			}
		});
	}

	/* -------------------------------------------------------------------------- */
	/*                              Private Methods                              */
	/* -------------------------------------------------------------------------- */

	/* ----------------- Send Event Triggered by checkbox change ---------------- */
}

customElements.define("action-table-no-results", ActionTableNoResults);
