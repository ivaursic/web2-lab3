document.addEventListener("DOMContentLoaded", function () {
  const startGameBtn = document.getElementById("startGameBtn");

  startGameBtn.addEventListener("click", function () {
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
          })
          .catch(error => {
              console.error("Gre?ka pri pokretanju igre:", error);
          });
  });
});
