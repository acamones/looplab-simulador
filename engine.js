(function (global) {
  'use strict';
  const products = {
    cat: {label:'Collar de gato', price:30, mm:250, closure:20, diameter:12, letters:4, charms:2, small:true, description:'Hasta 4 letras + 2 charms pequeños incluidos.'},
    dogS: {label:'Collar de perro · S', price:40, mm:320, closure:30, diameter:15, letters:4, charms:0, description:'Hasta 4 letras incluidas.'},
    dogM: {label:'Collar de perro · M', price:45, mm:420, closure:30, diameter:15, letters:4, charms:0, description:'Hasta 4 letras incluidas.'},
    dogL: {label:'Collar de perro · L', price:50, mm:520, closure:30, diameter:15, letters:4, charms:0, description:'Hasta 4 letras incluidas.'},
    key: {label:'Llavero', price:25, mm:160, closure:0, diameter:15, letters:0, charms:2, flexible:true, description:'2 adornos incluidos: charms base, letras o uno de cada uno.'},
    phone: {label:'Phone strap', price:40, mm:280, closure:0, diameter:15, letters:0, charms:2, flexible:true, description:'2 adornos incluidos: charms base, letras o uno de cada uno. Incluye pestaña de colores.'}
  };
  function quote(state, items) {
    const p=products[state.product];
    if(!p) throw new Error('Producto no válido');
    const letters=Array.from(state.name || '');
    const charms=(state.charms||[]).map(sku=>items.find(i=>i.sku===sku));
    const diameter=state.product==='cat'?Number(state.diameter)||12:15;
    const includedLetters=p.flexible?Math.min(2,letters.length):Math.min(p.letters,letters.length);
    const availableCharmSlots=p.flexible?Math.max(0,2-includedLetters):p.charms;
    // Apply the included slots to the most expensive charms: the customer always
    // receives the same fair price regardless of selection or visual order.
    const ranked=charms.map((c,i)=>({c,i})).sort((a,b)=>(b.c?.price||0)-(a.c?.price||0));
    const included=new Set(ranked.slice(0,availableCharmSlots).map(x=>x.i));
    const charmCharges=charms.map((c,i)=>!c?0:included.has(i)?Math.max(0,c.price-(p.small?2:3)):c.price);
    const letterCharge=Math.max(0,letters.length-includedLetters)*2;
    const adornmentSpan=letters.length*15+charms.reduce((n,c)=>n+(c?.size||0),0);
    const remaining=p.mm-p.closure-adornmentSpan;
    const rounds=Math.max(0,Math.floor(remaining/diameter));
    const base=p.price,extras=letterCharge+charmCharges.reduce((a,b)=>a+b,0);
    return {p,base,extras,total:base+extras,letters,charms,diameter,rounds,includedLetters,charmCharges,remaining};
  }
  function validate(state,items) {
    const q=quote(state,items),errors=[];
    if(!/^[A-Z]*$/.test(state.name||'')) errors.push('Usa letras de la A a la Z, sin tildes ni Ñ.');
    if(q.remaining<q.diameter*2) errors.push('Esta combinación no entra en la medida. Quita alguna letra o charm.');
    if(q.charms.some(c=>!c||c.price===null)) errors.push('Hay un charm que no está disponible.');
    if(q.charms.some(c=>c&&((q.p.small&&c.size>10)||(!q.p.small&&c.size<=10)))) errors.push(q.p.small?'Para gato, elige charms pequeños.':'Los charms pequeños son exclusivos para gato.');
    const demand={};const add=sku=>{if(sku){const key=items.find(i=>i.sku===sku)?.stockGroup||sku;demand[key]=(demand[key]||0)+1;}};
    (state.beads||[]).slice(0,q.rounds).forEach(add);(state.charms||[]).forEach(add);add(state.hardware);
    q.letters.forEach(l=>{const item=items.find(i=>i.category==='Letras'&&i.color===l&&i.type===(state.letterStyle==='flat'?'Letra plana':'Letra cubo'));if(item)add(item.sku);else errors.push('La letra '+l+' no está disponible en ese estilo.');});
    if((state.beads||[]).length<q.rounds||(state.beads||[]).slice(0,q.rounds).some(sku=>!sku)) errors.push('Completa los colores de tu loop.');
    for(const sku of Object.keys(demand)){const item=items.find(i=>i.sku===sku);if(!item||demand[sku]>item.stock)errors.push('No alcanzan las piezas de '+(item?item.type+' · '+item.color:sku)+' para esta combinación.');}
    return [...new Set(errors)];
  }
  function allocateBeads(colors,count,items,pattern='alternate') {
    const chosen=[...new Set(colors)].filter(s=>items.some(i=>i.sku===s&&i.stock>0));
    const capacity=Object.fromEntries(chosen.map(s=>[s,Math.max(0,Math.floor(items.find(i=>i.sku===s).stock))]));
    if(!chosen.length)return Array(count).fill(null);
    if(pattern==='blocks'){
      const amounts=chosen.map((s,i)=>Math.min(capacity[s],Math.floor(count/chosen.length)+(i<count%chosen.length?1:0)));
      let left=count-amounts.reduce((a,b)=>a+b,0);
      while(left>0){let added=false;chosen.forEach((s,i)=>{if(left&&amounts[i]<capacity[s]){amounts[i]++;left--;added=true;}});if(!added)break;}
      return chosen.flatMap((s,i)=>Array(amounts[i]).fill(s)).concat(Array(left).fill(null));
    }
    return Array.from({length:count},(_,i)=>{
      for(let offset=0;offset<chosen.length;offset++){const s=chosen[(i+offset)%chosen.length];if(capacity[s]>0){capacity[s]--;return s;}}
      return null;
    });
  }
  const api={products,quote,validate,allocateBeads};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  global.LoopEngine=api;
})(typeof window!=='undefined'?window:globalThis);
