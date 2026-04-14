import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker
from apps.users.models import User
from apps.projects.models import Project, ProjectMember
from apps.tasks.models import Task, TaskComment

fake = Faker()

class Command(BaseCommand):
    help = 'Seed database with realistic mock data'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=1)

    def handle(self, *args, **options):
        multiplier = options['count']
        self.stdout.write('Wiping existing data...')
        self._wipe()
        
        self.stdout.write('Creating users...')
        users = self._create_users(10 * multiplier)
        
        self.stdout.write('Creating projects...')
        projects = self._create_projects(users, 2 * multiplier)
        
        self.stdout.write('Adding members...')
        self._create_members(projects, users)
        
        self.stdout.write('Creating tasks...')
        tasks = self._create_tasks(projects, users, 5 * multiplier)
        
        self.stdout.write('Adding comments...')
        self._create_comments(tasks, users, 2 * multiplier)
        
        self._print_summary()

    def _wipe(self):
        TaskComment.objects.all().delete()
        Task.objects.all().delete()
        ProjectMember.objects.all().delete()
        Project.objects.all().delete()
        User.objects.exclude(is_staff=True).delete()

    def _create_users(self, count):
        users = []
        # Ensure admin exists if not already there (though staff excluded in wipe)
        admin, created = User.objects.get_or_create(
            email='admin@example.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_verified': True
            }
        )
        if created:
            admin.set_password('Admin@1234')
            admin.save()
        users.append(admin)

        for _ in range(count):
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = fake.unique.email().lower()
            user = User.objects.create_user(
                email=email,
                password='Test@1234',
                first_name=first_name,
                last_name=last_name,
                is_verified=True
            )
            users.append(user)
        return users

    def _create_projects(self, users, per_user):
        projects = []
        status_options = [Project.STATUS_ACTIVE, Project.STATUS_COMPLETED]
        
        for user in users:
            for _ in range(per_user):
                deadline = None
                if random.random() > 0.3:
                    deadline = timezone.now() + timezone.timedelta(days=random.randint(7, 90))
                
                project = Project.objects.create(
                    owner=user,
                    title=fake.catch_phrase(),
                    description=fake.paragraph(),
                    status=random.choices(status_options, weights=[0.7, 0.3])[0],
                    deadline=deadline
                )
                ProjectMember.objects.create(
                    project=project,
                    user=user,
                    role=ProjectMember.ROLE_OWNER
                )
                projects.append(project)
        return projects

    def _create_members(self, projects, users):
        for project in projects:
            # Pick 2-4 random users to be members (not the owner)
            potential_members = [u for u in users if u != project.owner]
            count = min(len(potential_members), random.randint(1, 3))
            selected = random.sample(potential_members, count)
            
            for user in selected:
                ProjectMember.objects.create(
                    project=project,
                    user=user,
                    role=random.choice([ProjectMember.ROLE_EDITOR, ProjectMember.ROLE_VIEWER])
                )

    def _create_tasks(self, projects, users, per_project):
        tasks = []
        status_options = [Task.STATUS_TODO, Task.STATUS_IN_PROGRESS, Task.STATUS_DONE]
        priority_options = [Task.PRIORITY_LOW, Task.PRIORITY_MEDIUM, Task.PRIORITY_HIGH]
        
        for project in projects:
            members = [m.user for m in project.members.all()]
            for i in range(per_project):
                due_date = None
                if random.random() > 0.2:
                    due_date = timezone.now() + timezone.timedelta(days=random.randint(-7, 30))
                
                assignee = random.choice(members + [None])
                
                task = Task.objects.create(
                    project=project,
                    title=fake.sentence(nb_words=4),
                    description=fake.paragraph(),
                    status=random.choices(status_options, weights=[0.4, 0.4, 0.2])[0],
                    priority=random.choices(priority_options, weights=[0.3, 0.5, 0.2])[0],
                    due_date=due_date,
                    assigned_to=assignee,
                    created_by=random.choice(members),
                    order_index=i
                )
                tasks.append(task)
        return tasks

    def _create_comments(self, tasks, users, per_task):
        for task in tasks:
            members = [m.user for m in task.project.members.all()]
            num_comments = random.randint(0, per_task)
            for _ in range(num_comments):
                TaskComment.objects.create(
                    task=task,
                    user=random.choice(members),
                    content=fake.paragraph(nb_sentences=2)
                )

    def _print_summary(self):
        self.stdout.write(self.style.SUCCESS('\n=== Seed complete ==='))
        self.stdout.write(f'Users:           {User.objects.count()}')
        self.stdout.write(f'Projects:        {Project.objects.count()}')
        self.stdout.write(f'Project members: {ProjectMember.objects.count()}')
        self.stdout.write(f'Tasks:           {Task.objects.count()}')
        self.stdout.write(f'Task comments:   {TaskComment.objects.count()}')
        self.stdout.write('=====================')
        self.stdout.write('Admin login: admin@example.com / Admin@1234')
        self.stdout.write('User login:  any seeded email / Test@1234')
