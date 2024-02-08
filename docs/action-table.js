var g=Object.defineProperty;var p=(c,a,t)=>a in c?g(c,a,{enumerable:!0,configurable:!0,writable:!0,value:t}):c[a]=t;var h=(c,a,t)=>(p(c,typeof a!="symbol"?a+"":a,t),t);class m extends HTMLElement{constructor(){super();const a=this.closest("action-table"),{rowsVisible:t}=a;t===0?this.style.display="":this.style.display="none",this.addEventListener("click",e=>{e.target instanceof HTMLButtonElement&&e.target.type==="reset"&&(this.dispatchEvent(new CustomEvent("action-table-filter",{bubbles:!0})),this.dispatchEvent(new CustomEvent("action-table-filters-reset",{bubbles:!0})))}),a.addEventListener("action-table",e=>{const s=e.detail;(s==null?void 0:s.rowsVisible)===0?this.style.display="":this.style.display="none"})}}customElements.define("action-table-no-results",m);class y extends HTMLElement{constructor(){var t;super();h(this,"table");h(this,"tbody");h(this,"cols",[]);h(this,"rows",[]);h(this,"filters",{});h(this,"sortAndFilter",this.delayUntilNoLongerCalled(()=>{this.filterTable(),this.sortTable(),this.appendRows(),this.tbody.matches("[style*=none]")&&(this.rowsVisible===0&&this.setFilters(),this.tbody.style.display="")}));if(this.store){const e=localStorage.getItem(`action-table${this.id}`);if(e){const i=JSON.parse(e);this.sort=i.sort,this.direction=i.direction}const s=localStorage.getItem(`action-table-filters${this.id}`);s&&(this.filters=JSON.parse(s))}if(this.hasAttribute("urlparams")){const e=new URLSearchParams(window.location.search),s={};for(const[i,o]of e.entries())i!=="sort"&&i!=="direction"&&((t=s[i])!=null&&t.values?s[i].values.push(o):(s[i]=s[i]||{},s[i].values=[o])),i==="sort"&&(this.sort=o),i==="direction"&&(o==="ascending"||o==="descending")&&(this.direction=o);Object.keys(s).length>0&&this.setFiltersObject(s)}this.addEventListeners()}get sort(){var t;return((t=this.getAttribute("sort"))==null?void 0:t.trim().toLowerCase())||""}set sort(t){this.setAttribute("sort",t)}get direction(){var e;const t=(e=this.getAttribute("direction"))==null?void 0:e.trim().toLowerCase();return t==="ascending"||t==="descending"?t:"ascending"}set direction(t){this.setAttribute("direction",t)}get store(){return this.hasAttribute("store")}get id(){return this.getAttribute("id")||""}get pagination(){return Number(this.getAttribute("pagination"))||0}set pagination(t){this.setAttribute("pagination",t.toString())}get page(){return Number(this.getAttribute("page"))||1}set page(t){t=this.checkPage(t),this.setAttribute("page",t.toString())}checkPage(t){return Math.max(1,Math.min(t,this.numberOfPages))}dispatch(t){this.dispatchEvent(new CustomEvent("action-table",{detail:t}))}connectedCallback(){const t=this.querySelector("table");if(t&&t.querySelector("thead tr th")&&t.querySelector("tbody tr td"))this.table=t,this.tbody=t.querySelector("tbody"),this.rows=Array.from(t.querySelectorAll("tbody tr"));else throw new Error("Could not find table with thead and tbody in action-table");const e=Object.keys(this.filters).length>0;!e&&!this.sort?this.appendRows():this.tbody.style.display="none",this.getColumns(),this.getTableContent(),(e||this.sort)&&(Object.keys(this.filters).forEach(s=>{this.cols.some(i=>i.name===s)||delete this.filters[s]}),this.sortAndFilter()),this.addObserver()}static get observedAttributes(){return["sort","direction","pagination","page"]}attributeChangedCallback(t,e,s){e!==s&&this.rows.length>0&&((t==="sort"||t==="direction")&&this.sortTable(),t==="pagination"&&this.dispatch({pagination:this.pagination}),this.appendRows())}setFiltersObject(t={}){this.filters=t,this.store&&localStorage.setItem(`action-table-filters${this.id}`,JSON.stringify(this.filters))}setFilters(t={}){this.setFiltersObject(t),this.filterTable(),this.appendRows()}addEventListeners(){this.addEventListener("click",t=>{const e=t.target;if(e instanceof HTMLButtonElement&&e.dataset.col){const s=e.dataset.col;let i="ascending";this.sort===s&&this.direction==="ascending"&&(i="descending"),this.sort=s,this.direction=i,this.store&&localStorage.setItem(`action-table${this.id}`,JSON.stringify({sort:this.sort,direction:i}))}},!1),this.addEventListener("change",t=>{const e=t.target;e instanceof HTMLInputElement&&e.closest("td")&&e.type==="checkbox"&&this.updateContent(e)}),this.addEventListener("action-table-filter",t=>{const e=t.detail?{...this.filters,...t.detail}:{};this.setFilters(e)}),this.addEventListener("action-table-update",t=>{const e=t.target;e instanceof Element&&this.updateContent(e,t.detail)})}updateContent(t,e={}){const s=t.matches("td")?t:t.closest("td");s&&(e=typeof e=="string"?{sort:e,filter:e}:e,this.setCellContent(s,e),this.sortAndFilter())}delayUntilNoLongerCalled(t){let e,s=!1;function i(){t(),s=!1}return function(){s?clearTimeout(e):s=!0,e=setTimeout(i,10)}}getColumns(){const t=this.table.querySelectorAll("thead th");if(t.forEach(e=>{const s=(e.dataset.col||this.getCellContent(e)).trim().toLowerCase(),i=e.dataset.order?e.dataset.order.split(","):void 0;if(this.cols.push({name:s,order:i}),!e.hasAttribute("no-sort")){const o=document.createElement("button");o.dataset.col=s,o.type="button",o.innerHTML=e.innerHTML,e.replaceChildren(o)}}),!this.table.querySelector("colgroup")){const e=document.createElement("colgroup");t.forEach(()=>{const s=document.createElement("col");e.appendChild(s)}),this.table.prepend(e)}}getCellContent(t){var s;let e=(t.textContent||"").trim();if(!e){const i=t.querySelector("svg");i instanceof SVGElement&&(e=((s=i.querySelector("title"))==null?void 0:s.textContent)||e);const o=t.querySelector("input[type=checkbox]");o instanceof HTMLInputElement&&o.checked&&(e=o.value,"actionTable"in t&&(t.actionTable={...t.actionTable,checked:!0}));const r=t.querySelector(":defined");r!=null&&r.shadowRoot&&(e=r.shadowRoot.textContent||e)}return e.trim()}getTableContent(){this.rows.forEach(t=>{t.querySelectorAll("td").forEach((s,i)=>{const o=this.cols[i];this.setCellContent(s,{col:o.name})})})}setCellContent(t,e={}){const s=this.getCellContent(t);t.actionTable={...t.actionTable,sort:t.dataset.sort||s,filter:t.dataset.filter||s,...e}}addObserver(){new MutationObserver(e=>{e.forEach(s=>{const i=s.target;if(i instanceof Element){if(i instanceof HTMLTableSectionElement||i instanceof HTMLTableRowElement)return;this.updateContent(i),this.sortAndFilter()}})}).observe(this.tbody,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["data-sort","data-filter"]})}filterTable(){const t=this.numberOfPages,e=this.rowsVisible,s=this.filters["action-table"];this.rows.forEach(i=>{let o=!1;const r=i.querySelectorAll("td");if(s){const d=Array.from(r).map(n=>n.actionTable.checked?"":n.actionTable.filter).join(" ");this.shouldHide(s,d)&&(o=!0)}r.forEach((d,n)=>{const l=this.filters[this.cols[n].name];l&&this.shouldHide(l,d.actionTable.filter)&&(o=!0)}),i.hideRow=o}),this.numberOfPages!==t&&this.dispatch({numberOfPages:this.numberOfPages}),this.rowsVisible!==e&&this.dispatch({rowsVisible:this.rowsVisible})}shouldHide(t,e){if(t.values&&t.values.length>0){if(t.regex){let s=t.values.join("|");return t.exclusive&&(s=`${t.values.map(r=>`(?=.*${r})`).join("")}.*`),!new RegExp(s,"i").test(e)}if(t.range){const[s,i]=t.values;if(!isNaN(Number(s))&&!isNaN(Number(i)))return Number(e)<Number(s)||Number(e)>Number(i)}return t.exclusive?!t.values.every(s=>e.toLowerCase().includes(s.toLowerCase())):t.exact?!t.values.some(s=>e===s):!t.values.some(s=>e.toLowerCase().includes(s.toLowerCase()))}return!1}sortTable(t=this.sort,e=this.direction){t=t.toLowerCase();const s=this.cols.findIndex(i=>i.name===t);if(s>=0&&this.rows.length>0){const i=this.cols[s].order,o=n=>i!=null&&i.includes(n)?i.indexOf(n).toString():n;this.rows.sort((n,l)=>{if(this.direction==="descending"){const f=n;n=l,l=f}const u=o(n.children[s].actionTable.sort),b=o(l.children[s].actionTable.sort);return this.alphaNumSort(u,b)}),this.querySelectorAll("col").forEach((n,l)=>{l===s?n.classList.add("sorted"):n.classList.remove("sorted")}),this.table.querySelectorAll("thead th").forEach((n,l)=>{const u=l===s?e:"none";n.setAttribute("aria-sort",u)})}}alphaNumSort(t,e){function s(i){return!isNaN(Number(i))}if(s(t)&&s(e)){const i=Number(t),o=Number(e);if(i<o)return-1;if(i>o)return 1}return typeof t=="string"&&typeof e=="string"?t.localeCompare(e):0}appendRows(){const t=i=>{const{pagination:o,page:r}=this;return o===0||i>=o*(r-1)+1&&i<=o*r},e=document.createDocumentFragment();let s=0;if(this.rows.forEach(i=>{let o="none";i.hideRow||(s++,t(s)&&(o="",e.appendChild(i))),i.style.display=o}),this.tbody.prepend(e),this.pagination>0){const i=this.checkPage(this.page);i!==this.page&&(this.page=i,this.dispatch({page:i}))}}get rowsVisible(){return this.rows.filter(t=>!t.hideRow).length}get numberOfPages(){return this.pagination>0?Math.ceil(this.rowsVisible/this.pagination):1}}customElements.define("action-table",y);
//# sourceMappingURL=action-table.js.map
