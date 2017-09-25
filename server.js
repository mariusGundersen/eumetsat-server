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
      covers: [
        [0, 352, 360, 8]
      ]
    })
  },
  {
    longitude: 41.5,
    get: fetch({
      url: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBNatColour_LowResolution.jpg",
      covers: [
        [0, 352, 360, 8]
      ]
    })
  },
  {
    longitude: 140.7,
    get: fetch({
      url: "http://agora.ex.nii.ac.jp/digital-typhoon/himawari-3g/latest/Hsfd/RGB/latest.jpg",
      covers: [
        [0, 0, 110, 10],
        [248, 0, 112, 12],
        [0, 350, 78, 10],
        [321, 350, 39, 10]
      ]
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
    <img src="/140.7/latest.jpeg" />
  </html>`)
})

app
.use(router.routes())
.listen(8080);

function closest(longitude){
  return images.sort((a, b) => Math.abs(a.longitude - longitude) - Math.abs(b.longitude - longitude))[0];
}