import { IContextBot } from "@models/context.interface";
import { createLivePicture, downloadAudio } from "@services/youtube.service";
import { BaseScene } from "telegraf/scenes";
import { addMsgToRemoveList, removeTempMessages } from "utils/processMessages";
import fs from 'fs';
import { Input } from "telegraf";
import { Video } from '@models/video';

const scene = new BaseScene<IContextBot>('youtube.audio');

scene.enter(async (ctx) => {
    addMsgToRemoveList(ctx.message?.message_id, ctx);
    removeTempMessages(ctx);

    if (ctx.session.video == undefined) {
        await ctx.scene.enter('start');
        return;
    }

    downloadAudio(ctx.session.video?.id!).subscribe((res) => {
        ctx.sendDocument(Input.fromLocalFile(res));
        ctx.scene.enter('start');
    });
});

export default scene;
