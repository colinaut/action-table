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
