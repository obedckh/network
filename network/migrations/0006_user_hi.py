# Generated by Django 5.1.4 on 2024-12-18 21:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0005_remove_comment_hii_remove_post_hi'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='hi',
            field=models.TextField(default='hi', max_length=51),
        ),
    ]
