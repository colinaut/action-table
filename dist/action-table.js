var b=Object.defineProperty;var p=(d,h,t)=>h in d?b(d,h,{enumerable:!0,configurable:!0,writable:!0,value:t}):d[h]=t;var l=(d,h,t)=>(p(d,typeof h!="symbol"?h+"":h,t),t);class m extends HTMLElement{constructor(){super();l(this,"tbody");l(this,"thead");l(this,"tfoot");l(this,"ths");l(this,"cols",[]);l(this,"filters",{});l(this,"rowsArray");l(this,"ready",!1);l(this,"colGroupCols");l(this,"rowsShown",0);this.direction="ascending",this.addEventListeners()}static get observedAttributes(){return["sort","direction","page","pagination"]}get sort(){var t;return((t=this.getAttribute("sort"))==null?void 0:t.trim().toLowerCase())||""}set sort(t){this.setAttribute("sort",t)}get direction(){var e;const t=(e=this.getAttribute("direction"))==null?void 0:e.trim().toLowerCase();return t==="ascending"||t==="descending"?t:"ascending"}set direction(t){this.setAttribute("direction",t)}get store(){return this.hasAttribute("store")}get URLparams(){return this.hasAttribute("urlparams")}get id(){return this.getAttribute("id")||""}get pagination(){return Number(this.getAttribute("pagination"))||0}set pagination(t){this.setAttribute("pagination",t.toString())}get page(){return Number(this.getAttribute("page"))||1}set page(t){this.setAttribute("page",t.toString())}connectedCallback(){this.init()}async init(){this.getTable();const t=this.querySelector("tbody");if(t&&Array.from(t.querySelectorAll("*")).filter(i=>i.tagName.indexOf("-")!==-1).length>0&&await this.waitForCustomElements(t),this.getTableContent(),this.addObserver(this.tbody),this.addNoResultsTfoot(),this.getLocalStorage(),this.getURLParams(),this.pagination>0){const e=document.querySelector("action-table-pagination");e&&(await customElements.whenDefined("action-table-pagination"),e.pagination=this.pagination,e.setProps({page:this.page,rowsShown:this.rowsShown}))}this.ready=!0,this.initialFilter()}attributeChangedCallback(t,e,i){e!==i&&this.ready&&((t==="sort"||t==="direction")&&this.sortTable(),t==="page"&&this.appendRows())}async initialFilter(){Object.keys(this.filters).length>0&&this.filterTable(),this.sort&&this.sortTable(),Object.keys(this.filters).length===0&&!this.sort&&this.appendRows(),this.rowsShown===0&&this.resetFilters();const t=this.querySelector("action-table-filters");t&&(await customElements.whenDefined("action-table-filters"),t.setFilterElements(this.filters))}async waitForCustomElements(t=this){const e=Array.from(t.querySelectorAll("*")).filter(o=>o.tagName.indexOf("-")!==-1);if(e.length===0)return[];if(e.every(o=>o&&customElements.get(o.tagName.toLowerCase())))return e;const s=e.map(o=>customElements.whenDefined(o.tagName.toLowerCase())),r=new Promise((o,n)=>setTimeout(()=>n("Timeout"),300));try{return await Promise.race([Promise.all(s),r]),e}catch{return[]}}setFilter(t,e,i=!1){const s=this.filters;this.doesColumnExist(t)&&(s[t]=s[t]||{},s[t].values=e,i&&(s[t].exclusive=i),this.filters=s,this.setFiltersLocalStorage())}doesColumnExist(t){return this.cols.includes(t)||t==="action-table"}getLocalStorage(){if(!this.store)return;const t=localStorage.getItem(`action-table${this.id?`-${this.id}`:""}`);if(t){const i=JSON.parse(t);this.sort=i.sort,this.direction=i.direction}const e=localStorage.getItem(`action-table-filters${this.id?`-${this.id}`:""}`);e&&(this.filters=JSON.parse(e))}setFiltersLocalStorage(){this.store&&localStorage.setItem(`action-table-filters${this.id?`-${this.id}`:""}`,JSON.stringify(this.filters))}getURLParams(){if(!this.URLparams)return;const t=new URLSearchParams(window.location.search);if(t.size===0)return;this.sort=t.get("sort")||this.sort;const e=t.get("direction");(e==="ascending"||e==="descending")&&(this.direction=e);const i={};for(const[s,r]of t.entries())s!=="sort"&&s!=="direction"&&this.doesColumnExist(s)&&(i[s]=i[s]||{},i[s].values=[r]);Object.keys(i).length>0&&(this.filters=i)}addEventListeners(){this.addEventListener("click",t=>{const e=t.target;if(e.tagName==="BUTTON"&&e.dataset.col){const i=e.dataset.col;let s="ascending";this.sort===i&&this.direction==="ascending"&&(s="descending"),this.sort=i,this.direction=s,this.store&&localStorage.setItem(`action-table${this.id?`-${this.id}`:""}`,JSON.stringify({sort:this.sort,direction:s}))}},!1),this.addEventListener("change",t=>{const e=t.target;e.closest("td")&&e.type==="checkbox"&&this.getContentSortAndFilter()})}getContentSortAndFilter(){this.getTableContent(),this.filterTable(),this.sortTable()}getTable(){const t=this.querySelector("table");this.thead=t.querySelector("thead"),this.tbody=t.querySelector("tbody");const e=this.tbody.querySelectorAll("tbody tr");this.rowsArray=Array.from(e),this.rowsShown=this.rowsArray.length,this.getColumns(t)}getColumns(t){this.ths=t.querySelectorAll("th");const e=t.querySelector("thead tr"),i=document.createDocumentFragment();if(this.ths&&this.ths.forEach(r=>{let o=r.dataset.col||this.getCellContent(r);if(o=o.trim().toLowerCase(),o)if(this.cols.push(o),r.dataset.col=o,r.hasAttribute("no-sort"))i.appendChild(r);else{const n=r.cloneNode(),a=document.createElement("button");a.dataset.col=o,a.innerHTML=r.innerHTML,n.appendChild(a),i.appendChild(n)}}),e==null||e.replaceChildren(i),!t.querySelector("colgroup")){const r=document.createElement("colgroup");this.cols.forEach(()=>{const o=document.createElement("col");r.appendChild(o)}),t.prepend(r)}return this.colGroupCols=this.querySelectorAll("col"),this.cols}addNoResultsTfoot(){const t=document.createElement("tfoot");t.classList.add("no-results"),t.innerHTML=`<tr><td colspan="${this.cols.length}"><p>No Results</p> <p><button>Reset Filters</button></p></td></tr>`,t.addEventListener("click",e=>{if(e.target.tagName!=="BUTTON")return;this.resetFilters();const s=this.querySelector("action-table-filters");s&&s.resetAllFilterElements()}),t.style.display="none",this.tfoot=t,this.tbody.after(this.tfoot)}getCellContent(t){var i;let e=(t==null?void 0:t.textContent)||"";if(e=e==null?void 0:e.trim(),!e){const s=t.querySelector("svg");s&&(e=((i=s.querySelector("title"))==null?void 0:i.textContent)||"");const r=t.querySelector("[type=checkbox]");r!=null&&r.checked&&(e=r.value)}return e.trim()}getTableContent(){this.rowsArray.forEach(t=>{const e=t.querySelectorAll("td");this.cols.forEach((i,s)=>{const r=e[s],o=this.getCellContent(r);r.actionTable={col:i,sort:r.dataset.sort||o,filter:r.dataset.filter||o}})})}addObserver(t){new MutationObserver(i=>{i.forEach(s=>{const r=s.target;(r instanceof HTMLTableCellElement||r instanceof HTMLSpanElement||r instanceof HTMLLIElement)&&this.getContentSortAndFilter()})}).observe(t,{childList:!0,subtree:!0,attributes:!0})}resetFilters(){this.filters={},this.setFiltersLocalStorage(),this.filterTable()}filterTable(t="",e=[],i=!1,s="i"){t=t.trim().toLowerCase(),this.doesColumnExist(t)&&this.setFilter(t,e,i);const r=this.filters["action-table"];this.rowsArray.forEach(o=>{let n=!1;const a=o.querySelectorAll("td");if(r){const u=Array.from(a).map(c=>c.actionTable.filter).join(" ");this.shouldHide(r,u,s)&&(n=!0)}a.forEach((u,c)=>{const f=u.actionTable.filter,g=this.filters[this.cols[c]];g&&this.shouldHide(g,f,s)&&(n=!0)}),o.hideRow=n}),this.appendRows(this.rowsArray)}shouldHide(t,e,i){if(t.values&&t.values.length>0){let s=t.values.join("|");if(t.exclusive&&(s=`${t.values.map(n=>`(?=.*${n})`).join("")}.*`),!new RegExp(s,i).test(e))return!0}return!1}sortTable(t=this.sort,e=this.direction){t=t.toLowerCase();const i=this.cols.findIndex(s=>s===t);if(i>=0&&this.rowsArray.length>0){const s=this.customSort(this.rowsArray,i);this.colGroupCols.forEach((r,o)=>{o===i?r.classList.add("sorted"):r.classList.remove("sorted")}),this.ths.forEach((r,o)=>{const n=o===i?e:"none";r.setAttribute("aria-sort",n)}),this.appendRows(s)}}customSort(t,e){return t.sort((i,s)=>{if(this.direction==="descending"){const c=i;i=s,s=c}const r=i.children[e],o=s.children[e],n=r.actionTable.sort,a=o.actionTable.sort;function u(c){return!isNaN(Number(c))}if(u(n)&&u(a)){const c=Number(n),f=Number(a);if(c<f)return-1;if(c>f)return 1}return typeof n=="string"&&typeof a=="string"?n.localeCompare(a):0})}isActivePage(t){const e=this.pagination;if(e===0)return!0;const i=e*(this.page-1)+1,s=e*this.page;return t+1>i&&t<=s}appendRows(t=this.rowsArray){const e=document.createDocumentFragment();let i=0;if(t.forEach(s=>{s.hideRow||i++,s.hideRow||!this.isActivePage(i)?s.style.display="none":(s.style.display="",e.appendChild(s))}),this.tfoot.style.display=i===0?"table-footer-group":"none",this.tbody.prepend(e),this.pagination>0){let s=this.page;const r=Math.ceil(i/this.pagination);s>r&&(s=r||1);const o=document.querySelector("action-table-pagination");if(o){const n={};this.page!==s&&(n.page=s),this.rowsShown!==i&&(n.rowsShown=i),Object.keys(n).length>0&&o.setProps(n)}this.page=s}this.rowsShown=i}}customElements.define("action-table",m);
//# sourceMappingURL=action-table.js.map
