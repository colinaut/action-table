export class ActionTableSwitch extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes(): string[] {
		return ["checked"];
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

	private sendEvent() {
		const detail = { checked: this.checked };
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
		console.log("switch connected");

		this.render();
		this.addEventListeners();
	}

	private render(): void {
		this.innerHTML = `<label class="switch"><input type="checkbox" ${this.checked ? "checked" : ""}><slot></slot></label>`;
	}
}

customElements.define("action-table-switch", ActionTableSwitch);
