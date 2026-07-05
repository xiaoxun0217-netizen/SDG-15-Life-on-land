// Rainwater Collector Game Logic
class RainwaterCollectorGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Game state
    this.gameRunning = false;
    this.gamePaused = false;
    this.score = 0;
    this.health = 100;
    this.level = 1;
    this.gameTime = 0;
    this.timeLimit = 180; // 3分钟 = 180秒
    this.timeRemaining = this.timeLimit;
    
    // Player (watering can)
    this.player = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 80,
      width: 50,
      height: 70,
      speed: 8,
      emoji: '🚿'
    };
    
    // Background particles for visual effect
    this.particles = [];
    this.clouds = [];
    this.rainEffect = [];
    
    // Audio context
    this.audioContext = null;
    this.audioInitialized = false;
    
    // Game objects
    this.raindrops = [];
    this.bombs = [];
    this.lightning = [];
    
    // Spawn rates
    this.raindropSpawnRate = 0.02;
    this.bombSpawnRate = 0.008;
    this.lightningSpawnRate = 0.005;
    
    // Input handling
    this.keys = {};
    this.mouseX = this.canvas.width / 2;
    
    this.setupEventListeners();
    this.gameLoop = this.gameLoop.bind(this);
  }

  setupEventListeners() {
    // Initialize audio context on first user interaction
    document.addEventListener('click', () => this.initAudio(), { once: true });
    document.addEventListener('touchstart', () => this.initAudio(), { once: true });
    document.addEventListener('keydown', () => this.initAudio(), { once: true });
    
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    // Mouse controls
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
    });

    // Touch controls for mobile
    this.canvas.addEventListener('touchmove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.mouseX = touch.clientX - rect.left;
      e.preventDefault();
    });

    // Button controls
    document.getElementById('startGameBtn').addEventListener('click', () => this.start());
    document.getElementById('pauseGameBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('resetGameBtn').addEventListener('click', () => this.reset());
  }

  initAudio() {
    if (!this.audioInitialized && !window.AudioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.audioInitialized = true;
    }
  }

  playSound(type = 'collect') {
    if (!this.audioInitialized || !this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'collect') {
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.setValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'damage') {
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.setValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'background') {
      // Soft background hum
      osc.frequency.value = 60;
      gain.gain.setValueAtTime(0.05, now);
      osc.start(now);
      osc.stop(now + 2);
    }
  }

  spawnParticles(x, y, type = 'water') {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2 - 3,
        life: 30,
        emoji: type === 'water' ? '💧' : type === 'bomb' ? '💥' : '⚡'
      });
    }
  }

  initBackgroundElements() {
    // Create clouds
    for (let i = 0; i < 3; i++) {
      this.clouds.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height * 0.3 + 20,
        width: 60 + Math.random() * 40,
        speed: 0.5 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.3
      });
    }

    // Create rain effect background
    for (let i = 0; i < 20; i++) {
      this.rainEffect.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        speed: 2 + Math.random() * 2,
        opacity: Math.random() * 0.3 + 0.1
      });
    }
  }

  start() {
    if (!this.gameRunning) {
      this.gameRunning = true;
      this.gamePaused = false;
      document.getElementById('startGameBtn').disabled = true;
      document.getElementById('pauseGameBtn').disabled = false;
      document.getElementById('pauseGameBtn').textContent = 'Pause';
      this.playBackgroundMusic();
      this.gameLoop();
    }
  }

  playBackgroundMusic() {
    if (!this.audioInitialized || !this.audioContext) return;

    const ctx = this.audioContext;
    
    // Create a simple ambient background music using oscillators
    const bassOsc = ctx.createOscillator();
    const melodyOsc = ctx.createOscillator();
    const gainBass = ctx.createGain();
    const gainMelody = ctx.createGain();
    
    // Bass line
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(110, ctx.currentTime); // A2
    gainBass.gain.setValueAtTime(0.1, ctx.currentTime);
    
    // Melody
    melodyOsc.type = 'sine';
    melodyOsc.frequency.setValueAtTime(220, ctx.currentTime); // A3
    gainMelody.gain.setValueAtTime(0.08, ctx.currentTime);
    
    bassOsc.connect(gainBass);
    melodyOsc.connect(gainMelody);
    gainBass.connect(ctx.destination);
    gainMelody.connect(ctx.destination);
    
    // Create a simple melodic pattern
    const now = ctx.currentTime;
    const notes = [220, 247, 277, 220, 247, 277, 294, 220]; // A3, B3, C#4, etc.
    let time = now;
    
    notes.forEach((note, index) => {
      const duration = 0.3;
      melodyOsc.frequency.setValueAtTime(note, time);
      time += duration;
    });
    
    bassOsc.start(now);
    melodyOsc.start(now);
    
    // Stop after 8 seconds and loop
    const loopDuration = 2.4; // 8 notes * 0.3s
    setTimeout(() => {
      if (this.gameRunning && !this.gamePaused) {
        bassOsc.stop();
        melodyOsc.stop();
        this.playBackgroundMusic();
      }
    }, loopDuration * 1000);
  }

  togglePause() {
    if (this.gameRunning) {
      this.gamePaused = !this.gamePaused;
      const btn = document.getElementById('pauseGameBtn');
      btn.textContent = this.gamePaused ? 'Resume' : 'Pause';
      if (!this.gamePaused) {
        this.gameLoop();
      }
    }
  }

  reset() {
    this.gameRunning = false;
    this.gamePaused = false;
    this.score = 0;
    this.health = 100;
    this.level = 1;
    this.gameTime = 0;
    this.timeRemaining = this.timeLimit;
    this.raindrops = [];
    this.bombs = [];
    this.lightning = [];
    this.particles = [];
    this.player.x = this.canvas.width / 2;
    
    this.initBackgroundElements();
    
    document.getElementById('startGameBtn').disabled = false;
    document.getElementById('pauseGameBtn').disabled = true;
    document.getElementById('pauseGameBtn').textContent = 'Pause';
    
    this.updateStats();
    this.draw();
  }

  updatePlayerPosition() {
    const speed = this.player.speed;
    
    // Keyboard controls
    if (this.keys['ArrowLeft']) {
      this.player.x = Math.max(0, this.player.x - speed);
    }
    if (this.keys['ArrowRight']) {
      this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + speed);
    }
    
    // Mouse/Touch controls
    if (this.mouseX > 0 && this.mouseX < this.canvas.width) {
      const targetX = this.mouseX - this.player.width / 2;
      this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, targetX));
    }
  }

  spawnObjects() {
    // Spawn raindrops
    if (Math.random() < this.raindropSpawnRate) {
      this.raindrops.push({
        x: Math.random() * this.canvas.width,
        y: -10,
        radius: 6,
        speed: 3 + Math.random(),
        collected: false,
        emoji: '💧'
      });
    }

    // Spawn bombs
    if (Math.random() < this.bombSpawnRate) {
      this.bombs.push({
        x: Math.random() * this.canvas.width,
        y: -15,
        width: 20,
        height: 20,
        speed: 2 + Math.random(),
        emoji: '💣'
      });
    }

    // Spawn lightning
    if (Math.random() < this.lightningSpawnRate) {
      this.lightning.push({
        x: Math.random() * this.canvas.width,
        y: -20,
        width: 15,
        height: 25,
        speed: 4,
        emoji: '⚡'
      });
    }
  }

  updateObjects() {
    // Update raindrops
    this.raindrops.forEach((drop, index) => {
      drop.y += drop.speed;
      
      // Check collision with player
      if (this.checkCollision(drop.x, drop.y, 12, 12, this.player.x, this.player.y, this.player.width, this.player.height)) {
        this.score += 10;
        this.playSound('collect');
        this.spawnParticles(drop.x, drop.y, 'water');
        this.raindrops.splice(index, 1);
      }
      
      // Remove if off screen
      if (drop.y > this.canvas.height) {
        this.raindrops.splice(index, 1);
      }
    });

    // Update bombs
    this.bombs.forEach((bomb, index) => {
      bomb.y += bomb.speed;
      
      // Check collision with player
      if (this.checkCollision(bomb.x, bomb.y, bomb.width, bomb.height, this.player.x, this.player.y, this.player.width, this.player.height)) {
        this.health -= 15;
        this.playSound('damage');
        this.spawnParticles(bomb.x, bomb.y, 'bomb');
        this.bombs.splice(index, 1);
      }
      
      // Remove if off screen
      if (bomb.y > this.canvas.height) {
        this.bombs.splice(index, 1);
      }
    });

    // Update lightning
    this.lightning.forEach((bolt, index) => {
      bolt.y += bolt.speed;
      
      // Check collision with player
      if (this.checkCollision(bolt.x, bolt.y, bolt.width, bolt.height, this.player.x, this.player.y, this.player.width, this.player.height)) {
        this.health -= 20;
        this.playSound('damage');
        this.spawnParticles(bolt.x, bolt.y, 'lightning');
        this.lightning.splice(index, 1);
      }
      
      // Remove if off screen
      if (bolt.y > this.canvas.height) {
        this.lightning.splice(index, 1);
      }
    });

    // Update level based on score
    this.level = Math.floor(this.score / 200) + 1;
    
    // Increase difficulty
    this.raindropSpawnRate = 0.02 + (this.level - 1) * 0.003;
    this.bombSpawnRate = 0.008 + (this.level - 1) * 0.002;
    this.lightningSpawnRate = 0.005 + (this.level - 1) * 0.001;
  }

  checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h2 &&
           y1 + h1 > y2;
  }

  draw() {
    // Create beautiful gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB');   // Sky blue at top
    gradient.addColorStop(0.3, '#B0E0E6'); // Powder blue
    gradient.addColorStop(0.7, '#E0F6FF'); // Light cyan
    gradient.addColorStop(1, '#90EE90');   // Light green at bottom
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw animated background rain effect
    this.rainEffect.forEach(rain => {
      rain.y += rain.speed;
      if (rain.y > this.canvas.height) {
        rain.y = -10;
        rain.x = Math.random() * this.canvas.width;
      }

      this.ctx.strokeStyle = `rgba(173, 216, 230, ${rain.opacity})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(rain.x, rain.y);
      this.ctx.lineTo(rain.x - 5, rain.y + 10);
      this.ctx.stroke();
    });

    // Draw clouds
    this.clouds.forEach(cloud => {
      cloud.x += cloud.speed;
      if (cloud.x > this.canvas.width + cloud.width) {
        cloud.x = -cloud.width;
      }

      // Cloud shape
      this.ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
      this.ctx.arc(cloud.x + cloud.width * 0.3, cloud.y - cloud.width * 0.1, cloud.width * 0.35, 0, Math.PI * 2);
      this.ctx.arc(cloud.x + cloud.width * 0.6, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw particles (collected items bursting effects)
    this.particles.forEach((particle, index) => {
      particle.life--;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // gravity

      this.ctx.font = `${Math.max(10, 20 * particle.life / 30)}px Arial`;
      this.ctx.globalAlpha = particle.life / 30;
      this.ctx.fillText(particle.emoji, particle.x, particle.y);
      this.ctx.globalAlpha = 1;

      if (particle.life <= 0) {
        this.particles.splice(index, 1);
      }
    });

    // Draw player (watering can) with glow effect
    const glow = this.ctx.createRadialGradient(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      0,
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      60
    );
    glow.addColorStop(0, 'rgba(135, 206, 250, 0.3)');
    glow.addColorStop(1, 'rgba(135, 206, 250, 0)');
    this.ctx.fillStyle = glow;
    this.ctx.fillRect(
      this.player.x - 30,
      this.player.y - 30,
      this.player.width + 60,
      this.player.height + 60
    );

    this.ctx.font = '70px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    this.ctx.fillText(this.player.emoji, this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
    this.ctx.shadowColor = 'transparent';

    // Draw raindrops with glow
    this.raindrops.forEach(drop => {
      // Glow effect
      const dropGlow = this.ctx.createRadialGradient(drop.x, drop.y, 0, drop.x, drop.y, 15);
      dropGlow.addColorStop(0, 'rgba(100, 200, 255, 0.5)');
      dropGlow.addColorStop(1, 'rgba(100, 200, 255, 0)');
      this.ctx.fillStyle = dropGlow;
      this.ctx.beginPath();
      this.ctx.arc(drop.x, drop.y, 15, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.font = '24px Arial';
      this.ctx.fillText(drop.emoji, drop.x, drop.y);
    });

    // Draw bombs with pulse effect
    this.bombs.forEach(bomb => {
      const pulse = Math.sin(this.gameTime * 0.1) * 5;
      this.ctx.font = `${28 + pulse}px Arial`;
      this.ctx.shadowColor = 'rgba(255, 0, 0, 0.3)';
      this.ctx.shadowBlur = 15;
      this.ctx.fillText(bomb.emoji, bomb.x, bomb.y);
      this.ctx.shadowColor = 'transparent';
    });

    // Draw lightning with flicker
    this.lightning.forEach(bolt => {
      const flicker = Math.random() > 0.3 ? 1 : 0.5;
      this.ctx.globalAlpha = flicker;
      this.ctx.font = '26px Arial';
      this.ctx.shadowColor = 'rgba(255, 255, 100, 0.8)';
      this.ctx.shadowBlur = 20;
      this.ctx.fillText(bolt.emoji, bolt.x, bolt.y);
      this.ctx.shadowColor = 'transparent';
      this.ctx.globalAlpha = 1;
    });

    // Draw pause overlay
    if (this.gamePaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  updateStats() {
    document.getElementById('scoreDisplay').textContent = this.score;
    document.getElementById('healthDisplay').textContent = Math.max(0, this.health);
    document.getElementById('levelDisplay').textContent = this.level;
    
    // Update time display
    const timeElement = document.getElementById('timeDisplay');
    if (timeElement) {
      const minutes = Math.floor(this.timeRemaining / 60);
      const seconds = this.timeRemaining % 60;
      timeElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      // Change color based on time remaining
      if (this.timeRemaining <= 30) {
        timeElement.style.color = '#e74c3c';
      } else if (this.timeRemaining <= 60) {
        timeElement.style.color = '#f39c12';
      } else {
        timeElement.style.color = '#2b8a4d';
      }
    }
    
    // Update health bar
    const healthPercent = Math.max(0, this.health / 100);
    document.getElementById('healthBar').style.width = (healthPercent * 100) + '%';
    
    // Change health bar color
    const healthBar = document.getElementById('healthBar');
    if (healthPercent > 0.5) {
      healthBar.style.background = 'linear-gradient(90deg, #2b8a4d, #e8f5ec)';
    } else if (healthPercent > 0.25) {
      healthBar.style.background = 'linear-gradient(90deg, #f39c12, #f9e79f)';
    } else {
      healthBar.style.background = 'linear-gradient(90deg, #e74c3c, #fadbd8)';
    }
    
    // Update achievements
    this.updateAchievements();
  }

  updateAchievements() {
    const achievements = [
      { id: 'seedling', minScore: 1, maxScore: 99 },
      { id: 'guardian', minScore: 100, maxScore: 299 },
      { id: 'protector', minScore: 300, maxScore: 499 },
      { id: 'hero', minScore: 500, maxScore: Infinity }
    ];

    achievements.forEach(achievement => {
      const element = document.getElementById(achievement.id);
      if (this.score >= achievement.minScore && this.score <= achievement.maxScore) {
        element.classList.add('unlocked');
        element.classList.remove('locked');
      }
    });
  }

  gameLoop() {
    if (!this.gameRunning || this.gamePaused) return;

    this.gameTime++;
    this.timeRemaining = Math.max(0, this.timeLimit - Math.floor(this.gameTime / 60)); // 60 frames per second
    
    this.updatePlayerPosition();
    this.spawnObjects();
    this.updateObjects();
    this.updateStats();
    this.draw();

    // End game if health reaches 0 or time runs out
    if (this.health <= 0) {
      this.endGame('health');
      return;
    }

    if (this.timeRemaining <= 0) {
      this.endGame('time');
      return;
    }

    requestAnimationFrame(this.gameLoop);
  }

  endGame(reason = 'health') {
    this.gameRunning = false;
    const finalScore = this.score;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    let endMessage = '';
    if (reason === 'time') {
      endMessage = '⏰ TIME UP!';
      this.ctx.fillText(endMessage, this.canvas.width / 2, this.canvas.height / 2 - 80);
      this.ctx.font = 'bold 32px Arial';
      this.ctx.fillText('Great effort conserving water!', this.canvas.width / 2, this.canvas.height / 2 - 20);
    } else {
      endMessage = '💔 GAME OVER!';
      this.ctx.fillText(endMessage, this.canvas.width / 2, this.canvas.height / 2 - 80);
      this.ctx.font = 'bold 32px Arial';
      this.ctx.fillText('Your ecosystem needs more protection', this.canvas.width / 2, this.canvas.height / 2 - 20);
    }
    
    this.ctx.font = 'bold 36px Arial';
    this.ctx.fillText(`Final Score: ${finalScore}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
    
    document.getElementById('startGameBtn').disabled = false;
    document.getElementById('pauseGameBtn').disabled = true;
    
    // Show notification
    const levelReached = this.level;
    alert(`Game Over!\n\nFinal Score: ${finalScore}\nLevel Reached: ${levelReached}\n\nThank you for playing and learning about ecosystem protection!\n\nPlay again to improve your score!`);
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const game = new RainwaterCollectorGame('rainWaterGame');
  game.initBackgroundElements();
  
  // Responsive canvas resizing
  function resizeCanvas() {
    const container = document.getElementById('gameCanvas');
    const maxWidth = Math.min(1000, container.offsetWidth - 40);
    const ratio = 1000 / 700;
    
    game.canvas.width = maxWidth;
    game.canvas.height = Math.floor(maxWidth / ratio);
    
    // Adjust game parameters for different canvas sizes
    if (game.canvas.width < 500) {
      game.player.speed = 6;
      game.player.width = 40;
      game.player.height = 55;
    } else if (game.canvas.width < 700) {
      game.player.speed = 7;
      game.player.width = 45;
      game.player.height = 60;
    } else {
      game.player.speed = 8;
      game.player.width = 50;
      game.player.height = 70;
    }
    
    // Reset player position
    game.player.y = game.canvas.height - 80;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Draw initial state
  game.initBackgroundElements();
  game.draw();
});
