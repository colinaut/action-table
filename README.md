# Action Table Web Component

Native HTML web component for adding sort functionality and filtering to html tables. This component does not use the Shadow DOM. Instead it includes a custom css stylesheet you can use, which you can override or customize.

Check out the [Demo Page](https://colinaut.github.io/action-table/)

## Action Table

To use the `<action-table>` component you must wrap it around a table. The table must include both a thead and a tbody for the main sortable rows. Action Table does not work where columns span more than one column.

The component will automatically make the table sortable based on these header cells, using the innerText of the "thead th" as the column name. If for some reason you do not want a column to be sortable then add `no-sort` attribute to the th.

The column names are important if you are using the filter function. If the header cell contains a SVG rather than text then it will use the SVG title attribute. If you want to supply a different column name you can add a `data-col` attribute to the th.

**Accessibility Optimizations**

When initialized, for accessibility action-table wraps the innerHTML in a button. When sorting it adds aria-sort the th with the sort direction. It also adds "sorted" class to the td when a column is sorted.

**Attributes:**

* sort: name of the default column to sort by
* direction: set the direction "ascending" or "descending" (defaults to ascending)
* store: add the store attribute to have action-table store the sort and filters in localStorage so that it retains the state on reload. LocalStorage will override initial attributes.
* urlparams: add the urlparams attribute to have the action-table grab sort and filters from url params on load. URL params will override sort and direction attributes, and localStorage.

### Sorting
Sorting is done alphanumerically based on either:

* Alphanumerically/Numerically — cell that starts with a number is sorted numerically, otherwise sorted as text
* SVGs using the SVG title attribute.
* Checkboxes based on checked status.
* You can override any of the above by adding a value to a `data-sort` attribute on the td.

The data-sort attribute is useful for time-based sorting as you can add the a unix timestamp. Another use would be having a cell list list the full name but have it sort by last name.

### Filtering
Filtering is done via the public filterTable() method. You can trigger this with javascript or better just use the action-table-filters element to set up controls. If the filter hides all results, the table automatically show a message indicating "No Results" along with a button to reset the filters. If on load all results are filtered out then it will automatically reset the filters. This protects against odd filter conditions in localStorage or URLparams.

## Action Table Switch

The `<action-table-switch>` element is an optional element used to add toggle checkbox switches to the table. The action-table.css file includes "star" and "switch" classes for easy styling. On it's own it's not much different then just manually adding a checkbox to the table using the same styles. I've included it as a basic element for strapping functionality onto as I assume you'll want to do something when people click it. It fires off a `action-table-switch` custom event containing the checked status and contents of any `data-id` attribute. You can also of extend the ActionTableSwitch class and replace the sendEvent() function with your own.

```
<action-table-switch class="star"></action-table-switch>
```

**Attributes:**

* checked - Indicates checked status
* label - Sets the aria-label for the input. Defaults to "switch". It's recommended that you make it more explicit for accessibility purposes.

## Action Table Filters

The `<action-table-filters>` is a wrapper element for filter menus and switches. In order for it to work it must live inside the `<action-table>` element. You can add your own filters manually using select menus, checkboxes, or radio buttons. There are two special elements which does some the work for you: `<action-table-filters-menu>` and `<action-table-filter-switch>`.

### Action Table Filter Menu

This custom element automatically finds all unique values in the cells of the specified column and creates a menu with those options. You can also have columns where cells can contain multiple values, by including those options in span tags. The menu defaults to a select menu but can be changed to a checkboxes or radio buttons. 

If you want to filter based on values different from then content then add `dataset-filter` attribute with the filter values to the td. This is useful for when you have a cell that displays date and time but you only want to filter by the date.

```
<action-table-filter-menu name="Column Name"></action-table-filter-menu>
```

**Attributes:**

* name - the name of the column to filter. Or search entire table with name "action-table".
* label - the label to display. Defaults to the column name
* options - (optional) to override the generated menu add a list of options as a comma delimited string.
* type - the menu type. Defaults to 'select', can also be 'checkbox' or 'radio'.
* multiple – adds multiple attribute to select menu. This has poor accessibility so it is recommended to use checkboxes instead
* exclusive - only applies to checkboxes and multiple select menus. Add exclusive if you want the multiple selections to be exclusive rather than the default inclusive.

### Action Table Filter Switch

This custom element is used primarily for filtering columns that contain checkbox switches. When selected it will show just rows where the checkbox is checked. It can be easily styled using the styles provided by action-table.css using the "switch" or "star" class.

```
<action-table-filter-switch name="Column Name"></action-table-filter-switch>
```

**Attributes:**

* name - the name of the column to filter
* label - the label to display. Defaults to the column name
* filter - (optional) defaults to "checked"; if you want to use it for a normal text based cell then change to to whatever text you want it to filter.

### Action Table Filter Reset

Just add a `<button type="reset">Reset</button>` and action-table-filters will trigger a reset for all filters on button press.

### Action Table Filter Manual Search Field

Just add `<input type="search name="column name" />` and action-table-filters will listen for input changes and filter the results.

### Searching entire row

If you want to search all columns then use name="action-table" instead of a column name. This works for input, select, radio, or checkboxes. Note you will need to supply your own options if you want to use full row search with action-table-filter-menu.

### Manually making your own filters

Any select menu, checkbox group or radio button group can be created and the `<action-table-filters>` will make it active. The select or input element must be named the same as the column name it is filtering. The values are what it is filtering. Any select option, checkbox, or radio button where value="" will reset the filter. Checkboxes can be styled with "switch" or "star" by adding the class to a wrapping element. Multiple selected checkboxes are inclusive by default unless you add the attribute exclusive on a parent wrapper for the group.

### Advanced Regex Filtering
Filtering is handled with regex.test(cellContent) where regex is based on RegExp(value, "i"). Thus if you want to get fancy with your filtering you can use regex for your filter value. This is useful for say filtering [number ranges with regex](https://www.regex-range.com/).

## Roadmap

- [x] **Improve A11y** - The accessibility of this needs work. Some more proper aria attributes and ideally keyboard navigation. Review [Adrian Roselli: Sorting Table Columns](https://adrianroselli.com/2021/04/sortable-table-columns.html)
  - [x] Fix focus outline for stars
  - [x] Add aria-sort
  - [x] Make table header sort actual buttons
  - [x] Add class to td for sorted column for highlighting
  - [x] Review all the filter menus and switches to see that they work properly
- [x] **Responsive Design** - add ability to make the table responsive. Ideally css only, but js if I must.
  - [x] Add shadow on side that is off screen see [Adrian Roselli: Under Engineered Responsive Tables](https://adrianroselli.com/2020/11/under-engineered-responsive-tables.html)
- [x] **LocalStorage save state** — add saving to local storage for sorting and filtering settings.
- [x] **Url Params** – grab URL parameters for default sorting and filtering
- [x] **No Rows Auto Reset** – some sort of automatic dialog to reset the filters if there are no rows
- [x] **data-filter** — add date-filter attribute to to allow filtering values different from sort values. useful for filtering dates when the cell lists the date and time.
- [x] Redesign action-filter-menu filter element for checkboxes or radio buttons
- [x] Add attribute for inclusive/exclusive selection for checkboxes
- [x] Get select multiple working
- [x] Add input text search with debounce
- [x] Add whole table search
- [x] Refactor to use name instead of col attribute
- [ ] **Date Handling** - automatic handing for sorting dates and times and filtering date ranges