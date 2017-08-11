import * as Jimp from "jimp";
import * as request from "request";
import * as _ from "lodash";
import ImageSize from "./image_size";
import * as moment from "moment";

class AmeshClient {
    static readonly UTC_OFFSET = 540; //JST
    static readonly AMESH_MESH_INDEX_URL = "http://tokyo-ame.jwa.or.jp/scripts/mesh_index.js";
    static readonly AMESH_BASE_URL = "http://tokyo-ame.jwa.or.jp";

    // Amesh updadtes every 5 minutes.
    static readonly AMESH_UPDATE_INTERVAL_MINUTE = 5;
    static readonly TIME_LINE_FORMAT = "YYYYMMDDHHmm";
    static readonly DEFAULT_COUNT_CANDIDATE = 3;

    private meshIndices: string[] = [];

    public async getMeshIndices(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            if (!_.isEmpty(this.meshIndices)) {
                resolve(this.meshIndices);
            }

            request.get(AmeshClient.AMESH_MESH_INDEX_URL, (err, res) => {
                if (!!err) {
                    reject(err);
                }

                if (res.statusCode !== 200) {
                    reject(new Error(`Failed to get meshIndices(${res.statusCode}).`));
                }

                try {
                    let body: string = res.body;
                    // Main part of contents are array of 'YYYYMMDDHHmm'
                    this.meshIndices = body.match(/\d{12}/g) as RegExpMatchArray;
                    resolve(this.meshIndices || []);
                } catch (ex) {
                    reject(new Error(`Failed to get meshIndices(${ex.messsage}).`));
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
    public static getLatestMeshIndexCandidates(max: number = 1): string[] {
        let result: string[] = [];
        let currentTime = moment().utcOffset(this.UTC_OFFSET);
        while (result.length < max) {
            let i = Math.floor(currentTime.minutes() / this.AMESH_UPDATE_INTERVAL_MINUTE);
            currentTime.minutes(i * this.AMESH_UPDATE_INTERVAL_MINUTE);
            result.push(currentTime.format(this.TIME_LINE_FORMAT));
            currentTime.add(-this.AMESH_UPDATE_INTERVAL_MINUTE, "minutes");
        }
        return result;
    }

    public static async getLatestImage(size: ImageSize): Promise<Jimp> {
        const meshIndices = this.getLatestMeshIndexCandidates(this.DEFAULT_COUNT_CANDIDATE);

        const c = new AmeshClient();
        for (let i = 0; i < meshIndices.length; i++) {
            try {
                console.log(`Get ${meshIndices[i]}...`);
                return await c.getImage(size, meshIndices[i]);
            } catch (ex) {
                console.error(`Image not found ${meshIndices[i]}`);
            }
        }

        throw new Error("Image not found");
    }

    public static async downloadLatestImage(size: ImageSize, dest: string): Promise<Jimp> {
        if (_.isEmpty(dest)) { throw new Error("dest is empty"); }
        const img = await this.getLatestImage(size);
        return new Promise<Jimp>((resolve, reject) => {
            img.write(dest, (err, image) => {
                if (!!err) {
                    reject(err);
                }
                resolve(image);
            });
        });
    }

    public async getMapImage(size: ImageSize): Promise<Jimp> {
        let url = `${AmeshClient.AMESH_BASE_URL}/map/map${size}.jpg`;
        return Jimp.read(url);
    }

    public async getMaskImage(size: ImageSize): Promise<Jimp> {
        let url = `${AmeshClient.AMESH_BASE_URL}/map/msk${size}.png`;
        return Jimp.read(url);
    }

    public async getMeshImage(size: ImageSize, meshIndex: string): Promise<Jimp> {
        let url = `${AmeshClient.AMESH_BASE_URL}/mesh/${size}/${meshIndex}.gif`;
        return Jimp.read(url);
    }

    public async getImage(size: ImageSize, meshIndex: string): Promise<Jimp> {
        let images = await Promise.all([
            this.getMapImage(size),
            this.getMaskImage(size),
            this.getMeshImage(size, meshIndex)
        ]);

        let result: Jimp = _.reduce<Jimp, Jimp>(
            images.slice(1, images.length),
            (result, img) => {
                return result.composite(img, 0, 0);
            },
            images[0]);

        return result;
    }

    public async downloadImage(size: ImageSize, meshIndex: string, dest: string): Promise<Jimp> {
        let img = await this.getImage(size, meshIndex);
        return new Promise<Jimp>((resolve, reject) => {
            img.write(dest, (err, image) => {
                if (!!err) {
                    reject(err);
                }
                resolve(image);
            });
        });;
    }
}


export default AmeshClient;
