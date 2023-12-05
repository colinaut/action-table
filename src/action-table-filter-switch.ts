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
        :host {
            --action-table-filter-switch-focus dodgerblue;
            --action-table-filter-switch-unchecked: lightgray;
            --action-table-filter-switch-checked: green;
        }
        label {
            display: inline-flex;
            align-items: center;
        }
        input {
            appearance: none;
            position: relative;
            display: inline-block;
            background: var(--action-table-filter-switch-unchecked);
            cursor: pointer;
            height: 1.4em;
            width: 2.75em;
            vertical-align: middle;
            border-radius: 2em;
            box-shadow: 0px 1px 3px #0003 inset;
            transition: 0.25s linear background;
            margin-inline-end: 0.5em;
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
            background: var(--action-table-filter-switch-checked);
          }
          :checked::before {
            transform: translateX(1rem);
          }
          input:focus {
            outline: transparent;
          }
          input:focus-visible {
            outline: 2px solid var(--action-table-filter-switch-focus);
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
		this.shadow.addEventListener("click", (event) => {
			const target = event.target as HTMLInputElement;
			let value = target.checked ? this.filter : "";
			let detail = { col: this.col, value };
			this.dispatchEvent(new CustomEvent("action-table-filter", { detail, bubbles: true }));
		});
	}

	public resetFilter() {
		const input = this.shadow.querySelector("input");
		if (input) {
			input.checked = false;
		}
	}
}

customElements.define("action-table-filter-switch", ActionTableFilterSwitch);
