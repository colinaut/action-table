import type { ActionCell } from "./types";
import type { ActionTable } from "./action-table";
export class ActionTableFilterRange extends HTMLElement {
	// private shadow: ShadowRoot;
	constructor() {
		super();
		// this.shadow = this.attachShadow({ mode: "open" });
		this.render();
		this.addEventListeners();
	}

	get name() {
		return this.getAttribute("name") || "";
	}

	private min = 0;
	private rangeTotal = 0;

	addEventListeners() {
		this.addEventListener("input", (e) => {
			const inputs = this.querySelectorAll("input");
			const output = this.querySelector("output");
			const [min, max] = Array.from(inputs).map((input) => Number(input.value));
			const minStr = min.toString();
			const maxStr = max.toString();
			// set content of outputs
			if (output instanceof HTMLOutputElement) {
				output.textContent = `${minStr}-${maxStr}`;
			}
			// set side margin of color
			const rangeColor = this.querySelector(".range-slider-highlight");
			if (rangeColor instanceof HTMLSpanElement) {
				// margin left is percentage of range based on total range distance of current value and min
				rangeColor.style.marginLeft = `${((min - this.min) / this.rangeTotal) * 100}%`;
				rangeColor.style.width = `${((max - min) / this.rangeTotal) * 100}%`;
			}
			// reset input values if goes out of range
			if (min > max) {
				// stop propagation so that it doesn't trigger the action-table-filter event
				e.stopPropagation();
				inputs[0].value = maxStr;
				inputs[1].value = minStr;
			}
		});
	}

	findMinMax(): number[] {
		const min = this.getAttribute("min");
		const max = this.getAttribute("max");
		if (min && max) {
			return [Number(min), Number(max)];
		}
		const actionTable = this.closest("action-table") as ActionTable;
		// 3. Get cols and tbody from actionTable
		const cols = actionTable.cols;
		const tbody = actionTable.tbody;

		// 4. Find column index based on column name in header data-col attribute; if not found, return
		const columnIndex = cols.findIndex((col) => col.name === this.name.toLowerCase());
		if (columnIndex === -1) {
			return [0, 0];
		}

		// 6. Get all cells in column
		const columnTDs = `td:nth-child(${columnIndex + 1})`;
		const cells = tbody.querySelectorAll(columnTDs) as NodeListOf<ActionCell>;

		return Array.from(cells).reduce((total: number[], current) => {
			const num = Number(current.actionTable.filter);
			let min = total.length === 2 ? total[0] : num;
			let max = total.length === 2 ? total[1] : num;
			min = min < num ? min : num;
			max = max > num ? max : num;
			return [min, max];
		}, []);
	}

	render() {
		const [min, max] = this.findMinMax();

		const minStr = min.toString();
		const maxStr = max.toString();
		this.rangeTotal = max - min;
		this.min = min;
		const label = this.getAttribute("label") || this.name;
		const labelDiv = document.createElement("div");
		labelDiv.textContent = label;
		const group = document.createElement("div");
		group.classList.add("range-slider-group");

		// TODO: make this variable so number of steps can be adjusted with attribute?
		// Each step is rounded to the nearest power of ten ( 10, 100, 1000, etc. )
		const step = Math.pow(10, Math.round(Math.log10(this.rangeTotal))) / 10;

		// Helper function
		function setAttributes(element: Element, attributes: Record<string, string>) {
			for (const key in attributes) {
				element.setAttribute(key, attributes[key]);
			}
		}

		// make array of values starting with the min and ending with the max with the steps in between
		const values = [min];
		for (let i = min + step; i <= max; i += step) {
			values.push(Math.round(i / step) * step);
		}
		if (!values.includes(max)) values.push(max);

		// Add svg ticks
		const svgTicks = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		setAttributes(svgTicks, {
			role: "presentation",
			width: "100%",
			height: "5",
		});
		const gaps = 100 / (values.length - 1);

		for (let i = 1; i < values.length - 1; i++) {
			const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			const gap = `${i * gaps}%`;
			setAttributes(line, {
				x1: gap,
				x2: gap,
				y1: "0",
				y2: "5",
				stroke: "currentColor",
				"stroke-width": "1",
			});
			svgTicks.append(line);
		}

		const slideHighlight = document.createElement("span");
		slideHighlight.classList.add("range-slider-highlight");
		group.append(svgTicks, slideHighlight);

		// Add input ranges
		for (let i = 0; i <= 1; i++) {
			const input = document.createElement("input");
			setAttributes(input, {
				type: "range",
				name: this.name,
				min: minStr,
				max: maxStr,
				"data-range": i === 0 ? "min" : "max",
				"aria-label": i === 0 ? "Min" : "Max",
				value: i === 0 ? minStr : maxStr,
			});
			group.append(input);
		}

		// add output
		const output = document.createElement("output");
		output.innerHTML = `${min}&ndash;${max}`;
		this.append(labelDiv, group, output);
	}
}

customElements.define("action-table-filter-range", ActionTableFilterRange);
