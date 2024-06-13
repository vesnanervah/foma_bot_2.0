import Jimp from "jimp";

class ImageClient {
    async getRcfcr(url: string): Promise<Buffer> {
        var srcImg = await Jimp.read(url);
        var cloneImg = srcImg.clone().mirror(true, false).crop(srcImg.getWidth() / 2, 0, srcImg.getWidth() / 2, srcImg.getHeight());
        srcImg.composite(cloneImg, srcImg.getWidth() / 2, 0);
        var bufferedImg = await srcImg.getBufferAsync(Jimp.MIME_JPEG);
        return bufferedImg;
    }
}

export { ImageClient };