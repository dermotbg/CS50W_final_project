from django.core.paginator import Paginator
from django.core.serializers import serialize
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from gtts import gTTS
from deep_translator import GoogleTranslator

import json
import openai 
import os
import whisper


from . import utils, models 

# load key
openai.api_key = os.environ.get('API_KEY')

# Create your views here.
def index(request):
    # mini-history function
    if request.user.is_authenticated:
        rev_hist = utils.gather_hist(request.user)
        return render(request, "BGpt/index.html", {
            "history": rev_hist[0:5]
        })
    else:
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
def chat_loop(request):
    # reset info on close session
    if request.method == "PUT":
        if request.session['chat_id']:
            request.session['chat_id'] = None
            return JsonResponse({"message": "session_ended"}, status=200)
        else:
            return JsonResponse({"message": "No Session to end"}, status=200)
    
    
    if request.method == "POST":
        # check for chat session id
        session_id = None
        # if request.session['chat_id'] is not None:
        if 'chat_id' in request.session:
            try: 
                request.session['chat_id']
                session_id = request.session['chat_id']
            except KeyError:
                pass
        else:
            try:
                lc = models.Chat.objects.filter(user=request.user).last()
                session_id = lc.session
                session_id +=1 
                request.session['chat_id'] = session_id
            except models.Chat.DoesNotExist:
                request.session['chat_id'] = 1
                session_id = 1

        # if request.session['chat_id'] is not None:
        #         session_id = request.session['chat_id']
        # else:
        #     try:
        #         lc = models.Chat.objects.filter(user=request.user).last()
        #         session_id = lc.session
        #         session_id +=1 
        #         request.session['chat_id'] = session_id
        #     except models.Chat.DoesNotExist:
        #         request.session['chat_id'] = 1
        #         session_id = 1

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

        formLang = json.loads(request.POST.get('lang'))
        if formLang == 'bg-en':
            result = model.transcribe(audio_file, language='bg')
        else:
            result = model.transcribe(audio_file, language='en')

        # drop audio file
        os.remove(audio_file)

        # generate response
        _resp = utils.gen_resp(result['text'], formLang)

        if formLang == 'bg-en':
            full_trans = GoogleTranslator(source='bg', target="en").translate(_resp)
        else:
            full_trans = GoogleTranslator(source='en', target="bg").translate(_resp)

        # split response into words
        words = _resp.split()

        # create translation list
        trans = []

        # append to list
        for word in words:
            try:
                if formLang == 'bg-en':
                    translations = GoogleTranslator(source='bg', target="en").translate(word)
                else:
                    translations = GoogleTranslator(source='en', target="bg").translate(word)
                trans.append(translations)

            # catch that one ConnectionError I got for some reason
            except ConnectionError:
                trans.append('?')
                return JsonResponse({"Error": "GT_RESP"}, status=424)

        # Generate TTS file
        if formLang == "bg-en":
            tts = gTTS(f"{_resp}", lang="bg")
        else:
            tts = gTTS(f"{_resp}", lang="en")
        tts.save("BGpt/static/BGpt/resp.ogg")

        # encode to base 64
        tts_b64 = utils.encode_resp("BGpt/static/BGpt/resp.ogg")

        # drop TTS file
        os.remove("BGpt/static/BGpt/resp.ogg")

        # check for previous title and if user gave title
        t = models.Chat.objects.filter(session=request.session['chat_id']).first()
        title = request.POST.get('title')

        # see if current title given exists and matches with db title
        if title and (not t or t.title != title):
            c = models.Chat.objects.filter(session=request.session['chat_id'])
            for row in c:
                row.title = title
                row.save()

        # write log to db
        log = models.Chat.objects.create(user=request.user,
                                        session=session_id,
                                        title=title if title else (t.title if t else "Untitled"),
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


@login_required
def history_view(request, user_id):

    full_hist = utils.gather_hist(user_id)
    paginator = Paginator(full_hist, 10)
    page_num = request.GET.get("page")
    page_obj = paginator.get_page(page_num)

    return render(request, "BGpt/history.html", {
        "history": page_obj
    })

@login_required
def edit(request, ch_id):
    try:
        chats = models.Chat.objects.filter(session=ch_id)
        chat_ser = serialize("json", chats)
        return JsonResponse(json.loads(chat_ser), safe=False)
        
    except models.Chat.DoesNotExist:
        return JsonResponse({"error": "Chat not found."}, status=404)
        

def save(request, ch_id):
    # try:
    #     # inp = models.Chat.objects.get(session=ch_id)
    #     chat = models.Chat.objects.filter(session=ch_id)
    # except:
    #     models.Chat.DoesNotExist
    #     return JsonResponse({"message": "Invalid Payload"}, status=400)
    
    # if chat.user != request.user:
    #     return JsonResponse({"message": "Unauthorized User"}, status=403)
    
    if request.method == "PUT":
        try:
            # inp = models.Chat.objects.get(session=ch_id)
            chat = models.Chat.objects.filter(session=ch_id)    
        except:
            models.Chat.DoesNotExist
            return JsonResponse({"message": "Invalid Payload"}, status=400)
        data = json.loads(request.body.decode('utf-8'))
        # print(data)
        posts = data["posts"]
        for new_title in chat:
            new_title.title = posts[0]["title"]
            print(new_title.title)
            new_title.save()
        # update all inputs
        for row in chat:
            for e in posts:
                if str(row.pk) == e["id"]:
                    row.input = e["input"]
                    row.save()
            # if posts[row] == row.pk:
            #     row.input = data["input"]
            #     row.save()
            # models.Chat.objects.filter(pk=post_id).update(input=post_content)

        return HttpResponse(status=204)
    elif request.method != "PUT":
        return JsonResponse({"message": "Error: Must be PUT request"}, status=400)