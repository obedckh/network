import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt


from .models import User, Post


def index(request):
    return render(request, 'network/index.html',{
        'is_authenticated': request.user.is_authenticated
    })
    
def post(request):
    all_posts = Post.objects.all().order_by('-create_date')
    paginator = Paginator(all_posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    #print([post.serialize() for post in page_obj])
    return JsonResponse({
        'posts': [post.serialize() for post in page_obj],
        'has_next': page_obj.has_next(),
        'has_previous': page_obj.has_previous(),
        'num_pages': paginator.num_pages,
        'current_page': page_obj.number,
    })

@login_required
def get_post(request, post_id):
    try:
        post = Post.objects.get(id=int(post_id))
        #print(post.serialize())
        return JsonResponse(post.serialize(), safe=False)
    except Exception as e:
        error = f"error: {e}"
        return JsonResponse({"get_post() error": error}, status=400)
    

@login_required
def following(request):
    #print("following() is called")
    try:
        user = request.user
        following_users = user.followed.all()  
        following_posts = Post.objects.filter(user__in=following_users).order_by('-create_date')
        paginator = Paginator(following_posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        return JsonResponse({
            'posts': [post.serialize() for post in page_obj],
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'num_pages': paginator.num_pages,
            'current_page': page_obj.number,
        })
    
    except Exception as e:
        error = f"error: {e}"
        return JsonResponse({"following() error": error}, status=400)
        

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
        paginator = Paginator(user_posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        return JsonResponse({
            'posts': [post.serialize() for post in page_obj],
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'num_pages': paginator.num_pages,
            'current_page': page_obj.number,
        })
    except Exception as e:
        print(f"error: {e}")
        return JsonResponse({"error": "Cannot get profile posts"}, status=400)
    

@login_required
def get_profile_info(request, user_id):
    try:
        user_id = int(user_id)
        user_info = User.objects.filter(id=user_id)
        #print("get_profile_info()  - user_info: ", user_info)
        return JsonResponse([user.serialize() for user in user_info], safe=False)
    except Exception as e:
        print(f"error: {e}")
        return JsonResponse({"error": "Cannot get profile info"}, status=400)
    

@login_required
def follow_user(request, user_id):
    try:
        user_to_follow = User.objects.get(id=int(user_id))
        follower = User.objects.get(id=int(request.user.id))
        user_to_follow.followers.add(follower)
        #print("1", user_to_follow.followers)
        return JsonResponse({"message": "Followed successfully"}, status=200)
    except Exception as e:
        error = f"error: {e}"
        return JsonResponse({"error": error}, status=400)
    

@login_required
def unfollow_user(request, user_id):
    try:
        user_to_unfollow = User.objects.get(id=int(user_id))
        unfollower = User.objects.get(id=int(request.user.id))
        user_to_unfollow.followers.remove(unfollower)
        #print("2", user_to_unfollow.followers)
        return JsonResponse({"message": "Unfollowed successfully"}, status=200)
    except Exception as e:
        error = f"error: {e}"
        return JsonResponse({"error": error}, status=400)
    

    
@login_required
@csrf_exempt
def update_post(request, post_id):
    #print("Request received")
    if request.method == 'POST':
        data = json.loads(request.body)
        mode = data.get('mode')
        #print(mode)
        
        try:
            current_user = User.objects.get(id=request.user.id)
            post = Post.objects.get(id=int(post_id))
            if mode == 'edit':
                content = data.get('content')
                content = content.lstrip()
                post.post_content = content
            elif mode == 'like':
                #print("mode = like")
                try:
                    post.likes.add(current_user)
                except Exception as e:
                    print(f"update_post() like post - error: {e}")   
            elif mode == 'unlike':
                #print("mode = unlike")
                try:
                    post.likes.remove(current_user)
                except Exception as e:
                    print(f"update_post() unlike post - error: {e}")   

            post.save()
            response = JsonResponse({'success': True})
            #print(response)
            return response
        except Post.DoesNotExist:
            return JsonResponse({'error': 'Post not found'}, status=404)
    return JsonResponse({'error': 'Invalid request'}, status=400)