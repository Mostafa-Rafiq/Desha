const slider = document.querySelector("slider")
const slide = document.querySelectorAll("slide")
const next = document.querySelector("next")
const prev = document.querySelector("prev")

let currentIndex = 0;

function UpdateSlide() {
    slider.style.transform = ` translateX(-$(currentIndex * 100)%) ` 
}

next.addEventListener("click" , () => {
    currentIndex = (currentIndex + 1) % slide.length;
    UpdateSlide()
})
 

prev.addEventListener("click" , () => {
    currentIndex = (currentIndex - 1 + slide.length) % slide.length;
    UpdateSlide()
})
 