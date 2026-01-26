// NEURAL NETWORK VISUALIZER - AI Brain Animation
(function() {
  'use strict';

  const container = document.getElementById('neuralNetworkViz');
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;

  // Network structure
  const layers = [4, 6, 6, 3]; // Input, Hidden1, Hidden2, Output
  const nodes = [];
  const connections = [];

  class Node {
    constructor(x, y, layer, index) {
      this.x = x;
      this.y = y;
      this.layer = layer;
      this.index = index;
      this.activation = Math.random();
      this.targetActivation = Math.random();
      this.radius = 8;
    }

    update() {
      // Smooth activation change
      this.activation += (this.targetActivation - this.activation) * 0.05;
      
      // Random activation changes
      if (Math.random() < 0.01) {
        this.targetActivation = Math.random();
      }
    }

    draw() {
      // Glow based on activation
      const glowSize = 15 + this.activation * 20;
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
      
      if (this.activation > 0.7) {
        gradient.addColorStop(0, 'rgba(6, 255, 240, ' + this.activation + ')');
        gradient.addColorStop(1, 'rgba(6, 255, 240, 0)');
      } else if (this.activation > 0.4) {
        gradient.addColorStop(0, 'rgba(139, 92, 246, ' + this.activation + ')');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 255, 255, ' + (this.activation * 0.5) + ')');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Node circle
      ctx.fillStyle = this.activation > 0.5 ? '#06FFF0' : '#8B5CF6';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner glow
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (this.activation * 0.8) + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class Connection {
    constructor(from, to) {
      this.from = from;
      this.to = to;
      this.weight = Math.random();
      this.flow = 0;
    }

    update() {
      // Signal flow based on activation
      this.flow = (this.from.activation + this.to.activation) / 2;
    }

    draw() {
      const alpha = this.flow * 0.4;
      const width = 1 + this.flow * 2;

      // Gradient along connection
      const gradient = ctx.createLinearGradient(
        this.from.x, this.from.y,
        this.to.x, this.to.y
      );
      
      if (this.flow > 0.6) {
        gradient.addColorStop(0, `rgba(6, 255, 240, ${alpha})`);
        gradient.addColorStop(1, `rgba(139, 92, 246, ${alpha})`);
      } else {
        gradient.addColorStop(0, `rgba(139, 92, 246, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.3})`);
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(this.from.x, this.from.y);
      ctx.lineTo(this.to.x, this.to.y);
      ctx.stroke();

      // Traveling pulse
      if (this.flow > 0.7) {
        const pulsePos = (Date.now() % 1000) / 1000;
        const pulseX = this.from.x + (this.to.x - this.from.x) * pulsePos;
        const pulseY = this.from.y + (this.to.y - this.from.y) * pulsePos;

        ctx.fillStyle = '#06FFF0';
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Build network
  function buildNetwork() {
    const padding = 60;
    const layerSpacing = (canvas.width - padding * 2) / (layers.length - 1);

    layers.forEach((nodeCount, layerIndex) => {
      const layerNodes = [];
      const nodeSpacing = (canvas.height - padding * 2) / (nodeCount + 1);

      for (let i = 0; i < nodeCount; i++) {
        const x = padding + layerIndex * layerSpacing;
        const y = padding + (i + 1) * nodeSpacing;
        const node = new Node(x, y, layerIndex, i);
        layerNodes.push(node);
        nodes.push(node);
      }

      // Create connections to next layer
      if (layerIndex < layers.length - 1) {
        const nextLayerStart = nodes.length;
        layerNodes.forEach(fromNode => {
          // Connect to all nodes in next layer
          for (let i = 0; i < layers[layerIndex + 1]; i++) {
            const toNode = nodes[nextLayerStart + i] || nodes[nodes.length - layers[layerIndex + 1] + i];
            if (toNode && toNode !== fromNode) {
              connections.push(new Connection(fromNode, toNode));
            }
          }
        });
      }
    });
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw connections
    connections.forEach(conn => {
      conn.update();
      conn.draw();
    });

    // Update and draw nodes
    nodes.forEach(node => {
      node.update();
      node.draw();
    });

    requestAnimationFrame(animate);
  }

  // Handle resize
  window.addEventListener('resize', () => {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    nodes.length = 0;
    connections.length = 0;
    buildNetwork();
  });

  // Initialize
  buildNetwork();
  animate();

})();

