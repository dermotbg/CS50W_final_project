import os
import tempfile
from pydub import AudioSegment
from pydub.playback import play
import soundfile as sf
import numpy as np

def conv_audio_in(input, ext):
    # create blank file with required filetype suffix
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f'.{ext}')
    # write the blob to audio
    temp_file.write(input)
    # close / return file
    temp_file.flush()

    # test audio
    audio = AudioSegment.from_file(temp_file.name, format=ext)
    play(audio)
    return temp_file


def audio_to_array(temp_file):
    audio, _ = sf.read(temp_file, dtype="float32")
    audio = audio / 32768.0
    return audio
#     # audio_array_bytes = input.split(b'\x1aE\xdf\xa3\x9fB\x86\x81\x01B')[1]

#     audio_array= np.array(input, dtype=np.int16)

#     output = AudioSegment(
#         data=audio_array.tobytes(),
#         sample_width=audio_array.dtype.itemsize,
#         channels=21,
#         frame_rate=44100
#     )

#     output.export("output.mp3", format="mp3")
#     # return output
