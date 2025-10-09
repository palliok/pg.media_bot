import { Telegraf, session } from "telegraf";
import * as dotenv from 'dotenv'
import stage from "./scences";
import { IContextBot } from "./models/context.interface";
import path from "path";
import { removeAllFilesSync } from "utils";
import authorizationMiddleware from "utils/authorization";

dotenv.config()

const _dirname = path.resolve();
const _tempDir = path.resolve(_dirname, 'temp/');
removeAllFilesSync(_tempDir);

const { BOT_TOKEN } = process.env;
if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!');
const bot = new Telegraf<IContextBot>(BOT_TOKEN);

bot.use(session());
bot.use(authorizationMiddleware);
bot.use(stage.middleware());

bot.catch((err, ctx) => {
    console.error(err);
    ctx.sendMessage('🤡');
});

bot.start(ctx => ctx.scene.enter('start'));

bot.on('message', async (ctx) => {
    if (ctx.scene.current?.id == undefined) {
        await ctx.scene.enter('start');
    };
});

bot.launch();