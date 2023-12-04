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
					// console.log("🚀 ~ file: main.ts:200 ~ ActionTableFilter ~ this.shadow.addEventListener ~ detail:", detail);
				}
			}
		});
	}

	public resetFilter() {
		console.log(`reset filter ${this.col}`);
		const select = this.shadowRoot?.querySelector("select");
		if (select) {
			select.value = "";
		}
		const detail = { col: this.col, value: "" };
		this.dispatchEvent(new CustomEvent("action-table-filter", { detail, bubbles: true }));
	}

	public connectedCallback(): void {
		this.render();

		this.addEventListeners();
	}

	private render(): void {
		const html = `<label part="label"><slot>Sort by</slot></label><select part="select" name="filter-${this.col}" data-col="${
			this.col
		}"><option value="">All</option>${this.options.split(",").map((option) => `<option value="${option}">${option}</option>`)}</select>`;
		const css = `<style></style>`;

		this.shadow.innerHTML = `${css}${html}`;
	}
}

export class ActionTableFilterReset extends HTMLElement {
	private shadow: ShadowRoot;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
	}

	public connectedCallback(): void {
		this.render();
		this.addEventListeners();
	}

	private render(): void {
		const html = `<button part="reset-button"><slot>Reset Filters</slot></button>`;

		this.shadow.innerHTML = `${html}`;
	}

	private addEventListeners(): void {
		// Add event listener that detects changes in the select element
		this.shadow.addEventListener("click", () => {
			this.dispatchEvent(new CustomEvent("action-table-filter-reset", { bubbles: true }));
		});
	}
}

export class ActionTableFilterSwitch extends HTMLElement {
	private shadow: ShadowRoot;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
	}

	static get observedAttributes(): string[] {
		return ["col", "filter"];
	}

	get col(): string {
		return this.getAttribute("col")?.trim().toLowerCase() || "";
	}

	get filter(): string {
		return this.getAttribute("filter")?.trim().toLowerCase() || "";
	}

	public connectedCallback(): void {
		this.render();
		this.addEventListeners();
	}

	private render(): void {
		const css = `<style>
        input {
            appearance: none;
            position: relative;
            display: inline-block;
            background: lightgrey;
            height: 1.4em;
            width: 2.75em;
            vertical-align: middle;
            border-radius: 2em;
            box-shadow: 0px 1px 3px #0003 inset;
            transition: 0.25s linear background;
          }
          input::before {
            content: "";
            display: block;
            width: 1em;
            height: 1em;
            background: #fff;
            border-radius: 1em;
            position: absolute;
            top: 0.2em;
            left: 0.2em;
            box-shadow: 0px 1px 3px #0003;
            transition: 0.25s linear transform;
            transform: translateX(0rem);
          }
          :checked {
            background: green;
          }
          :checked::before {
            transform: translateX(1rem);
          }
          input:focus {
            outline: transparent;
          }
          input:focus-visible {
            outline: 2px solid dodgerblue;
            outline-offset: 2px;
          }
          </style>`;
		const html = `<label>
        <input type="checkbox" />
        <slot>Show Only ${this.filter} for ${this.col}</slot>
      </label>`;

		this.shadow.innerHTML = `${css}${html}`;
	}

	private addEventListeners(): void {
		// Add event listener that detects changes in the select element
		this.shadow.addEventListener("click", () => {
			this.dispatchEvent(new CustomEvent("action-table-filter-reset", { bubbles: true }));
		});
	}
}

customElements.define("action-table-filter-menu", ActionTableFilterMenu);
customElements.define("action-table-filter-switch", ActionTableFilterSwitch);
customElements.define("action-table-filter-reset", ActionTableFilterReset);
