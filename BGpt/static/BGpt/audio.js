document.addEventListener('DOMContentLoaded', () => {
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
        media_rec.onstop = async ()=>{
            const blob = new Blob(data, {'type': 'audio/ogg; codecs=opus'});
            data = [];

            // below just for checking in browser
            let url = window.URL.createObjectURL(blob);
            rec_sound.src = url;
            
            const formData = new FormData();
            formData.append('audio', blob, 'audio.ogg')
            fetch (`/audio_in`, {
                method: 'POST',
                // headers: {
                //     "X-CSRFToken": Cookies.get('csrftoken'),
                //     // "Content-Type": "audio/mp3"
                // },
                body: formData
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.log(error))
        }
 
    })
    .catch(function(error) {
        console.log(error.name, error.message);
    });
})