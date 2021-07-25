import time
from celery import shared_task

@shared_task
def sample_task(t_type):
    time.sleep(int(t_type))
    return True