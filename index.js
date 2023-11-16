const path = require('path');
const config = require('./config');
const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 3000;

const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const ASTEROID_WIDTH = 50;
const ASTEROID_HEIGHT = 50;
const ASTEROID_SPEED = 2;

// Provjerava je li konfigurirana vanjska URL adresa
if (config.externalUrl) {
  // Ako je vanjska URL adresa konfigurirana, pokre?e HTTP server
  const hostname = '0.0.0.0';
  app.listen(config.port, hostname, () => {
    console.log(`Server locally running at http://${hostname}:${config.port}/ and from outside on ${config.externalUrl}`);
  });
} else {
  // Ako vanjska URL adresa nije konfigurirana, pokre?e HTTPS server
  const server = https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app).listen(config.port, () => {
    console.log(`Server running at https://localhost:${config.port}/`);
  });
}

// Postavljanje stati?kog direktorija za public
app.use(express.static(path.join(__dirname, 'public')));

// Dodaje rutu za slanje HTML stranice
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.post('/start-game', (req, res) => {
  // Handle the POST request for starting the game
  const { numAsteroids, asteroidFrequency } = req.body;
  const canvas = null; // canvas ?e biti postavljen na klijentskoj strani
  const game = initializeGame(canvas, numAsteroids, asteroidFrequency);
  res.json({ success: true, game });
});

// Inicijalizacija igre
function initializeGame(canvas, numAsteroids, asteroidFrequency) {
  let asteroids = [];
  let bestTime = 0;
  let startTime = 0;
  let currentTime = 0;

  const player = {
    x: canvas.width / 2 - PLAYER_WIDTH / 2,
    y: canvas.height / 2 - PLAYER_HEIGHT / 2,
    dx: 0,
    dy: 0,
  };

  setGameParameters(numAsteroids, asteroidFrequency, player);

  generateAsteroids();
  startTime = new Date();

  // Postavlja intervale za crtanje i generiranje asteroida
  setInterval(draw, 10);
  setInterval(function () {
    generateAsteroid();
  }, asteroidFrequency);

  return {
    player,
    asteroids,
    bestTime,
    startTime,
    currentTime,
  };
}

// Crtanje igre
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

// Vra?a funkciju za crtanje igra?a
function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
}

// Vra?a funkciju za crtanje asteroida
function drawAsteroid(asteroid) {
  ctx.drawImage(asteroidImage, asteroid.x, asteroid.y, ASTEROID_WIDTH, ASTEROID_HEIGHT);
}

// Vra?a funkciju za a?uriranje polo?aja igra?a
function updatePlayer() {
  player.x += player.dx;
  player.y += player.dy;

  if (player.x > canvas.width) player.x = 0;
  if (player.x < 0) player.x = canvas.width;
  if (player.y > canvas.height) player.y = 0;
  if (player.y < 0) player.y = canvas.height;
}

// Vra?a funkciju za a?uriranje polo?aja asteroida
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

// Vra?a funkciju za crtanje vremena
function drawTime() {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'right';
  ctx.fillText(`Best Time: ${formatTime(bestTime)}`, canvas.width - 10, 20);
  ctx.fillText(`Current Time: ${formatTime(currentTime)}`, canvas.width - 10, 40);
}

// Formatira vrijeme u odgovaraju?i oblik
function formatTime(time) {
  const minutes = Math.floor(time / (60 * 1000));
  const seconds = Math.floor((time % (60 * 1000)) / 1000);
  const milliseconds = time % 1000;
  return `${padZero(minutes)}:${padZero(seconds)}.${padZero(milliseconds, 3)}`;
}

// Dodaje nule ispred brojeva ako je potrebno
function padZero(num, size = 2) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

// Vra?a funkciju za rukovanje sudarom
function handleCollision() {
  currentTime = new Date() - startTime;

  if (currentTime > bestTime) {
    bestTime = currentTime;
    localStorage.setItem("bestTime", bestTime);
  }

  resetGame();
}

// Vra?a funkciju za resetiranje igre
function resetGame() {
  player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
  player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
  asteroids = [];
  generateAsteroids();
}

// Vra?a funkciju za generiranje asteroida
function generateAsteroids() {
  for (let i = 0; i < numAsteroids; i++) {
    generateAsteroid();
  }
}

// Vra?a funkciju za generiranje pojedinog asteroida
function generateAsteroid() {
  asteroids.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    dx: (Math.random() - 0.5) * ASTEROID_SPEED,
    dy: (Math.random() - 0.5) * ASTEROID_SPEED
  });
}

// Provjerava postoji li dokument (koristi se za izbjegavanje gre?aka pri izvr?avanju na serveru)
if (typeof document !== 'undefined') {
  // Pokre?e se nakon ?to se dokument potpuno u?ita
  window.onload = function () {
    const canvas = document.getElementById("game");

    if (!canvas) {
      console.error("Canvas element not found.");
      return;
    }

    const ctx = canvas.getContext("2d");

    let numAsteroids;
    let asteroidFrequency;
    let player;
    let asteroids;
    let bestTime;
    let startTime, currentTime;

    const asteroidImage = new Image();
    asteroidImage.src = "/asteroid.png"; // Dodao '/' ispred putanje
    asteroidImage.onload = function () {
      if (asteroidImage.width === 0 || asteroidImage.height === 0) {
        console.error("Slika asteroida nije u?itana ispravno. Provjerite putanju i veli?inu slike.");
      }
    };

    const playerImage = new Image();
    playerImage.src = "/spaceship.png"; // Dodao '/' ispred putanje
    playerImage.onload = function () {
      if (playerImage.width === 0 || playerImage.height === 0) {
        console.error("Slika igra?a nije u?itana ispravno. Provjerite putanju i veli?inu slike.");
      }
    };

    // Dodaje rukovanje tipkovni?kim doga?ajima
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Pokre?e igru
    startGame();
  };
}

// Dodaje funkciju za pokretanje igre
function startGame() {
  const numAsteroids = document.getElementById("numAsteroids").value;
  const asteroidFrequency = document.getElementById("asteroidFrequency").value;

  // Pohranjuje podatke u localStorage
  localStorage.setItem("numAsteroids", numAsteroids);
  localStorage.setItem("asteroidFrequency", asteroidFrequency);

  // ?alje podatke na server
  fetch("/start-game", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ numAsteroids, asteroidFrequency }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP gre?ka! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Igra pokrenuta:", data);
      // Nema preusmjeravanja
    })
    .catch(error => {
      console.error("Gre?ka pri pokretanju igre:", error);
    });
}
