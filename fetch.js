const Jimp = require('jimp');

module.exports = function start({url, covers}) {
  let latest = undefined;

  async function fetch(){
    let latestHash;
    while(true){
      console.log('fetching', url, new Date());
      try{
        const image = await Jimp.read(url);
        let hash;
        const buffer = await new Promise((res, rej) => {
          hash = image.hash();
          if(latestHash == hash) return rej(new Error('not updated yet'));
          image.resize(360, 360);
          for(const [x, y, width, height] of covers){
            image.scan(x, y, width, height, blacken);
          }
          image.getBuffer('image/jpeg', (err, buffer) => err ? rej(err) : res(buffer))
        });
        latestHash = hash;
        latest = buffer;
        console.log('fetch success');
        const milliseconds = getTimeout();
        console.log(`next fetch in ${milliseconds/1000}s`);
        await delay(milliseconds);
      }catch(e){
        console.log(`fetch failed`)
        console.error(e.message);
        console.log(`next fetch in ${60}s`);
        await delay(1000*60);
      }
    }
  }

  fetch();

  return () => latest;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

const getTimeout = () => getMillisecondsUntilNextSecond() + 1000*(getSecondsUntilNextMinute() + 60*getMinutesUntilNextHour());
const getMinutesUntilNextHour = () => 59 - new Date().getMinutes();
const getSecondsUntilNextMinute = () => 59 - new Date().getSeconds();
const getMillisecondsUntilNextSecond = () => 1000 - new Date().getMilliseconds();
function blacken(x, y, idx) {
  this.bitmap.data[ idx + 0 ] = 0;
  this.bitmap.data[ idx + 1 ] = 0;
  this.bitmap.data[ idx + 2 ] = 0;
}