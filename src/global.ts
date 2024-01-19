import { ActionTableEventDetail, FiltersObject } from "./types";
declare global {
	interface GlobalEventHandlersEventMap {
		"action-table": CustomEvent<ActionTableEventDetail>;
		"action-table-filter": CustomEvent<FiltersObject | undefined>;
		"action-table-update": CustomEvent<{ sort: string; filter: string } | string>;
	}
}

export {};
