document.addEventListener('DOMContentLoaded', () =>{

    // declare container variables
    editUser = document.querySelector('#edit-user');
    userContainer = document.querySelector('#change-user');

    editPw = document.querySelector('#edit-pw');
    pwContainer = document.querySelector('#change-pw');

    editUser.addEventListener('click', function() {
        if (getComputedStyle(pwContainer).display === 'flex'){
            pwContainer.style.animationPlayState = "paused";
            pwContainer.classList.remove('slide-in');
            pwContainer.classList.add('slide-out');
            pwContainer.style.animationPlayState = "running";
            if (userContainer.classList.contains('slide-out')){
                userContainer.classList.remove('slide-out');
            };
            pwContainer.addEventListener('animationend', function() {
                this.style.display = 'none';
                userContainer.classList.add('slide-in');
                userContainer.style.display = 'flex';
                userContainer.style.animationPlayState = "running";   
            }, {once:true});
        }
        else{
            if (userContainer.classList.contains('slide-out')){
                userContainer.classList.remove('slide-out');
            };
            userContainer.classList.add('slide-in');
            userContainer.style.display = 'flex';
            userContainer.style.animationPlayState = "running";   
        }
    });

    
    editPw.addEventListener('click', function() {
        if (getComputedStyle(userContainer).display === 'flex'){
            userContainer.style.animationPlayState = "paused";
            userContainer.classList.remove('slide-in');
            userContainer.classList.add('slide-out');
            userContainer.style.animationPlayState = "running";
            if (pwContainer.classList.contains('slide-out')){
                pwContainer.classList.remove('slide-out');
            };
            userContainer.addEventListener('animationend', function() {
                this.style.display = 'none';
                pwContainer.classList.add('slide-in');
                pwContainer.style.display = 'flex';
                pwContainer.style.animationPlayState = "running";
            },{once:true});
        }
        else{
            if (pwContainer.classList.contains('slide-out')){
                pwContainer.classList.remove('slide-out');
            };
            pwContainer.classList.add('slide-in');
            pwContainer.style.display = 'flex';
            pwContainer.style.animationPlayState = "running";
        }   
    });
})
