document.addEventListener('DOMContentLoaded', () => {
    const histItems = document.querySelectorAll('.list-group-item')

    histItems.forEach(item =>{
        item.addEventListener('click', function(e){
            e.preventDefault

            const chatSession = this.dataset.id;
            console.log(chatSession);
            // hide any open chats
            const allChats = document.querySelectorAll('.list-group-responses li');
            allChats.forEach(log => {
                log.style.display = 'none';
            });

            // display active chat
            const actChat = document.querySelectorAll(`.list-group-responses li[data-id="${chatSession}"]`);
            actChat.forEach(log => {
                console.log(log);
                log.style.display = 'block';
            })
        });
    })
});