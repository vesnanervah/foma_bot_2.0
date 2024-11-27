import Jimp from "jimp";
import { BaseCommandClient, GetReplyArgs } from "../baseCommandClient.js";
import { Message, Update } from "@telegraf/types";

class ImageClient extends BaseCommandClient{
    triggerRegExp = /^рсфср|шалаш/i;

    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.triggerRegExp.test(commandName);
    }

    async getReply(args: GetReplyArgs<Update.MessageUpdate<Record<"photo", {}> & Message.PhotoMessage> & any>) {
        try{
            const url = await args.ctx!.telegram.getFileLink((args.ctx!.message.photo[1] ?? args.ctx!.message.photo[0]).file_id);
            const img = args.commandName.toLowerCase() == 'рсфср' ? await this.getRcfcr(url.toString()) : await this.getShalash(url.toString());
            args.ctx?.replyWithPhoto({source: img});
        }
        catch {
            args.ctx?.reply(`Не удалось сделать ${args.commandName}`);
        }
    }

    private async getRcfcr(url: string): Promise<Buffer> {
        const srcImg = await Jimp.read(url);
        const isEvenWidth = srcImg.getWidth() % 2 == 0;
        const cropX = isEvenWidth ? srcImg.getWidth() / 2 : (srcImg.getWidth() - 1) / 2;
        const cropWidth = isEvenWidth ? srcImg.getWidth() / 2 : (srcImg.getWidth() + 1) / 2;
        const cloneImg = srcImg.clone().mirror(true, false).crop(cropX, 0, cropWidth, srcImg.getHeight());
        srcImg.composite(cloneImg, srcImg.getWidth() / 2, 0);
        const bufferedImg = await srcImg.getBufferAsync(Jimp.MIME_JPEG);
        return bufferedImg;
    }

    private async getShalash(url: string): Promise<Buffer> {
        const srcImg = await Jimp.read(url);
        const isEvenWidth = srcImg.getWidth() % 2 == 0;
        const cropX = isEvenWidth ? srcImg.getWidth() / 2 : (srcImg.getWidth() - 1) / 2;
        const cropWidth = isEvenWidth ? srcImg.getWidth() / 2 : (srcImg.getWidth() + 1) / 2;
        const cloneImg = srcImg.clone().crop(cropX, 0, cropWidth, srcImg.getHeight());
        srcImg.mirror(true, false).composite(cloneImg, srcImg.getWidth() / 2, 0);
        const bufferedImg = await srcImg.getBufferAsync(Jimp.MIME_JPEG);
        return bufferedImg;
    }
}

export { ImageClient };