var m=Object.defineProperty;var a=(n,e,t)=>e in n?m(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var o=(n,e,t)=>(a(n,typeof e!="symbol"?e+"":e,t),t);import"./index.js";import"./action-table-switch.js";import"./action-table.js";import"./action-table-filters.js";import"./action-table-pagination.js";class i extends HTMLElement{constructor(){super();o(this,"randomNumber");const t=this.attachShadow({mode:"open"});this.randomNumber=Math.floor(Math.random()*10)+1,t.innerHTML=`${this.randomNumber}`,this.dispatch(this.randomNumber.toString()),this.addEventListener("click",()=>{this.randomNumber=Math.floor(Math.random()*10)+1,t.innerHTML=`${this.randomNumber}`,this.dispatch(this.randomNumber.toString())})}dispatch(t){const r=new CustomEvent("action-table-update",{detail:t,bubbles:!0});this.dispatchEvent(r)}}customElements.define("random-number",i);
//# sourceMappingURL=main.js.map