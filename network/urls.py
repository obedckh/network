
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create", views.create_post, name="create"),
    path("<int:user_id>", views.profile, name="profile"),
    path('edit/<str:post_id>', views.edit_post, name="edit_post"),
    
    # API routes
    path("post/allpost", views.post, name="post"),
    path("post/following", views.following, name="following"),
    path("user/<str:user_id>", views.profile, name="profile"),
    path("profileInfo/<str:user_id>", views.get_profile_info, name="get_profile_info")
]
