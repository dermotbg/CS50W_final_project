document.addEventListener('DOMContentLoaded', () =>{

        // edit user info
    editUser = document.querySelector('#edit-user');
    editUser.addEventListener('click', function() {
        container = document.querySelector('#change-user');
        container.style.display = 'flex';
        container.style.animationPlayState = "running"    
    });
})
