import { BaseScene } from "telegraf/scenes";
import { IContextBot } from "../../models/context.interface";
import { addMsgToRemoveList, removeTempMessages } from "utils/processMessages";
import { getLinksMessage } from "@services/links.service";

const links = new BaseScene<IContextBot>('links');

links.enter(async (ctx) => {
    addMsgToRemoveList(ctx.message?.message_id, ctx);
    removeTempMessages(ctx);

    ctx.session.timestamps = undefined;
    ctx.session.video = undefined;

    const msg = await ctx.reply('😬', {
        reply_markup: {
            remove_keyboard: true
        }
    });

    addMsgToRemoveList(msg.message_id, ctx);

    try {
        const links = await getLinksMessage();
        await ctx.replyWithHTML(links, {
            link_preview_options: {
                is_disabled: true
            }
        });
        
        await ctx.scene.enter('start');
        return;
    } catch (error) {
        console.log(error);
    }
});

export default links;