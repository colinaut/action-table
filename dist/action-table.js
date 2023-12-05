var u=Object.defineProperty;var m=(c,n,t)=>n in c?u(c,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):c[n]=t;var h=(c,n,t)=>(m(c,typeof n!="symbol"?n+"":n,t),t);class y extends HTMLElement{constructor(){super();h(this,"tbody");h(this,"ths");h(this,"cols",[]);h(this,"rowsArray")}static get observedAttributes(){return["sort","direction"]}get sort(){var t;return((t=this.getAttribute("sort"))==null?void 0:t.trim().toLowerCase())||""}set sort(t){this.setAttribute("sort",t)}get direction(){var t;return((t=this.getAttribute("direction"))==null?void 0:t.trim().toLowerCase())||"ascending"}set direction(t){this.setAttribute("direction",t)}connectedCallback(){const t=this.querySelector("table");this.tbody=t.querySelector("tbody"),this.getColumns(t);const e=this.tbody.querySelectorAll("tbody tr");this.rowsArray=Array.from(e),this.sort&&this.sortTable(),this.addEventListeners()}getColumns(t){return this.ths=t.querySelectorAll("th"),this.ths&&this.ths.forEach(e=>{let i=e.dataset.col||e.innerText||"";i=i.trim().toLowerCase(),i&&(this.cols.push({name:i,index:e.cellIndex}),e.dataset.sortable!=="false"&&(e.dataset.sortable="true"))}),this.cols}attributeChangedCallback(t,e,i){}addEventListeners(){this.addEventListener("click",t=>{const e=t.target;if(e.tagName==="TH"){if(e.dataset.sortable==="false")return;let i=e.dataset.col||e.innerText||"";i=i.trim().toLowerCase(),i&&(this.sort===i&&this.direction==="ascending"?this.direction="descending":(this.sort=i,this.direction="ascending"),this.sortTable())}},!1),this.addEventListener("action-table-filter",t=>{const{col:e,value:i}=t.detail;this.filterTable(e,i)}),this.addEventListener("action-table-filter-reset",()=>{this.resetFilters()})}resetFilters(){this.cols.forEach(t=>{t.filter=""}),this.filterTable()}filterTable(t="",e="",i="i"){t=t==null?void 0:t.trim().toLowerCase(),typeof e=="string"&&(e=e.trim()),this.cols=this.cols.map(s=>(s.name===t&&(s.filter=e),s)),this.rowsArray.forEach(s=>{s.style.display="";const o=s.children;this.cols.forEach(r=>{const f=o[r.index],l=this.getCellContent(f).toString();if(r.filter&&typeof r.filter=="string")new RegExp(r.filter,i).test(l)||(s.style.display="none");else if(r.filter&&Array.isArray(r.filter)){const a=r.filter;let d="(";a.forEach((g,b)=>{d+=`${g}`,d+=b<a.length-1?"|":""}),d+=")",new RegExp(d,i).test(l)||(s.style.display="none")}})}),this.sortTable()}getCellContent(t){var i;let e=t.dataset.sort||t.innerText||"";if(e=e==null?void 0:e.trim(),!e){const s=t.firstElementChild;s.tagName.toLowerCase()==="svg"&&(e=((i=s.querySelector("title"))==null?void 0:i.textContent)||""),(s.tagName.toLowerCase()==="action-table-switch"||s.tagName.toLowerCase()==="input")&&(e=s.checked?"checked":"")}return e=Number(e)?Number(e):e.trim(),e}sortTable(t=this.sort,e=this.direction){t=t==null?void 0:t.trim().toLowerCase(),e=e==null?void 0:e.trim().toLowerCase();const i=this.cols.findIndex(s=>s.name===t);i>=0&&this.rowsArray.length>0&&(this.rowsArray.sort((s,o)=>{const r=s.children[i],f=o.children[i];let l=this.getCellContent(r),a=this.getCellContent(f);if(this.direction==="ascending"){if(l<a)return-1;if(l>a)return 1}else{if(l<a)return 1;if(l>a)return-1}return 0}),this.ths.forEach(s=>{var o;s.dataset.sort_direction="",(s.dataset.sort===t||((o=s.innerText)==null?void 0:o.trim().toLowerCase())===t)&&(s.dataset.sort_direction=e)}),this.rowsArray.forEach(s=>this.tbody.appendChild(s)))}}customElements.define("action-table",y);
//# sourceMappingURL=action-table.js.map
