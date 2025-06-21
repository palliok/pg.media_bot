import { IContextBot } from "@models/context.interface";
import { createLivePicture } from "@services/youtube.service";
import { BaseScene } from "telegraf/scenes";
import { addMsgToRemoveList, removeTempMessages } from "utils/processMessages";
import fs from 'fs';
import { Input } from "telegraf";

const scene = new BaseScene<IContextBot>('youtube.picture.live');

scene.enter(async (ctx) => {
    addMsgToRemoveList(ctx.message?.message_id, ctx);
    removeTempMessages(ctx);

    if (ctx.session.video == undefined) {
        await ctx.scene.enter('start');
        return;
    }

    const picture = await createLivePicture(ctx.session.video?.id!);
    await ctx.sendMessage('Картинка «' + ctx.session.video?.title + '» загружена на YouTube. \n❗️ Не забудь загрузить в ВК');
    ctx.sendDocument(Input.fromLocalFile(picture)).then(() => {
        if (fs.existsSync(picture)) {
            fs.unlinkSync(picture);
        }
        ctx.scene.enter('start');
        return;
    });
});


export default scene;
