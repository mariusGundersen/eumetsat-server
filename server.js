const Koa = require('koa');
const Router = require('koa-router');

const fetch = require('./fetch.js');

const app = new Koa();
const router = new Router();

const images = [
  {
    longitude: 0,
    get: fetch({
      image: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSG_RGBNatColour_LowResolution.jpg",
      covers: [
        [0, 352, 360, 8]
      ]
    })
  },
  {
    longitude: 41.5,
    get: fetch({
      image: "http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBNatColour_LowResolution.jpg",
      covers: [
        [0, 352, 360, 8]
      ]
    })
  },
  {
    longitude: 140.7,
    get: fetch({
      image: "http://agora.ex.nii.ac.jp/digital-typhoon/himawari-3g/latest/Hsfd/RGB/latest.jpg",
      covers: [
        [0, 0, 110, 10],
        [248, 0, 112, 12],
        [0, 350, 78, 10],
        [321, 350, 39, 10]
      ]
    })
  },
  {
    longitude: -89.5,
    get: fetch({
      image: timestamp => `http://rammb-slider.cira.colostate.edu/data/imagery/${timestamp.toString(10).substr(0,8)}/goes-16---full_disk/geocolor/${timestamp}/00/000_000.png`,
      json: "http://rammb-slider.cira.colostate.edu/data/json/goes-16/full_disk/geocolor/latest_times.json",
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
    <img src="/-89.5/latest.jpeg" />
  </html>`)
})

app
.use(router.routes())
.listen(8080);

function closest(longitude){
  while(longitude>180) longitude-=360;
  while(longitude<-180) longitude+=360;
  return images.sort((a, b) => Math.abs(a.longitude - longitude) - Math.abs(b.longitude - longitude))[0];
}