from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from gtts import gTTS
from deep_translator import GoogleTranslator
# from pydub.silence import split_on_silence

import json
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
            return render(request, 'BGpt/login_register.html', {
                "message": "Invalid Username and/or Password"
            })
    else:
        return render(request, "BGpt/login_register.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    # pass
    if request.method == 'POST':
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]
        conf = request.POST["confirmation"]

        if not username and email and password and conf:
            return render(request, "BGpt/login_register.html", {
                "message": "Please fill in all fields"
            })
        # check pw
        if password != conf:
            return render(request, "BGpt/login_register.html", {
                "message": "Passwords do not match"
            })
        # check username
        try:
            user = models.User.objects.create_user(username, password, email)
            user.save()
        except IntegrityError:
            return render(request, "BGpt/login_register.html", {
                "message": "Username already exists"
            })
        
        login(request, user)
        return HttpResponseRedirect(reverse('index'))
    else:
        return render(request, "BGpt/login_register.html")
    
@csrf_exempt
@login_required
# def audio_in(request):
def chat_loop(request):
    if request.method == "PUT":
        if request.session['chat_id']:
            request.session['chat_id'] = None
            return JsonResponse({"message": "session_ended"}, status=200)
        else:
            return JsonResponse({"message": "No Session to end"}, status=200)
        # request.session['last_resp'] = None
    
    
    if request.method == "POST":
        # check for session id
        session_id = None
        if request.session['chat_id'] is not None:
                session_id = request.session['chat_id']
        else:
            try:
                lc = models.Chat.objects.filter(user=request.user).last()
                session_id = lc.session
                session_id +=1 
                request.session['chat_id'] = session_id
            except models.Chat.DoesNotExist:
                request.session['chat_id'] = 1
                session_id = 1

        # take/save blob from req
        audio = request.FILES['audio']
        audio_file = utils.save_audio(audio)

        # TODO : ENG to BG / BG to ENG selection
        formModel = json.loads(request.POST.get('model'))

        match formModel:
            case "base":
                model = whisper.load_model('base')
            case "med":
                model = whisper.load_model('medium')
            case "large":
                model = whisper.load_model('large')
        
        result = model.transcribe(audio_file, language='bg')

        # drop audio file
        os.remove(audio_file)

        # generate response
        _resp = utils.gen_resp(result['text'])
        full_trans = GoogleTranslator(source='bg', target="en").translate(_resp)
        # store last resp in session for future session checks. 
        # request.session['last_resp'] = _resp

        words = _resp.split()
        trans = []

        for word in words:
            try:
                translations = GoogleTranslator(source='bg', target="en").translate(word)
                trans.append(translations)
            except ConnectionError:
                trans.append('?')
                return JsonResponse({"Error": "GT_RESP"}, status=424)

        # Generate TTS file
        tts = gTTS(f"{_resp}", lang="bg")
        tts.save("BGpt/static/BGpt/resp.ogg")

        # encode to base 64
        tts_b64 = utils.encode_resp("BGpt/static/BGpt/resp.ogg")

        # drop TTS file
        os.remove("BGpt/static/BGpt/resp.ogg")

        # store to db
        log = models.Chat.objects.create(user=request.user,
                                         session=session_id,
                                         input=result['text'],
                                         response=_resp,
                                         trans_resp=full_trans)
        log.save()

        # send b64 response via json
        return JsonResponse({"input": result["text"], 
                             "GPT_Response": _resp, 
                             "tts_resp": tts_b64, 
                             "words": words, 
                             "trans": trans, 
                             "full_trans": full_trans}, 
                             status=200)
        # return JsonResponse({"tts_resp": tts_b64}, status=200)

