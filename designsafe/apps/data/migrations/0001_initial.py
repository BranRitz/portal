# -*- coding: utf-8 -*-
# Generated by Django 1.10.7 on 2017-12-13 16:30
from __future__ import unicode_literals
from designsafe.libs.elasticsearch import indices as IndicesManager

from django.db import migrations

def init_indices(*args):
    IndicesManager.init()

class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
      # migrations.RunPython(init_indices)
    ]
