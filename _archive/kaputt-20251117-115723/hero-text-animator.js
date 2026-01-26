// Hero Text Animator - Rotating Words Effect
(function() {
  'use strict';

  const element = document.querySelector('[data-text-rotate]');
  if (!element) return;

  const words = JSON.parse(element.dataset.textRotate || '[]');
  if (words.length === 0) return;

  let currentIndex = 0;
  const speed = 3000; // Change every 3 seconds

  function typeWord(word, callback) {
    element.textContent = '';
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < word.length) {
        element.textContent += word[charIndex];
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(callback, speed);
      }
    }, 100);
  }

  function cycle() {
    currentIndex = (currentIndex + 1) % words.length;
    typeWord(words[currentIndex], cycle);
  }

  // Start
  element.textContent = words[0];
  setTimeout(() => cycle(), speed);

})();

