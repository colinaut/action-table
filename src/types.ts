export type ColsArray = { name: string; order?: string[] }[];

export type SingleFilterObject = {
	values: string[];
	exclusive?: boolean;
	regex?: boolean;
	exact?: boolean;
	range?: boolean;
	cols?: string[];
};

export type FiltersObject = {
	[key: string]: SingleFilterObject;
};

export type ActionTableCellData = {
	sort: string;
	filter: string;
};

export type PaginationProps = { page?: number; pagination?: number; rowsShown?: number };

export type ActionTableEventDetail = {
	page?: number;
	pagination?: number;
	numberOfPages?: number;
	rowsVisible?: number;
};

// export type ActionTableSortStore = { sort: string; direction: "ascending" | "descending" };

export type UpdateContentDetail = { sort?: string; filter?: string } | string;

export type Direction = "ascending" | "descending";

export type ActionTableStore = {
	filters?: FiltersObject;
	sort?: string;
	direction?: Direction;
};
