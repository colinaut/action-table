export type ColsArray = string[];

export type SingleFilterObject = {
	values: string[];
	exclusive?: boolean;
};

export type FiltersObject = {
	[key: string]: SingleFilterObject;
};
