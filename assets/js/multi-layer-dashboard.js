// Multi-Layer Dashboard - Terminal + Waveform + Code Matrix + Live Stats
(function() {
  'use strict';
  
  const container = document.getElementById('neuralNetworkViz');
  if (!container) return;
  
  // Stats
  const stats = {
    scripts: { current: 0, target: 6, speed: 0.3 },
    tracks: { current: 0, target: 10, speed: 0.2 },
    games: { current: 0, target: 4, speed: 0.25 },
    blog: { current: 0, target: 8, speed: 0.15 }
  };
  
  // PowerShell Commands Queue
  const commands = [
    { cmd: 'Get-Process | Where-Object {$_.CPU -gt 100}', output: 'Process: Code.exe (CPU: 125%)' },
    { cmd: 'Get-Service | Where-Object {$_.Status -eq "Running"}', output: 'Services: 45 running' },
    { cmd: 'Get-ChildItem -Path C:\\Temp -Recurse | Measure-Object', output: 'Files: 1,234 | Size: 2.5 GB' },
    { cmd: 'Get-ADUser -Filter * | Measure-Object', output: 'AD Users: 1,567' },
    { cmd: 'Test-NetConnection -ComputerName google.com', output: 'Ping: 12ms | Status: OK' }
  ];
  
  let currentCommand = 0;
  let isTyping = false;
  
  // Code Matrix Snippets
  const codeSnippets = [
    'function Optimize-System { ... }',
    '$processes = Get-Process',
    'foreach ($item in $collection) {',
    'Write-Host "Success!" -ForegroundColor Green',
    'if ($condition) { Execute-Action }',
    'try { $result = Invoke-Command } catch { ... }',
    'Measure-Object -Property Size -Sum',
    'Select-Object -First 10 | Format-Table'
  ];
  
  // Create Canvas for Code Matrix
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.opacity = '0.15';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1';
  const ctx = canvas.getContext('2d');
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;
  
  // Code Matrix Particles
  const particles = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
      speed: 0.5 + Math.random() * 0.5,
      opacity: 0.3 + Math.random() * 0.3
    });
  }
  
  // Create HTML Structure
  container.innerHTML = '';
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.appendChild(canvas);
  
  // Terminal Section
  const terminal = document.createElement('div');
  terminal.style.cssText = `
    position: relative;
    z-index: 3;
    background: rgba(0, 0, 0, 0.4);
    border-bottom: 1px solid rgba(6, 255, 240, 0.3);
    padding: 1rem;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    height: 120px;
    overflow: hidden;
  `;
  
  const terminalHeader = document.createElement('div');
  terminalHeader.style.cssText = `
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: rgba(6, 255, 240, 0.8);
    font-size: 0.75rem;
  `;
  terminalHeader.innerHTML = `
    <span style="width: 12px; height: 12px; border-radius: 50%; background: #FF5F57;"></span>
    <span style="width: 12px; height: 12px; border-radius: 50%; background: #FEBC2E;"></span>
    <span style="width: 12px; height: 12px; border-radius: 50%; background: #28C840;"></span>
    <span style="margin-left: 0.5rem;">PowerShell 7.x</span>
  `;
  
  const terminalBody = document.createElement('div');
  terminalBody.id = 'terminalBody';
  terminalBody.style.cssText = `
    color: #00FF88;
    line-height: 1.6;
    height: 60px;
    overflow: hidden;
  `;
  
  terminal.appendChild(terminalHeader);
  terminal.appendChild(terminalBody);
  container.appendChild(terminal);
  
  // Waveform Section
  const waveformContainer = document.createElement('div');
  waveformContainer.style.cssText = `
    position: relative;
    z-index: 3;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border-bottom: 1px solid rgba(139, 92, 246, 0.3);
  `;
  
  const waveformCanvas = document.createElement('canvas');
  waveformCanvas.width = container.offsetWidth - 32;
  waveformCanvas.height = 100;
  waveformCanvas.style.cssText = `
    width: 100%;
    height: 100%;
    max-height: 100px;
  `;
  const waveformCtx = waveformCanvas.getContext('2d');
  waveformContainer.appendChild(waveformCanvas);
  container.appendChild(waveformContainer);
  
  // Stats Section
  const statsContainer = document.createElement('div');
  statsContainer.style.cssText = `
    position: relative;
    z-index: 3;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
  `;
  
  function createStatCard(label, value, color, icon) {
    const card = document.createElement('div');
    card.style.cssText = `
      text-align: center;
      padding: 0.75rem;
      background: rgba(11, 15, 22, 0.6);
      border: 1px solid ${color}40;
      border-radius: 8px;
      transition: all 0.3s;
    `;
    card.innerHTML = `
      <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">${icon}</div>
      <div style="font-size: 1.8rem; font-weight: 900; color: ${color}; margin-bottom: 0.25rem;" data-stat="${label}">0</div>
      <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.1em;">${label}</div>
    `;
    card.onmouseenter = () => {
      card.style.borderColor = color + '80';
      card.style.background = color + '10';
      card.style.transform = 'translateY(-2px)';
    };
    card.onmouseleave = () => {
      card.style.borderColor = color + '40';
      card.style.background = 'rgba(11, 15, 22, 0.6)';
      card.style.transform = 'translateY(0)';
    };
    return card;
  }
  
  statsContainer.appendChild(createStatCard('Scripts', 0, '#06FFF0', '⚡'));
  statsContainer.appendChild(createStatCard('Tracks', 0, '#8B5CF6', '🎵'));
  statsContainer.appendChild(createStatCard('Games', 0, '#FF1493', '🎮'));
  statsContainer.appendChild(createStatCard('Blog', 0, '#00FF88', '📝'));
  container.appendChild(statsContainer);
  
  // Terminal Typing Animation
  function typeCommand() {
    if (isTyping) return;
    isTyping = true;
    
    const cmd = commands[currentCommand];
    let charIndex = 0;
    terminalBody.innerHTML = `<span style="color: #06FFF0;">PS></span> <span id="typingText"></span><span id="cursor" style="background: #06FFF0; width: 8px; display: inline-block; animation: blink 1s infinite;"> </span>`;
    const typingText = document.getElementById('typingText');
    const cursor = document.getElementById('cursor');
    
    const typeInterval = setInterval(() => {
      if (charIndex < cmd.cmd.length) {
        typingText.textContent += cmd.cmd[charIndex];
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          terminalBody.innerHTML += `<br><span style="color: #00FF88;">${cmd.output}</span>`;
          setTimeout(() => {
            isTyping = false;
            currentCommand = (currentCommand + 1) % commands.length;
            setTimeout(typeCommand, 2000);
          }, 1500);
        }, 500);
      }
    }, 50);
  }
  
  // Waveform Animation
  function drawWaveform() {
    waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
    const centerY = waveformCanvas.height / 2;
    const barCount = 60;
    const barWidth = waveformCanvas.width / barCount;
    
    for (let i = 0; i < barCount; i++) {
      const height = Math.random() * 80 + 10;
      const x = i * barWidth;
      const gradient = waveformCtx.createLinearGradient(0, centerY - height, 0, centerY + height);
      
      if (i < barCount / 3) {
        gradient.addColorStop(0, '#06FFF0');
        gradient.addColorStop(1, '#06FFF080');
      } else if (i < (barCount * 2) / 3) {
        gradient.addColorStop(0, '#8B5CF6');
        gradient.addColorStop(1, '#8B5CF680');
      } else {
        gradient.addColorStop(0, '#FF1493');
        gradient.addColorStop(1, '#FF149380');
      }
      
      waveformCtx.fillStyle = gradient;
      waveformCtx.fillRect(x, centerY - height / 2, barWidth - 2, height);
    }
  }
  
  // Code Matrix Animation
  function drawCodeMatrix() {
    ctx.fillStyle = 'rgba(11, 15, 22, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '10px "Courier New"';
    ctx.textAlign = 'left';
    
    particles.forEach(particle => {
      particle.y += particle.speed;
      if (particle.y > canvas.height) {
        particle.y = -20;
        particle.x = Math.random() * canvas.width;
        particle.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      }
      
      ctx.fillStyle = `rgba(6, 255, 240, ${particle.opacity})`;
      ctx.fillText(particle.text, particle.x, particle.y);
    });
  }
  
  // Stats Animation
  function animateStats() {
    Object.keys(stats).forEach(key => {
      const stat = stats[key];
      if (stat.current < stat.target) {
        stat.current = Math.min(stat.current + stat.speed, stat.target);
        const element = document.querySelector(`[data-stat="${key.charAt(0).toUpperCase() + key.slice(1)}"]`);
        if (element) {
          element.textContent = Math.floor(stat.current);
        }
      }
    });
  }
  
  // Resize Handler
  function handleResize() {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    waveformCanvas.width = container.offsetWidth - 32;
  }
  
  // Animation Loop
  function animate() {
    drawCodeMatrix();
    drawWaveform();
    animateStats();
    requestAnimationFrame(animate);
  }
  
  // Initialize
  window.addEventListener('resize', handleResize);
  typeCommand();
  animate();
  
  // Add CSS for cursor blink
  if (!document.getElementById('dashboard-styles')) {
    const style = document.createElement('style');
    style.id = 'dashboard-styles';
    style.textContent = `
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  console.log('✅ Multi-Layer Dashboard initialisiert!');
})();








