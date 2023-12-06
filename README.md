# Action Table Web Component

Native HTML web component for adding sort functionality and filtering to html tables. This component does not use the Shadow DOM. Instead it includes a custom css stylesheet you can use, which you can override or customize.

Check out the [Demo Page](https://colinaut.github.io/action-table/)

## Action Table

To use the `<action-table>` component you must wrap it around a table. The table must include both a thead and a tbody for the main sortable rows. The component will automatically make the table sortable based on these header cells, using the innerText of the "thead th" as the column name. If for some reason you do not want a column to be sortable then add `data-sortable="false"` to the th.

The column names are important if you are using the filter function. If the header cell contains a SVG rather than text then it will use the SVG title attribute. If you want to supply a different column name you can add a `data-col` attribute to the th.

Sorting is done alphanumerically based on either:

* Normal text using the innerText of the td.
* Numbers, as long as the cell contains only numbers.
* SVGs using the SVG title attribute.
* Checkboxes based on checked status.
* You can override any of the above by adding a value to a `data-sort` attribute on the td.

The data-sort attribute is useful for time-based sorting as you can add the a unix timestamp. Another use would be having a cell list list the full name but have it sort by last name.

### Accessibility Optimizations

When initialized, for accessibility action-table wraps the innerHTML in a button with aria-roledescription="sort button". When sorting it adds aria-sort the th with the sort direction. It also adds "sorted" class to the td when a column is sorted.

## Action Table Switch

The `<action-table-switch>` element is an optional element used to add toggle checkbox switches to the table. The action-table.css file includes "star" and "switch" classes for easy styling. On it's own it's not much different then just manually adding a checkbox to the table using the same styles. I've included it as a basic element for strapping functionality onto as I assume you'll want to do something when people click it. It fires off a `action-table-switch` custom event containing the checked status and contents of any `data-id` attribute. You can also of extend the ActionTableSwitch class and replace the sendEvent() function with your own.

```
<action-table-switch class="star"></action-table-switch>
```

Attributes:

* checked - Indicates checked status
* label - Sets the aria-label for the input. Defaults to "switch". It's recommended that you make it more explicit for accessibility purposes.

## Action Table Filters

The `<action-table-filters>` is a wrapper element for filter menus and switches. In order for it to work it must live inside the `<action-table>` element. You can add your own filters manually using select menus, checkboxes, or radio buttons. There are two special elements which does some the work for you: `<action-table-filters-menu>` and `<action-table-filter-switch>`.

### Action Table Filter Menu

This custom element automatically finds all unique values in the cells of the specified column and creates a select menu with those options. You can also have columns where cells can contain multiple options, by including those options in span tags.

```
<action-table-filter-menu col="Column Name"></action-table-filter-menu>
```

Attributes:

* col - the name of the column to filter
* label - the label to display. Defaults to the column name
* options - (optional) to override the generated menu add a list of options as a comma delimited string.

### Action Table Filter Switch

This custom element is used primarily for filtering columns that contain checkbox switches. When selected it will show just rows where the checkbox is checked. It can be easily styled using the styles provided by action-table.css using the "switch" or "star" class.

```
<action-table-filter-switch col="Column Name"></action-table-filter-switch>
```

Attributes:

* col - the name of the column to filter
* label - the label to display. Defaults to the column name
* filter - (optional) defaults to "checked"; if you want to use it for a normal text based cell then change to to whatever text you want it to filter.

### Action Table Filter Reset

Just add a `<button type="reset">Reset</button>` and it will trigger a reset for all filters.

### Manually making your own filters

Any select menu, checkbox group or radio button group can be created and the `<action-table-filters>` will make it active. The select or input element must be named the same as the column name it is filtering. The values are what it is filtering. Any select option, checkbox, or radio button where value="" will reset the filter. Checkboxes can be styled with "switch" or "star" by adding the class to a wrapping element.

Filtering is handled with regex.test(cellContent) where regex is based on RegExp(value, "i"). Thus if you want to get fancy with your filtering you can use regex for your filter value. This is useful for say filtering [number ranges with regex](https://www.regex-range.com/).

## Roadmap

- [x] **Improve A11y** - The accessibility of this needs work. Some more proper aria attributes and ideally keyboard navigation. Review [Adrian Roselli: Sorting Table Columns](https://adrianroselli.com/2021/04/sortable-table-columns.html)
  - [x] Fix focus outline for stars
  - [x] Add aria-sort
  - [x] Make table header sort actual buttons with aria-roledescription="sort button"
  - [x] Add class to td for sorted column for highlighting
  - [ ] Review all the filter menus and switches to see that they work properly
- [ ] **Responsive Design** - add ability to make the table responsive. Ideally css only, but js if I must.
  - [ ] Add shadow on side that is off screen see [Adrian Roselli: Under Engineered Responsive Tables](https://adrianroselli.com/2020/11/under-engineered-responsive-tables.html)
- [ ] **LocalStorage save state** — add saving to local storage for sorting and filtering settings.
- [ ] **Date Handling** - automatic handing for sorting dates and times and filtering date ranges.