var g=Object.defineProperty;var m=(c,a,t)=>a in c?g(c,a,{enumerable:!0,configurable:!0,writable:!0,value:t}):c[a]=t;var h=(c,a,t)=>(m(c,typeof a!="symbol"?a+"":a,t),t);class y extends HTMLElement{constructor(){super();h(this,"tbody");h(this,"ths");h(this,"cols",[]);h(this,"rowsArray")}static get observedAttributes(){return["sort","direction"]}get sort(){var t;return((t=this.getAttribute("sort"))==null?void 0:t.trim().toLowerCase())||""}set sort(t){this.setAttribute("sort",t)}get direction(){var t;return((t=this.getAttribute("direction"))==null?void 0:t.trim().toLowerCase())||"ascending"}set direction(t){this.setAttribute("direction",t)}connectedCallback(){const t=this.querySelector("table");this.tbody=t.querySelector("tbody"),this.getColumns(t);const e=this.tbody.querySelectorAll("tbody tr");this.rowsArray=Array.from(e),this.sort&&this.sortTable(),this.addEventListeners()}getColumns(t){return this.ths=t.querySelectorAll("th"),this.ths&&this.ths.forEach(e=>{let r=e.dataset.col||e.innerText||"";r=r.trim().toLowerCase(),r&&(this.cols.push({name:r,index:e.cellIndex}),e.dataset.sortable!=="false"&&(e.dataset.sortable="true",e.innerHTML=`<button aria-roledescription="sort button" data-col="${r}">${e.innerHTML}</button>`))}),this.cols}attributeChangedCallback(t,e,r){}addEventListeners(){this.addEventListener("click",t=>{const e=t.target;if(e.tagName==="BUTTON"){if(e.dataset.sortable==="false")return;let r=e.dataset.col;r&&(this.sort===r&&this.direction==="ascending"?this.direction="descending":(this.sort=r,this.direction="ascending"),this.sortTable())}},!1),this.addEventListener("action-table-filter",t=>{const{col:e,value:r}=t.detail;this.filterTable(e,r)}),this.addEventListener("action-table-filter-reset",()=>{this.resetFilters()})}resetFilters(){this.cols.forEach(t=>{t.filter=""}),this.filterTable()}filterTable(t="",e="",r="i"){t=t==null?void 0:t.trim().toLowerCase(),typeof e=="string"&&(e=e.trim()),this.cols=this.cols.map(s=>(s.name===t&&(s.filter=e),s)),this.rowsArray.forEach(s=>{s.style.display="";const n=s.children;this.cols.forEach(i=>{const f=n[i.index],l=this.getCellContent(f).toString();if(i.filter&&typeof i.filter=="string")new RegExp(i.filter,r).test(l)||(s.style.display="none");else if(i.filter&&Array.isArray(i.filter)){const o=i.filter;let d="(";o.forEach((b,u)=>{d+=`${b}`,d+=u<o.length-1?"|":""}),d+=")",new RegExp(d,r).test(l)||(s.style.display="none")}})}),this.sortTable()}getCellContent(t){var r;let e=t.dataset.sort||t.innerText||"";if(e=e==null?void 0:e.trim(),!e){const s=t.firstElementChild;s.tagName.toLowerCase()==="svg"&&(e=((r=s.querySelector("title"))==null?void 0:r.textContent)||""),(s.tagName.toLowerCase()==="action-table-switch"||s.tagName.toLowerCase()==="input")&&(e=s.checked?"checked":"")}return e=Number(e)?Number(e):e.trim(),e}sortTable(t=this.sort,e=this.direction){t=t==null?void 0:t.trim().toLowerCase(),e=e==null?void 0:e.trim().toLowerCase();const r=this.cols.findIndex(s=>s.name===t);r>=0&&this.rowsArray.length>0&&(this.rowsArray.sort((s,n)=>{const i=s.children[r],f=n.children[r];let l=this.getCellContent(i),o=this.getCellContent(f);if(this.direction==="ascending"){if(l<o)return-1;if(l>o)return 1}else{if(l<o)return 1;if(l>o)return-1}return 0}),this.rowsArray.forEach(s=>{Array.from(s.children).forEach((n,i)=>{i===r?n.classList.add("sorted"):n.classList.remove("sorted")})}),this.ths.forEach(s=>{var n;s.setAttribute("aria-sort","none"),(s.dataset.sort===t||((n=s.innerText)==null?void 0:n.trim().toLowerCase())===t)&&s.setAttribute("aria-sort",e)}),this.rowsArray.forEach(s=>this.tbody.appendChild(s)))}}customElements.define("action-table",y);
//# sourceMappingURL=action-table.js.map
