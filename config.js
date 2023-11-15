// config.js
const externalUrl = 'https://asteroids-web2-lab3.onrender.com';
const port = externalUrl && 5432 ? parseInt(5432) : 4080;

module.exports = {
  externalUrl,
  port,
  baseURL: externalUrl || `https://localhost:${port}`,
};
