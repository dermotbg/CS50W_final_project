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
    var currentUrl = new URL(window.location.href);
    var chat_num = currentUrl.hash.substring(6);
    // console.log(chat_num)
    fetch(`/edit/${chat_num}`)
    .then(response => response.json())
    .then(result =>{
        console.log(result)

        for (let i = 0; i < result.length; i++){
            let inp_id = result[i].pk

            // create edit title area:
            const header = document.querySelector('#edit-title');
            let title = document.querySelector('#chat-title')
            title.innerHTML = result[i].fields.title;

            const container = document.querySelector('#edit-mod');
            // create editable post areas
            const editBox = document.createElement('textarea');

            editBox.innerHTML = result[i].fields.input
            editBox.className = 'bubble left';
            editBox.id = `ed-${inp_id}`
            editBox.style.display = 'flex';
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

            // create cancel path
            let cancel = document.querySelectorAll('.cancel');
            cancel.forEach(function(e){
                // clone event node without eventlistener to prevent onclick stacks
                let cancelClone = e.cloneNode(true);
                // replace event node with the clone
                e.parentNode.replaceChild(cancelClone, e);
                // apply listener to the clone
                cancelClone.addEventListener('click', () =>{
                    while (container.firstChild) {
                        container.firstChild.remove();
                    }
                });
            })

            // Save changes
            const save = document.querySelector('#save');
            const editCont = document.querySelector('#edit-mod')
            let saveClone = save.cloneNode(true);
            save.parentNode.replaceChild(saveClone, save);
            saveClone.addEventListener('click', () => {

                const allInps = document.querySelectorAll(`[id^="ed-"]`)
                var inputArray = [];
                
                allInps.forEach(function(e){
                    var inputObj = {}
                    let id = e.id.substring(3);
    
                    inputObj = {
                        id: id,
                        input: e.value,
                        title: title.innerHTML
                    };
                    
                    inputArray.push(inputObj)
                })

                // delete old edit boxes
                while (editCont.firstChild) {
                    editCont.firstChild.remove();
                }

                fetch(`/save/${chat_num}`, {
                    method: 'PUT',
                    headers: {
                        "X-CSRFToken": Cookies.get('csrftoken'),
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "posts": inputArray
                    })
                })
                .then( () => {
                    // catch 2 or more edits:
                    var activeUrl = new URL(window.location.href);
                    var activeSess = activeUrl.hash.substring(6);
                    // update original chat li's
                    const origs = document.querySelectorAll(`[data-id="ch-${activeSess}"]`)

                    origs.forEach(function(e){
                        for (let i = 0; i < inputArray.length; i++){
                            if (inputArray[i].id === e.id.substring(e.id.length - 2) && e.id.includes("inp")){
                                e.innerHTML = inputArray[i].input
                            }
                        };
                        
                    });
                    // update original title li
                    const ogTitle = document.querySelector(`#item-${activeSess}`);
                    ogTitle.innerHTML = title.innerHTML;
                });
            })
        };
    });
}