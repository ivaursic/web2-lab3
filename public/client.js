const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const ASTEROID_WIDTH = 50;
const ASTEROID_HEIGHT = 50;
const ASTEROID_SPEED = 2;

let numAsteroids;
let asteroidFrequency;

function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resetGame(); 
  }
  

function setGameParameters() {
  // iz local storage
  numAsteroids = parseInt(localStorage.getItem("numAsteroids")) || 5;
  asteroidFrequency = parseInt(localStorage.getItem("asteroidFrequency")) || 2000;
}

  
function initializeGame() {
  let player = {
    x: canvas.width / 2 - PLAYER_WIDTH / 2,
    y: canvas.height / 2 - PLAYER_HEIGHT / 2,
    dx: 0,
    dy: 0
  };

  let asteroids = [];

  let bestTime = localStorage.getItem("bestTime") || "00:00.000";
  let startTime, currentTime;

  const asteroidImage = new Image();
  asteroidImage.src = "asteroid.png";
  asteroidImage.onload = function() {
    if (asteroidImage.width === 0 || asteroidImage.height === 0) {
      console.error("Slika asteroida nije u?itana ispravno. Proverite putanju i veli?inu slike.");
    }
  };

  const playerImage = new Image();
  playerImage.src = "spaceship.png";
  playerImage.onload = function() {
    if (playerImage.width === 0 || playerImage.height === 0) {
      console.error("Slika igra?a nije u?itana ispravno. Proverite putanju i veli?inu slike.");
    }
  };


  function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
  }

  function drawAsteroid(asteroid) {
    ctx.drawImage(asteroidImage, asteroid.x, asteroid.y, ASTEROID_WIDTH, ASTEROID_HEIGHT);
  }

  function updatePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    if (player.x > canvas.width) player.x = 0;
    if (player.x < 0) player.x = canvas.width;
    if (player.y > canvas.height) player.y = 0;
    if (player.y < 0) player.y = canvas.height;
  }

  function updateAsteroids() {
    for (let asteroid of asteroids) {
      asteroid.x += asteroid.dx;
      asteroid.y += asteroid.dy;

      if (asteroid.x > canvas.width) asteroid.x = 0;
      if (asteroid.x < 0) asteroid.x = canvas.width;
      if (asteroid.y > canvas.height) asteroid.y = 0;
      if (asteroid.y < 0) asteroid.y = canvas.height;

      if (
        player.x < asteroid.x + ASTEROID_WIDTH &&
        player.x + PLAYER_WIDTH > asteroid.x &&
        player.y < asteroid.y + ASTEROID_HEIGHT &&
        player.y + PLAYER_HEIGHT > asteroid.y
      ) {
        handleCollision();
      }
    }
  }

  function handleCollision() {
    currentTime = new Date() - startTime;

    if (currentTime > bestTime) {
      bestTime = currentTime;
      localStorage.setItem("bestTime", bestTime);
    }

    resetGame();
  }

  function resetGame() {
    player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
    player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
    asteroids = [];
    generateAsteroids();
  }

  function generateAsteroids() {
    for (let i = 0; i < numAsteroids; i++) {
      generateAsteroid();
    }
  }

  function generateAsteroid() {
    asteroids.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * ASTEROID_SPEED,
        dy: (Math.random() - 0.5) * ASTEROID_SPEED
      });
  }

  function drawTime() {
    ctx.font = '16px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.fillText(`Best Time: ${formatTime(bestTime)}`, canvas.width - 10, 20);
    ctx.fillText(`Current Time: ${formatTime(currentTime)}`, canvas.width - 10, 40);
  }

  function formatTime(time) {
    const minutes = Math.floor(time / (60 * 1000));
    const seconds = Math.floor((time % (60 * 1000)) / 1000);
    const milliseconds = time % 1000;
    return `${padZero(minutes)}:${padZero(seconds)}.${padZero(milliseconds, 3)}`;
  }

  function padZero(num, size = 2) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  function draw() {
    currentTime = new Date() - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    for (let asteroid of asteroids) {
      drawAsteroid(asteroid);
    }
    drawTime();

    updatePlayer();
    updateAsteroids();
  }

  function startGame() {
    setGameParameters(); // iz local storage-a
    generateAsteroids();
    startTime = new Date();
    setInterval(draw, 10);

     setInterval(function() {
    generateAsteroid();
  }, asteroidFrequency);
  }

  document.addEventListener("keydown", function(event) {
    handleKeyDown(event);
  });

  document.addEventListener("keyup", function(event) {
    handleKeyUp(event);
  });

  window.addEventListener("resize", handleResize);

  function handleKeyDown(event) {
    switch(event.key) {
      case "ArrowLeft":
        player.dx = -2;
        break;
      case "ArrowRight":
        player.dx = 2;
        break;
      case "ArrowUp":
        player.dy = -2;
        break;
      case "ArrowDown":
        player.dy = 2;
        break;
    }
  }

  function handleKeyUp(event) {
    switch(event.key) {
      case "ArrowLeft":
      case "ArrowRight":
        player.dx = 0;
        break;
      case "ArrowUp":
      case "ArrowDown":
        player.dy = 0;
        break;
    }
  }

  startGame();
}

initializeGame(); 