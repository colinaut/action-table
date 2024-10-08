# Action Table Web Component

Native HTML web component for adding sort functionality and filtering to HTML tables. This component does not use the Shadow DOM. Instead it includes a custom css stylesheet you can use, which you can override or customize.

Check out the [Demo Page](https://colinaut.github.io/action-table/)

## Installation

### Main files

*  `dist/index.js` the main file installs action-table.js and action-table-filters.js. You can also install the components separately:
   *  `dist/action-table.js` automatic sort headers and public accessible filtering functions
   *  `dist/action-table-filters.js` includes action-table-filters wrapper which adds event listeners for form elements;  also includes the action-table-filter-menu and action-table-filter-switch components.
   *  `dist/action-table-pagination.js` includes action-table-pagination for displaying pagination buttons and action-table-pagination-options for a menu to allow users to adjust the number of rows displayed per page.
*  `dist/action-table-switch.js` optional action-table-switch element. Not installed by default index.js.
*  `dist/action-table.css` optional but recommended stylesheet. You can override the styles or write your own.

### CDN
```
<script type="module" src="https://unpkg.com/@colinaut/action-table/dist/index.js"></script>
<!-- optional: <script type="module" src="https://unpkg.com/@colinaut/action-table/dist/action-table-switch.js"></script> -->
<link rel="stylesheet" href="https://unpkg.com/@colinaut/action-table/dist/action-table.css" />

```

### NPM

```
npm i @colinaut/action-table

pnpm i @colinaut/action-table
```

Then `import "@colinaut/action-table";` into your main script. You may also load the CSS styles or write your own.

### Eleventy static site

If you are using [Eleventy](https://www.11ty.dev), and want to install locally rather than rely on the CDN, you can install via NPM/PNPM and then pass through the JS and CSS files so that it is included in the output. Then you would just need to add it to the head.

```
eleventyConfig.addPassthroughCopy({
    "node_modules/@colinaut/action-table/dist/*.js": "js/action-table",
    "node_modules/@colinaut/action-table/dist/action-table.css": "css",
})
```
```
<script src="/js/action-table/index.js"></script>
<!-- optional: <script src="/js/action-table/action-table-switch.js"></script> -->
<link rel="stylesheet" href="/css/action-table.css" />
```

## Action Table

To use the `<action-table>` component you must wrap it around a HTML table. The table must include both a thead and a tbody for the main sortable rows. Action Table does not work where columns span more than one column.

The component will automatically make the table sortable based on these header cells, using the innerText of the "thead th" as the column name. If for some reason you do not want a column to be sortable then add `no-sort` attribute to the th.

The column names are important if you are using the filter function. If the header cell contains a SVG rather than text then it will use the SVG title attribute. If you want to supply a different column name you can add a `data-col` attribute to the th.

**Accessibility Optimizations**

When initialized, for accessibility action-table wraps the innerHTML in a button. When sorting it adds aria-sort the th with the sort direction. It also adds "sorted" class to the td when a column is sorted.

**Content Editable cells**

You can add `contenteditable` to any td and action-table will recognize this, any changes made by the users will update the table on blur (when the user tabs or clicks away).

**Attributes:**

* sort: Name of the default column to sort by.
* direction: Set the direction "ascending" or "descending". _Defaults to ascending_.
* store: Add the store attribute to have action-table store the sort and filters in localStorage so that it retains the state on reload. localStorage will override initial attributes. String added to the `store` attribute will be the name used for localStorage. _Defaults to 'action-table' if none specified_.
* urlparams: Add the urlparams attribute to have the action-table grab sort and filters from url params on load. URL params will override sort and direction attributes, and localStorage.

### Sorting

Sorting is done based on the cell value: numbers are sorted numerically, machine readable dates are sorted by date, and otherwise sorted as text. By adding the `store` attribute to the action-table it will store the sort and filters in localStorage.

The sort order can also be set with a comma separated list in the `data-order` attribute on the th for the column. For instance, adding this attribute `data-order="Jan,Feb,Mar"` to the th will force the column to sort using that order as long as the cell values match. Non-matching cell values revert to base sort function.

The cell value is determined by:

* if there is a `data-sort` attribute on the td it uses it
* Otherwise it uses td cell textContent
* If there is no `data-sort` or textContent it will read:
  * SVGs using the SVG title attribute
  * Checkboxes based on checked status

### Filtering

Filtering is done via the public filterTable() method. You can trigger this with javascript or better just use the action-table-filters element to set up controls. If the filter hides all results, the table automatically show a message indicating "No Results" along with a button to reset the filters. If on load all results are filtered out then it will automatically reset the filters. By adding the `store` attribute to the action-table it will store the sort and filters in localStorage. This protects against odd filter conditions in localStorage or URLparams.

Filtering is based on the content of the cell much like sorting, except it uses a `data-filter` attribute:

* if there is a `data-filter` attribute on the td it uses it
* Otherwise it uses td cell textContent
* If there is no `data-filter` or textContent it will read:
  * SVGs using the SVG title attribute
  * Checkboxes based on checked status

## Action Table Filters

The `<action-table-filters>` is a wrapper element for filter menus and switches. In order for it to work it must live inside the `<action-table>` element. You can add your own filters manually using select menus, checkboxes, or radio buttons. There are two special elements which does some the work for you: `<action-table-filters-menu>` and `<action-table-filter-switch>`.

### Action Table Filter Menu

The menu defaults to a select menu but can be changed to checkboxes or radio buttons. On load this custom element automatically finds all unique values in the cells of the specified column and creates a menu with those options. You can also have columns where cells contain multiple values by including those options in span tags. If the th for the column includes `data-order` attribute it will use this when ordering the options list. Note, select menus and radio buttons have a minimum of 2 options and checkboxes have a minimum of 1 option (below the minimum it won't render).

If you want to filter based on values different from the content then add `dataset-filter` attribute with the filter values to the td. This is useful for when you want to simplify the menu; for instance, when a cell that displays date and time but you only want to filter by the date.

```
<action-table-filter-menu name="Column Name"></action-table-filter-menu>
```

**Attributes:**

* name: The name of the column to filter; or search entire table with name "action-table".
* label: The label to display. _Defaults to the column name_.
* all: Text used for "All" for first select menu option and first radio button that resets the filter. _Defaults to "All"_.
* options: (Optional) To override the generated menu add a list of options as a comma delimited string. NOTE: If you set the name to "action-table" you must set options manually.
* type: The menu type. _Defaults to 'select', can also be 'checkbox' or 'radio'_.
* multiple: Adds multiple attributes to select menu. This has poor accessibility so it is recommended to use checkboxes instead.
* exclusive: Only applies to checkboxes and multiple select menus. Add exclusive if you want multiple selections to be exclusive rather than the default inclusive.
* regex: This will cause the table filter to use regex for matching (see Regex Filtering below).
* exact: This will only use exact matches instead of includes.
* descending: Reverses the order of the options.

### Action Table Filter Switch

This custom element is used primarily for filtering columns that contain checkbox switches or the optional `action-table-switch` element. Though can also work with normal text based cells if you want a filter switch for a single value. It can be easily styled using the "switch" or "star" class defined in action-table.css styles.

```
<action-table-filter-switch name="Column Name"></action-table-filter-switch>
```

**Attributes:**

* name: The name of the column to filter; or search entire table with name "action-table".
* label: The label to display. _Defaults to the column name_.
* value: (Optional) _defaults to checkbox.checked value of "on"_.

### Action Table Filter Range

Custom dual range slider element for filtering by number ranges. Can only be used for columns that contain numbers only. It will automatically find the minimum and maximum values for the column. You can manually set min and max values by setting min and max attributes. This element relies heavily on the action-table.css styles.

```
<action-table-filter-range name="Column Name"></action-table-filter-range>
```

**Attributes:**

* name: The name of the column to filter.
* label: The label to display. _Defaults to the column name_.
* min: (Optional) manually set min value for ranges.
* max: (Optional) manually set value for ranges.

### Action Table Filter Manual Search Field

Just add `<input type="search name="column name" />` and action-table-filters will listen for input changes and filter the results. This uses "input" event as default but if you prefer blur then add `data-event="blur"` attribute to the input field.

If you want to search every column then use `name="action-table"`. By default this searches every column. You can limit this search by adding the columns to be searched as a comma separated string as such to the search input element. `data-cols="column,column2"`.

### Action Table Filter Reset

Just add a `<button type="reset" disabled>Reset</button>` and action-table-filters will trigger a reset for all filters on button press. The reset button will automatically be enabled/disabled based on whether the table is filtered.

### Regex Filtering

Filtering is handled using includes by default. You can use regex where regex is based on RegExp(value, "i") which allows you to get fancy with your filtering. This is useful for filtering [number ranges with regex](https://www.regex-range.com/).

### Manually making your own filters

Any select menu, checkbox group, or radio button group can be created and the `<action-table-filters>` will make it active.

* The select or input element must be named the same as the column name it is filtering, or named "action-table" if you want it to search entire row.
* The values are the filter values. Any select option, checkbox, or radio button where value="" will reset the filter.
* Checkboxes can be styled with "switch" or "star" by adding the class to a wrapping element.
* Multiple selected checkboxes are inclusive by default unless you add the attribute 'exclusive' on a parent wrapper for the group.
* You can add 'regex' attribute to the element or wrapping element to have it use regex.
* Make your own range inputs using `data-range="min"` or `"data-range=max"`. The action-table-filters will listen for changes.

## Action Table No Results

The `<action-table-no-results>` element is for alerting when the table has no results due to filtering. It is a purely functional element that you supply the content to. It is hidden by default and shows when the table has no results. If you include a reset type button it will trigger the reset.

**Example:**

```
<action-table-no-results>
	<strong><em>No results found</em></strong> <button type="reset">Reset Filters</button>
</action-table-no-results>
```

## Action Table Pagination

To add pagination to any table add the number of visible rows with `pagination="10"` attribute on the action-table element. Then add the `<action-table-pagination></action-table-pagination>` element within the action-table element.

**Attributes:**

* label: String that will be displayed as the pagination title. This attribute is special as it automatically replaces {rows} for the current rows range and {total} for the total rows. _Defaults to "Showing {rows} of {total}:"_

## Action Table Pagination Options

The `<action-table-pagination-options></action-table-pagination-options>` element adds a select menu to allow users to change the number of pagination rows.

**Attributes:**

* options: (Required) comma separated list of numbers for the options menu
* label: Select menu label text. _Defaults to "Rows per:"_

## Action Table Switch

The `<action-table-switch>` element is an optional element used to add toggle checkbox switches to the table. It is not added in the default index.js import. The action-table.css file includes "star" and "switch" classes for easy styling. On it's own it's not much different than just manually adding a checkbox to the table using the same styles. I've included it as a basic element for strapping functionality onto as I assume you'll want to do something when people click it. It fires off a custom event, `action-table-switch`, containing details about the element. You can also extend the ActionTableSwitch class and replace the sendEvent() function with your own.

```
<action-table-switch class="star"></action-table-switch>
```

**Attributes:**

* checked: Indicates checked status.
* label: Sets the aria-label for the input. _Defaults to "switch"_. Be explicit for accessibility purposes.
* value: Sets the value.
* name: Sets the name.

## Custom Events

The components use a number of custom events for reactively passing variables. You can tap into this if you want to add your own custom JavaScript.

* action-table: The action-table element dispatches an 'action-table' event whenever it triggers a change in the pagination, numberOfPages, rowsVisible, or page variable. The action-table-pagination element listens for this events in order to update itself when the table is filtered or when the pagination attribute is changed. Event detail type is ActionTableEventDetail.
* action-table-filter: The action-table element listens for this events in order to filter the table. The action-table-filters element dispatches this whenever a filter menu or input is changed. Event detail type is FiltersObject.
* action-table-filters-reset: The action-table-filters element listens for this to reset all filters. The action-table-no-results dispatches this when the reset button is triggered. No event detail.
* action-table-update: The action-table element listens for this event in order to update the content in a specific table cell. This is mainly useful for custom elements inside of table cells with dynamic content. Event detail type is UpdateContentDetail.

## CSS Variables

The action-table.css includes some CSS variables for easy overrides.

```
action-table {
    --highlight: paleturquoise;
	--focus: dodgerblue;
	--star-checked: orange;
	--star-unchecked: gray;
	--switch-checked: green;
	--switch-unchecked: lightgray;
	--border: 1px solid lightgray;
    --border-radius: 0.2em;
	--th-bg: whitesmoke;
	--th-sorted: rgb(244, 220, 188);
	--col-sorted: rgb(255, 253, 240);
	--td-options-bg: whitesmoke;
	--page-btn: whitesmoke;
	--page-btn-active: rgb(244, 220, 188);
}

action-table-filter-range {
	--thumb-size: 1.3em;
	--thumb-bg: #fff;
	--thumb-border: solid 2px #9e9e9e;
	--thumb-shadow: 0 1px 4px 0.5px rgba(0, 0, 0, 0.25);
	--thumb-highlight: var(--highlight);
	--track-bg: lightgray;
	--track-shadow: inset 0 0 2px #00000099;
	--track-highlight: var(--highlight);
	--ticks-color: #b2b2b2;
	--ticks-width: 1;
}
```
