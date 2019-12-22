const { getImages } = require("./getImages");

const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');

const app = new Koa();
const router = new Router();

const images = getImages();

router.get('/:longitude/:time.jpeg', ({req, res, params, query}, next) => {
  const latest = closest(parseFloat(params.longitude)).getLatest(query.ignore);
  console.log('->', new Date().toISOString(), req.url);
  res.writeHead(200, {'Content-Type': 'image/jpeg' });
  res.end(latest, 'binary');
});

router.get('/', ({req, res}, next) => {
  res.writeHead(200, {'Content-Type': 'text/html' });
  res.end(template`<!doctype html>
  <html>
    <style>
      body {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        background: black;
        color: #eee;
      }
    </style>
    ${images.map(image)}
  </html>`)
});

app
.use(serve('/mnt/earths'))
.use(router.routes())
.listen(8080);

function image(img){
  return template`<div class="location">
    <h2>Longitude: ${img.longitude}</h2>
    <img src="/${img.longitude}/latest.jpeg?ignore=1" />
    <ul>
      <li>Last fetch: ${img.lastFetch()}
      <li>Next fetch: ${img.nextUpdate()} seconds
      <li>Fail count: ${img.failCount()}
      <li>Fetches: ${img.fetchCount()}
    </ul>
  </div>`;
}

function closest(longitude){
  while(longitude>180) longitude-=360;
  while(longitude<-180) longitude+=360;
  return [...images].sort((a, b) => Math.abs(a.longitude - longitude) - Math.abs(b.longitude - longitude))[0];
}

function template(strings, ...objects){
  return String.raw(strings, ...objects.map(o => Array.isArray(o) ? o.join('') : o))
}