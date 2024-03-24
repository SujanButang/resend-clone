import { editClassName } from "./helper";

const menuBtn = document.querySelector('#menu')
const closeMenuBtn = document.querySelector('#close-menu');

const mobileMenu = document.querySelector('#mobile-menu')

menuBtn.addEventListener('click',()=>{
 editClassName(mobileMenu,'scale-y-100','scale-y-0')
 editClassName(menuBtn,'hidden','flex')
 editClassName(closeMenuBtn,'flex','hidden')
})

closeMenuBtn.addEventListener('click',()=>{
 editClassName(mobileMenu,'scale-y-0','scale-y-100')
 editClassName(menuBtn,'flex','hidden')
 editClassName(closeMenuBtn,'hidden','flex')
})