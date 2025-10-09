import { VKApiResponse, VKVideo } from "@models/vk";
import axios from "axios";

const baseUrl = 'https://api.vk.com/method';
const version = '5.199';

export async function getVkLiveLink(): Promise<string | undefined> {
    if (!process.env.VK_GROUP_ID) {
        throw new Error('Empty VK_GROUP_ID');
    }
    const videos = await getGroupVideos(Number.parseInt(process.env.VK_GROUP_ID), 50);
    const liveVideos = videos?.filter(video => 
        video.live === 1 || 
        video.broadcast_is_live === 1 ||
        video.broadcast_status === 'started'
      );
    if (liveVideos == undefined || liveVideos.length == 0) {
        return undefined;
    }
    const url = liveVideos[0].share_url?.split('?')[0];
    if (!url) {
        return undefined;
    }
    return url;
}

async function getGroupVideos(groupId: number, count: number = 10): Promise<VKVideo[]> {
    const ownerId = -Math.abs(groupId);

    const response = await callMethodVk<{ count: number; items: VKVideo[] }>('video.get', {
        owner_id: ownerId,
        count: count,
        extended: 1
    });

    return response.items;
}

async function callMethodVk<T>(method: string, params: Record<string, string | number> = {}): Promise<T> {
    const response = await axios.get<VKApiResponse<T>>(`${baseUrl}/${method}`, {
        params: {
            ...params,
            access_token: process.env.VK_ACCESS_TOKEN,
            v: version
        },
        timeout: 10000
    });

    if (response.data.error) {
        throw new Error(`VK API Error ${response.data.error.error_code}: ${response.data.error.error_msg}`);
    }

    if (!response.data.response) {
        throw new Error('Empty response from VK API');
    }

    return response.data.response;
}