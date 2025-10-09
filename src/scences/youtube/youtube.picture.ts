import { IContextBot } from "@models/context.interface";
import { getPictureFromVideo } from "@services/drawing.service";
import { BaseScene } from "telegraf/scenes";
import { addMsgToRemoveList, removeTempMessages } from "utils/processMessages";

const scene = new BaseScene<IContextBot>('youtube.picture');

scene.enter(async (ctx) => {
    addMsgToRemoveList(ctx.message?.message_id, ctx);
    removeTempMessages(ctx);

    if (ctx.session.video == undefined) {
        await ctx.scene.enter('start');
        return;
    }

    ctx.session.video.picture = getPictureFromVideo(ctx.session.video);
    const title = ctx.session.video.title.toLocaleLowerCase();
    if (title.includes('богослужение')) {
        await ctx.scene.enter('youtube.picture.live');
        return;
    }

    if (title.includes('луки') || title.includes('деяния') || title.includes('иона')) {
        await ctx.scene.enter('youtube.picture.sermon');
        return;
    }

    const keyboard = [['трансляция'], ['проповедь']];

    const msg = await ctx.reply('что делаем?', {
        reply_markup: {
            keyboard: keyboard,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });

    addMsgToRemoveList(msg.message_id, ctx);
});

scene.on('message', async (ctx) => {
    addMsgToRemoveList(ctx.message.message_id, ctx);

    switch (ctx.text) {
        case 'трансляция':
            await ctx.scene.enter('youtube.picture.live');
            break;
        case 'проповедь':
            await ctx.scene.enter('youtube.picture.sermon');
            break;
        default:
            break;
    }
});

export default scene;
