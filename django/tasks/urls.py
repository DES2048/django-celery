from django.urls import path
from .views import home, task_create, task_result, tasks_batch_result

urlpatterns = [
    path("", home, name="home"),
    path("tasks/", task_create, name="task-create"),
    path("tasks/<str:task_id>/", task_result, name="task-result"),
    path("task/result/", tasks_batch_result, name="task-batch-result")
]