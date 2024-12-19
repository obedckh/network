from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("User", related_name="followed", blank=True)
    
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "follower_count": self.followers.count() or 0,
            "following_count": self.followed.all().count() or 0,
            "post_count": self.posts.count() or 0,
        }

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False, related_name="posts")
    post_content = models.TextField(max_length=300, blank=False, null=False, verbose_name="post_content")
    create_date = models.DateTimeField(auto_now_add=True, null=False, blank=True)
    likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)
    
    def serialize(self):
        return {
            "id": self.id,
            "post_owner": self.user.username,
            "owner_id": self.user.id,
            "content" : self.post_content,
            "likes": self.likes.count(),
            "timestamp": self.create_date.strftime("%b %d %Y, %I:%M %p"),
            "comments":[comment.serialize() for comment in self.related_comments.all()]
        }

    
class Comment(models.Model):
    commenter = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=False, blank=False, related_name="user_commmented")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=False, blank=False, related_name="related_comments")
    comment_content = models.TextField(max_length=300, blank=False, null=False, verbose_name="post_content")
    comment_date = models.DateTimeField(auto_now_add=True, null=False, blank=True)
    
    def serialize(self):
        return {
            "commenter": self.commenter.username,
            "content": self.comment_content,
            "comment_date": self.comment_date.strftime("%b %d %Y, %I:%M %p")
        }