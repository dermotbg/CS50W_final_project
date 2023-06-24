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


# Distinctiveness and Complexity

## Distinctiveness
As of the time of writing, ~July 2023 there's nothing I can find online that mimics this kind of conversational language learning, but seeing as though it's based off openai's whisper API I can sense by the time you're reading this it might be old news. 

The idea behind this came from my own journey into learning a new language in a country where a large percentage of locals can speak english, it was always more efficient to speak english, in work we spoke english and with your friends you will speak english. I knew myself I needed a way to practise working out responses quicker in my head and building confidence for the next interaction. 

## Complexity
### Audio loop Client/Server/Client
Coming from a Audio Engineering background, I thought this knowledge might be useful to impletement an easy system to send audio back and forth. It was not. Turns out it was a lot more complicated than originally expected, so I attempted to break it down into it's individual steps:

**Step 1: Get the audio from the client.**
First we need to get access to the users mic, this thankfully was easily accessable with the [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) method. A very helpful tool in handling the recording of the audio was the [MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API).

I took advantage of this a lot by firstly recording through a [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) instance, and then using its [ondataavailable](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event) event to push the info into an array and folowing up with an [onstop](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/stop_event) event to trigger an asynchronous function converting the recording to be sent back to the server via POST as a blob through the [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData) constructor. 

**Step 2: Process the audio server side.**
This processessing heavily relies on openai's [Whisper API](https://github.com/openai/whisper) & [ChatGPT API](https://platform.openai.com/docs/guides/gpt). Whisper looks after the transcription, but firstly we must generate a file path for the audio, so it uses the save_audio() function from utils.py to save a temp file, it's then transcribed based off the given model. 

It's both a blessing and a hinderance though, as it's smaller models struggle to understand Bulgarian and larger models are quite time consuming. A response is then generated of the transcribed text with chat GPT. Even with transcription error, it's able to generate decent repsonses. That response is then passed to [gTTS](https://gtts.readthedocs.io/en/latest/) to generate an an audio file based on the chatgpt response. 

- gTTS is quite robtic sounding and more like a placeholder, future iterations make take advantage of some outsourced API's. 

Before we can send it via JSON, it needs to be converted into a Base64 string, which is handled by our encode_resp() function in utils.py which uses the [base64](https://docs.python.org/3/library/base64.html) Python Library. 

**Step 3: Process the audio for playback client-side.**
From the intial functions promise we take the response and fire our playAudio() function. This uses the [Web Audio API's](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) interface to provide a framework for decoding the incoming base64 string, feeding it back into an array and then into a buffer to be played back through the users output. 