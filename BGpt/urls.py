from django.urls import path
from . import views

urlpatterns =[
    path("", views.index, name="index"),
    path("register", views.register, name="register"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("history/<int:user_id>", views.history_view, name="history"),
    path("profile/<int:user_id>", views.profile_view, name="profile"),


    # API's
    path("save/<int:ch_id>", views.save, name="save"),
    path("edit/<int:ch_id>", views.edit, name="edit"),
    path("delete/<int:ch_id>", views.delete, name="delete"),
    path("chat_loop", views.chat_loop, name="chat_loop")
]