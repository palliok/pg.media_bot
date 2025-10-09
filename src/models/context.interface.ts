import { User } from '@telegraf/types';
import { Context, Scenes } from 'telegraf';
import { Timestamp, Video } from './video';

export interface UserSession extends User {
	messagesToRemove: number[];
}

interface SceneSession extends Scenes.SceneSession {
	usersList: UserSession[] | undefined;
	video: Video | undefined;
	timestamps: Timestamp[] | undefined;
}

export interface IContextBot extends Context {
	scene: Scenes.SceneContextScene<IContextBot>;
	session: SceneSession;
}