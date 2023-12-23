import type { ActionTable } from "./action-table";
import { PaginationProps } from "./types";
export class ActionTablePagination extends HTMLElement {
	constructor() {
		super();
		this.addEventListeners();
	}

	private buttonGroup = 1;
	public page = 1;
	public pagination = 0;
	public rowsShown = 0;
	private maxButtonGroups = 1;

	public connectedCallback(): void {
		const actionTable = this.closest("action-table") as ActionTable;
		this.pagination = actionTable.pagination;
		this.page = actionTable.page;
		this.rowsShown = actionTable.rowsShown;
		this.render();
	}

	get maxButtons(): number {
		return Number(this.getAttribute("max-buttons")) || 10;
	}

	public setProps(props: PaginationProps) {
		const { page, rowsShown } = props;
		console.log("setProps", { page, rowsShown });

		let triggerRender = false;
		if (page !== undefined && page !== this.page) {
			this.page = page;
			triggerRender = true;
		}
		if (rowsShown !== undefined && rowsShown !== this.rowsShown) {
			this.rowsShown = rowsShown;
			triggerRender = true;
		}

		if (triggerRender) {
			this.render();
		}
	}

	// TODO: clean this up
	public render() {
		const { page, pagination, rowsShown } = this;
		console.log("rendering pagination", { page, pagination, rowsShown });

		// temporarily local variables
		const maxButtons = this.maxButtons;
		const numberOfButtons = Math.ceil(rowsShown / pagination);
		const maxButtonGroups = Math.ceil(numberOfButtons / maxButtons); // reassign to this at end of render
		let buttonGroup = this.buttonGroup; // reassign to this at end of render

		if (buttonGroup > maxButtonGroups) {
			buttonGroup = maxButtonGroups;
		} else if (buttonGroup < 1) {
			buttonGroup = 1;
		}

		const startIndex = (buttonGroup - 1) * maxButtons + 1;

		/* -------------------------------------------------------------------------- */
		/*                             Render the buttons                             */
		/* -------------------------------------------------------------------------- */

		/* ----------------------------- Button strings ----------------------------- */
		const buttonStart = `<button type="button" class="`;

		function pageButton(i: number, className: string = ""): string {
			return `${buttonStart}${page === i ? `active ${className}` : `${className}`}" data-page="${i}">${i}</button>`;
		}

		function paginationButton(className: string, title: number): string {
			return `${buttonStart}${className}" title="${title}">...</button>`;
		}

		/* -------------------------- Start making buttons -------------------------- */

		let paginatedButtons = "";

		if (buttonGroup > 1) {
			paginatedButtons += `${pageButton(1, "first")}${paginationButton("prev", startIndex - 1)}`;
		}

		if (rowsShown > 0) {
			// for looping through the number of pages
			for (let i = startIndex; i <= numberOfButtons; i++) {
				// code to handle each page
				paginatedButtons += pageButton(i);
				if (i !== numberOfButtons && i >= maxButtons * buttonGroup) {
					paginatedButtons += `${paginationButton("next", i + 1)}${pageButton(numberOfButtons, "last")}`;
					break;
				}
			}
		}

		this.innerHTML = `<span class="pagination-title">Pagination:</span> ${paginatedButtons}`;

		// assign temporary variables back to this
		this.buttonGroup = buttonGroup;
		this.maxButtonGroups = maxButtonGroups;
	}

	private addEventListeners(): void {
		this.addEventListener("click", (event) => {
			const target = event.target as HTMLInputElement;

			if (target.tagName.toLowerCase() === "button") {
				// temp variable
				// must trigger action-table page change if it changes
				let page = this.page;

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
				// TODO: simplify this
				// temp variable
				// Must rerender if the buttonGroup changes
				let buttonGroup = this.buttonGroup;
				if (target.classList.contains("next")) {
					page = buttonGroup * this.maxButtons + 1;
					buttonGroup++;
				}
				if (target.classList.contains("prev")) {
					buttonGroup--;
					page = buttonGroup * this.maxButtons;
				}
				if (target.classList.contains("first")) {
					buttonGroup = 1;
				}
				if (target.classList.contains("last")) {
					buttonGroup = this.maxButtonGroups;
				}
				if (this.page !== page) {
					this.page = page;
					const actionTable = this.closest("action-table") as ActionTable;
					actionTable.page = this.page;
				}
				if (this.buttonGroup !== buttonGroup) {
					this.buttonGroup = buttonGroup;
					this.render();
				}
			}
		});
	}
}

customElements.define("action-table-pagination", ActionTablePagination);
