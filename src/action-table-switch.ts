/* -------------------------------------------------------------------------- */
/*                             Action Table Switch                            */
/* -------------------------------------------------------------------------- */
/* ----- Optional element added as an example to be extended by the user ---- */

export class ActionTableSwitch extends HTMLElement {
	constructor() {
		super();
		this.render();
		this.addEventListeners();
	}

	/* -------------------------------------------------------------------------- */
	/*                                 Attributes                                 */
	/* -------------------------------------------------------------------------- */

	get checked(): boolean {
		return this.hasAttribute("checked");
	}
	set checked(value: boolean) {
		if (value) {
			this.setAttribute("checked", "");
		} else {
			this.removeAttribute("checked");
		}
	}
	get label(): string {
		return this.getAttribute("label") || "switch";
	}

	get name(): string {
		return this.getAttribute("name") || "";
	}

	get value(): string {
		return this.getAttribute("value") || "on";
	}

	/* -------------------------------------------------------------------------- */
	/*                               Event Listeners                              */
	/* -------------------------------------------------------------------------- */

	private addEventListeners() {
		const input = this.querySelector("input");
		if (input) {
			input.addEventListener("change", () => {
				this.checked = input.checked;
				this.sendEvent();
			});
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                              Private Methods                              */
	/* -------------------------------------------------------------------------- */

	/* ----------------- Send Event Triggered by checkbox change ---------------- */

	private async sendEvent() {
		const detail = { checked: this.checked, id: this.id || this.dataset.id, name: this.name, value: this.value };
		this.dispatchEvent(new CustomEvent("action-table-switch", { detail, bubbles: true }));
	}

	private render(): void {
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.name = this.name;
		checkbox.value = this.value;
		checkbox.checked = this.checked;
		checkbox.setAttribute("aria-label", this.label);
		this.replaceChildren(checkbox);
	}
}

customElements.define("action-table-switch", ActionTableSwitch);
