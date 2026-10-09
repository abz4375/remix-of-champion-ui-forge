import fox from '@/assets/vani-a.png';
import otter from '@/assets/vani-b.png';
import owl from '@/assets/vani-c.png';
import foxDirections from '@/assets/fox-directions.webp';
import foxReactions from '@/assets/fox-reactions.webp';
import otterDirections from '@/assets/otter-directions.webp';
import otterReactions from '@/assets/otter-reactions.webp';
import owlDirections from '@/assets/owl-directions.webp';
import owlReactions from '@/assets/owl-reactions.webp';
export const versions = [
 { id:'A',name:'Vani A',title:'Current production prompt',status:'Live',image:fox,directions:foxDirections,reactions:foxReactions,calls:1842,active:12,rate:11.5,score:3.6,duration:74,answer:68.4 },
 { id:'B',name:'Vani B',title:'Shorter opening, direct meeting ask',status:'In test',image:otter,directions:otterDirections,reactions:otterReactions,calls:916,active:8,rate:13.2,score:4.2,duration:69,answer:71.2 },
 { id:'C',name:'Vani C',title:'Hinglish-first greeting',status:'In test',image:owl,directions:owlDirections,reactions:owlReactions,calls:910,active:6,rate:9.8,score:2.7,duration:81,answer:66.1 },
];
export const secondary=['Call duration (seconds)','Answer rate','Location confirmed rate','Callback requested rate'];
export const guardrails=['Incorrect meeting-fixed rate','Do-not-call rate','Early drop rate','Bot response latency (P95)','Loopy / repeating calls rate','Seller had to repeat themselves rate'];
export const internal=['Not interested rate','Call later rate','Pronunciation quality','Overlap count','Seller question gaps','Already-in-touch rate','Objection mix'];
export const promptText=`# VANI · Seller meeting assistant\n\n## Your role\nYou are VANI, a friendly voice assistant from IndiaMART.\nSpeak naturally in English, Hindi, or Hinglish.\nMatch the seller’s language and keep each turn short.\n\n## Opening\n“Namaste! Main IndiaMART se VANI bol rahi hoon.\nKya abhi baat karne ka sahi samay hai?”\n\n## Understand the business\nAsk which products the seller currently supplies.\nListen without interrupting. Confirm their location.\n\n## Offer a meeting\nAsk if they would like to meet an IndiaMART executive\nto discuss relevant business opportunities.\nConfirm a preferred date and time before booking.\n\n## Respect the seller\nIf not interested, acknowledge politely and end the call.\nNever imply a meeting is booked without explicit consent.\nIf asked not to call, respect that request immediately.\n\n## Closing\nSummarise the agreed next step. Thank the seller.\n“Dhanyavaad, aapka din achha rahe!”`;
export function metadata(title:string,description:string){return {meta:[{title:`${title} — VANI Lab`},{name:'description',content:description},{property:'og:title',content:`${title} — VANI Lab`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};}
