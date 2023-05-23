import re
import ffmpeg
import shutil
import pytube
from moviepy.editor import *
from datetime import datetime
from datetime import timedelta
import helpers.youtubeHelper as YoutubeHelper
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
import isodate

months = ["unknown", "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]


async def get_timestamps(link: str):
    video_info = YoutubeHelper.get_video_info(link)['items'][0]
    youtube = video_info['snippet']

    print(youtube)
    description = youtube['description'].strip().encode()
    duration = isodate.parse_duration(video_info['contentDetails']['duration'])
    print(duration)
    video_length = str(timedelta(seconds=duration.total_seconds()))

    times = []
    for st1 in description.split(b'\n'):
        timecode = st1.decode()
        if re.search(r'^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)', timecode):
            t1 = timecode.split(' ', 1)[0].strip()
            t2 = timecode.split(' ', 1)[1].strip()
            times.append((t1, t2))

    timecodes = []
    for i in range(len(times)):
        if i != len(times)-1:
            timecodes.append(((times[i])[0], (times[i+1])[0], (times[i])[1]))
        else:
            timecodes.append(((times[i])[0], video_length, (times[i])[1]))
    
    return timecodes


async def check_video_1080p(url: str):
    youtube = pytube.YouTube(url)
    streams = youtube.streams
    print(streams)

    if streams == None:
        return None
    
    video = streams.filter(res='1080p', file_extension='mp4').first()
    return video


async def download_video(url: str):
    youtube = pytube.YouTube(url)
    print(youtube, flush=True)

    temp_dir = 'cut_video_temp' + datetime.now().strftime("%Y%m%d-%H%M%S")
    print(temp_dir, flush=True)

    print(youtube.streams.filter(res='1080p', file_extension='mp4'), flush=True)
    video = youtube.streams.filter(res='1080p', file_extension='mp4').first().download(output_path=f'temp/{temp_dir}', filename_prefix='video')
    audio = youtube.streams.filter(type='audio', file_extension='mp4').first().download(output_path=f'temp/{temp_dir}', filename_prefix='audio')

    video_stream = ffmpeg.input(video)
    audio_stream = ffmpeg.input(audio)

    video = 'video.mp4'
    ffmpeg.output(audio_stream, video_stream, f'temp/{temp_dir}/{video}', vcodec='copy', acodec='copy').run()

    return (video, temp_dir)


async def parse_timestamp_to_seconds(time: str):
    if len(time.split(':')) == 2:
        t = datetime.strptime(time, '%M:%S')
        return t.minute * 60 + t.second
    if len(time.split(':')) == 3:
        t = datetime.strptime(time, '%H:%M:%S')
        return t.hour * 3600 + t.minute * 60 + t.second

async def cut_video(link: str, clips: list):
    video = await download_video(link)

    cut_clips = []
    for clip in clips:
        start_time = await parse_timestamp_to_seconds(clip[0])
        end_time = await parse_timestamp_to_seconds(clip[1])
        cut_clip_path = f'temp/{video[1]}/{start_time}.mp4'
        ffmpeg_extract_subclip(f'temp/{video[1]}/{video[0]}', start_time, end_time, targetname=cut_clip_path)
        cut_clips.append((start_time, cut_clip_path, clip[2]))

    return cut_clips


async def cut_video_and_upload(link: str, clips: list):
    cut_clips = await cut_video(link, clips)
    await upload_videos_to_youtube(link, cut_clips)
    return cut_clips


async def upload_videos_to_youtube(link: str, videos: list):
    print('start upload videos', flush=True)
    video_info = YoutubeHelper.get_video_info(link)['items'][0]
    youtube = video_info['snippet']

    video_date = datetime.fromisoformat(youtube['publishedAt'])
    description = f'{video_date.day} {months[video_date.month]} {video_date.year}'

    for video in videos:
        res = await YoutubeHelper.upload_video_to_youtube(video, description)
        print(res, flush=True)
    
    print((videos[0])[1]);
    temp_dir = (videos[0])[1].rsplit('/', 1)[0]
    print(temp_dir)
    shutil.rmtree(temp_dir)
    shutil.rmtree('temp')
    print('end upload videos')
