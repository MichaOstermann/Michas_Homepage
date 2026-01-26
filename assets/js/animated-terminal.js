// Animated Terminal - Typewriter Effect
(function() {
  const terminal = document.querySelector('[data-terminal]');
  if (!terminal) return;

  const lines = JSON.parse(terminal.dataset.terminal);
  const output = terminal.querySelector('[data-terminal-output]');
  const cursor = terminal.querySelector('[data-terminal-cursor]');
  
  if (!output || !lines) return;

  let currentLine = 0;
  let currentChar = 0;
  let isTyping = false;

  // Cursor blink
  setInterval(() => {
    cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
  }, 530);

  // Start when visible
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isTyping) {
      startTyping();
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(terminal);

  async function startTyping() {
    isTyping = true;
    
    for (let i = 0; i < lines.length; i++) {
      await typeLine(lines[i]);
      await wait(600);
    }
  }

  async function typeLine(line) {
    const lineEl = document.createElement('div');
    lineEl.style.marginBottom = '0.5rem';
    
    // Prompt
    if (line.type !== 'output' && line.type !== 'error') {
      const prompt = document.createElement('span');
      prompt.style.color = '#06FFF0';
      prompt.textContent = 'PS C:\\> ';
      lineEl.appendChild(prompt);
    }

    // Text
    const textEl = document.createElement('span');
    textEl.style.color = line.color || (line.type === 'output' ? '#00FF88' : '#FFF');
    lineEl.appendChild(textEl);
    output.appendChild(lineEl);

    // Type character by character
    const text = line.text;
    for (let i = 0; i < text.length; i++) {
      textEl.textContent += text[i];
      await wait(30);
    }
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

})();








