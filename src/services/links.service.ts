import { getVkLiveLink } from "./vk.service";
import { getYouTubeLiveLink } from "./youtube.service";

export async function getLinksMessage(): Promise<string> {

    const youtube = await getYouTubeLiveLink();
    const vk = await getVkLiveLink();
    
    const vkLink = vk == undefined ? '❌ Трансляция в ВК не запущена' : `<a href="${vk}">VK видео</a>`;
    const youtubeLink = youtube == undefined ? '❌ Трансляция в YouTube не запущена' : `<a href="${youtube}">YouTube</a>`;

    const msg = `Подключайтесь к трансляции!\n\n${vkLink}\n\n${youtubeLink}`;

    return msg;
}