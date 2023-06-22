import os

from django.conf import settings

def save_audio(audio_file):
    audio_file_path = os.path.join(settings.MEDIA_ROOT, 'BGpt/static/BGpt', audio_file.name)
    with open(audio_file_path, 'wb') as f:
        for chunk in audio_file.chunks():
            f.write(chunk)
    return audio_file_path