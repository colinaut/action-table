export type ColsArray = string[];

export type SingleFilterObject = {
	values: string[];
	exclusive?: boolean;
};

export type FiltersObject = {
	[key: string]: SingleFilterObject;
};

export type ActionCell = HTMLTableCellElement & {
	actionTable: {
		col: string;
		sort: string;
		filter: string;
	};
};

export type ActionRow = HTMLTableRowElement & {
	hideRow: boolean;
};

export type PaginationProps = { page?: number; pagination?: number; rowsShown?: number };
