document.addEventListener('DOMContentLoaded', () => {
    // pre-load chat if came from quick links 
    const current_url = new URL(window.location.href);
    const preLoad = current_url.hash.substring(1);
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
});