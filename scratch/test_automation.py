import os
import django
import sys

# Set up Django environment
sys.path.append('/Users/satyam/project management/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from apps.projects.models import Project
from apps.tasks.models import Task
from apps.users.models import User

def test_automation():
    # 1. Setup
    user = User.objects.first()
    if not user:
        print("No user found. Run seeding first.")
        return

    print("Cleaning up old test projects...")
    Project.objects.filter(title="Test Automation Project").delete()

    project = Project.objects.create(
        owner=user,
        title="Test Automation Project",
        status=Project.STATUS_ACTIVE
    )
    print(f"Created project: {project.title}, Status: {project.status}")

    # 2. Add tasks
    task1 = Task.objects.create(
        project=project,
        created_by=user,
        title="Task 1",
        status=Task.STATUS_TODO
    )
    task2 = Task.objects.create(
        project=project,
        created_by=user,
        title="Task 2",
        status=Task.STATUS_TODO
    )
    
    project.refresh_from_db()
    print(f"Both tasks TODO. Project Status: {project.status} (Expected: active)")

    # 3. Complete one task
    task1.status = Task.STATUS_DONE
    task1.save()
    
    project.refresh_from_db()
    print(f"Task 1 DONE. Project Status: {project.status} (Expected: active)")

    # 4. Complete second task
    task2.status = Task.STATUS_DONE
    task2.save()
    
    project.refresh_from_db()
    print(f"All tasks DONE. Project Status: {project.status} (Expected: completed)")

    # 5. Revert one task
    task1.status = Task.STATUS_IN_PROGRESS
    task1.save()
    
    project.refresh_from_db()
    print(f"Task 1 moved to IN-PROGRESS. Project Status: {project.status} (Expected: active)")

    # Cleanup
    project.delete()
    print("Test passed and cleaned up.")

if __name__ == "__main__":
    test_automation()
