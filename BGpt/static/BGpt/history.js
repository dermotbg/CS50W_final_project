document.addEventListener('DOMContentLoaded', () => {

    // pre-load chat if came from quick links 
    const currentUrl = new URL(window.location.href);
    const preLoad = currentUrl.hash.substring(1);
    // if page is loaded with a hash, load corresponding chat. 
    if (preLoad != null){
        plChat = document.querySelectorAll(`.list-group-responses li[data-id="ch-${preLoad}"]`);
            plChat.forEach(log => {
                console.log(plChat)
                log.style.display = 'block';
                if (log.id.includes('resp')) {
                  log.style['text-align'] = 'right';
                };
            })  
    };


    const histItems = document.querySelectorAll('.list-group-item')

    histItems.forEach(item =>{
        item.addEventListener('click', function(e){
            e.preventDefault
            const editBtn = document.querySelector('#edit-cont');
            editBtn.style.display = 'flex';  

            const chatSession = this.dataset.id;
            // console.log(chatSession);
            // hide any open chats
            const allChats = document.querySelectorAll('.list-group-responses li');
            allChats.forEach(log => {
              log.style.display = 'none';
            });

            // display active chat
            const actChat = document.querySelectorAll(`.list-group-responses li[data-id="${chatSession}"]`);
            actChat.forEach(log => {
                log.style.display = 'block';
                if (log.id.includes('resp')) {
                  log.style['text-align'] = 'right';
                };
            }) 
        });
    })
    editPost()
});

function editPost(){
    const edit = document.querySelector('#edit');
    const info = document.querySelector('#info');
    const save = document.querySelector('#save');
    const cancel = document.querySelector('#cancel');
    const chats = document.querySelectorAll('.list-group a');

    edit.addEventListener('click', () =>{
        edit.style.display = 'none';
        info.style.display = 'block';
        save.style.display = 'block';
        cancel.style.display = 'block';

        // add cancel path
    cancel.addEventListener('click', () =>{
        
        edit.style.display = 'flex';
        info.style.display = 'none';
        save.style.display = 'none';
        cancel.style.display = 'none';
        
    });
    // cancel if diff chat is clicked
    chats.forEach(function(e) {
        e.addEventListener('click', function dropEdit() {
            edit.style.display = 'flex';
            info.style.display = 'none';
            save.style.display = 'none';
            cancel.style.display = 'none';
            this.removeEventListener('click', dropEdit)
            
        });
    });

    

    // add listeners for each input bubble
    inps = document.querySelectorAll('.bubble-left');
    inps.forEach(function(e){
        e.addEventListener('click', function(){
            const inp_id = this.id
            console.log(inp_id);

            const container = document.querySelector(`.body-cont${inp_id}`);
            let text = document.querySelector(`.post-body${inp_id}`);
            
            })

        });
    })
    
}