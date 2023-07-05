from django.contrib import admin
from .models import User, Chat

class UserAdmin(admin.ModelAdmin):
    list_display = ("pk", "username")

class ChatAdmin(admin.ModelAdmin):
    list_display = ("session", "user", "timestamp")

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Chat, ChatAdmin)