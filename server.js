const Jimp = require('jimp');
const http = require('http');

let latest = null;

async function fetch(){
  console.log('fetching', new Date());
  const image = await Jimp.read("http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSGIODC_RGBNatColour_LowResolution.jpg");
  const buffer = await new Promise((res, rej) => image.resize(360, 360).getBuffer('image/jpeg', (err, buffer) => err ? rej(err) : res(buffer)));
  latest = buffer;
  setTimeout(fetch, getTimeout());
}

fetch();

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'image/jpeg' });
  res.end(latest, 'binary');
}).listen(8080);

const getTimeout = () => getMillisecondsUntilNextSecond() + 1000*(getSecondsUntilNextMinute() + 60*getMinutesUntilNextHour());
const getMinutesUntilNextHour = () => 60 - new Date().getMinutes();
const getSecondsUntilNextMinute = () => 60 - new Date().getSeconds();
const getMillisecondsUntilNextSecond = () => 1000 - new Date().getMilliseconds();
