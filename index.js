const express = require('express');
const config = require('./config');


const app = express();
const path = require('path');

if (config.externalUrl) {
    const hostname = '0.0.0.0';
    app.listen(config.port, hostname, () => {
      console.log(`Server locally running at http://${hostname}:${config.port}/ and from outside on ${config.externalUrl}`);
    });
  } else {
    const server = https.createServer({
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.cert')
    }, app).listen(config.port, () => {
      console.log(`Server running at https://localhost:${config.port}/`);
    });
  }

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));  //pocetna stranica je za postavke igrice
});
