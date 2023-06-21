from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
import openai 
import whisper
import os

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
    

def audio_in(request):
    # print(request.body)
    if request.method == "POST":
        blob = request.body
        # utils.conv_audio_in(audio)
        if blob:
            temp_audio = utils.conv_audio_in(blob, "mp3")
            # audio_array = utils.audio_to_array(temp_audio.name)
            audio_array = utils.audio_to_array(temp_audio.name)
            model = whisper.load_model('base')
            result = model.transcribe(audio_array)
            # drop temp file
            os.unlink(temp_audio.name)
            print(result["text"])
            return JsonResponse({"message": 'Audio file uploaded successfully.'}, status=200)
        else:
            return JsonResponse({"message": 'Audio file not uploaded successfully.'}, status=406)
        model = whisper.load_model('base')
        result = model.transcribe(audio)
        print(result["text"])
        return HttpResponse('Audio received')
    # else:
    #     return HttpResponse('Audio Not recieved')
