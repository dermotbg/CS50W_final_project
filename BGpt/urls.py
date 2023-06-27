from django.urls import path
from . import views

urlpatterns =[
    path("", views.index, name="index"),
    path("register", views.register, name="register"),
    path("login", views.login_view, name="login"),


    # API's
    path("audio_in", views.audio_in, name="audio_in")
]