class RandomNumberComponent extends HTMLElement {
	private randomNumber: number;

	constructor() {
		super();
		const shadow = this.attachShadow({ mode: "open" });
		this.randomNumber = Math.floor(Math.random() * 10) + 1;
		shadow.innerHTML = `${this.randomNumber}`;
		this.dispatch(this.randomNumber.toString());

		// click event that rerandomizes the number
		this.addEventListener("click", () => {
			this.randomNumber = Math.floor(Math.random() * 10) + 1;
			shadow.innerHTML = `${this.randomNumber}`;
			this.dispatch(this.randomNumber.toString());
		});
	}

	private dispatch(detail: { sort: string; filter: string } | string) {
		// console.log("dispatch", detail);
		const event = new CustomEvent<{ sort: string; filter: string } | string>("action-table-update", {
			detail,
			bubbles: true,
		});
		this.dispatchEvent(event);
	}
}

customElements.define("random-number", RandomNumberComponent);
