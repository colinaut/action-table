var y=Object.defineProperty;var m=(d,l,t)=>l in d?y(d,l,{enumerable:!0,configurable:!0,writable:!0,value:t}):d[l]=t;var h=(d,l,t)=>(m(d,typeof l!="symbol"?l+"":l,t),t);class S extends HTMLElement{constructor(){super();h(this,"tbody");h(this,"tfoot");h(this,"ths");h(this,"cols",[]);h(this,"filters",{});h(this,"rowsArray");h(this,"ready",!1);this.direction="ascending",this.addEventListeners()}static get observedAttributes(){return["sort","direction","store","params"]}get sort(){var t;return((t=this.getAttribute("sort"))==null?void 0:t.trim().toLowerCase())||""}set sort(t){this.setAttribute("sort",t)}get direction(){var e;const t=(e=this.getAttribute("direction"))==null?void 0:e.trim().toLowerCase();return t==="ascending"||t==="descending"?t:"ascending"}set direction(t){this.setAttribute("direction",t)}get store(){return this.hasAttribute("store")}get URLparams(){return this.hasAttribute("urlparams")}connectedCallback(){this.getTable(),this.addNoResultsTfoot(),this.getLocalStorage(),this.getURLParams(),this.sort&&this.sortTable(),this.ready=!0,Object.keys(this.filters).length>0&&this.initialFilter()}attributeChangedCallback(t,e,s){e!==s&&(t==="sort"||t==="direction")&&this.ready&&this.sortTable()}async initialFilter(){const t=await this.waitForCustomElements();if(this.filterTable(),this.rowsShown.length===0&&this.resetFilters(),t.length>0){const e=t.find(s=>s.tagName.toLowerCase()==="action-table-filters");e&&e.setFilterElements(this.filters)}}async waitForCustomElements(){const t=Array.from(this.querySelectorAll("*")).filter(r=>r.tagName.indexOf("-")!==-1);if(t.every(r=>r&&customElements.get(r.tagName.toLowerCase())))return t;const s=t.map(r=>customElements.whenDefined(r.tagName.toLowerCase())),i=new Promise((r,c)=>setTimeout(()=>c("Timeout"),300));try{return await Promise.race([Promise.all(s),i]),t}catch{return[]}}setFilter(t,e,s=!1){const i=this.filters;this.doesColumnExist(t)&&(i[t]=i[t]||{},i[t].values=e,s&&(i[t].exclusive=s),this.filters=i,this.setFiltersLocalStorage())}doesColumnExist(t){return this.cols.includes(t)||t==="action-table"}getLocalStorage(){if(!this.store)return;const t=localStorage.getItem("action-table");if(t){const s=JSON.parse(t);this.sort=s.sort,this.direction=s.direction}const e=localStorage.getItem("action-table-filters");e&&(this.filters=JSON.parse(e))}setFiltersLocalStorage(){this.store&&localStorage.setItem("action-table-filters",JSON.stringify(this.filters))}getURLParams(){if(!this.URLparams)return;const t=new URLSearchParams(window.location.search);if(t.size===0)return;this.sort=t.get("sort")||this.sort;const e=t.get("direction");(e==="ascending"||e==="descending")&&(this.direction=e);const s={};for(const[i,r]of t.entries())i!=="sort"&&i!=="direction"&&this.doesColumnExist(i)&&(s[i]=s[i]||{},s[i].values=[r]);Object.keys(s).length>0&&(this.filters=s)}addEventListeners(){this.addEventListener("click",t=>{const e=t.target;if(e.tagName==="BUTTON"){const s=e.dataset.col;if(s){let i="ascending";this.sort===s&&this.direction==="ascending"&&(i="descending"),this.sort=s,this.direction=i,this.store&&localStorage.setItem("action-table",JSON.stringify({sort:this.sort,direction:i}))}}},!1)}getTable(){const t=this.querySelector("table");this.tbody=t.querySelector("tbody");const e=this.tbody.querySelectorAll("tbody tr");this.rowsArray=Array.from(e),this.getColumns(t)}getColumns(t){return this.ths=t.querySelectorAll("th"),this.ths&&this.ths.forEach(e=>{let s=e.dataset.col||this.getCellContent(e);s=s.trim().toLowerCase(),s&&(this.cols.push(s),e.dataset.col=s,e.hasAttribute("no-sort")||(e.innerHTML=`<button data-col="${s}">${e.innerHTML}</button>`))}),this.cols}addNoResultsTfoot(){const t=document.createElement("tfoot");t.classList.add("no-results"),t.innerHTML=`<tr><td colspan="${this.cols.length}"><p>No Results</p> <p><button>Reset Filters</button></p></td></tr>`,t.addEventListener("click",e=>{if(e.target.tagName!=="BUTTON")return;this.resetFilters();const i=this.querySelector("action-table-filters");i&&i.resetAllFilterElements()}),t.style.display="none",this.tfoot=t,this.tbody.after(this.tfoot)}getCellContent(t){var s;let e=t.innerText||"";if(e=e==null?void 0:e.trim(),!e){const i=t.querySelector("svg");i&&(e=((s=i.querySelector("title"))==null?void 0:s.textContent)||"");const r=t.querySelector("[type=checkbox]");r!=null&&r.checked&&(e=r.value)}return e.trim()}resetFilters(){this.filters={},this.setFiltersLocalStorage(),this.filterTable()}filterTable(t="",e=[],s=!1,i="i"){t=t.trim().toLowerCase(),this.doesColumnExist(t)&&this.setFilter(t,e,s);function r(o,n){if(o.values&&o.values.length>0){let a=o.values.join("|");if(o.exclusive&&(a=`${o.values.map(u=>`(?=.*${u})`).join("")}.*`),!new RegExp(a,i).test(n))return!0}return!1}const c=this.filters["action-table"];this.rowsArray.forEach(o=>{let n="";const a=o.querySelectorAll("td");c&&r(c,o.innerText)&&(n="none"),a.forEach((f,g)=>{const u=f.dataset.filter||this.getCellContent(f),b=this.filters[this.cols[g]];b&&r(b,u)&&(n="none")}),o.style.display=n}),this.tfoot.style.display=this.rowsShown.length===0?"table-footer-group":"none"}get rowsShown(){return this.rowsArray.filter(t=>t.style.display!=="none")}sortTable(t=this.sort,e=this.direction){t=t.toLowerCase();const s=this.cols.findIndex(i=>i===t);s>=0&&this.rowsArray.length>0&&(this.customSort(this.rowsArray,s),this.rowsArray.forEach((i,r)=>{this.tbody.appendChild(i),r<1&&this.ths.forEach((o,n)=>{const a=n===s?e:"none";o.setAttribute("aria-sort",a)}),i.querySelectorAll("td").forEach((o,n)=>{n===s?o.classList.add("sorted"):o.classList.remove("sorted")})}))}customSort(t,e){return t.sort((s,i)=>{if(this.direction==="descending"){const f=s;s=i,i=f}const r=s.children[e],c=i.children[e],o=r.dataset.sort||this.getCellContent(r),n=c.dataset.sort||this.getCellContent(c);function a(f){return!isNaN(parseFloat(f))}return a(o)&&a(n)?parseFloat(o)-parseFloat(n):a(o)?-1:a(n)?1:o.localeCompare(n)})}}customElements.define("action-table",S);
//# sourceMappingURL=action-table.js.map
