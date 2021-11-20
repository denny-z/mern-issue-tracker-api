import dotenv from 'dotenv';
import express from 'express';
import SourceMapSupport from 'source-map-support';
import render from './render.jsx';

const proxy = require('http-proxy-middleware');

dotenv.config();
SourceMapSupport.install();

const app = express();

const apiProxyTarget = process.env.API_PROXY_TARGET;
if (apiProxyTarget) {
  app.use('/graphql', proxy({ target: apiProxyTarget }));
}

process.env.UI_API_ENDPOINT = process.env.UI_API_ENDPOINT || 'http://localhost:3000/graphql';
// eslint-disable-next-line max-len
process.env.UI_SERVER_API_ENDPOINT = (process.env.UI_SERVER_API_ENDPOINT || process.env.UI_API_ENDPOINT);

const enableHMR = (process.env.ENABLE_HMR || 'true') === 'true';
if (enableHMR && process.env.NODE_ENV !== 'production') {
  console.log('Adding dev middleware', enableHMR);
  /* eslint "global-require": "off" */
  /* eslint "import/no-extraneous-dependencies": "off" */
  const webpack = require('webpack');
  const devMiddleware = require('webpack-dev-middleware');
  const hotMiddleware = require('webpack-hot-middleware');

  const config = require('../webpack.config.js')[0];

  config.entry.app.push('webpack-hot-middleware/client');
  config.plugins = config.plugins || [];
  config.plugins.push(new webpack.HotModuleReplacementPlugin());

  const compiler = webpack(config);
  app.use(devMiddleware(compiler));
  app.use(hotMiddleware(compiler));
}

app.use(express.static('public'));


app.get('/env.js', (req, res) => {
  const env = {
    UI_API_ENDPOINT: process.env.UI_API_ENDPOINT,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  };
  res.send(`window.ENV = ${JSON.stringify(env)}`);
});

app.get('*', (req, res, next) => {
  render(req, res, next);
});

const port = process.env.UI_SERVER_PORT || 8000;

app.listen(port, () => {
  console.log(`UI server started on port ${port}`);
});

if (module.hot) {
  module.hot.accept('./render.jsx');
}
