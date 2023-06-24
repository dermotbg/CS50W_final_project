from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from gtts import gTTS
# from pydub.silence import split_on_silence

import openai 
import os
import whisper


from . import utils, models 

# load key
openai.api_key = os.environ.get('API_KEY')

# Create your views here.
def index(request):
    return render(request, "BGpt/index.html")

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, 'BGpt/index.html', {
                "login_msg": "Invalid Username and/or Password"
            })
    else:
        return render(request, "BGpt/index.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    # pass
    if request.method == 'POST':
        username = request.POST["username"]
        email = request.POST["email"]

        # check pw
        password = request.POST["password"]
        conf = request.POST["confirmation"]
        if password != conf:
            return render(request, "BGpt/register.html", {
                "message": "Passwords do not match"
            })

        try:
            user = models.User.objects.create_user(username, password, email)
            user.save()
        except IntegrityError:
            return render(request, "BGpt/register.html", {
                "message": "Username already exists"
            })
        login(request, user)
        return HttpResponseRedirect(reverse('index'))
    else:
        return render(request, "BGpt/register.html")
    
@csrf_exempt
def audio_in(request):
    if request.method == "POST":
        # take/save blob from req
        audio = request.FILES['audio']
        audio_file = utils.save_audio(audio)


        # switch statement giving user model sizes?
        # TODO
        model = whisper.load_model('medium')
        result = model.transcribe(audio_file, language='bg')
        print(result['text'])

        # translation if needed later:
        # trans = model.transcribe(audio_file, task='translate', language='bg')
        # print(trans['text'])

        # drop audio file
        os.remove(audio_file)

        # generate response
        _resp = utils.gen_resp(result['text'])

        # Generate TTS file
        tts = gTTS(f"{_resp}", lang="bg")
        tts.save("BGpt/static/BGpt/resp.ogg")

        # encode to base 64
        tts_b64 = utils.encode_resp("BGpt/static/BGpt/resp.ogg")

        # drop TTS file
        os.remove("BGpt/static/BGpt/resp.ogg")

        # send b64 response via json
        return JsonResponse({"input": result["text"], "GPT_Response": _resp, "tts_resp": tts_b64}, status=200)
        # return JsonResponse({"tts_resp": tts_b64}, status=200)

