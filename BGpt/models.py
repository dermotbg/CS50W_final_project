from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    pass

class Chat(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="chatter")
    session = models.IntegerField()
    title = models.CharField(max_length=100)
    input = models.TextField(max_length=500)
    response = models.TextField(max_length=500)
    trans_resp = models.TextField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)
