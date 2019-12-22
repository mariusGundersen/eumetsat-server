const fetch = require('./fetch.js');

function getImages() {
  return [
    {
      longitude: -89.5,
      ...fetch({
        title: 'america',
        imageUrl: timestamp => `http://rammb-slider.cira.colostate.edu/data/imagery/${timestamp.toString(10).substr(0, 8)}/goes-16---full_disk/natural_color/${timestamp}/00/000_000.png`,
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
}

exports.getImages = getImages;
