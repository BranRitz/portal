from django.shortcuts import render
from django.http import HttpResponse
from dsapi.agave.files import *
import json
import logging

logger = logging.getLogger(__name__)
# Create your views here.

#This should probably use @login_required
def list_path(request):
    #if not request.is_ajax():
    #    return
    # We'll be passing the Auth token through the query string, Purely for example purposes. Same for the base URL
    token = request.GET.get('token')
    #url = request.GET.get('url')
    url = 'https://api.araport.org/'
    path = request.GET.get('path')
    af = AgaveFiles(url, token)
    l = af.list_path(path)
    return HttpResponse(json.dumps(l), content_type="application/json")