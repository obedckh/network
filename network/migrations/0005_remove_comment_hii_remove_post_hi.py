# Generated by Django 5.1.4 on 2024-12-18 18:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0004_comment_hii_post_hi'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='comment',
            name='hii',
        ),
        migrations.RemoveField(
            model_name='post',
            name='hi',
        ),
    ]
