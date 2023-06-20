document.addEventListener('DOMContentLoaded', () => {
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
        }

        // convert to blob
        media_rec.onstop = (e)=>{
            let blob = new Blob(data, {'type': 'audio/mp3;'});
            data = [];
            let url = window.URL.createObjectURL(blob);
            rec_sound.src = url;
        }
    })
    // .then( () => {
    //     fetch
    // })

    .catch(function(error) {
        console.log(error.name, error.message);
    });
})
    

    // .then(function(MediaStream) {
    //     console.log(MediaStream.state)
    // })
    // .then()
    

