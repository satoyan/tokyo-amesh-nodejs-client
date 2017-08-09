import "mocha";
import * as chai from "chai";
import { ImageSize } from "../";

describe("ImageSize", () => {
    it("Small should be '000'", () => {
        chai.expect(ImageSize.Small).to.eq("000");
    });

    it("Large should be '100'", () => {
        chai.expect(ImageSize.Large).to.eq("100");
    });
})