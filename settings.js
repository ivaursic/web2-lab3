// settings.js
function startGame() {
    const numAsteroids = document.getElementById("numAsteroids").value;
    const asteroidFrequency = document.getElementById("asteroidFrequency").value;
  
    // Prenosimo unesene parametre na index.html preko local storage
    localStorage.setItem("numAsteroids", numAsteroids);
    localStorage.setItem("asteroidFrequency", asteroidFrequency);
  
    // Redirectamo na glavnu igru
    window.location.href = "game.html";
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    // Sada se ova funkcija izvr?ava kada je DOM u potpunosti u?itan
    // Dodajte ovdje bilo kakve dodatne inicijalizacije ili event listenere
});