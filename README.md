# Action Table Web Component

Native web component for adding sort functionality and filtering to html tables.

## Requirements

The action-table component requires that wrap around a table with headers in thead with th and a tbody element. Column names are based on either `data-col` attribute on the th or the innerText content of the th.

Sorting is done alphanumerically based on either a `data-sort` attribute on the td, the text content of the cell or a title if it's a svg, The data-sort attribute is included as it makes custom sorting easier. For example:

* For date sorting add the date as a unix timestamp in data-sort.
* Sort by last name instead of first name by adding the last name in data-sort.

## Filters

The action-table-filters is a wrapper element that activates any interal select or checkboxs os radio buttont. There are two special element action-table-filters-menu and action-table-filter-switch.

## Roadmap

### LocalStorage save

Add saving to local storage for sorting and filtering settings.

### Optional Base CSS stylesheet

Create a custom stylesheet that can be optionally used.