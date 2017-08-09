import * as Jimp from "jimp";
import * as request from "request";
import * as _ from "lodash";
import ImageSize from "./image_size";
import * as moment from "moment";

class AmeshClient {
    readonly AMESH_TIMELINES_URL = "http://tokyo-ame.jwa.or.jp/scripts/mesh_index.js";
    readonly AMESH_BASE_URL = "http://tokyo-ame.jwa.or.jp";

    // Amesh updadtes every 5 minutes.
    static readonly AMESH_UPDATE_INTERVAL_MINUTE = 5;
    static readonly TIME_LINE_FORMAT = "YYYYMMDDHHmm";
    static readonly DEFAULT_COUNT_CANDIDATE = 3;

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

    /**
     *
     * @param max count to length of result
     * @example Current datetime is 2017/05/30 13:06, max is 3, then result will be
     * ["201705301305", "201705301300", "201705301255"]
     */
    public static getLatestTimeLineCandidates(max: number = 1): string[] {
        let result: string[] = [];
        let currentTime = moment();
        while (result.length < max) {
            let i = Math.floor(currentTime.minutes() / this.AMESH_UPDATE_INTERVAL_MINUTE);
            currentTime.minutes(i * this.AMESH_UPDATE_INTERVAL_MINUTE);
            result.push(currentTime.format(this.TIME_LINE_FORMAT));
            currentTime.add(-this.AMESH_UPDATE_INTERVAL_MINUTE, "minutes");
        }
        return result;
    }

    public static async getLatestImage(size: ImageSize): Promise<Jimp> {
        const timeline = this.getLatestTimeLineCandidates(this.DEFAULT_COUNT_CANDIDATE);

        const c = new AmeshClient();
        for (let i = 0; i < timeline.length; i++) {
            try {
                return await c.getImage(size, timeline[i]);
            } catch (ex) {
                console.error(`Image not found ${timeline[i]}`);
            }
        }

        throw new Error("Image not found");
    }

    public static async downloadLatestImage(size: ImageSize, dest: string): Promise<Jimp> {
        if (_.isEmpty(dest)) { throw new Error("dest is empty"); }
        const img = await this.getLatestImage(size);
        img.write(dest);
        return img;
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
