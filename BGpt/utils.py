import openai
import os
import base64 
import string
import random
from . import models
from itertools import groupby

from django.conf import settings

def save_audio(audio_file):
    # set random string length
    n = 5
    # create random string
    name = "".join(random.choices(string.ascii_lowercase, k=n))
    # attach to audio file
    audio_file.name = name
    # define directory and write to disk
    audio_file_path = os.path.join(settings.MEDIA_ROOT, 'BGpt/static/BGpt', audio_file.name)
    with open(audio_file_path, 'wb') as f:
        for chunk in audio_file.chunks():
            f.write(chunk)
    return audio_file_path

def gen_resp(orig_txt, formLang):
    if formLang == 'bg-en':
        response = openai.ChatCompletion.create(
            model = "gpt-3.5-turbo",
            messages = [
                {"role": "system", "content": """You are having smalltalk as a Bulgarian, in Bulgarian. If asked, pick a female name for yourself and a city that you came from. 
                                                You are talking to a foreigner trying to learn Bulgarian, so be as helpful as possible with any mistakes. 
                                                If something doesn't make sense, give them tips in english. If no topics are brought up, offer some popular topics like 
                                                favourite movies or if they have been to Bulgaria etc. Keep the responses short. """},
                {"role": "user", "content": f"{orig_txt}"}
            ],
            temperature=0,
            # stream=True
        )
        print(response["choices"][0]["message"]["content"].encode('utf-8').decode())
        return response["choices"][0]["message"]["content"].encode('utf-8').decode()
    else:
        response = openai.ChatCompletion.create(
            model = "gpt-3.5-turbo",
            messages = [
                {"role": "system", "content": """You are having smalltalk as a English speaker, with an English speaker. If asked, pick a female name for yourself and a city that you came from. 
                                                You are talking to a foreigner interested in learning English, so be helpful. 
                                                If something doesn't make sense, give them tips. If no topics are brought up, offer some popular topics like 
                                                favourite movies or if they have been to Bulgaria etc. Keep the responses short. """},
                {"role": "user", "content": f"{orig_txt}"}
            ],
            temperature=0,
            # stream=True
        )
        print(response["choices"][0]["message"]["content"].encode('utf-8').decode())
        return response["choices"][0]["message"]["content"].encode('utf-8').decode()


def encode_resp(response_path):
    # convert tts to base64 for json
    with open (response_path, 'rb') as _tts:
        data = _tts.read()
        tts_base64 = base64.b64encode(data).decode('utf-8')
        return tts_base64

def gather_hist(user_id):
        hist = models.Chat.objects.filter(user=user_id).order_by('-session', 'timestamp')
        rev_hist = []
        d_hist = set()

        # iterables for each session and each group of sessions
        # given expression into the groupby is "x.session" which is the individual session id's in hist.
        for session, group in groupby(hist, lambda x: x.session):

            # add groups of sessions to lists where applicable 
            session_group = list(group)

            # append if session has not been appended
            if session not in d_hist:
                d_hist.add(session)
                rev_hist.append(session_group)

        return(rev_hist)