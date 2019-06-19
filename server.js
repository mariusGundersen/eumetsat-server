const Koa = require('koa');
const Router = require('koa-router');

const fetch = require('./fetch.js');

const app = new Koa();
const router = new Router();

const images = [
  {
    longitude: -89.5,
    ...fetch({
      title: 'america',
      imageUrl: timestamp => `http://rammb-slider.cira.colostate.edu/data/imagery/${timestamp.toString(10).substr(0,8)}/goes-16---full_disk/natural_color/${timestamp}/00/000_000.png`,
      json: "http://rammb-slider.cira.colostate.edu/data/json/goes-16/full_disk/geocolor/latest_times.json",
      log: (...m) => console.log('[-89.5]', ...m)
    })
  },
  {
    longitude: 0,
    ...fetch({
      title: 'africa',
      imageUrl: "https://eumetview.eumetsat.int/static-images/latestImages/EUMETSAT_MSG_RGBNatColourEnhncd_LowResolution.jpg",
      covers: [
        [0, 352, 360, 8]
      ],
      log: (...m) => console.log('[  0.0]', ...m)
    })
  },
  {
    longitude: 41.5,
    ...fetch({
      title: 'middleEast',
      imageUrl: "https://eumetview.eumetsat.int/static-images/latestImages/EUMETSAT_MSGIODC_RGBNatColourEnhncd_LowResolution.jpg",
      covers: [
        [0, 352, 360, 8]
      ],
      log: (...m) => console.log('[ 41.5]', ...m)
    })
  },
  {
    longitude: 140.7,
    ...fetch({
      title: 'pacific',
      imageUrl: "http://rammb.cira.colostate.edu/ramsdis/online/images/thumb/himawari-8/full_disk_ahi_natural_color.jpg",
      covers: [
        [0, 0, 110, 10],
        [248, 0, 112, 12],
        [0, 350, 78, 10],
        [321, 350, 39, 10]
      ],
      log: (...m) => console.log('[140.7]', ...m)
    })
  }
];

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
})

app
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