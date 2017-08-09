import * as Jimp from "jimp";
import * as request from "request";
import * as _ from "lodash";
import ImageSize from "./image_size";

class AmeshClient {
    readonly AMESH_TIMELINES_URL = "http://tokyo-ame.jwa.or.jp/scripts/mesh_index.js";
    readonly AMESH_BASE_URL = "http://tokyo-ame.jwa.or.jp";
    private timeLine: string[] = [];

    public async getTimeline(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            if (!_.isEmpty(this.timeLine)) {
                resolve(this.timeLine);
            }

            request.get(this.AMESH_TIMELINES_URL, (err, res) => {
                if (!!err) {
                    reject(err);
                }

                if (res.statusCode !== 200) {
                    reject(new Error(`Failed to get timeline(${res.statusCode}).`));
                }

                try {
                    let body: string = res.body;
                    // Main part of contents are array of 'YYYYMMDDHHmm'
                    this.timeLine = body.match(/\d{12}/g) as RegExpMatchArray;
                    resolve(this.timeLine || []);
                } catch (ex) {
                    reject(new Error(`Failed to get timeline(${ex.messsage}).`));
                }
            });
        });
    }

    public async getMapImage(size: ImageSize): Promise<Jimp> {
        let url = `${this.AMESH_BASE_URL}/map/map${size}.jpg`;
        return Jimp.read(url);
    }

    public async getMaskImage(size: ImageSize): Promise<Jimp> {
        let url = `${this.AMESH_BASE_URL}/map/msk${size}.png`;
        return Jimp.read(url);
    }

    public async getMeshImage(size: ImageSize, timeline: string): Promise<Jimp> {
        let url = `${this.AMESH_BASE_URL}/mesh/${size}/${timeline}.gif`;
        return Jimp.read(url);
    }

    public async getImage(size: ImageSize, timeline: string): Promise<Jimp> {
        let images = await Promise.all([
            this.getMapImage(size),
            this.getMaskImage(size),
            this.getMeshImage(size, timeline)
        ]);


        return _.reduce<Jimp, Jimp>(
            images.slice(1, images.length),
            (result, img) => {
                return result.composite(img, 0, 0);
            },
            images[0]);
    }

    public async downloadImage(size: ImageSize, timeline: string, dest: string): Promise<void> {
        let img = await this.getImage(size, timeline);
        img.write(dest);
        return;
    }
}


export default AmeshClient;
