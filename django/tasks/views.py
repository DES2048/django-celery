import json
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST 
from django.http.response import JsonResponse
from .tasks import sample_task
from celery.result import AsyncResult


def home(request):
    return render(request, "tasks/home.html")


@csrf_exempt
@require_POST
def task_create(request):
    t_type = request.POST.get("type")

    task = sample_task.delay(t_type)
    
    return JsonResponse(
        data={"id": task.id},
        safe=False,
        status=202
    )


def task_result(request, task_id):
    result = AsyncResult(task_id)

    data = {
        "id" : task_id,
        "state" : result.state,
        "result" : result.result
    }

    return JsonResponse(data=data)

    
def tasks_batch_result(request):
    body = json.load(request.body)

    data = [ 
        {
            "id" : result.id,
            "state" : result.state,
            "result" : result.result    
        } for result in map(AsyncResult, body)
    ]

    return JsonResponse(data, safe=False)

