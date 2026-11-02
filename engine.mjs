export function validateDeck(d){
 if(!d||typeof d.title!=='string'||!d.title.trim()||!Array.isArray(d.categories)||!d.categories.length)throw Error('Нужны название набора и массив categories.');
 const labels=new Set();const ids=new Set();
 for(const c of d.categories){
  if(!c||typeof c.id!=='string'||!c.id||ids.has(c.id)||typeof c.label!=='string'||!c.label.trim()||labels.has(c.label.trim()))throw Error('У каждой категории должны быть уникальные id и название.');
  ids.add(c.id);labels.add(c.label.trim());
  if(!Array.isArray(c.cards)||!c.cards.length||c.cards.some(x=>typeof x!=='string'||!x.trim()||x.length>3000))throw Error('Карточки должны быть непустыми строками длиной до 3000 символов.');
  const normalized=c.cards.map(x=>x.trim().normalize('NFKC').toLocaleLowerCase('ru').replace(/\s+/g,' '));
  if(new Set(normalized).size!==normalized.length)throw Error('Повторяющиеся карточки в категории «'+c.label+'».');
 }
 for(const k of ['catastrophes','bunkers','threats'])if(d[k]!==undefined&&(!Array.isArray(d[k])||d[k].some(x=>typeof x!=='string'||!x.trim()||x.length>5000)))throw Error('Неверный список '+k);
 return d;
}
export function randomInt(n){const a=new Uint32Array(1);const bound=4294967296-4294967296%n;do{crypto.getRandomValues(a);}while(a[0]>=bound);return a[0]%n;}
export function shuffle(input){const a=[...input];for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function deal(deck,names){validateDeck(deck);if(names.length<4||names.length>16)throw Error('Добавьте от 4 до 16 персонажей.');if(new Set(names.map(x=>x.trim().toLocaleLowerCase('ru'))).size!==names.length)throw Error('Имена игроков должны отличаться.');for(const c of deck.categories)if(c.cards.length<names.length)throw Error('В категории «'+c.label+'» только '+c.cards.length+' карточек. Для раздачи без повторов нужно '+names.length+'.');
 const piles=deck.categories.map(c=>shuffle(c.cards));
 const world={catastrophe:deck.catastrophes?.length?shuffle(deck.catastrophes)[0]:'',bunker:''};
 const tableCards=[];const bunkers=shuffle(deck.bunkers||[]).slice(0,5);const threats=shuffle(deck.threats||[]).slice(0,7);for(let i=0;i<bunkers.length;i++){tableCards.push({label:'Раунд '+(i+1)+' · Бункер',text:bunkers[i]});if(threats[i])tableCards.push({label:'Раунд '+(i+1)+' · Угроза',text:threats[i]});}for(let i=5;i<threats.length;i++)tableCards.push({label:'Финал · Угроза изгнанных '+(i-4),text:threats[i]});
 const id=crypto.randomUUID();return {id,title:deck.title,world,table:{v:1,game:id,title:deck.title,name:'Общий стол',world,cards:tableCards},players:names.map((name,i)=>({v:1,game:id,title:deck.title,name,world,cards:deck.categories.map((c,j)=>({label:c.label,text:piles[j][i]}))}))};
}
export function encodeHand(hand){return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(hand)))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');}
export function decodeHand(s){if(s.length>100000)throw Error('Слишком длинная ссылка.');const d=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0))));if(d.v!==1||typeof d.name!=='string'||typeof d.game!=='string'||typeof d.title!=='string'||!d.world||!Array.isArray(d.cards)||!d.cards.length||d.cards.length>100||d.cards.some(c=>typeof c.label!=='string'||typeof c.text!=='string'))throw Error('Некорректная ссылка на карточки.');return d;}
