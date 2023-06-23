import openai
import os

from django.conf import settings

def save_audio(audio_file):
    audio_file_path = os.path.join(settings.MEDIA_ROOT, 'BGpt/static/BGpt', audio_file.name)
    with open(audio_file_path, 'wb') as f:
        for chunk in audio_file.chunks():
            f.write(chunk)
    return audio_file_path

def gen_resp(orig_txt):
    response = openai.ChatCompletion.create(
        model = "gpt-3.5-turbo",
        messages = [
            {"role": "system", "content": """You are having smalltalk as a Bulgarian, in Bulgarian. You pick a random name for yourself and a small village that you came from. 
                                             You are talking to a foreigner trying to learn Bulgarian, so be as helpful as possible with any mistakes. 
                                             If something doesn't make sense, give them tips in english. If no topics are brought up, offer some popular topics like 
                                             favourite movies or if they have been to Bulgaria etc """},
            {"role": "user", "content": f"{orig_txt}"}
        ],
        temperature=0,
        # stream=True
    )
    # for chunk in response:
    #     print(chunk[])
    print(response["choices"][0]["message"]["content"].encode('utf-8').decode())
    # for i in response:
    #     print(i["choices"][0]["message"])
