# BGpt - Conversational Translator
Practise your conversational language learning

- create Virtual Env: `python3 -m venv <venv location>`
- install requirements.txt
- Whisper requires the command-line tool [ffmpeg](https://ffmpeg.org/) to be installed on your system, which is available from  most package managers:
```
# on Ubuntu or Debian
sudo apt update && sudo apt install ffmpeg

# on Arch Linux
sudo pacman -S ffmpeg

# on MacOS using Homebrew (https://brew.sh/)
brew install ffmpeg

# on Windows using Chocolatey (https://chocolatey.org/)
choco install ffmpeg

# on Windows using Scoop (https://scoop.sh/)
scoop install ffmpeg
```
- run: `python3 manage.py makemigrations`
- run: `python3 manage.py migrate`
- run: `python3 manage.py runserver`


# Distinctiveness and Complexity

## Distinctiveness

As of the time of I've started this project (June/July 2023) there's nothing I can find online that mimics this kind of conversational language learning, but seeing as though it's based off openai's whisper API and how pretty soon an explosion on GPT lead applications will come in the next few months I can sense by the time you're reading this it might be old news. 

The idea behind this came from my own journey into learning a new language in a country where a large percentage of locals can speak english, and being a textbook introvert. In most cases it is more efficient to speak english, in work we spoke english and with your friends you will speak english. I knew myself I needed a way to practise working out responses quicker in my head and building confidence for the next interaction. 

## Complexity

### Audio loop Client/Server/Client

Coming from a Audio Engineering background, I thought this knowledge might be useful to implement an easy system to send audio back and forth. It was not. Turns out it was a lot more complicated than originally expected, so I attempted to break it down into it's individual steps:

**Step 1: Get the audio from the client.**

First we need to get access to the users mic, this thankfully was easily accessible with the [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) method. A very helpful tool in handling the recording of the audio was the [MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API).

I took advantage of this a lot by firstly recording through a [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) instance, and then using its [ondataavailable](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event) event to push the info into an array and following up with an [onstop](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/stop_event) event to trigger an asynchronous function converting the recording to be sent back to the server via POST as a blob through the [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData) constructor. 

**Step 2: Process the audio server side.**

This processessing heavily relies on openai's [Whisper API](https://github.com/openai/whisper) & [ChatGPT API](https://platform.openai.com/docs/guides/gpt). Whisper looks after the transcription, but firstly we must generate a file path for the audio, so it uses the save_audio() function from utils.py to save a temp file, it's then transcribed based off the given model. 

It's both a blessing and a hinderance though, as it's smaller models struggle to understand Bulgarian and larger models are quite time consuming. A response is then generated of the transcribed text with chat GPT. Even with transcription error, it's able to generate decent responses. That response is then passed to [gTTS](https://gtts.readthedocs.io/en/latest/) to generate an an audio file based on the chatgpt response. 

- gTTS is quite robotic sounding and more like a placeholder, future iterations may take advantage of some outsourced API's. 

Before we can send it via JSON, it needs to be converted into a Base64 string, which is handled by our encode_resp() function in utils.py which uses the [base64](https://docs.python.org/3/library/base64.html) Python Library. 

**Step 3: Process the audio for playback client-side.**

From the initial function's promise we take the response and fire our playAudio() function. This uses the [Web Audio API's](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) interface to provide a framework for decoding the incoming base64 string, feeding it back into an array and then into a buffer to be played back through the users output. 

**Additional Features**

The text is received from the backend in an array of words. The array of words is looped through and divs are created at an interval using [setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval) to mimic the word by word response you normally get via LLM's. While it's iterating through each word, it's applying [Bootstrap Tooltips](https://getbootstrap.com/docs/5.3/components/tooltips/) to each generated div, which can be hovered over to display the translation of the word. 

This is somewhat unclear from a translation perspective between languages with/without genders, so for clarity, another translation is done on the backend, and displayed as a string to clear up any translation irregularities for the user. 

### Structure
The application uses a combination of single page and branching path ideas. 

**Index**

The main functionality of the application is hosted within the index page, mostly without any refreshing. While using the index as a landing, I took advantage of [Bootstrap Modals](https://getbootstrap.com/docs/5.3/components/modal/) to generate a "chat" interface and another modal for a "quick history" interface. 

All chatting takes place within the modal, once the chat is over and you close the modal, the back end receives a PUT request to compartmentalise the preceding chat as a specific "chat session".

There is a "Quick History" interface, this opens a modal that offers links to view the last 5 chats you've had. These effectively all lead to the "Full History" page explained below, but amend the path on it's load. 

**Login/Register**

While there are two paths for Login and Register, they are the same page that uses Javascript to define which form should be displayed on the initial load. There are buttons for each form, and the forms are animated using CSS [@keyframes](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes) to slide in/out. This is written in the slide.js file. 

**History**

Could be classed as similar to previous iterations of History pages we've completed in Problem Sets throughout the course but I've attempted to take it to the next level. 

Structurally it's made using [Bootstrap List Groups](https://getbootstrap.com/docs/5.3/components/list-group/). On the left there are columns with individual chats sessions, and once clicked, display the correct session on the right side. 

Mostly functioning through onClick listeners taking dataset values from the left column and displaying the corresponding chat on the right. 

My plan to give it distinctiveness and complexity was to make a seamless editing experience. While in previous projects we've dealt with AJAX requests for individual posts/etc, I wanted everything to be editable within one action. Each chat has multiple entries with no limit on quantity. 

When a chat is edited, a modal is opened with the full chat but all inputs and the title are editable (The responses are disabled). 
There are two API's in action here: 

**/edit** - Just takes the information from the database, allowing the application to generate the editing interface. 

**/save**  - Called when the user saves their changes. This has two actions, for the title it goes through the DB and renames each entry of the session to the new title, and then iterates through each individual input based off that chat session and updates the entry. 


**Profile**

Nothing too exciting here, just an area to update information/password. Uses the slide.js animation. 

**Responsiveness** 

Using [@media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries) the website changes it's structure to suit smaller devices where needed. 

# Files 
```
Capstone
│   README.md
│   db.sqlite3
|   manage.py
|   requirements.txt   
│
└───BGpt
│   │   _pycache_
│   │   _init_.py
|   |   admin.py
│   │   models.py
│   │   tests.py
│   │   urls.py
│   │   utils.py
│   │   views.py
│   │
│   └───migrations
│   |   │   _init_.py
│   |   │   0001_initial.py
│   |   │   0002_chat.py
│   |   │   0003_chat_title.py
|   └───static
|   |   └───BGpt
|   |   |   |   audio.js
|   |   |   |   Flag.png
|   |   |   |   history.js
|   |   |   |   slide.js
|   |   |   |   styles.css
|   |   |   |   styles.scss
|   └───templates
|   |   └───BGpt
|   |   |   |   history.html
|   |   |   |   index.html
|   |   |   |   layout.html
|   |   |   |   login_register.html
|   |   |   |   profile.html
│   
└───capstone
    │   _pycache_
    │   _init_py
    |   asgi.py
    |   settings.py
    |   urls.py
    |   wsgi.py
```
## Contents of Created Files 

**requirements.txt** - Application requirements generated by pipreqs

### Static

**audio.js** - Javascript handling chat loop. Includes functions ```playAudio()```, ```closeSession()```, ```conversationLoop()```.

**Flag.png** - Flag image used for Logo

**history.js** - Javascript handling history interactions. Includes functions ```preLoad()```, ```viewChat()```, ```editChat()```, ```deleteChat()```.

**styles.css/.scss** - css generated through sass. 

### Templates

**history.html** - History html template.

**index.html** - Index html template.

**layout** - Django layout template.

**login_register.html** - Login/Register template.

**profile.html** - Profile html template.

### Python

**utils.py** - Main functions used in views.py ```save_audio()```, ```gen_resp()```, ```encode_resp()```, ```gather_hist()```.

# Closing Comments 

From conception of the idea to what's being submit now, in my own perspective the end product is one sided on a function vs. structure level. The website itself is quite simple, only a few pages, one additional model outside of django's user model (which was a mistake). The workload was weighted towards the chat loop itself, and a lot of Javascript to make the little structure that's there as interactive as possible. 

I like to think of this now as an MVP. 
There are many points of weakness that have been left within, and have learned a lot about the importance of firstly deciding the correct way to approach a problem, and thorough research that would need to be done prior to basing functionality around 3rd party API's. 

I may return to this idea in future, there were a lot of other features I had in mind such as more in depth options with the GPT model, having the ability to chose scenarios (i.e. at the market / in a restaurant / etc). 

A saying I used when finishing off musical projects is relevant here, "art is never finished, only abandoned" and it's time to move onto the next project. 

This was CS50W!