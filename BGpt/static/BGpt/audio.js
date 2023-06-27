document.addEventListener('DOMContentLoaded', () => {
    conversationLoop()
})

function playAudio(audio_B64) {
    // create new audio context object
    const audio_context = new AudioContext();

    // create source to be played once decoded
    const buffer_source = audio_context.createBufferSource();

    // decode base 64 string
    const audioData = atob(audio_B64)

    // create array size of audio file
    const audio_array_buffer = new Uint8Array(audioData.length)
    
    // store decoded data within array 
    for(let i = 0; i < audioData.length; i++){
        audio_array_buffer[i] = audioData.charCodeAt(i);
    }
    // decode the array into an audio buffer
    audio_context.decodeAudioData(audio_array_buffer.buffer, buffer =>{
        buffer_source.buffer = buffer;
        // connect to output device and start playback
        buffer_source.connect(audio_context.destination);
        buffer_source.start(0);
    });
}

function conversationLoop(){
    // def blob outside promise chain
    let blob;
    // set media reqs
    const constraints = {audio: true};
    // get mic permissions
    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(audio_stream)
    {
        const start_btn = document.querySelector('#btn-start');
        const stop_btn = document.querySelector('#btn-stop');
        const media_rec = new MediaRecorder(audio_stream);
        let data = [];
        let rec_sound = document.querySelector('#playback');

        // on record button function
        start_btn.addEventListener('click', () =>{
            media_rec.start();
            console.log(media_rec.state);
        });

        // on stop button function
        stop_btn.addEventListener('click', () => {
            media_rec.stop();
            console.log(media_rec.state);
        });

        // store recorded event data in data array
        media_rec.ondataavailable = function(e) {
            data.push(e.data);
        };

        // convert to blob
        media_rec.onstop = () => {
            // create blob with the required specs
            const blob = new Blob(data, {'type': 'audio/ogg; codecs=opus'});
            // clear data array for the next iteration
            data = [];

            // below just for checking in browser
            // let url = window.URL.createObjectURL(blob);
            // rec_sound.src = url;
            
            const formData = new FormData();
            formData.append('audio', blob, 'audio.ogg')
            fetch (`/audio_in`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            // console.log(response))
            .then(data => {
                console.log(data);
                playAudio(data.tts_resp);
                replay = document.querySelector('#btn-replay')
                replay.style.display = "block";
                document.addEventListener('click', () => {
                    playAudio(data.tts_resp);
                })
            })
            .catch(error => console.log(error))
        }
 
    })
    .catch(function(error) {
        console.log(error.name, error.message);
    });
}