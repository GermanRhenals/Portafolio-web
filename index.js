document.addEventListener("DOMContentLoaded", function () {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slider > div');
    const totalSlides = slides.length;
    let currentIndex = 0;

    function showSlide() {
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.style.order = 1;
            } else {
                const order = (index - currentIndex + totalSlides) % totalSlides + 2;
                slide.style.order = order;
            }
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide();
    }

    function startAutoSlider() {
        setInterval(() => {
            nextSlide();
        }, 3000); // Ajusta el intervalo según tus necesidades
    }

    showSlide();
    startAutoSlider();
});




