import { Moment } from "moment";

export interface Timestamp {
    id: string,
    start: number,
    end: number,
    title: string,
    description?: string,
    select?: boolean
}

export interface Video {
    id: string,
    title: string;
    description: string | undefined | null;
    date: Moment;
    timestamps: Timestamp[],
    picture?: Picture;
    isLive?: boolean | undefined;
}

export interface Picture {
    imagePath?: string,
    transparent?: number,
    title?: string,
    preacher?: string,
    date?: Moment | string
}