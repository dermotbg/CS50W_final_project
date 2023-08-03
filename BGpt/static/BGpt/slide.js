document.addEventListener('DOMContentLoaded', () =>{

    // profile page
    if (window.location.toString().includes("profile")){
        // declare container variables
        editUser = document.querySelector('#edit-user');
        userContainer = document.querySelector('#change-user');

        editPw = document.querySelector('#edit-pw');
        pwContainer = document.querySelector('#change-pw');

        slide(userContainer, editUser, pwContainer, editPw)
    }
    // login/reg page
    else{
        const login_btn = document.querySelector("#login");
        const reg_btn = document.querySelector("#register");
        const login = document.querySelector("#login-cont");
        const reg = document.querySelector("#register-cont");

        slide(login, login_btn, reg, reg_btn)
    }
})


function slide(container1, cont1Btn, container2, cont2Btn){
    cont1Btn.addEventListener('click', function() {
        if (getComputedStyle(container2).display === 'flex'){
            container2.style.animationPlayState = "paused";
            container2.classList.remove('slide-in');
            container2.classList.add('slide-out');
            container2.style.animationPlayState = "running";
            if (container1.classList.contains('slide-out')){
                container1.classList.remove('slide-out');
            };
            container2.addEventListener('animationend', function() {
                this.style.display = 'none';
                container1.classList.add('slide-in');
                container1.style.display = 'flex';
                container1.style.animationPlayState = "running";   
            }, {once:true});
        }
        else{
            if (container1.classList.contains('slide-out')){
                container1.classList.remove('slide-out');
            };
            container1.classList.add('slide-in');
            container1.style.display = 'flex';
            container1.style.animationPlayState = "running";   
        }
    })
    cont2Btn.addEventListener('click', function() {
        if (getComputedStyle(container1).display === 'flex'){
            container1.style.animationPlayState = "paused";
            container1.classList.remove('slide-in');
            container1.classList.add('slide-out');
            container1.style.animationPlayState = "running";
            if (container2.classList.contains('slide-out')){
                container2.classList.remove('slide-out');
            };
            container1.addEventListener('animationend', function() {
                this.style.display = 'none';
                container2.classList.add('slide-in');
                container2.style.display = 'flex';
                container2.style.animationPlayState = "running";
            },{once:true});
        }
        else{
            if (container2.classList.contains('slide-out')){
                container2.classList.remove('slide-out');
            };
            container2.classList.add('slide-in');
            container2.style.display = 'flex';
            container2.style.animationPlayState = "running";
        }   
    });
}
