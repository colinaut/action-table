export type ColsArray = string[];

export type SingleFilterObject = {
	values: string[];
	exclusive?: boolean;
	regex?: boolean;
};

export type FiltersObject = {
	[key: string]: SingleFilterObject;
};

export type ActionCell = HTMLTableCellElement & {
	actionTable: {
		col: string;
		sort: string;
		filter: string;
		checked?: boolean;
	};
};

export type ActionRow = HTMLTableRowElement & {
	hideRow: boolean;
};

export type PaginationProps = { page?: number; pagination?: number; rowsShown?: number };

export type ActionTableEventDetail = {
	page?: number;
	pagination?: number;
	numberOfPages?: number;
	rowsVisible?: number;
};

export type ActionTableSortStore = { sort: string; direction: "ascending" | "descending" };

export type UpdateContentDetail = { sort?: string; filter?: string } | string;
