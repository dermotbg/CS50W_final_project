from django.urls import path
from . import views

urlpatterns =[
    path("", views.index, name="index"),
    path("register", views.register, name="register"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("edit/<int:inp_id>", views.edit, name="edit"),
    path("history/<int:user_id>", views.history_view, name="history"),


    # API's
    path("chat_loop", views.chat_loop, name="chat_loop")
]