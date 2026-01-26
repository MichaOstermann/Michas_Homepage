(function(){
  'use strict';

  // Smooth scroll for CTA links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if(el){
        e.preventDefault();
        el.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Animated Counter with Intersection Observer
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        const target = parseInt(entry.target.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            entry.target.textContent = target.toLocaleString('de-DE');
            clearInterval(timer);
          } else {
            entry.target.textContent = Math.floor(current).toLocaleString('de-DE');
          }
        }, 16);
        
        entry.target.dataset.animated = 'true';
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isActive = item.classList.contains('active');
      
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      
      // Open clicked if it wasn't active
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Testimonials Carousel
  const track = document.querySelector('.carousel-track');
  const cards = document.querySelectorAll('.t-card');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const dotsContainer = document.querySelector('.carousel-dots');
  
  if (track && cards.length > 0) {
    let currentIndex = 0;
    const totalCards = cards.length;
    
    // Create dots
    for (let i = 0; i < totalCards; i++) {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
    
    const dots = document.querySelectorAll('.dot');
    
    function updateCarousel() {
      const cardWidth = cards[0].offsetWidth + 24;
      track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }
    
    function goToSlide(index) {
      currentIndex = index;
      updateCarousel();
    }
    
    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalCards;
      updateCarousel();
    }
    
    function prevSlide() {
      currentIndex = (currentIndex - 1 + totalCards) % totalCards;
      updateCarousel();
    }
    
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    setInterval(nextSlide, 5000);
    window.addEventListener('resize', updateCarousel);
  }

  // Video Hero Control
  const video = document.getElementById('heroVideo');
  const videoControl = document.getElementById('videoControl');
  
  if (video && videoControl) {
    const pauseIcon = videoControl.querySelector('.pause-icon');
    const playIcon = videoControl.querySelector('.play-icon');
    
    videoControl.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        pauseIcon.style.display = '';
        playIcon.style.display = 'none';
        videoControl.setAttribute('aria-label', 'Video pausieren');
      } else {
        video.pause();
        pauseIcon.style.display = 'none';
        playIcon.style.display = '';
        videoControl.setAttribute('aria-label', 'Video abspielen');
      }
    });
  }

  // Live Chat Widget
  const chatFab = document.getElementById('chatFab');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const chatMessages = document.getElementById('chatMessages');
  const quickReplies = document.querySelectorAll('.quick-reply');
  
  if (chatFab && chatPanel) {
    let isOpen = false;
    
    function toggleChat() {
      isOpen = !isOpen;
      chatPanel.style.display = isOpen ? 'flex' : 'none';
      if (isOpen) {
        chatInput.focus();
        const badge = document.querySelector('.chat-badge');
        if (badge) badge.style.display = 'none';
      }
    }
    
    chatFab.addEventListener('click', toggleChat);
    if (chatClose) chatClose.addEventListener('click', toggleChat);
    
    function addMessage(text, isUser = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-message ' + (isUser ? 'user' : 'bot');
      msgDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function handleMessage(text) {
      if (!text.trim()) return;
      
      addMessage(text, true);
      chatInput.value = '';
      
      setTimeout(() => {
        let response = 'Danke für deine Nachricht! Ein Mitarbeiter wird sich in Kürze melden. 👍';
        
        if (text.toLowerCase().includes('preis')) {
          response = 'Unsere Preise starten bei €0 für Starter, €79 für Pro und €249 für Enterprise. Schau dir die Übersicht an! 💰';
        } else if (text.toLowerCase().includes('demo')) {
          response = 'Gerne! Buche einen Termin auf unserer Website oder schreib uns an demo@businesspro.de 🎯';
        } else if (text.toLowerCase().includes('support')) {
          response = 'Support ist im Pro-Paket per Email und im Enterprise-Paket prioritär verfügbar. Wie können wir helfen? 🛠️';
        }
        
        addMessage(response);
      }, 800);
    }
    
    if (chatSend) {
      chatSend.addEventListener('click', () => handleMessage(chatInput.value));
    }
    
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleMessage(chatInput.value);
      });
    }
    
    quickReplies.forEach(btn => {
      btn.addEventListener('click', () => {
        handleMessage(btn.dataset.reply);
      });
    });
  }

  // Scroll to Top Button
  const scrollTop = document.getElementById('scrollTop');
  
  if (scrollTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTop.style.display = 'flex';
      } else {
        scrollTop.style.display = 'none';
      }
    });
    
    scrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();