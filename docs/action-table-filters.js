var d=Object.defineProperty;var f=(l,t,e)=>t in l?d(l,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):l[t]=e;var b=(l,t,e)=>(f(l,typeof t!="symbol"?t+"":t,e),e);class p extends HTMLElement{constructor(){super()}static get observedAttributes(){return["col","options","label"]}get col(){return this.getAttribute("col")||""}get options(){return this.getAttribute("options")||""}set options(t){this.setAttribute("options",t)}get label(){return this.getAttribute("label")||this.col}addEventListeners(){this.addEventListener("change",t=>{const e=t.target;if(e.tagName==="SELECT"){const i=this.col;if(i){const s=e.value,n={col:i,value:s};this.dispatchEvent(new CustomEvent("action-table-filter",{detail:n,bubbles:!0}))}}})}resetFilter(){var e;const t=(e=this.shadowRoot)==null?void 0:e.querySelector("select");t&&(t.value="")}findOptions(t){var h,r,c;t=t.toLowerCase();const e=(h=this.closest("action-table"))==null?void 0:h.querySelectorAll("table thead th"),i=Array.from(e).findIndex(o=>{var u;return((u=o.dataset.col)==null?void 0:u.toLowerCase())===t||o.innerText.toLowerCase()===t});if(i===-1)return;const s=(r=this.closest("action-table"))==null?void 0:r.querySelectorAll(`table tbody td:nth-child(${i+1})`),n=(c=this.closest("action-table"))==null?void 0:c.querySelectorAll(`table tbody td:nth-child(${i+1}) > *`);let a=[];n&&n.length>0?a=Array.from(n).map(o=>o.innerText):a=Array.from(s).map(o=>o.innerText),this.options=Array.from(new Set(a)).join(",")}connectedCallback(){this.options||this.findOptions(this.col),this.render(),this.addEventListeners()}render(){const t=`<label>${this.label}</label> <select name="filter-${this.col}" data-col="${this.col}"><option value="">All</option>${this.options.split(",").map(e=>`<option value="${e}">${e}</option>`)}</select>`;this.innerHTML=`${t}`}}customElements.define("action-table-filter-menu",p);class v extends HTMLElement{constructor(){super()}static get observedAttributes(){return["col","filter","label"]}get col(){return this.getAttribute("col")||""}get filter(){return this.getAttribute("filter")||"checked"}get label(){return this.getAttribute("label")||this.col}connectedCallback(){this.render(),this.addEventListeners()}render(){const t=`<label>
        <input type="checkbox" />
        <span>${this.label}</span>
      </label>`;this.innerHTML=`${t}`}addEventListeners(){this.addEventListener("click",t=>{let i=t.target.checked?this.filter:"",s={col:this.col,value:i};this.dispatchEvent(new CustomEvent("action-table-filter",{detail:s,bubbles:!0}))})}resetFilter(){const t=this.querySelector("input");t&&(t.checked=!1)}}customElements.define("action-table-filter-switch",v);class m extends HTMLElement{constructor(){super();b(this,"filters")}connectedCallback(){this.filters=this.querySelectorAll("select, input[type=checkbox], input[type=radio]"),this.addEventListeners()}resetAllFilters(){this.filters.forEach(i=>{if(i.type==="checkbox"){const s=i;s.checked=!1}if(i.type==="radio"){const s=i;s.value===""&&(s.checked=!0)}i.tagName.toLowerCase()==="select"&&(i.value="")});const e=this.querySelectorAll("action-table-filter-menu, action-table-filter-switch");e==null||e.forEach(i=>{i.resetFilter()})}addEventListeners(){var i;(i=this.filters)==null||i.forEach(s=>{if(s.type==="checkbox"){const n=s;n.addEventListener("change",()=>{const a=Array.from(this.filters).filter(r=>{if(r.type==="checkbox"){const c=r;return c.type==="checkbox"&&c.name===n.name&&c.checked}else return!1}).map(r=>r.value);let h={col:n.name,value:a};this.dispatchEvent(new CustomEvent("action-table-filter",{detail:h,bubbles:!0}))})}s.type==="radio"&&s.addEventListener("change",()=>{const n={col:s.name,value:s.value};this.dispatchEvent(new CustomEvent("action-table-filter",{detail:n,bubbles:!0}))}),s.tagName.toLowerCase()==="select"&&s.addEventListener("change",()=>{const n={col:s.name,value:s.value};this.dispatchEvent(new CustomEvent("action-table-filter",{detail:n,bubbles:!0}))})});const e=this.querySelector("button[type=reset]");e==null||e.addEventListener("click",()=>{this.dispatchEvent(new CustomEvent("action-table-filter-reset",{bubbles:!0}))}),this.addEventListener("action-table-filter-reset",()=>{this.resetAllFilters()})}}customElements.define("action-table-filters",m);
//# sourceMappingURL=action-table-filters.js.map
