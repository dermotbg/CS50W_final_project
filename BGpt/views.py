from django.db import IntegrityError
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from . import utils, models

# Create your views here.
def index(request):
    return render (request, "BGpt/index.html")

def login(request):
    pass

def logout(request):
    pass

def register(request):
    # pass
    if request.method == 'POST':
        username = request.POST["username"]
        email = request.POST["email"]

        # check pw
        password = request.POST["password"]
        conf = request.POST["confirmation"]
        if password != conf:
            return render(request, "BGpt/register.html", {
                "message": "Passwords do not match"
            })

        try:
            user = models.User.objects.create_user(username, password, email)
            user.save()
        except IntegrityError:
            return render(request, "BGpt/register.html", {
                "message": "Username already exists"
            })
        login(request, user)
        return HttpResponseRedirect(reverse('index'))
    else:
        return render(request, "BGpt/register.html")