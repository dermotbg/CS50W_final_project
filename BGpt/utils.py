import openai
import os
import base64 
from . import models

from django.conf import settings

def save_audio(audio_file):
    # should have random string generator for filename? 
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


# convert to base64 for json
def encode_resp(response_path):
    with open (response_path, 'rb') as _tts:
        data = _tts.read()
        tts_base64 = base64.b64encode(data).decode('utf-8')
        return tts_base64

def gather_hist(user_id):
        hist = models.Chat.objects.filter(user=user_id).order_by('-session', 'timestamp')
        rev_hist = []
        d_hist = set()
        # add first session input/response
        for h in hist:
            if h.session not in d_hist:
                d_hist.add(h.session)
                rev_hist.append({"user":h.user, 
                                 "session":h.session, 
                                 "title": h.title,
                                 "input": h.input,
                                 "response": h.response, 
                                 "trans_resp": h.trans_resp,
                                 "timestamp": h.timestamp,
                                 "pk": h.pk})
            # catch ongoing inputs/responses 
            elif h.session in d_hist and h.pk not in d_hist:
                d_hist.add(h.pk)
                rev_hist.append({"user":h.user, 
                                 "session":h.session, 
                                 "title": h.title,
                                 "input": h.input,
                                 "response": h.response, 
                                 "trans_resp": h.trans_resp,
                                 "timestamp": h.timestamp,
                                 "pk": h.pk})
        return(rev_hist)