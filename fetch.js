const Jimp = require('jimp');
const request = require('request');

const fs = require('fs').promises;

module.exports = function start({title, log, imageUrl, json, covers = []}) {
  let latest = undefined;
  let fetchCount = 0;
  let lastFetch = new Date();
  let delayNext = 0;
  let failCount = 0;

  async function fetch(){
    let latestHash;
    while(true){
      try{
        const url = await getUrl(imageUrl, json, log);
        const now = new Date();
        log('fetching', url, now);
        const image = await Jimp.read(url);
        const hash = image.hash();
        if(latestHash == hash) throw new Error('not updated yet');

        log('writing image to disk');
        const path = `/mnt/earths/${title}/${now.getFullYear()}-${pad(now.getMonth())}-${pad(now.getDate())}`;
        await fs.mkdir(path, {recursive: true});
        const file = `${path}/${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.jpg`;
        await image.write(file);
        log('Wrote', file);

        image.resize(360, 360);
        for(const [x, y, width, height] of covers){
          image.scan(x, y, width, height, blacken);
        }

        latest = await new Promise((res, rej) => image.getBuffer('image/jpeg', (err, ok) => err ? rej(err) : res(ok)));
        latestHash = hash;
        log('fetch success', latestHash);
        lastFetch = now;
        const milliseconds = getTimeout();
        log(`next fetch in ${milliseconds/1000}s`);
        delayNext = milliseconds;
        failCount = 0;
        fetchCount = 0;
        await delay(milliseconds);
      }catch(e){
        log(`fetch failed`)
        log(e && e.message);
        failCount++;
        delayNext = failCount*60*1000;
        log(`next fetch in ${60*failCount}s`);
        await delay(delayNext);
      }
    }
  }

  fetch();

  return {
    getLatest(ignore){
      if(!ignore) fetchCount++;
      return latest;
    },
    lastFetch: () => lastFetch.toISOString(),
    failCount: () => failCount,
    nextUpdate: () => (delayNext/1000)|0,
    fetchCount: () => fetchCount
  };
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
const pad = n => n < 10 ? '0'+n : ''+n;

async function getUrl(imgUrl, jsonUrl, log){
  if(!jsonUrl) return imgUrl;

  log('getting json', jsonUrl);
  const times = await getJson(jsonUrl);
  log('got json');
  return imgUrl(times['timestamps_int'][0]);
}

async function getJson(url){
  return new Promise((res, rej) => request({
    url,
    json: true
  }, (error, response, body) => error ? rej(error) : res(body)));
}