import os
from celery import Celery

# Définir la variable d'environnement pour les paramètres Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartbot.settings')

# Créer l'instance Celery
app = Celery('smartbot')

# Charger la configuration à partir des paramètres Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Découvrir automatiquement les tâches dans les applications Django
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
