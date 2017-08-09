# tokyo-amesh-nodejs-client

## How to use

### install
```
$ npm i tokyo_amesh_node_client

# run test
$ cd ./node_modules/tokyo_amesh_node_client && npm run test
```

### writing code
```
const {
    ImageSize,
    AmeshClient
} = require("tokyo_amesh_node_client");


async function test() {
    const ac = new AmeshClient();
    const timeline = await ac.getTimeline();
    console.log(timeline);

    const latest = timeline[0];

    // get small image as Jimp object
    const small = await ac.getImage(ImageSize.Small, latest)
    console.info(small);


    // save as file
    const dest = `/tmp/amesh_${latest}.png`;
    await ac.downloadImage(ImageSize.Large, latest, dest);
}

```
