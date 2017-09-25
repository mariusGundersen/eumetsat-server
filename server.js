const Koa = require('koa');
const Router = require('koa-router');

const fetch = require('./fetch.js');

const app = new Koa();
const router = new Router();

const images = [
  {
    longitude: 0,
    get: fetch({
      url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSG_RGBNatColour_LowResolution.jpg",
      refresh: 60*60*1000
    })
  },
  {
    longitude: 41.5,
    get: fetch({
      url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBNatColour_LowResolution.jpg",
      refresh: 60*60*1000
    })
  }
];

router.get('/:longitude/:time.jpeg', ({req, res, params}, next) => {
  const latest = closest(parseFloat(params.longitude)).get();
  console.log('->', new Date().toISOString(), req.url);
  res.writeHead(200, {'Content-Type': 'image/jpeg' });
  res.end(latest, 'binary');
});

router.get('/', ({req, res}, next) => {
  res.writeHead(200, {'Content-Type': 'text/html' });
  res.end(`<!doctype html>
  <html>
    <h1>Earth View</h1>
    <img src="/0/latest.jpeg" />
    <img src="/41.5/latest.jpeg" />
  </html>`)
})

app
.use(router.routes())
.listen(8080);

function closest(longitude){
  return images.sort((a, b) => Math.abs(a.longitude - longitude) - Math.abs(b.longitude - longitude))[0];
}