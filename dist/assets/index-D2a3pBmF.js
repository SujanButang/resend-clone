(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))d(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const c of t.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&d(c)}).observe(document,{childList:!0,subtree:!0});function n(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function d(e){if(e.ep)return;e.ep=!0;const t=n(e);fetch(e.href,t)}})();const r=(s,o,n)=>{s.classList.add(o),s.classList.remove(n)},i=document.querySelector("#menu"),l=document.querySelector("#close-menu"),u=document.querySelector("#mobile-menu");i.addEventListener("click",()=>{r(u,"scale-y-100","scale-y-0"),r(i,"hidden","flex"),r(l,"flex","hidden")});l.addEventListener("click",()=>{r(u,"scale-y-0","scale-y-100"),r(i,"flex","hidden"),r(l,"hidden","flex")});
