const path = require('path');
const config = require('./config');
const express = require('express');
const https = require('https'); // Dodano
const fs = require('fs'); // Dodano
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = 3000;

if (config.externalUrl) {
  const hostname = '0.0.0.0';
  app.listen(config.port, hostname, () => {
    console.log(`Server locally running at http://${hostname}:${config.port}/ and from outside on ${config.externalUrl}`);
  });
} else {
  const https = require('https');  // Dodajte ovu liniju kako biste uklju?ili modul 'https'
  const fs = require('fs');  
  const server = https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app)
    .listen(config.port, function () {
      console.log(`Server running at https://localhost:${config.port}/`);
    });
}

// Dodajte ovu rutu kako biste poslali HTML stranicu
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'settings.html'));
});

app.post('/start-game', (req, res) => {
  // Dohvatite podatke iz tijela zahtjeva (req.body)
  const { numAsteroids, asteroidFrequency } = req.body;

  // Ovdje obavite inicijalizaciju igre s dobivenim parametrima
  // Primjer:
  const player = {
      x: canvas.width / 2 - PLAYER_WIDTH / 2,
      y: canvas.height / 2 - PLAYER_HEIGHT / 2,
      dx: 0,
      dy: 0,
  };

  // Postavite igra?a i parametre igre
  setGameParameters(numAsteroids, asteroidFrequency, player);

  // Inicijalizirajte igru
  generateAsteroids();
  startTime = new Date();

  // Postavite intervale za crtanje i generiranje asteroida
  setInterval(draw, 10);
  setInterval(function () {
      generateAsteroid();
  }, asteroidFrequency);

  // Po?aljite odgovor (ako je potrebno)
  res.json({ success: true });
});

// Ovaj dio je pomaknut iznad, izvan if-else bloka, tako da se izvr?ava uvijek kada je potrebno
if (typeof document !== 'undefined') {

window.onload = function () {
  const canvas = document.getElementById("game");

  if (!canvas) {
    console.error("Canvas element not found.");
    return;
  }

  const ctx = canvas.getContext("2d");
  const PLAYER_WIDTH = 50;
  const PLAYER_HEIGHT = 50;
  const ASTEROID_WIDTH = 50;
  const ASTEROID_HEIGHT = 50;
  const ASTEROID_SPEED = 2;

  let numAsteroids;
  let asteroidFrequency;
  let player;
  let asteroids;
  let bestTime;
  let startTime, currentTime;

  const asteroidImage = new Image();
  asteroidImage.src = "asteroid.png";
  asteroidImage.onload = function () {
    if (asteroidImage.width === 0 || asteroidImage.height === 0) {
      console.error("Slika asteroida nije u?itana ispravno. Proverite putanju i veli?inu slike.");
    }
  };

  const playerImage = new Image();
  playerImage.src = "spaceship.png";
  playerImage.onload = function () {
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
  event.preventDefault();

  const numAsteroids = document.getElementById("numAsteroids").value;
  const asteroidFrequency = document.getElementById("asteroidFrequency").value;

  // Pohrani podatke u localStorage
  localStorage.setItem("numAsteroids", numAsteroids);
  localStorage.setItem("asteroidFrequency", asteroidFrequency);

  // Po?alji podatke na server
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
      // Redirect to game.html
      window.location.href = "game.html";
    })
    .catch(error => {
      console.error("Gre?ka pri pokretanju igre:", error);
    });
}


  document.addEventListener("keydown", function (event) {
    handleKeyDown(event);
  });

  document.addEventListener("keyup", function (event) {
    handleKeyUp(event);
  });

  function handleKeyDown(event) {
    switch (event.key) {
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
    switch (event.key) {
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

}};
startGame();
