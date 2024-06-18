import Jimp from "jimp";
import { BaseCommandClient, GetReplyArgs } from "../baseCommandClient.js";

class ImageClient extends BaseCommandClient{
    triggerRegExp = /рсфср|шалаш/i;

    async getReply(args: GetReplyArgs) {
        try{
            const url = await args.ctx!.telegram.getFileLink((args.ctx!.message.photo[1] ?? args.ctx!.message.photo[0]).file_id);
            var img = args.commandName.toLowerCase() == 'рсфср' ? await this.getRcfcr(url.toString()) : await this.getShalash(url.toString());
            args.ctx?.replyWithPhoto({source: img});
        }
        catch {
            args.ctx?.reply(`Не удалось сделать ${args.commandName}`);
        }
    }

    private async getRcfcr(url: string): Promise<Buffer> {
        var srcImg = await Jimp.read(url);
        var cloneImg = srcImg.clone().mirror(true, false).crop(srcImg.getWidth() / 2, 0, srcImg.getWidth() / 2, srcImg.getHeight());
        srcImg.composite(cloneImg, srcImg.getWidth() / 2, 0);
        var bufferedImg = await srcImg.getBufferAsync(Jimp.MIME_JPEG);
        return bufferedImg;
    }

    private async getShalash(url: string): Promise<Buffer> {
        var srcImg = await Jimp.read(url);
        var cloneImg = srcImg.clone().crop(srcImg.getWidth() / 2, 0, srcImg.getWidth() / 2, srcImg.getHeight());
        srcImg.mirror(true, false).composite(cloneImg, srcImg.getWidth() / 2, 0);
        var bufferedImg = await srcImg.getBufferAsync(Jimp.MIME_JPEG);
        return bufferedImg;
    }
}

export { ImageClient };