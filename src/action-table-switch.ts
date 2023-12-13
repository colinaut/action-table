export class ActionTableSwitch extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes(): string[] {
		return ["checked", "label", "name", "value"];
	}

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

	private sendEvent() {
		const detail = { checked: this.checked, id: this.id || this.dataset.id, name: this.name };
		this.dispatchEvent(new CustomEvent("action-table-switch", { detail, bubbles: true }));
	}

	private addEventListeners() {
		const input = this.querySelector("input") as HTMLInputElement;
		input.addEventListener("change", () => {
			this.checked = input.checked;
		});
		this.sendEvent();
	}

	public connectedCallback(): void {
		this.render();
		this.addEventListeners();
	}

	private render(): void {
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.name = this.name;
		checkbox.value = this.value;
		checkbox.checked = this.checked;
		checkbox.setAttribute("aria-label", this.label);
		this.append(checkbox);
	}
}

customElements.define("action-table-switch", ActionTableSwitch);
