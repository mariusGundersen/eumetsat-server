const Jimp = require('jimp');
const http = require('http');

let latest = null;

async function fetch(){
  console.log('fetching', new Date());
  try{
    const image = await Jimp.read("http://oiswww.eumetsat.org/IPPS/html/latestImages/EUMETSAT_MSG_RGBNatColour_LowResolution.jpg");
    const buffer = await new Promise((res, rej) => {
      image
        .resize(360, 360)
        .scan(0, 352, 360, 360, function (x, y, idx) {
          this.bitmap.data[ idx + 0 ] = 0;
          this.bitmap.data[ idx + 1 ] = 0;
          this.bitmap.data[ idx + 2 ] = 0;
        })
        .getBuffer('image/jpeg', (err, buffer) => err ? rej(err) : res(buffer))
    });
    latest = buffer;
    console.log('fetch success');
  }catch(e){
    console.error(e.message)
  }finally{
    const milliseconds = getTimeout();
    console.log(`next fetch in ${milliseconds/1000}s`)
    setTimeout(fetch, milliseconds);
  }
}

fetch();

http.createServer((req, res) => {
  console.log('->', new Date().toISOString(), req.url);
  res.writeHead(200, {'Content-Type': 'image/jpeg' });
  res.end(latest, 'binary');
}).listen(8080);

const getTimeout = () => (getMillisecondsUntilNextSecond() + 1000*(getSecondsUntilNextMinute() + 60*getMinutesUntilNextHour())) % (10*60*1000);
const getMinutesUntilNextHour = () => 59 - new Date().getMinutes();
const getSecondsUntilNextMinute = () => 59 - new Date().getSeconds();
const getMillisecondsUntilNextSecond = () => 1000 - new Date().getMilliseconds();
