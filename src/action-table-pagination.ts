import type { ActionTable } from "./action-table";
import "./action-table-pagination-options";

export class ActionTablePagination extends HTMLElement {
	constructor() {
		super();
		this.addEventListeners();
	}

	private page = 1;
	private numberOfPages = 1;
	private group = 1;
	private maxGroups = 1;
	private actionTable = this.closest("action-table") as ActionTable;

	public connectedCallback(): void {
		this.render();
	}

	public render() {
		console.log("render pagination");

		const { page, numberOfPages } = this.actionTable;
		// reassign number of pages based on this.actionTable
		this.numberOfPages = numberOfPages;
		this.page = page;
		// temporarily local variables
		const maxButtons = Number(this.getAttribute("max-buttons")) || 10;
		const maxGroups = Math.ceil(numberOfPages / maxButtons); // reassign to this at end of render
		let group = this.group; // reassign to this at end of render

		if (group > maxGroups) {
			group = maxGroups;
		} else if (group < 1) {
			group = 1;
		}

		const startIndex = (group - 1) * maxButtons + 1;

		/* -------------------------------------------------------------------------- */
		/*                             Render the buttons                             */
		/* -------------------------------------------------------------------------- */

		/* ----------------------------- Button strings ----------------------------- */
		function pageButton(i: number, className: string = "", text?: string): string {
			return `<button type="button" class="${page === i ? `active ${className}` : `${className}`}" data-page="${i}" title="${className}">${text || i}</button>`;
		}

		/* -------------------------- Start making buttons -------------------------- */

		let paginatedButtons = "";

		if (group > 1) {
			paginatedButtons += `${pageButton(1, "first")}${pageButton(startIndex - 1, "prev", "...")}`;
		}

		if (numberOfPages > 0) {
			// for looping through the number of pages
			for (let i = startIndex; i <= numberOfPages; i++) {
				// code to handle each page
				paginatedButtons += pageButton(i);
				if (i !== numberOfPages && i >= maxButtons * group) {
					paginatedButtons += `${pageButton(i + 1, "next", "...")}${pageButton(numberOfPages, "last")}`;
					break;
				}
			}
		}

		const classAttr = (suffix: string) => ` class="pagination-${suffix}"`;

		this.innerHTML = `<span${classAttr("label")}></span> <span${classAttr("buttons")}>${paginatedButtons}</span>`;
		this.changeLabel(page);

		// assign temporary variables back to this
		this.group = group;
		this.maxGroups = maxGroups;
	}

	private changeLabel(page: number) {
		const { pagination, rowsVisible } = this.actionTable;

		const label = this.getAttribute("label") || "Showing {rows} of {total}:";

		const labelStr = label.replace("{rows}", `${page * pagination - pagination + 1}&ndash;${page * pagination}`).replace("{total}", `${rowsVisible}`);

		const labelSpan = this.querySelector("span.pagination-label");
		if (labelSpan) labelSpan.innerHTML = labelStr;
	}

	private addEventListeners(): void {
		this.addEventListener("click", (event) => {
			const target = event.target;
			if (target instanceof HTMLButtonElement) {
				// temp variable
				// must trigger action-table page change if it changes
				let page: number = 1;

				if (target.dataset.page) {
					// set the current page before setting the current page on the action table so that it doesn't rerender when setProps is returned
					page = Number(target.dataset.page);

					target.classList.add("active");
					this.querySelectorAll("button").forEach((button) => {
						if (button !== target) {
							button.classList.remove("active");
						}
					});
				}
				// temp variables
				// Must rerender if the group changes
				let group = this.group;

				const hasClass = (className: string) => {
					return target.classList.contains(className);
				};
				if (hasClass("next")) {
					group++;
				}
				if (hasClass("prev")) {
					group--;
				}
				if (hasClass("first")) {
					group = 1;
				}
				if (hasClass("last")) {
					group = this.maxGroups;
				}

				this.actionTable.page = this.page = page;
				this.changeLabel(page);

				if (this.group !== group) {
					this.group = group;
					this.render();
				}
				// }
			}
		});

		this.actionTable.addEventListener("action-table", (e) => {
			const { page, pagination, numberOfPages } = e.detail;
			console.log("action-table pagination", e.detail);
			if ((page && page !== this.page) || (numberOfPages !== undefined && numberOfPages !== this.numberOfPages) || pagination !== undefined) {
				console.log("action-table pagination render", page, this.page, pagination, numberOfPages, this.numberOfPages);
				this.render();
			}
		});
	}
}

customElements.define("action-table-pagination", ActionTablePagination);
