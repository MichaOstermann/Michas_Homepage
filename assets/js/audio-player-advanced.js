// Advanced Audio Player with Waveform Visualization
(function() {
  'use strict';

  class AdvancedAudioPlayer {
    constructor(element) {
      this.container = element;
      this.audio = element.querySelector('audio');
      if (!this.audio) return;

      this.canvas = element.querySelector('[data-waveform]');
      this.playBtn = element.querySelector('[data-play]');
      this.progress = element.querySelector('[data-progress]');
      this.timeDisplay = element.querySelector('[data-time]');
      this.volumeControl = element.querySelector('[data-volume]');

      this.isPlaying = false;
      this.audioContext = null;
      this.analyser = null;
      this.dataArray = null;
      this.animationId = null;

      this.init();
    }

    init() {
      // Create Audio Context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      const source = this.audioContext.createMediaElementSource(this.audio);
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      // Event Listeners
      if (this.playBtn) {
        this.playBtn.addEventListener('click', () => this.togglePlay());
      }

      if (this.progress) {
        this.progress.addEventListener('click', (e) => this.seek(e));
      }

      if (this.volumeControl) {
        this.volumeControl.addEventListener('input', (e) => {
          this.audio.volume = e.target.value / 100;
        });
      }

      this.audio.addEventListener('timeupdate', () => this.updateProgress());
      this.audio.addEventListener('ended', () => this.stop());

      // Start waveform if canvas exists
      if (this.canvas) {
        this.drawWaveform();
      }
    }

    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }

    async play() {
      try {
        await this.audioContext.resume();
        await this.audio.play();
        this.isPlaying = true;
        if (this.playBtn) {
          this.playBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          `;
        }
      } catch (error) {
        console.error('Play error:', error);
      }
    }

    pause() {
      this.audio.pause();
      this.isPlaying = false;
      if (this.playBtn) {
        this.playBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        `;
      }
    }

    stop() {
      this.pause();
      this.audio.currentTime = 0;
    }

    seek(e) {
      if (!this.progress) return;
      const rect = this.progress.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.audio.currentTime = percent * this.audio.duration;
    }

    updateProgress() {
      if (!this.audio.duration) return;

      const percent = (this.audio.currentTime / this.audio.duration) * 100;
      
      if (this.progress) {
        const fill = this.progress.querySelector('[data-progress-fill]');
        if (fill) fill.style.width = percent + '%';
      }

      if (this.timeDisplay) {
        this.timeDisplay.textContent = `${this.formatTime(this.audio.currentTime)} / ${this.formatTime(this.audio.duration)}`;
      }
    }

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    drawWaveform() {
      if (!this.canvas) return;

      const ctx = this.canvas.getContext('2d');
      const WIDTH = this.canvas.width;
      const HEIGHT = this.canvas.height;

      const draw = () => {
        this.animationId = requestAnimationFrame(draw);

        this.analyser.getByteFrequencyData(this.dataArray);

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / this.dataArray.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < this.dataArray.length; i++) {
          barHeight = (this.dataArray[i] / 255) * HEIGHT * 0.8;

          // Gradient
          const gradient = ctx.createLinearGradient(0, HEIGHT - barHeight, 0, HEIGHT);
          gradient.addColorStop(0, '#06FFF0');
          gradient.addColorStop(0.5, '#8B5CF6');
          gradient.addColorStop(1, '#FF1493');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }
      };

      draw();
    }
  }

  // Initialize all advanced players
  document.querySelectorAll('[data-audio-player]').forEach(el => {
    new AdvancedAudioPlayer(el);
  });

})();



