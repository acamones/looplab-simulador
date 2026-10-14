/* Loop Lab. Catalogue snapshot; no orders or customer data are sent by this app. */
'use strict';
const $=id=>document.getElementById(id);
const E=window.LoopEngine;
let items=[],state={product:'cat',started:false,ready:false,diameter:9,name:'',letterStyle:'cube',charms:[],beads:[],hardware:'',sequence:[],selected:'r0',colors:[]};
let editingPerla=false,drag=null,suppressPieceClickUntil=0;
const colors={Fucsia:'#dc488d',Magenta:'#b63c7d','Palo rosa':'#c89099','Rosa':'#e6a2bb','Rosa chicle':'#f188b5','Rosa pastel':'#efbfd0','Rosa pálido':'#f3d3de','Rosa sandía':'#f58094','Rosa fresa':'#f07897',Lila:'#bea3d3','Lila pastel':'#d0bfdf','Malva gris':'#b19eaf',Morado:'#8d68ac','Morado cálido':'#a870a7',Violeta:'#8c68bc',Azul:'#4684c4','Azul medio':'#63a0d3','Azul pastel':'#b3d2e9','Azul cielo':'#a5cfe9','Azul cobalto':'#3e69b1','Azul marino':'#34486e','Azul petróleo':'#437f8a',Celeste:'#a1cce0',Turquesa:'#62bec0','Verde azulado':'#5e9b9c','Verde esmeralda':'#559d83','Verde hoja':'#83a466','Verde limón':'#c3d564','Verde lima':'#c1d05c','Verde menta':'#b5d8bc','Verde olivo':'#a0ab73','Verde':'#85b783','Verde agua':'#b4d9cb','Verde pastel':'#c8dcc1','Verde oscuro':'#567b5a','Verde pistacho':'#c2d891','Verde manzana':'#a2bf6b','Verde pino':'#5d8a67',Amarillo:'#f1d36a','Amarillo pastel':'#eee0a1','Amarillo neon':'#e9ed4f',Dorado:'#c8aa62',Mango:'#ebbb66',Mostaza:'#c5a358',Anaranjado:'#eba36c',Naranja:'#eba36c',Calabaza:'#c77b4c',Canela:'#ac785e',Durazno:'#efc0a0',Terracota:'#bb816c',Cobre:'#b8866a',Ladrillo:'#ac7060',Borgoña:'#8b4a5c',Rojo:'#d45b5e','Rojo fresa':'#e87078',Arena:'#dccbb1',Beige:'#ddcdb1',Blanco:'#f1ede5','Blanco jaspeado':'#e8e5dd','Blanco perla':'#f2ede2','Crema tostado':'#d2bb9b',Crema:'#ead9bd',Gris:'#b7b4af','Gris claro':'#d4d0cb','Gris medio':'#a4a3a0','Gris oscuro':'#727570',Mármol:'#dad9d5',Nude:'#d5b9a6',Perlado:'#e8e0ce',Marrón:'#806656',Negro:'#454443'};
function hex(name){return colors[name]||'#d6b5c5';}
function money(v){return 'S/ '+Number(v).toFixed(2);}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function item(sku){return items.find(x=>x.sku===sku);}
function group(){return state.product==='cat'||state.product.startsWith('dog')?'collar':state.product;}
function q(){return E.quote(state,items);}
function baseColors(){const opts=items.filter(x=>x.category==='Cuentas'&&x.type==='Redonda base'&&x.size===q().diameter&&x.stock>0);const order=window.LoopPhotos?.orderByDiameter?.[q().diameter]||(q().diameter===12?window.LoopPhotos?.order:null);if(order){const rank=sku=>order.includes(sku)?order.indexOf(sku):order.length;opts.sort((a,b)=>rank(a.sku)-rank(b.sku));}return opts;}
function availableCharms(){return items.filter(x=>x.price!==null&&x.stock>0&&(q().p.small?x.size<=10:x.size>10)).sort((a,b)=>a.price-b.price);}
function charmModels(opts){
  const models=[...new Set(opts.map(x=>x.type))],plates=models.indexOf('Dinosaurio con placas'),neck=models.indexOf('Dinosaurio cuello largo');
  if(plates>=0&&neck>=0){models.splice(neck,1);models.splice(models.indexOf('Dinosaurio con placas')+1,0,'Dinosaurio cuello largo');}
  const vertical=models.indexOf('Texturizada vertical');
  if(models.includes('Texturizada horizontal')&&vertical>=0){models.splice(vertical,1);models.splice(models.indexOf('Texturizada horizontal')+1,0,'Texturizada vertical');}
  return models;
}
function hardwareItems(){return items.filter(x=>x.stock>0&&(state.product==='cat'?x.type==='Broche pequeño':state.product.startsWith('dog')?x.type==='Broche grande':state.product==='key'?x.type==='Herraje completo para llavero':x.type==='Mosquetón giratorio con aro'));}
function defaults(){
  editingPerla=false;state.colors=[];state.charms=[];
  state.hardware=hardwareItems()[0]?.sku||'';state.beads=[];state.sequence=[];state.selected='r0';sync();
}
function sync(){
  const info=q(),opts=baseColors();state.colors=state.colors.filter(s=>opts.some(x=>x.sku===s));
  const capacity=Object.fromEntries(opts.map(x=>[x.sku,x.stock]));
  state.beads=Array.from({length:info.rounds},(_,i)=>{
    const previous=state.beads[i];
    if(previous&&state.colors.includes(previous)&&capacity[previous]>0){capacity[previous]--;return previous;}
    if(i<state.beads.length)return null;
    const sku=state.colors.map((_,j)=>state.colors[(i+j)%state.colors.length]).find(s=>capacity[s]>0);
    if(!sku)return null;
    capacity[sku]--;return sku;
  });
  const split=Math.ceil(info.rounds/2);const ids=[];
  for(let i=0;i<split;i++)ids.push('r'+i);
  info.letters.forEach((_,i)=>ids.push('l'+i));info.charms.forEach((_,i)=>ids.push('c'+i));
  for(let i=split;i<info.rounds;i++)ids.push('r'+i);
  if(state.sequence.length!==ids.length||state.sequence.some(id=>!ids.includes(id)))state.sequence=ids;
  if(!ids.includes(state.selected))state.selected=ids[0];
}
function piece(id){let index=Number(id.slice(1));if(id[0]==='r'){let x=item(state.beads[index]);return {id,type:'round',label:x?.color||'Sin color',color:x?hex(x.color):'#ebe4da',mm:q().diameter,sku:x?.sku,empty:!x};}if(id[0]==='l')return {id,type:'letter',label:Array.from(state.name)[index]||'',color:'#f3ede1',mm:15};let x=item(state.charms[index]);return {id,type:'charm',label:x?.type||'',color:hex(x?.color),mm:x?.size||15,model:x?.type,sku:x?.sku};}
function symbol(model,fill){
  const line='#754d41';
  if(/Corazón/.test(model))return `<path d="M0 12C-24-3-20-20-9-19C-4-19 0-15 0-12C0-15 4-19 9-19C20-20 24-3 0 12Z" fill="${fill}"/>`;
  if(/Estrella/.test(model))return `<path d="M0-21 6-7 21-6 10 4 13 19 0 12-13 19-10 4-21-6-6-7Z" fill="${fill}"/>`;
  if(/Flor|Rosa/.test(model))return `<g fill="${fill}">${Array.from({length:6},(_,i)=>`<ellipse cx="0" cy="-12" rx="8" ry="11" transform="rotate(${i*60})"/>`).join('')}</g><circle r="7" fill="#edcd71"/>`;
  if(/Ojo/.test(model))return `<ellipse rx="22" ry="16" fill="${fill}"/><ellipse rx="14" ry="11" fill="#f3ede1"/><circle r="8" fill="#6395b7"/><circle r="4" fill="#452c26"/>`;
  if(/Hexagonal/.test(model))return `<path d="M-20 0-10-18 10-18 20 0 10 18-10 18Z" fill="${fill}"/><path d="M-10-18 0 0 20 0M0 0-10 18" fill="none" stroke="#fff" opacity=".25"/>`;
  if(/Lazo/.test(model))return `<path d="M-3 0-21-14-20 14ZM3 0 21-14 20 14Z" fill="${fill}"/><rect x="-5" y="-6" width="10" height="12" rx="3" fill="${fill}"/>`;
  if(/Hoja/.test(model))return `<path d="M-16 17C-28-5-7-24 20-18C25 8 6 26-16 17" fill="${fill}"/><path d="M-15 15 15-14" stroke="${line}" opacity=".4"/>`;
  if(/Cactus/.test(model))return `<path d="M-6 21V-16Q-6-26 6-16V1H13V-8Q13-16 20-8V6Q20 11 6 11V21Z M-6 7H-13Q-20 7-20 0V-8Q-20-16-13-8V0H-6" fill="${fill}"/>`;
  if(/Arco/.test(model))return `<path d="M-22 15V0A22 22 0 0 1 22 0V15" fill="none" stroke="#d8a6a9" stroke-width="8"/><path d="M-14 15V0A14 14 0 0 1 14 0V15" fill="none" stroke="#e6cb94" stroke-width="8"/><path d="M-6 15V0A6 6 0 0 1 6 0V15" fill="none" stroke="#a5ba96" stroke-width="8"/>`;
  if(/Fresa/.test(model))return '<path d="M-17-12Q0-22 17-12Q23-3 0 22Q-23-3-17-12" fill="#d97581"/><path d="M-13-15 0-8 13-15 0-21Z" fill="#809969"/><g fill="#f5dbaf"><circle cx="-8" cy="-2" r="1.5"/><circle cx="6" cy="-1" r="1.5"/><circle cx="0" cy="10" r="1.5"/></g>';
  if(/Luna/.test(model))return `<path d="M13-19A21 21 0 1 0 18 14A19 19 0 0 1 13-19" fill="${fill}"/>`;
  if(/Nube/.test(model))return `<path d="M-19 13Q-30 0-15-5Q-13-26 4-14Q20-22 20-5Q33 0 20 13Z" fill="${fill}"/>`;
  if(/Trébol/.test(model))return `<g fill="${fill}"><circle cx="-9" cy="-8" r="11"/><circle cx="9" cy="-8" r="11"/><circle cx="-9" cy="8" r="11"/><circle cx="9" cy="8" r="11"/><rect x="-2" y="8" width="5" height="18"/></g>`;
  if(/Texturizada|Glow|Redonda/.test(model))return `<circle r="20" fill="${fill}"/>${/Texturizada/.test(model)?'<path d="M-12-15Q-22 0-12 15M-3-19Q-12 0-3 19M7-18Q0 0 7 18M15-12Q11 0 15 12" fill="none" stroke="#fff" opacity=".5"/>':/sprinkles/.test(model)?'<g stroke-width="3"><path d="M-8-8-4-5M5 4 9 7" stroke="#d781a0"/><path d="M7-10 10-7M-12 4-9 7" stroke="#79aa9b"/></g>':''}`;
  if(/Oso|Mickey|Alien|Pato|Dinosaurio/.test(model))return `<circle cx="-13" cy="-14" r="9" fill="${fill}"/><circle cx="13" cy="-14" r="9" fill="${fill}"/><ellipse rx="21" ry="19" fill="${fill}"/><circle cx="-7" cy="-2" r="2" fill="${line}"/><circle cx="7" cy="-2" r="2" fill="${line}"/><path d="M-5 8Q0 12 5 8" fill="none" stroke="${line}" stroke-width="2"/>`;
  const glyph={'Hamburguesa':'🍔','Hot dog':'🌭','Mimpao':'🥟','Papitas':'🍟','Pizza':'🍕','Pollo frito':'🍗'}[model];
  if(glyph)return `<text y="11" text-anchor="middle" font-size="35">${glyph}</text>`;
  return `<circle r="20" fill="${fill}"/>`;
}
function charmPhoto(sku,standalone=false){
  const photo=window.LoopPhotos?.charms?.[sku];if(!photo)return '';
  const source=window.LoopPhotos.images.find(i=>i.id===photo.imageId);
  const image=standalone?`<image href="${source.source}" width="${source.width}" height="${source.height}"/>`:`<use href="#${photo.imageId}"/>`;
  return `<svg data-real-charm-photo="${sku}" x="-19" y="-19" width="38" height="38" style="width:38px;height:38px;overflow:hidden" viewBox="${photo.left} ${photo.top} ${photo.width} ${photo.height}" preserveAspectRatio="xMidYMid meet" overflow="hidden">${image}</svg>`;
}
function renderPiece(p,x,y,scale,selected){
  const photo=p.type==='round'&&window.LoopPhotos?.beads[p.sku];
  let content=p.type==='round'?`<circle r="19" fill="${p.color}"/><circle cx="-6" cy="-7" r="7" fill="#fff" opacity=".13"/>`:p.type==='letter'?`<rect x="-19" y="-19" width="38" height="38" rx="${state.letterStyle==='flat'?12:6}" fill="${p.color}" stroke="#cdbdaf" stroke-width="1"/><text text-anchor="middle" y="8" font-size="26" font-family="Arial,sans-serif" fill="#452c26">${esc(p.label)}</text>`:symbol(p.model,p.color);
  if(photo)content=`<g data-real-photo="${p.sku}" clip-path="url(#photo-circle)"><use href="#${photo.imageId||'photo-source'}" transform="scale(${19/photo.radius}) translate(${-photo.x} ${-photo.y})"/></g>`;
  else if(p.type==='charm'&&window.LoopPhotos?.charms?.[p.sku])content=charmPhoto(p.sku);
  return `<g data-piece="${p.id}" data-x="${x.toFixed(2)}" data-y="${y.toFixed(2)}" role="button" tabindex="0" aria-label="${esc(p.type==='letter'?'Letra '+p.label:p.label)}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(3)})"><title>${esc(p.label)}</title>${selected?'<circle r="27" fill="none" stroke="#221613" stroke-width="2" stroke-dasharray="3 3"/>':''}${content}<circle r="25" fill="transparent"/></g>`;
}
function previewSVG(forExport=false){
  const info=q(),parts=state.sequence.map(piece);let svg='<defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#452c26" flood-opacity=".12"/></filter></defs>';
  if(window.LoopPhotos){const needed=new Set(parts.map(p=>{const photo=p.type==='round'?window.LoopPhotos.beads[p.sku]:window.LoopPhotos.charms?.[p.sku];return photo?.imageId||(photo?'photo-source':null);}));const photos=(window.LoopPhotos.images||[{id:'photo-source',source:window.LoopPhotos.source,width:window.LoopPhotos.width,height:window.LoopPhotos.height}]).filter(p=>needed.has(p.id));svg+=`<defs><clipPath id="photo-circle"><circle r="19"/></clipPath>${photos.map(p=>`<image id="${p.id}" href="${p.source}" width="${p.width}" height="${p.height}"/>`).join('')}</defs>`;}
  svg+='<rect width="500" height="500" fill="#fffaf3"/>';
  const hc='#b6aba0',totalSpan=parts.reduce((n,p)=>n+p.mm,0)||1;
  if(state.product==='key'){
    // Both cable ends attach to the upper ring, matching the actual keychain.
    // The beads run down the left side, round the bottom, and back up the right.
    const path='M225 185C165 230 150 380 250 405C350 380 335 230 275 185';
    svg+=`<path data-keychain-loop="true" d="${path}" fill="none" stroke="#b6aba0" stroke-width="2"/>`;
    const arc=[];let distance=0,previous;
    const curves=[[[225,185],[165,230],[150,380],[250,405]],[[250,405],[350,380],[335,230],[275,185]]];
    curves.forEach((c,j)=>{for(let i=j?1:0;i<=360;i++){const t=i/360,u=1-t,point={x:u*u*u*c[0][0]+3*u*u*t*c[1][0]+3*u*t*t*c[2][0]+t*t*t*c[3][0],y:u*u*u*c[0][1]+3*u*u*t*c[1][1]+3*u*t*t*c[2][1]+t*t*t*c[3][1]};if(previous)distance+=Math.hypot(point.x-previous.x,point.y-previous.y);arc.push({...point,distance});previous=point;}});
    const factor=Math.min(5,distance/totalSpan);let cursor=0;
    parts.forEach(p=>{const target=(cursor+p.mm/2)/totalSpan*distance,point=arc.find(a=>a.distance>=target)||arc.at(-1);svg+=renderPiece(p,point.x,point.y,p.mm*factor/38,!forExport&&p.id===state.selected);cursor+=p.mm;});
    svg+=`<g data-keychain-hardware="true"><rect x="235" y="20" width="30" height="49" rx="13" fill="none" stroke="${hc}" stroke-width="6"/><path d="M250 70V78" stroke="${hc}" stroke-width="8"/><circle cx="250" cy="112" r="35" fill="none" stroke="${hc}" stroke-width="6"/><path data-cable-end="left" d="M232 140C237 123 226 129 224 143L221 166L225 185" fill="none" stroke="#59544e" stroke-width="3"/><path data-cable-end="right" d="M268 140C263 123 274 129 276 143L279 166L275 185" fill="none" stroke="#59544e" stroke-width="3"/><rect x="220" y="161" width="10" height="25" rx="2" fill="#b6aba0" transform="rotate(14 225 173)"/><rect x="270" y="161" width="10" height="25" rx="2" fill="#b6aba0" transform="rotate(-14 275 173)"/></g>`;
  }else{
    const phone=state.product==='phone',rx=phone?88:170,ry=phone?144:170,cy=phone?260:265;
    svg+=`<ellipse cx="250" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#b6aba0" stroke-width="2"/>`;
    const arc=[];let distance=0,previous;for(let i=0;i<=720;i++){let angle=-Math.PI/2-.04-i/720*(Math.PI*2-.08),point={x:250+rx*Math.cos(angle),y:cy+ry*Math.sin(angle)};if(previous)distance+=Math.hypot(point.x-previous.x,point.y-previous.y);arc.push({...point,distance});previous=point;}
    const factor=Math.min(5,distance/(totalSpan+info.p.closure));
    let cursor=0;parts.forEach(p=>{const target=(cursor+p.mm/2)/totalSpan*distance;let point=arc.find(a=>a.distance>=target)||arc.at(-1);svg+=renderPiece(p,point.x,point.y,p.mm*factor/38,!forExport&&p.id===state.selected);cursor+=p.mm;});
    if(phone)svg+=`<rect x="225" y="40" width="50" height="45" rx="8" fill="${hc}"/><path d="M246 84V109Q250 115 254 109V84" fill="none" stroke="#aaa49b" stroke-width="5"/><rect x="240" y="98" width="20" height="34" rx="8" fill="none" stroke="${hc}" stroke-width="5"/>`;
    else svg+=`<rect x="227" y="${cy-ry-10}" width="46" height="23" rx="6" fill="${hc}"/><path d="M250 ${cy-ry-9}V${cy-ry+12}" stroke="#fffaf3" stroke-width="2"/>`;
  }
  if(forExport)svg+=`<rect y="458" width="500" height="42" fill="#f7f2e8"/><text x="22" y="485" font-size="17" font-family="Arial,sans-serif" fill="#452c26">loop lab · ${esc(info.p.label)}</text><text x="478" y="485" text-anchor="end" font-size="17" font-family="Arial,sans-serif" fill="#452c26">${money(info.total)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" role="img" aria-label="Simulación de ${esc(info.p.label)} personalizado">${svg}</svg>`;
}
function renderPalette(){
  const opts=baseColors(),selected=piece(state.selected);
  $('photo-test').hidden=!opts.some(x=>window.LoopPhotos?.beads[x.sku]);
  $('photo-test').textContent=`Probar una combinación · ${q().diameter} mm`;
  const canPaint=!editingPerla||selected.type==='round';
  const usedOther=sku=>state.beads.filter((s,i)=>s===sku&&i!==Number(state.selected?.slice(1))).length;
  const colorAllowed=x=>canPaint&&(!editingPerla||usedOther(x.sku)<x.stock);
  $('color-mode').value=editingPerla?'piece':'all';
  $('color-combination').hidden=editingPerla;
  $('paint-all').hidden=editingPerla;
  const isChosen=x=>editingPerla?selected.sku===x.sku:state.colors.includes(x.sku);
  $('palette').innerHTML=opts.map(x=>`<button type="button" class="swatch ${isChosen(x)?'selected-color':''}" style="--swatch:${window.LoopPhotos?.beads[x.sku]?.color||hex(x.color)};--mark:${['Negro','Borgoña','Morado','Violeta','Azul marino','Marrón'].includes(x.color)?'#fffaf3':'#452c26'}" data-color="${x.sku}" ${colorAllowed(x)?'':'disabled'} aria-label="${esc(x.color)} · ${x.stock} disponibles" title="${esc(x.color)} · ${x.stock} disponibles" aria-pressed="${isChosen(x)}"></button>`).join('');
  $('paint-label').textContent=editingPerla?(canPaint?'Perla '+(state.sequence.indexOf(state.selected)+1)+' · '+selected.label:'Selecciona una perla en el loop'):state.colors.length?state.colors.length+' '+(state.colors.length===1?'color elegido':'colores elegidos'):'Elige tus colores';
  $('color-note').textContent=editingPerla?'Elige un color: solo cambia la perla resaltada. Puedes tocar otra perla para editarla.':'Elige uno o varios colores. Toca un color para añadirlo y vuelve a tocarlo para quitarlo.';
  $('paint-all').disabled=!state.colors.length;
  $('piece-color-field').hidden=selected.type!=='round';
  $('piece-color').innerHTML='<option value="">Sin color</option>'+opts.map(x=>`<option value="${x.sku}" ${usedOther(x.sku)>=x.stock?'disabled':''}>${esc(x.color)}</option>`).join('');
  $('piece-color').value=selected.sku||'';
}
function paintSelectedPiece(sku){
  if(state.selected?.[0]!=='r'||(sku&&!baseColors().some(x=>x.sku===sku)))return;
  const index=Number(state.selected.slice(1)),used=state.beads.filter((s,i)=>s===sku&&i!==index).length;
  if(sku&&used>=item(sku).stock){toast('Ya usaste las '+item(sku).stock+' perlas disponibles de '+item(sku).color+'. Elige otro color.');return;}
  if(sku&&!state.colors.includes(sku))state.colors.push(sku);
  state.beads[Number(state.selected.slice(1))]=sku||null;render();
}
function reorderPiece(id,target){
  const from=state.sequence.indexOf(id);
  if(from<0||target<0||target>=state.sequence.length||from===target)return false;
  state.sequence.splice(from,1);state.sequence.splice(target,0,id);return true;
}
function bindPieceGestures(){
  const preview=$('preview');
  function activate(){if(!drag||drag.active)return;drag.active=true;state.selected=drag.id;preview.classList.add('is-dragging');drag.element?.classList.add('piece-in-hand');if(drag.element?.parentNode)drag.element.parentNode.appendChild(drag.element);}
  function paintDrag(){
    if(!drag?.active)return;drag.frame=null;
    state.sequence.forEach((id,i)=>{const node=drag.nodes.get(id),slot=drag.slots[i];if(!node||!slot)return;
      const x=id===drag.id&&drag.point?drag.point.x:slot.x,y=id===drag.id&&drag.point?drag.point.y:slot.y;
      node.element.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)}) ${node.scale}`);
    });
  }
  function finish(e,cancel=false){
    if(!drag||e.pointerId!==drag.pointerId)return;
    const ended=drag;clearTimeout(ended.timer);if(ended.frame!==null)cancelAnimationFrame(ended.frame);drag=null;preview.classList.remove('is-dragging');
    if(cancel&&ended.active)state.sequence=ended.original;
    suppressPieceClickUntil=Date.now()+600;
    if(ended.moved)$('piece-status').textContent=cancel?'Movimiento cancelado.':'Pieza ubicada en la posición '+(state.sequence.indexOf(ended.id)+1)+'.';
    if(!cancel&&!ended.moved){state.selected=ended.id;}
    if(preview.hasPointerCapture?.(e.pointerId))preview.releasePointerCapture(e.pointerId);
    render();
  }
  preview.addEventListener('pointerdown',e=>{
    if(!state.ready||drag||e.isPrimary===false||(e.button!==undefined&&e.button!==0))return;
    const g=e.target.closest('[data-piece]'),svg=preview.querySelector('svg');if(!g||!svg)return;
    const matrix=svg.getScreenCTM();if(!matrix)return;
    const inverse=matrix.inverse();
    const pieces=Array.from(svg.querySelectorAll('[data-piece]'));
    const slots=pieces.map(el=>({x:Number(el.dataset.x),y:Number(el.dataset.y)}));
    const nodes=new Map(pieces.map(el=>[el.dataset.piece,{element:el,scale:el.getAttribute('transform').match(/scale\([^)]*\)/)?.[0]||'scale(1)'}]));
    const element=nodes.get(g.dataset.piece)?.element;
    drag={id:g.dataset.piece,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,inverse,slots,nodes,element,original:[...state.sequence],active:false,moved:false,frame:null,point:null};
    preview.setPointerCapture(e.pointerId);
    drag.timer=setTimeout(activate,120);
  });
  preview.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.pointerId)return;
    const distance=Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY);
    if(!drag.active&&distance<4)return;
    if(!drag.active){clearTimeout(drag.timer);activate();}
    if(distance>=4)drag.moved=true;
    e.preventDefault();
    const m=drag.inverse,x=m.a*e.clientX+m.c*e.clientY+m.e,y=m.b*e.clientX+m.d*e.clientY+m.f;
    drag.point={x,y};
    let nearest=0,best=Infinity;drag.slots.forEach((p,i)=>{const d=(p.x-x)**2+(p.y-y)**2;if(d<best){best=d;nearest=i;}});
    reorderPiece(drag.id,nearest);
    if(drag.frame===null)drag.frame=requestAnimationFrame(paintDrag);
  });
  preview.addEventListener('pointerup',e=>finish(e));
  preview.addEventListener('pointercancel',e=>finish(e,true));
  preview.addEventListener('contextmenu',e=>{if(drag||e.target.closest('[data-piece]'))e.preventDefault();});
  preview.addEventListener('lostpointercapture',e=>finish(e,true));
}
function renderCharms(){
  const opts=availableCharms(),models=charmModels(opts);const previous=$('charm-model').value;
  $('charm-model').innerHTML='<option value="">Elige un charm</option>'+models.map(type=>`<option value="${esc(type)}">${esc(type)}</option>`).join('');if(models.includes(previous))$('charm-model').value=previous;
  renderVariants();
}
function renderVariants(){
  const opts=availableCharms().filter(x=>x.type===$('charm-model').value),prev=$('charm-variant').value;
  $('charm-variant').innerHTML='<option value="">Elige una variante</option>'+opts.map(x=>`<option value="${x.sku}">${esc(x.color||'Única')}</option>`).join('');if(opts.some(x=>x.sku===prev))$('charm-variant').value=prev;renderCharmChoice();
}
function galleryPhoto(c){
  const paths={'photo-charms-small-01':'charms-small-neutral-01.webp','photo-charms-small-02':'charms-small-neutral-02.webp','photo-charms-large-01':'charms-large-neutral-01.webp','photo-charms-large-02':'charms-large-neutral-02.webp','photo-charms-large-03':'charms-large-neutral-03.webp','photo-charms-large-04':'charms-large-neutral-04.webp','photo-charms-large-05':'charms-large-neutral-05.webp','photo-charms-large-06':'charms-large-neutral-06.webp'};
  const photo=window.LoopPhotos?.charms?.[c.sku],atlas=window.LoopPhotos?.images?.find(x=>x.id===photo?.imageId);
  if(photo&&atlas&&paths[photo.imageId])return `<svg aria-hidden="true" viewBox="${photo.left} ${photo.top} ${photo.width} ${photo.height}" preserveAspectRatio="xMidYMid meet"><image href="./assets/${paths[photo.imageId]}" width="${atlas.width}" height="${atlas.height}"/></svg>`;
  return `<svg aria-hidden="true" viewBox="-30 -30 60 60">${symbol(c.type,hex(c.color))}</svg>`;
}
function charmCostLabel(c){
  const charms=[...state.charms],replace=$('charm-action').value==='replace'&&charms.length>0;
  if(replace)charms[Number($('charm-target').value)||0]=c.sku;else charms.push(c.sku);
  const delta=E.quote({...state,charms},items).total-q().total;
  return delta===0?(replace?'Sin costo extra':'Incluido'):delta<0?'Baja '+money(-delta):delta<c.price?'Mejora +'+money(delta):'Extra +'+money(delta);
}
function renderCharmGallery(){
  const opts=availableCharms(),models=charmModels(opts),model=$('charm-model').value;
  $('change-charm-model').hidden=!model;
  $('charm-model-gallery').classList.toggle?.('has-model',!!model);
  $('charm-model-gallery').innerHTML=(model?models.filter(type=>type===model):models).map(type=>{
    const c=opts.find(x=>x.type===type),labels=[...new Set(opts.filter(x=>x.type===type).map(charmCostLabel))];
    return `<button type="button" class="charm-card" data-charm-model="${esc(type)}" aria-pressed="${type===model}">${galleryPhoto(c)}<strong>${esc(type)}</strong><small>${esc(labels.length===1?labels[0]:'Costo según variante')}</small></button>`;
  }).join('');
  $('charm-variant-panel').hidden=!model;
  $('charm-availability').hidden=!opts.some(c=>c.type===model&&c.colorAvailability);
  $('charm-variant-panel').querySelector('h3').textContent=model?'Elige el color de '+model:'Elige el color';
  $('charm-variant-gallery').innerHTML=opts.filter(x=>x.type===model).map(c=>{
    const stockKey=c.stockGroup||c.sku,used=state.charms.filter(s=>(item(s)?.stockGroup||s)===stockKey).length,replace=$('charm-action').value==='replace'&&(item(state.charms[Number($('charm-target').value)||0])?.stockGroup||state.charms[Number($('charm-target').value)||0])===stockKey,unavailable=used>=c.stock&&!replace;
    return `<button type="button" class="charm-card" data-charm-variant="${c.sku}" aria-pressed="${c.sku===$('charm-variant').value}" ${unavailable?'disabled':''}>${galleryPhoto(c)}<strong>${esc(c.color||'Única')}</strong><small>${unavailable?'Sin unidades disponibles':esc(charmCostLabel(c))}</small></button>`;
  }).join('');
}
function charmEdit(){
  const charms=[...state.charms],replace=$('charm-action').value==='replace'&&charms.length>0;
  const target=Number($('charm-target').value)||0,sku=$('charm-variant').value;
  if(replace)charms[target]=sku;else charms.push(sku);
  return {charms,replace};
}
function renderCharmChoice(){
  renderCharmGallery();
  const c=item($('charm-variant').value),current=q();
  $('charm-choice').hidden=!c;$('charm-actions').hidden=!c||!state.charms.length;
  if(!c){$('add-charm').disabled=true;return;}
  if(!$('charm-action').value)$('charm-action').value='add';
  const previous=$('charm-target').value;
  $('charm-target').innerHTML=current.charms.map((x,i)=>`<option value="${i}">${i+1}. ${esc(x.type)} · ${esc(x.color)}</option>`).join('');
  $('charm-target').value=Number(previous)<state.charms.length?previous||'0':'0';
  const edit=charmEdit(),next=E.quote({...state,charms:edit.charms},items),delta=next.total-current.total;
  $('charm-target-field').hidden=!edit.replace;
  $('add-charm').disabled=!edit.replace&&state.charms.length>=8;
  $('charm-icon').innerHTML=`<svg viewBox="-30 -30 60 60">${charmPhoto(c.sku,true)||symbol(c.type,hex(c.color))}</svg>`;$('charm-title').textContent=c.type;
  $('charm-price').textContent=edit.replace?(delta===0?'Cambio sin costo extra':delta<0?'Tu total baja '+money(-delta):'Cambio · +'+money(delta)):
    delta===0?'Incluido · sin costo extra':delta<c.price?'Mejora del adorno incluido · +'+money(delta):'Adorno adicional · +'+money(delta);
  $('add-charm').textContent=edit.replace?'Cambiar charm':delta===0?'+ Agregar incluido':'+ Agregar extra';
}
function renderHardware(){const opts=hardwareItems();if(!opts.some(x=>x.sku===state.hardware))state.hardware=opts[0]?.sku||'';}
function render(){
  for(const id of ['color-step','name-step','charm-step','total-section','piece-editor'])$(id).hidden=!state.ready;
  $('gesture-note').hidden=!state.ready;
  $('size-field').hidden=!state.started||group()!=='collar';$('diameter-field').hidden=!state.ready||state.product!=='cat';$('included').hidden=!state.ready;$('pet-note').hidden=!state.ready||group()!=='collar';
  document.querySelectorAll('[data-product]').forEach(b=>b.setAttribute('aria-pressed',String(state.started&&b.dataset.product===group())));
  if(!state.ready){$('preview-label').textContent='Tu próximo loop';$('preview-count').textContent='';$('preview').innerHTML='<div class="empty-preview"><span class="eyebrow">HECHO A TU MANERA</span><h2>Todo empieza<br>con tu elección.</h2><p>'+(state.started?'Elige la mascota y la medida de su collar.':'¿Collar, llavero o phone strap?')+'</p></div>';$('size').value='';$('download').hidden=true;$('order').disabled=true;return;}
  $('download').hidden=false;
  sync();const info=q();$('preview-label').textContent=info.p.label;$('preview').innerHTML=previewSVG();$('preview-count').textContent=info.p.mm/10+' cm'+(group()==='collar'?' de collar':' aprox. · perímetro del loop');
  document.querySelectorAll('[data-product]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.product===group())));
  $('size-field').hidden=group()!=='collar';$('diameter-field').hidden=state.product!=='cat';$('pet-note').hidden=group()!=='collar';$('size').value=group()==='collar'?state.product:'cat';$('diameter').value=String(state.diameter);
  $('included').textContent=info.p.description;$('letter-note').textContent='Letras A–Z, sin Ñ. '+(info.p.flexible?'Las primeras 2 letras pueden ocupar los adornos incluidos.':'Hasta 4 letras incluidas.')+' Letras adicionales: S/2 cada una.';
  $('charm-note').textContent=info.p.small?'Incluye 2 charms pequeños. Cada pequeño adicional cuesta S/2.':info.p.flexible?'Incluye 2 adornos: charms base, letras o uno de cada uno. Las letras también ocupan estos espacios. Mejoras: intermedio +S/1; premium +S/2.':'Charms adicionales: base S/3, intermedio S/4 y premium S/5.';
  $('selected-charms').innerHTML=info.charms.map((c,i)=>{const charge=info.charmCharges[i],label=charge===0?'Incluido':charge<c.price?'Mejora +'+money(charge):'Extra +'+money(charge);return `<span class="charm-chip">${esc(c?.type||'Charm')} · ${esc(c?.color||'')} · ${label} <button type="button" data-remove="${i}" aria-label="Quitar ${esc(c?.type||'charm')}">×</button></span>`;}).join('');
  $('position').innerHTML=state.sequence.map((id,i)=>`<option value="${id}">${i+1}. ${esc(piece(id).type==='letter'?'Letra '+piece(id).label:piece(id).label)}</option>`).join('');$('position').value=state.selected;$('position-label').textContent=state.sequence.length+' piezas';
  const pos=state.sequence.indexOf(state.selected);$('move-left').disabled=pos<=0;$('move-right').disabled=pos>=state.sequence.length-1;
  renderPalette();renderStockGuidance();renderHardware();renderCharmChoice();const errors=E.validate(state,items);$('errors').innerHTML=errors.map(e=>'<p>'+esc(e)+'</p>').join('');$('order').disabled=!!errors.length;
  $('base-price').textContent=money(info.base);$('extras-price').textContent=money(info.extras);$('total-price').textContent=money(info.total);
  $('download').disabled=!!errors.length;
}
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,3500);}
function summary(){
  const info=q(),parts=state.sequence.map(piece),name=state.name?state.name+' ('+(state.letterStyle==='flat'?'letras planas':'letras cúbicas')+')':'Sin letras';
  return 'Hola, Loop Lab 🩷 Quiero armar este diseño:\n\n'+info.p.label+'\nMedida: '+info.p.mm/10+' cm'+(group()==='collar'?'':' de perímetro del loop aprox.')+'\nNombre: '+name+'\nColores base: '+[...new Set(state.beads.map(s=>item(s)?.color))].join(', ')+'\nCharms: '+(info.charms.map(c=>c.type+' · '+c.color+(c.colorAvailability?' (color sujeto a disponibilidad)':'')+' ['+c.sku+']').join('; ')||'Sin charms')+'\n\nOrden de las piezas:\n'+parts.map((p,i)=>(i+1)+'. '+(p.type==='letter'?'Letra '+p.label:p.label)+(p.sku?' ['+p.sku+']':'')).join('\n')+'\n\nBase: '+money(info.base)+'\nExtras: '+money(info.extras)+'\nTotal del diseño: '+money(info.total)+'\n\n¿Me confirman disponibilidad, medida final y costo de envío?';
}
async function imageBlob(){const svg=previewSVG(true),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{const img=new Image();await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=url;});const canvas=document.createElement('canvas');canvas.width=1500;canvas.height=1500;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,1500,1500);return await new Promise((ok,no)=>canvas.toBlob(b=>b?ok(b):no(new Error('No se pudo crear la imagen')),'image/png'));}finally{URL.revokeObjectURL(url);}}
async function download(){try{const blob=await imageBlob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mi-loop-'+state.product+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);toast('Imagen lista para guardar.');}catch{toast('No pudimos guardar la imagen. Prueba con una captura de pantalla.');}}
async function copyInstagramLink(){
  $('instagram-link-field').hidden=false;
  try{await navigator.clipboard.writeText('https://ig.me/m/looplab_pe');toast('Enlace copiado. Pégalo en Safari o Chrome para abrir el chat de Loop Lab.');}
  catch{$('instagram-link').focus();$('instagram-link').select();toast('Mantén presionado el enlace para copiarlo y abrirlo en tu navegador.');}
}
async function copyOrder(){try{await navigator.clipboard.writeText(summary());toast('Pedido copiado. Guarda la imagen del loop y adjúntala al pegar el resumen en Instagram.');}catch{$('order-text').focus();$('order-text').select();toast('Mantén presionado el resumen y elige Copiar. Luego abre el chat de @looplab_pe.');}}
function changeProduct(product){state.started=true;state.ready=product!=='collar';state.product=product==='collar'?'cat':product;if(state.product==='cat')state.diameter=9;state.name='';$('name').value='';$('charm-model').value='';$('charm-variant').value='';$('charm-action').value='';defaults();renderCharms();render();}
function mixColors(){state.beads=E.allocateBeads(state.colors,q().rounds,items,$('pattern').value);}
function renderStockGuidance(){
  const info=q(),used=Object.fromEntries(state.colors.map(s=>[s,state.beads.filter(x=>x===s).length]));
  $('stock-guide').hidden=!state.colors.length;
  const total=state.colors.reduce((n,s)=>n+(item(s)?.stock||0),0),shortage=Math.max(0,info.rounds-total);
  $('stock-usage').textContent=state.colors.map(s=>`${item(s)?.color}: ${used[s]||0} de ${item(s)?.stock||0} disponibles`).join(' · ');
  $('stock-message').textContent=shortage?`Con estos colores puedes completar ${Math.min(total,info.rounds)} de ${info.rounds} perlas. Agrega otro color para completar las ${shortage} que faltan.`:'Tu combinación respeta las perlas disponibles.';
  const suggested=shortage?baseColors().filter(x=>!state.colors.includes(x.sku)&&x.stock>=shortage).slice(0,3):[];
  $('stock-suggestions').innerHTML=suggested.map(x=>`<button type="button" data-combine="${x.sku}">Combinar con ${esc(x.color)}</button>`).join('');
}
function bind(){
  $('stock-suggestions').addEventListener('click',e=>{const b=e.target.closest('[data-combine]');if(!b)return;const sku=b.dataset.combine;if(!baseColors().some(x=>x.sku===sku))return;if(!state.colors.includes(sku))state.colors.push(sku);editingPerla=false;mixColors();render();});
  $('photo-test').addEventListener('click',()=>{editingPerla=false;state.colors=(window.LoopPhotos?.demoByDiameter?.[q().diameter]||window.LoopPhotos?.demo||Object.keys(window.LoopPhotos?.beads||{})).filter(sku=>baseColors().some(i=>i.sku===sku));mixColors();render();});
  document.querySelectorAll('[data-product]').forEach(b=>b.addEventListener('click',()=>changeProduct(b.dataset.product)));
  $('size').addEventListener('change',e=>{if(e.target.value)changeProduct(e.target.value);});$('diameter').addEventListener('change',e=>{state.diameter=Number(e.target.value);defaults();renderCharms();render();});
  $('name').addEventListener('input',e=>{const start=e.target.selectionStart;state.name=e.target.value.toUpperCase();e.target.value=state.name;if(start!==null)e.target.setSelectionRange(start,start);render();});
  $('letter-style').addEventListener('change',e=>{state.letterStyle=e.target.value;render();});
  $('palette').addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(!b)return;const sku=b.dataset.color;if(editingPerla){paintSelectedPiece(sku);return;}state.colors=state.colors.includes(sku)?state.colors.filter(s=>s!==sku):[...state.colors,sku];mixColors();render();});
  $('paint-all').addEventListener('click',()=>{const selected=piece(state.selected),sku=selected.type==='round'&&selected.sku?selected.sku:state.colors.at(-1);if(!sku)return;state.colors=[sku];mixColors();render();});
  $('pattern').addEventListener('change',()=>{mixColors();render();});
  $('piece-color').addEventListener('change',e=>paintSelectedPiece(e.target.value));
  $('color-mode').addEventListener('change',e=>{editingPerla=e.target.value==='piece';if(editingPerla&&state.selected?.[0]!=='r')state.selected=state.sequence.find(id=>id[0]==='r')||state.selected;render();});
  $('position').addEventListener('change',e=>{state.selected=e.target.value;render();});
  function selectPiece(e){if(e.type!=='keydown'&&Date.now()<suppressPieceClickUntil)return;const g=e.target.closest('[data-piece]');if(g){state.selected=g.dataset.piece;render();}}
  bindPieceGestures();$('preview').addEventListener('click',selectPiece);$('preview').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectPiece(e);}});
  function move(delta){const pos=state.sequence.indexOf(state.selected),next=pos+delta;if(next<0||next>=state.sequence.length)return;[state.sequence[pos],state.sequence[next]]=[state.sequence[next],state.sequence[pos]];render();}
  $('move-left').addEventListener('click',()=>move(-1));$('move-right').addEventListener('click',()=>move(1));
  $('change-charm-model').addEventListener('click',()=>{$('charm-model').value='';$('charm-variant').value='';$('charm-action').value='';renderVariants();});
  $('charm-model-gallery').addEventListener('click',e=>{const b=e.target.closest('[data-charm-model]');if(!b)return;$('charm-model').value=b.dataset.charmModel;$('charm-variant').value='';$('charm-action').value='';renderVariants();$('charm-variant-panel').scrollIntoView?.({block:'nearest',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
  $('charm-variant-gallery').addEventListener('click',e=>{const b=e.target.closest('[data-charm-variant]');if(!b||b.disabled)return;$('charm-variant').value=b.dataset.charmVariant;renderCharmChoice();});
  $('charm-model').addEventListener('change',()=>{$('charm-action').value='';renderVariants();});
  $('charm-variant').addEventListener('change',()=>{$('charm-action').value='';renderCharmChoice();});
  $('charm-action').addEventListener('change',renderCharmChoice);$('charm-target').addEventListener('change',renderCharmChoice);
  $('add-charm').addEventListener('click',()=>{
    if(!item($('charm-variant').value))return;
    const edit=charmEdit();if(!edit.replace&&state.charms.length>=8){toast('Puedes combinar hasta 8 charms, según la medida.');return;}
    state.charms=edit.charms;$('charm-model').value='';$('charm-variant').value='';$('charm-action').value='';renderCharms();render();
  });
  $('selected-charms').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(b){state.charms.splice(Number(b.dataset.remove),1);state.sequence=[];render();}});
  $('copy-instagram-link').addEventListener('click',copyInstagramLink);
  $('download').addEventListener('click',download);$('save-order-image').addEventListener('click',download);$('order').addEventListener('click',()=>{if(E.validate(state,items).length)return;$('order-text').value=summary();$('order-dialog').showModal();});$('close-dialog').addEventListener('click',()=>$('order-dialog').close());$('copy-order').addEventListener('click',copyOrder);
  $('share-order').addEventListener('click',async()=>{if(!navigator.share){await copyOrder();return;}try{const blob=await imageBlob(),file=new File([blob],'mi-loop.png',{type:'image/png'});if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'Mi diseño Loop Lab',text:summary()});else await navigator.share({title:'Mi diseño Loop Lab',text:summary()});}catch(e){if(e.name!=='AbortError')toast('Usa Copiar pedido o guarda la imagen para enviarla.');}});
}
async function init(){try{const response=await fetch('./catalog.json');if(!response.ok)throw new Error('Catálogo');const data=await response.json();items=data.items;defaults();bind();renderCharms();render();}catch(e){$('preview').innerHTML='<p class="loading">No pudimos cargar los materiales.<br>Recarga la página para intentarlo otra vez.</p>';$('order').disabled=true;$('download').disabled=true;}}
init();
