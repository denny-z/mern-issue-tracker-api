const express = require('express');
require('dotenv').config();

const app = express();

const UI_API_ENDPOINT = process.env.UI_API_ENDPOINT || 'http://localhost:3000/graphql'
const env = { UI_API_ENDPOINT };

app.use(express.static('public'));

app.get('/env.js', function(req, res) {
  res.send(`window.ENV = ${JSON.stringify(env)}`);
});

const port = process.env.UI_SERVER_PORT || 8000;

app.listen(port, function() {
  console.log(`UI server started on port ${port}`);
});
