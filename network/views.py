import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django import forms

from .models import User, Post, Comment

class CreateForm(forms.Form):
    new_post_form = forms.CharField(label="New Post", required=True, widget=forms.Textarea(attrs={
        'rows': 2,
        'cols': 50,
        'placeholder': "What's in your mind..."
    }))

def index(request):
    return render(request, 'network/index.html',{
        'is_authenticated': request.user.is_authenticated
    })
    
def post(request):
    all_posts = Post.objects.all().order_by('-create_date')
    return JsonResponse([post.serialize() for post in all_posts], safe=False)

@login_required
def following(request):
    user = request.user
    following_users = user.followers.all()    
    following_posts = Post.objects.filter(user__in=following_users).order_by('-create_date')
    return JsonResponse([post.serialize() for post in following_posts], safe=False)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def create_post(request):
    if request.method == "POST":
        content = request.POST["newpost"]
        Post.objects.create(
            user=request.user, 
            post_content=content
            )
        return HttpResponseRedirect(reverse("index"))


@login_required
def profile(request, user_id):
    try:
        user_id = int(user_id)
        user_posts = Post.objects.filter(user=user_id).order_by('-create_date')
        return JsonResponse([post.serialize() for post in user_posts], safe=False)
    except Exception as e:
        print(f"error: {e}")
        return JsonResponse({"error": "Cannot get profile posts"}, status=400)
    


@login_required
def get_profile_info(request, user_id):
    try:
        user_id = int(user_id)
        user_info = User.objects.filter(id=user_id)
        print("user_info: ", user_info)
        return JsonResponse([user.serialize() for user in user_info], safe=False)
    except Exception as e:
        print(f"error: {e}")
        return JsonResponse({"error": "Cannot get profile info"}, status=400)
    
    
@login_required
def edit_post(request, post_id):
    return render(request, 'network/index.html',{
        "title": "Edit Post",
        
    })