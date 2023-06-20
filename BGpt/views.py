from django.shortcuts import render

from . import utils

# Create your views here.
def index(request):
    return render (request, "BGpt/index.html")