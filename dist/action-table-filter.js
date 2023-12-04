var r=Object.defineProperty;var c=(o,i,t)=>i in o?r(o,i,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[i]=t;var l=(o,i,t)=>(c(o,typeof i!="symbol"?i+"":i,t),t);class h extends HTMLElement{constructor(){super();l(this,"shadow");this.shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["col","options"]}get col(){var t;return((t=this.getAttribute("col"))==null?void 0:t.trim().toLowerCase())||""}get options(){return this.getAttribute("options")||""}addEventListeners(){this.shadow.addEventListener("change",t=>{const e=t.target;if(e.tagName==="SELECT"){const s=this.col;if(s){const n=e.value,a={col:s,value:n};this.dispatchEvent(new CustomEvent("action-table-filter",{detail:a,bubbles:!0}))}}})}resetFilter(t={dispatch:!0}){var s;const e=(s=this.shadowRoot)==null?void 0:s.querySelector("select");if(e&&(e.value=""),t.dispatch){const n={col:this.col,value:""};this.dispatchEvent(new CustomEvent("action-table-filter",{detail:n,bubbles:!0}))}}connectedCallback(){this.render(),this.addEventListeners()}render(){const t="<style>label{display:inline-block;margin-inline-end:.5em}</style>",e=`<label part="label"><slot>Sort by</slot></label><select part="select" name="filter-${this.col}" data-col="${this.col}"><option value="">All</option>${this.options.split(",").map(s=>`<option value="${s}">${s}</option>`)}</select>`;this.shadow.innerHTML=`${t}${e}`}}class d extends HTMLElement{constructor(){super();l(this,"shadow");this.shadow=this.attachShadow({mode:"open"})}connectedCallback(){this.render(),this.addEventListeners()}render(){const t='<button part="reset-button"><slot>Reset Filters</slot></button>';this.shadow.innerHTML=`${t}`}addEventListeners(){this.shadow.addEventListener("click",()=>{this.dispatchEvent(new CustomEvent("action-table-filter-reset",{bubbles:!0}))})}}class u extends HTMLElement{constructor(){super();l(this,"shadow");this.shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["col","filter"]}get col(){var t;return((t=this.getAttribute("col"))==null?void 0:t.trim().toLowerCase())||""}get filter(){var t;return((t=this.getAttribute("filter"))==null?void 0:t.trim().toLowerCase())||""}connectedCallback(){this.render(),this.addEventListeners()}render(){const t='<style>:host{--action-table-filter-switch-checked:green}input{appearance:none;position:relative;display:inline-block;background:var(--action-table-filter-switch-unchecked);cursor:pointer;height:1.4em;width:2.75em;vertical-align:middle;border-radius:2em;box-shadow:0 1px 3px #0003 inset;transition:.25s linear background}input::before{content:"";display:block;width:1em;height:1em;background:#fff;border-radius:1em;position:absolute;top:.2em;left:.2em;box-shadow:0 1px 3px #0003;transition:.25s linear transform;transform:translateX(0)}:checked{background:var(--action-table-filter-switch-checked)}:checked::before{transform:translateX(1rem)}input:focus{outline:transparent}input:focus-visible{outline:2px solid var(--action-table-filter-switch-focus);outline-offset:2px}</style>',e=`<label>
        <input type="checkbox" />
        <slot>Show Only ${this.filter} for ${this.col}</slot>
      </label>`;this.shadow.innerHTML=`${t}${e}`}addEventListeners(){this.shadow.addEventListener("click",t=>{const s=t.target.checked;let n={col:this.col,value:""};s&&(n={col:this.col,value:this.filter}),this.dispatchEvent(new CustomEvent("action-table-filter",{detail:n,bubbles:!0}))})}resetFilter(t={dispatch:!0}){const e=this.shadow.querySelector("input");if(e&&(e.checked=!1),t.dispatch){const s={col:this.col,value:""};this.dispatchEvent(new CustomEvent("action-table-filter",{detail:s,bubbles:!0}))}}}customElements.define("action-table-filter-menu",h);customElements.define("action-table-filter-switch",u);customElements.define("action-table-filter-reset",d);
//# sourceMappingURL=action-table-filter.js.map
