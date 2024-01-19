# Notes

## Refactor how parent child reactivity works

### State communications:

1. Sort state: column and direction
   1. Sort state is set and reflected via observed attributes on action-table.
   2. Headers are turned into sort buttons which trigger sort state.
2. Filter state: column and filter values
   1. Set with a filtersObj property which is an object (see FiltersObject in types.ts)
   2. To change filter state, call filterTable() method with or without arguments. Arguments will update filtersObj
   3. Right now, when filtersObj is changed nothing happens reactively. Ideally what should happen is:
      1. It should trigger filterTable() method.
      2. If filtersObj changed by actions-table-filter it should trigger filterTable() method but not update actions-table-filters elements.
      3. If however it is updated by something else like an auto reset then it should update actions-table-filters elements
3. Pagination state: page number, number of rows per page, number of pages
   1. the actions-table-pagination needs to be render updated based on page number and number of pages
   2. actions-table needs to be updated based on page number and number of rows per page
   3. Right now it's all method calls
   4. actions-table-pagination buttons update page number
   5. actions-table filter updates number of pages based on number of displayed rows and can update page number if the current page is higher than the max page
   6. Ideal is a reactive property which would need trigger the above on changes. Might need a local state to test against the main state so that it doesn't trigger render when not needed.