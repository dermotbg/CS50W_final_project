document.addEventListener('DOMContentLoaded', () => {

    // Preload if needed
    preLoad()

    // View Funct
    viewPost()

    // Edit Function
    editMode()

});

function preLoad(){
    // pre-load chat if came from quick links 
    const currentUrl = new URL(window.location.href);
    const preLoad = currentUrl.hash.substring(1);
    // if page is loaded with a hash, load corresponding chat. 
    if (preLoad != null){
        plChat = document.querySelectorAll(`.list-group-responses li[data-id="ch-${preLoad}"]`);
            plChat.forEach(log => {
                // console.log(plChat)
                log.style.display = 'block';
                if (log.id.includes('resp')) {
                  log.style['text-align'] = 'right';
                };
            })  
    };
}

function viewPost(){
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
}

function editMode(){
    const edit = document.querySelector('#edit');
    const info = document.querySelector('#info');
    const save = document.querySelector('#save');
    const cancel = document.querySelector('#cancel');
    // const chats = document.querySelectorAll('.list-group a');

    edit.addEventListener('click', () =>{
        edit.style.display = 'none';
        info.style.display = 'block';
        save.style.display = 'block';
        cancel.style.display = 'block';

        // call edit post function
        editPost()
    });

    save.addEventListener('click', () =>{
        edit.style.display = 'block';
        info.style.display = 'none';
        save.style.display = 'none';
        cancel.style.display = 'none';
    });
    
}
function editPost(){
    const inps = document.querySelectorAll('.left');
    inps.forEach(function(e){
        
        e.addEventListener('click', function() {
            let inp_id = this.id
            // console.log(inp_id);

            const orig = document.querySelector(`#${inp_id}`);
            const editBox = document.createElement('textarea');

            // remove orig textbox
            orig.style.display = 'none';

            orig.after(editBox);
            editBox.innerHTML = orig.innerHTML;
            editBox.className = 'bubble left';
            editBox.style.display = 'flex';
            // editBox.style.minHeight = '100px';
            // editBox.style.minWidth = '100px';
            editBox.style.minBlockSize = '100px';

            // Save changes
            save.addEventListener('click', () => {
                fetch(`/edit/${inp_id.substring(3, 5)}`, {
                    method: 'PUT',
                    headers: {
                        "X-CSRFToken": Cookies.get('csrftoken')
                    },
                    body: JSON.stringify({
                        "post_bod": editBox.value
                    })
                })
                .then( () => {
                    
                    // update original li
                    orig.innerHTML = editBox.value;
                });
            })
        });
    });
}

        // add cancel path
    // cancel.addEventListener('click', () =>{
        
    //     edit.style.display = 'flex';
    //     info.style.display = 'none';
    //     save.style.display = 'none';
    //     cancel.style.display = 'none';
        
    // });
    // cancel if diff chat is clicked
    // chats.forEach(function(e) {
    //     e.addEventListener('click', function dropEdit() {
    //         edit.style.display = 'flex';
    //         info.style.display = 'none';
    //         save.style.display = 'none';
    //         cancel.style.display = 'none';
    //         this.removeEventListener('click', dropEdit)
            
    //     });
    // });

    // add listeners for each input bubble
