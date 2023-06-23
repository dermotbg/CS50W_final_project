from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
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
        audio = request.FILES['audio']
        audio_file = utils.save_audio(audio)
        # switch statement giving user model sizes?
        model = whisper.load_model('medium')
        result = model.transcribe(audio_file, language='bg')
        print(result['text'])
        # trans = model.transcribe(audio_file, task='translate', language='bg')
        # print(trans['text'])
        os.remove(audio_file)
        _resp = utils.gen_resp(result['text'])
        return JsonResponse({"input_text": result["text"], "translated_text": _resp}, status=200)

    # else:
    #     return HttpResponse('Audio Not recieved')


        _resp = utils.gen_resp(result['text'], trans['text'])
        return JsonResponse({"input_text": result["text"], "translated_text": trans["text"]}, status=200)

