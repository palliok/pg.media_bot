export interface VKApiResponse<T> {
  response?: T;
  error?: VKError;
}

export interface VKError {
  error_code: number;
  error_msg: string;
  request_params: Array<{
    key: string;
    value: string;
  }>;
}

export interface VKVideo {
  id: number;
  owner_id: number;
  title: string;
  duration: number;
  description: string;
  date: number;
  views: number;
  comments: number;
  player: string;
  platform?: string;
  can_edit: number;
  can_add: number;
  is_private: number;
  access_key?: string;
  processing?: number;
  is_favorite: boolean;
  live?: number;
  live_start_time?: number;
  spectateurs?: number;
  content_restricted?: number;
  broadcast_is_live?: number;
  broadcast_status?: string;
  share_url?: string;
}

export interface VKGroup {
  id: number;
  name: string;
  screen_name: string;
  is_closed: number;
  type: string;
  photo_200: string;
}

export interface LiveStreamInfo {
  isLive: boolean;
  liveUrl?: string;
  title?: string;
  startTime?: Date;
  viewers?: number;
  video?: VKVideo;
  error?: string;
}