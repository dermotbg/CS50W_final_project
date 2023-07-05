document.addEventListener('DOMContentLoaded', () => {
    // handle close session when modal is closed. 
    closeSession();
    // initialise handler in global scale to stop overlapping on replay button
    var playAudioHandler;
    conversationLoop(playAudioHandler)
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

function conversationLoop(playAudioHandler){
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
        // let rec_sound = document.querySelector('#playback');

        // on record button function
        start_btn.addEventListener('click', () =>{
            start_btn.style.display ='none'
            stop_btn.style.display = 'block'
            media_rec.start();
            console.log(media_rec.state);
        });

        // on stop button function
        stop_btn.addEventListener('click', () => {
            start_btn.style.display ='block'
            stop_btn.style.display = 'none'
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

            
            const formData = new FormData();
            formData.append('audio', blob, 'audio.ogg')

            // check for model selection
            model = document.querySelector('#model_selector').value;
            formData.append('model', JSON.stringify(model));
            // console.log(model)

            // check for title
            const title = document.querySelector('#chat-title').value
            if (title){
                formData.append('title', JSON.stringify(title))
            }
            
            fetch (`/chat_loop`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            // console.log(response))
            .then(data => {
                // initialise required variables
                const resp_area = document.querySelector('#response');
                const trans_area = document.querySelector('#resp-trans');
                const replay = document.querySelector('#btn-replay')

                // clear old response if applicable
                while (resp_area.firstChild){
                    resp_area.removeChild(resp_area.lastChild)
                }
                while (trans_area.firstChild){
                    trans_area.removeChild(trans_area.lastChild)
                }
                // print and play
                console.log(data);
                playAudio(data.tts_resp);

                // replay event needs a handler to be removed each time to prevent overlapping
                if (playAudioHandler != null){
                    replay.removeEventListener('click', playAudioHandler);
                };


                playAudioHandler = () => {
                    playAudio(data.tts_resp);
                };  

                // add most recent tts iteration
                replay.addEventListener('click', playAudioHandler)

                // display button
                replay.style.display = "block";
            
                // word by word response
                let words = data.words
                let i = 0;
                let pSpeed = setInterval(() => {

                    if (i < words.length){
                        // div for word
                        const word = document.createElement("div");
                        // class for word    
                        word.classList.add(`div${i}`)
                        // add reqs and append
                        word.innerHTML = (`${words[i]} `);
                        word.style.paddingRight = '5px';

                        // assign translated word to title
                        word.title = data.trans[i]

                        // assign attributes for bootstrap tooltip 
                        word.setAttribute("data-toggle", "tooltip");
                        word.setAttribute("data-placement", "top");

                        // append to response
                        resp_area.appendChild(word);

                        // initialise bootstrap tooltip
                        new bootstrap.Tooltip(word);
                        i++;
                    }
                    else{
                        clearInterval = pSpeed
                    }
                }, 500);
                const f_trans = document.createElement("div");
                f_trans.innerHTML = `${data.full_trans}`
                trans_area.appendChild(f_trans)

            
            })
            .catch(error => console.log(error))
        }
 
    })
    .catch(function(error) {
        console.log(error.name, error.message);
    });
}

function closeSession(){
    const close_sess = document.querySelectorAll('.cls-sess');
    close_sess.forEach(function(e){
        e.addEventListener('click', function(){
            fetch('/chat_loop',{
                method: "PUT",
                body: JSON.stringify({
                    message: "Session Closed"
                })
            })
            .then( () => {
                const resp_area = document.querySelector('#response');
                const trans_area = document.querySelector('#resp-trans');

                // clear old response if applicable
                while (resp_area.firstChild){
                    resp_area.removeChild(resp_area.lastChild)
                }
                while (trans_area.firstChild){
                    trans_area.removeChild(trans_area.lastChild)
                }
            })
        });
    });
}