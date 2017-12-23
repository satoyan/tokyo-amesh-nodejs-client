# tokyo-amesh-nodejs-client

## How to use

### install
```
$ npm i tokyo_amesh_node_client

# run test
$ cd ./node_modules/tokyo_amesh_node_client && npm run test
```

### example (TypeScript)
```
import { AmeshClient, ImageSize } from "tokyo_amesh_node_client";

// The easiest way to get amesh image (as Jimp object).
AmeshClient.getLatestImage(ImageSize.Small)
    .then((img) => {
        console.log("Getting amesh image has been finished.");
        console.log(`width: ${img.bitmap.width}, height: ${img.bitmap.height}`);
    });

// You can also download an image as a file.
const fileName = "amesh.png";
AmeshClient.downloadLatestImage(ImageSize.Small, fileName)
    .then((img) => {
        console.log("Image has been downloaded.");
    });

// You can get mesh indecies.
const ameshClient = new AmeshClient();
ameshClient.getMeshIndices()
    .then((indices) => {
        console.log(indices);
    });

// Mesh indices looks like below.
[ '201708101315',
  '201708101310',
  '201708101305',
  '201708101300',
]

// You can get an image using specific mesh index.
ameshClient.getMeshIndices()
    .then((indices) => {
        return ameshClient.getImage(ImageSize.Small, indices[0]);
    })
    .then((img) => {
        console.log("Got an image.");
    });
```
