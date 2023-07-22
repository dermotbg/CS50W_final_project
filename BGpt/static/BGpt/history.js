document.addEventListener('DOMContentLoaded', () => {

    // Preload if needed
    preLoad()

    // View Funct
    viewPost()

    const edit = document.querySelector('#edit')
    edit.addEventListener('click', () =>{
        editPost()
    });
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


function editPost(){
    // get chat from DB 
    const currentUrl = new URL(window.location.href);
    const chat_num = currentUrl.hash.substring(6);
    // console.log(chat_num)
    fetch(`/edit/${chat_num}`)
    .then(response => response.json())
    .then(result =>{
        console.log(result)
        for (let i = 0; i < result.length; i++){
            let inp_id = result[i].pk
            console.log(inp_id)
            const container = document.querySelector('#edit-mod');
            // create editable areas
            const editBox = document.createElement('textarea');

            editBox.innerHTML = result[i].fields.input
            editBox.className = 'bubble left';
            editBox.id = `ed-${inp_id}`
            editBox.style.display = 'flex';
            // editBox.style.minBlockSize = '10em';
            editBox.style.minWidth = '25em'
            editBox.style.minHeight = '1em'
            container.appendChild(editBox)

            // create disabled responses
            const respBox = document.createElement('div');
            respBox.innerHTML = result[i].fields.response
            respBox.className = 'bubble right';
            respBox.style.display = 'flex';
            respBox.style.backgroundColor = 'grey';
            respBox.disabled = true;
            respBox.classList.add('edit-resp')
            container.appendChild(respBox)
            console.log(respBox)

            // create cancel path
            const cancel = document.querySelectorAll('.cancel');
            cancel.forEach(function(e){
                e.addEventListener('click', () =>{
                    while (container.firstChild){
                        container.firstChild.remove();
                    }
                });
            })

            // Save changes
            const save = document.querySelector('#save');
            save.addEventListener('click', () => {
                fetch(`/save/${inp_id}`, {
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
                    const orig = document.querySelector(`#inp${inp_id}`);
                    orig.innerHTML = editBox.value;
                });
            })
        };
    });
}