var u=Object.defineProperty;var b=(a,o,t)=>o in a?u(a,o,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[o]=t;var d=(a,o,t)=>(b(a,typeof o!="symbol"?o+"":o,t),t);class m extends HTMLElement{constructor(){super();d(this,"tbody");d(this,"ths");d(this,"cols",[]);d(this,"rowsArray")}static get observedAttributes(){return["sort","direction"]}get sort(){var t;return((t=this.getAttribute("sort"))==null?void 0:t.trim().toLowerCase())||""}set sort(t){typeof t=="string"&&this.setAttribute("sort",t)}get direction(){var t;return((t=this.getAttribute("direction"))==null?void 0:t.trim().toLowerCase())||"ascending"}set direction(t){typeof t=="string"&&this.setAttribute("direction",t)}connectedCallback(){const t=this.querySelector("table");this.tbody=t.querySelector("tbody"),this.getColumns(t);const e=this.tbody.querySelectorAll("tbody tr");this.rowsArray=Array.from(e),this.sort&&this.sortTable(),this.addEventListeners()}getColumns(t){return this.ths=t.querySelectorAll("th"),this.ths&&this.ths.forEach(e=>{var r,i;let s=e.dataset.col||((r=e.children[0])==null?void 0:r.getAttribute("title"))||e.textContent||((i=e.children[0])==null?void 0:i.textContent)||"";if(s=s.trim().toLowerCase(),s){this.cols.push({name:s,index:e.cellIndex});const n=document.createElement("span");n.classList.add("sort-arrow"),e.append(n)}}),this.cols}attributeChangedCallback(t,e,s){}addEventListeners(){this.addEventListener("click",t=>{var s;const e=t.target;if(e.tagName==="TH"){let r=e.dataset.col||((s=e.children[0])==null?void 0:s.getAttribute("title"))||e.textContent||"";r=r.trim().toLowerCase(),r&&(this.sort===r&&this.direction==="ascending"?this.direction="descending":(this.sort=r,this.direction="ascending"),this.sortTable())}},!1),this.addEventListener("action-table-filter",t=>{const{col:e,value:s}=t.detail;this.filterTable(e,s)}),this.addEventListener("action-table-filter-reset",()=>{this.resetFilters()})}resetFilters(){this.cols.forEach(e=>{e.filter=""}),this.filterTable();const t=this.querySelectorAll("action-table-filter-menu, action-table-filter-switch");t==null||t.forEach(e=>{e.resetFilter({dispatch:!1})})}filterTable(t="",e=""){t=t==null?void 0:t.trim().toLowerCase(),typeof e=="string"&&(e=e.trim()),this.cols=this.cols.map(s=>(s.name===t&&(s.filter=e),s)),this.rowsArray.forEach(s=>{s.style.display="";const r=s.children;this.cols.forEach(i=>{let n=r[i.index].textContent||r[i.index].dataset.sort||"";if(n=n==null?void 0:n.trim(),i.filter&&typeof i.filter=="string")new RegExp(i.filter,"i").test(n)||(s.style.display="none");else if(i.filter&&Array.isArray(i.filter)){const c=i.filter;let l="(";c.forEach((f,g)=>{l+=`${f}`,l+=g<c.length-1?"|":""}),l+=")",new RegExp(l,"i").test(n)||(s.style.display="none")}})}),this.sortTable()}getCellSortValue(t){let e=t.dataset.sort||t.textContent||"";return e=Number(e)?Number(e):e,e}sortTable(t=this.sort,e=this.direction){t=t==null?void 0:t.trim().toLowerCase(),e=e==null?void 0:e.trim().toLowerCase();const s=this.cols.findIndex(r=>r.name===t);s>=0&&this.rowsArray.length>0&&(this.rowsArray.sort((r,i)=>{const n=r.children[s],c=i.children[s];let l=this.getCellSortValue(n),h=this.getCellSortValue(c);if(this.direction==="ascending"){if(l<h)return-1;if(l>h)return 1}else{if(l<h)return 1;if(l>h)return-1}return 0}),this.ths.forEach(r=>{var i;r.classList.remove("sort-ascending"),r.classList.remove("sort-descending"),((i=r.textContent)==null?void 0:i.trim().toLowerCase())===t&&r.classList.add(`sort-${e}`)}),this.rowsArray.forEach(r=>this.tbody.appendChild(r)))}}customElements.define("action-table",m);
//# sourceMappingURL=action-table.js.map
