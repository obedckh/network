
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create", views.create_post, name="create"),
    path("<int:user_id>", views.profile, name="profile"),
    
    
    # API routes
    path("post/allpost", views.post, name="post"),
    path("post/following", views.following, name="following"),
    path("post/<str:user_id>", views.profile, name="profile"),
    path("profileInfo/<str:user_id>", views.get_profile_info, name="get_profile_info"),
    path("follow/<str:user_id>", views.follow_user, name="follow_user"),
    path("unfollow/<str:user_id>", views.unfollow_user, name="unfollow_user"),
    path("update_post/<int:post_id>", views.update_post, name="update_post"),
    path("getpost/<str:post_id>", views.get_post, name="get_post"),
]
