export class ActionTableSwitch extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes(): string[] {
		return ["checked", "label"];
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
		return this.getAttribute("label") || this.getAttribute("class") || "";
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
		this.innerHTML = `<label><input type="checkbox" ${this.checked ? "checked" : ""}><span class="sr-only">${this.label}</span></label>`;
	}
}

customElements.define("action-table-switch", ActionTableSwitch);
