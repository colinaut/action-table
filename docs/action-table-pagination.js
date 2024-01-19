var f=Object.defineProperty;var d=(r,s,e)=>s in r?f(r,s,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[s]=e;var c=(r,s,e)=>(d(r,typeof s!="symbol"?s+"":s,e),e);class m extends HTMLElement{constructor(){super();const s=this.closest("action-table"),{pagination:e}=s,t=n=>n.map(a=>`<option ${e===a?"selected":""}>${a}</option>`).join(""),i=this.options.length>0?`<label class="pagination-select"><span>${this.getAttribute("label")||"Rows per:"}</span> <select>${t(this.options)}</select></label>`:"";this.innerHTML=i,this.addEventListener("change",n=>{if(n.target instanceof HTMLSelectElement){const a=Number(n.target.value);isNaN(a)||(s.pagination=a)}})}get options(){const s=this.getAttribute("options");if(s){const e=s.split(",").map(t=>Number(t)).filter(t=>!isNaN(t));if(e.length>0)return e}return[]}}customElements.define("action-table-pagination-options",m);class $ extends HTMLElement{constructor(){super();c(this,"page",1);c(this,"numberOfPages",1);c(this,"group",1);c(this,"maxGroups",1);c(this,"actionTable",this.closest("action-table"));this.addEventListeners()}connectedCallback(){this.render()}render(){const{page:e,numberOfPages:t}=this.actionTable;this.numberOfPages=t,this.page=e;const i=Number(this.getAttribute("max-buttons"))||10,n=Math.ceil(t/i);let a=this.group;a>n?a=n:a<1&&(a=1);const l=(a-1)*i+1;function p(o,u="",h){return`<button type="button" class="${e===o?`active ${u}`:`${u}`}" data-page="${o}" title="${u}">${h||o}</button>`}let g="";if(a>1&&(g+=`${p(1,"first")}${p(l-1,"prev","...")}`),t>0){for(let o=l;o<=t;o++)if(g+=p(o),o!==t&&o>=i*a){g+=`${p(o+1,"next","...")}${p(t,"last")}`;break}}const b=o=>` class="pagination-${o}"`;this.innerHTML=`<span${b("label")}></span> <span${b("buttons")}>${g}</span>`,this.changeLabel(e),this.group=a,this.maxGroups=n}changeLabel(e){const{pagination:t,rowsVisible:i}=this.actionTable,a=(this.getAttribute("label")||"Showing {rows} of {total}:").replace("{rows}",`${e*t-t+1}&ndash;${e*t}`).replace("{total}",`${i}`),l=this.querySelector("span.pagination-label");l&&(l.innerHTML=a)}addEventListeners(){this.addEventListener("click",e=>{const t=e.target;if(t instanceof HTMLButtonElement){let i=1;t.dataset.page&&(i=Number(t.dataset.page),t.classList.add("active"),this.querySelectorAll("button").forEach(l=>{l!==t&&l.classList.remove("active")}));let n=this.group;const a=l=>t.classList.contains(l);a("next")&&n++,a("prev")&&n--,a("first")&&(n=1),a("last")&&(n=this.maxGroups),this.actionTable.page=this.page=i,this.changeLabel(i),this.group!==n&&(this.group=n,this.render())}}),this.actionTable.addEventListener("action-table",e=>{const{page:t,pagination:i,numberOfPages:n}=e.detail;(t&&t!==this.page||n!==void 0&&n!==this.numberOfPages||i!==void 0)&&this.render()})}}customElements.define("action-table-pagination",$);
//# sourceMappingURL=action-table-pagination.js.map
