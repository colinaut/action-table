# Action Table Web Component

Native web component for adding sort functionality and filtering to html tables.

## Requirements

The action-table component requires that a table with thead and a tbody element be included in the slot. The thead header cells must use `th`. Column names are based on either `data-col` attribute on the th, a title attribute on the first child element (useful for svgs), or the text content of the cell.

Sorting is done alphanumerically based on either a `data-sort` attribute or on the td or the text content of the cell. The data-sort attribute is included as it makes custom sorting easier. For example:

* For date sorting add the date as a unix timestamp in data-sort.
* Sort by last name instead of first name by adding the last name in data-sort.

## Roadmap

### LocalStorage save

Add saving to local storage for sorting and filtering settings.

### Filter Component

This will be a separate component for filtering the rows. Proposed component will be a fully rendered without a slot. It can render either as a switch or a select menu. Props will be `label` for the optional header, `col` for the targeted column, `options` for the options, and `switch` to display it as a switch. Switch components can only have two options.

When triggered the component will pass the selected option to the parent action-table component as a custom event detail. The action-component will then filter the table hiding rows which contain the string in the selected col.

```
<action-table-filter label="Day of the Week" col="date" options="monday,wednesday,tuesday,thursday,friday"></action-table-filter>
```
Action table reset creates a reset button to remove all filters
```
<action-table-reset></action-table-reset>
```

### Advanced Filter Component

Filter component should be able to pass a custom function rather than just a simple word to check for. I may need this.

### Optional Base CSS stylesheet

Create a custom stylesheet that can be optionally used.