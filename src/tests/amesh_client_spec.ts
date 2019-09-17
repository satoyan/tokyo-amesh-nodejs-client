// tslint:disable:no-unused-expression
import * as chai from "chai";
import "mocha";
import { AmeshClient, ImageSize } from "../";
import * as Jimp from "jimp";
import * as _ from "lodash";

describe("AmeshClient", () => {
    let target: AmeshClient;

    beforeEach(() => {
        target = new AmeshClient();
    });

    describe("getTimeline", () => {
        let timeline: string[];

        beforeEach(() => {
            return target.getMeshIndices()
                .then((tl) => timeline = tl);
        });

        it("timeline should not be null or undefined", () => {
            chai.expect(timeline).not.to.be.null;
            chai.expect(timeline).not.to.be.undefined;
        });

        it("timelines should be instance of string[]", () => {
            chai.expect(timeline).to.instanceof(Array);
        });
    });

    describe("getImage", () => {
        let timeline: string[];
        let image: Jimp;

        before(() => {
            return target.getMeshIndices().then((tl) => timeline = tl);
        });

        describe("get last image", () => {
            describe("get large image", () => {
                before(() => {
                    return target.getImage(ImageSize.Large, timeline[0])
                        .then((img) => image = img);
                });

                it("image should not be null nor undefined", () => {
                    chai.expect(image).not.to.be.null;
                    chai.expect(image).not.to.be.undefined;
                });

                it("image size is large", () => {
                    chai.expect(image.bitmap.width).to.eq(30801);
                    chai.expect(image.bitmap.height).to.eq(1920);
                });
            });

            describe("get small image", () => {
                before(() => {
                    return target.getImage(ImageSize.Small, timeline[0])
                        .then((img) => image = img);
                });

                it("image should not be null nor undefined", () => {
                    chai.expect(image).not.to.be.null;
                    chai.expect(image).not.to.be.undefined;
                });

                it("image size is large", () => {
                    chai.expect(image.bitmap.width).to.eq(770);
                    chai.expect(image.bitmap.height).to.eq(480);
                });
            });
        });

        describe("get first image", () => {
            describe("get large image", () => {
                before(() => {
                    return target.getImage(ImageSize.Large, _.last(timeline) as string)
                        .then((img) => image = img);
                });

                it("image should not be null nor undefined", () => {
                    chai.expect(image).not.to.be.null;
                    chai.expect(image).not.to.be.undefined;
                });

                it("image size is large", () => {
                    chai.expect(image.bitmap.width).to.eq(3080);
                    chai.expect(image.bitmap.height).to.eq(1920);
                });
            });

            describe("get small image", () => {
                before(() => {
                    return target.getImage(ImageSize.Small, _.last(timeline) as string)
                        .then((img) => image = img);
                });

                it("image should not be null nor undefined", () => {
                    chai.expect(image).not.to.be.null;
                    chai.expect(image).not.to.be.undefined;
                });

                it("image size is large", () => {
                    chai.expect(image.bitmap.width).to.eq(770);
                    chai.expect(image.bitmap.height).to.eq(480);
                });
            });
        });

        describe("get latest image with infered methIndex", () => {
            describe("get large image", () => {
                before(() => {
                    return AmeshClient.getLatestImage(ImageSize.Large,)
                        .then((img) => image = img);
                });

                it("image should not be null nor undefined", () => {
                    chai.expect(image).not.to.be.null;
                    chai.expect(image).not.to.be.undefined;
                });

                it("image size is large", () => {
                    chai.expect(image.bitmap.width).to.eq(3080);
                    chai.expect(image.bitmap.height).to.eq(1920);
                });
            });

            describe("get small image", () => {
                before(() => {
                    return AmeshClient.getLatestImage(ImageSize.Small,)
                        .then((img) => image = img);
                });

                it("image should not be null nor undefined", () => {
                    chai.expect(image).not.to.be.null;
                    chai.expect(image).not.to.be.undefined;
                });

                it("image size is large", () => {
                    chai.expect(image.bitmap.width).to.eq(770);
                    chai.expect(image.bitmap.height).to.eq(480);
                });
            });
        });
    });
})
