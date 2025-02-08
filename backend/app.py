# yt-dlp --write-subs --write-auto-subs --sub-format vtt --skip-download 'https://www.youtube.com/watch?v=jNQXAC9IVRw'
import webvtt
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import glob
import os
from anthropic import Anthropic
import yt_dlp
import json
import pdb

app = Flask(__name__)
CORS(app)

client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY"),  # This is the default and can be omitted
)

def get_caption_text(video_url):
    ydl_opts = {
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['en'],
        'skip_download': True,
        'subtitlesformat': 'ttml',
        'quiet': True
    }

    ydl = yt_dlp.YoutubeDL(ydl_opts)
    info = ydl.extract_info(video_url, download=False)
    sub_data = info['automatic_captions']['en']
    caption_url = sub_data[0]['url']
    caption_text = ydl.urlopen(caption_url)
    try:
        captions = json.load(caption_text)
    except json.JSONDecodeError:
        captions = caption_text.read().decode('utf-8')
        if captions == '':
            return ''
        return captions

    s = ''
    for i,event in enumerate(captions['events'][1:]):
        for seg in event['segs']:
            s += seg['utf8'] 
    return s

@app.route('/subtitle', methods=['GET'])
def get_summary():
    url = request.args.get('url')
    subtitle_text = get_caption_text(url)
    message = client.messages.create(
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": (
                "These are the captions of a YouTube video:\n"
                f"```{subtitle_text}```\n\n"
                """Please summarize it. 
                Use bullet point lists.
                Be concise with a warm, but professional tone.
                When describing the points, stick to the chronological order of the ideas.
                Frame all the opinions as coming from the point of view of the narrator or maker of the video"""
            ),
        }
    ],
    model="claude-3-5-haiku-latest",
    )
    return jsonify({'subtitle': message.content[0].text})

if __name__ == '__main__':
    app.run(debug=True)
