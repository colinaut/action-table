# Action Table Web Component

Native web component for adding sort functionality and filtering to html tables.

## Requirements

The action-table component requires that wrap around a table with headers in thead with th and a tbody element. Column names are based on either `data-col` attribute on the th or the innerText content of the th.

Sorting is done alphanumerically based on either a `data-sort` attribute on the td, the text content of the cell or a title if it's a svg, The data-sort attribute is included as it makes custom sorting easier. For example:

* For date sorting add the date as a unix timestamp in data-sort.
* Sort by last name instead of first name by adding the last name in data-sort.

## Filters

The action-table-filters is a wrapper element that activates any interal select or checkboxs os radio buttons. There are two special elements: action-table-filters-menu and action-table-filter-switch.

action-table-filters-menu automatically grabs all values from the column specified to create an options list of unique values. Column cells can have multiple options by wrapping them in spans.

action-table-filter-switch is designed to pair with a column containing the action-table-switch. It filters to show only checked items.

Filtering is handled with regex.test(cellContent) where regex is the filter value. Thus if you want to get fancy with your filtering you can use regex.

## Switch

The action-table-switch element is a simple checkbox element for the body of the table. There are two styles that are part of the stylesheet switch and star

## Roadmap

### LocalStorage save

Add saving to local storage for sorting and filtering settings.

### Optional Base CSS stylesheet

Finish Base CSS stylesheet

- [x] Create swtich style for switch element
- [x] Create star style for switch element
- [ ] Improve filters wrapper element styles
- [ ] Improve action-table style