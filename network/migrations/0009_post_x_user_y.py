# Generated by Django 5.1.4 on 2024-12-28 13:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0008_delete_comment'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='x',
            field=models.TextField(default='x', max_length=64),
        ),
        migrations.AddField(
            model_name='user',
            name='y',
            field=models.TextField(default='y', max_length=64),
        ),
    ]
