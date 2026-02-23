from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver


class Roles(models.TextChoices):
    STUDENT = "STUDENT", "Student"
    FACULTY = "FACULTY", "Faculty"
    ADMIN = "ADMIN", "Admin"


class CustomUser(AbstractUser):

    kau_id = models.IntegerField(unique=True, null=True)
    username = models.CharField(max_length=200)
    email = models.EmailField(unique=True)

    role = models.CharField(max_length=10, choices=Roles.choices)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    def __str__(self):
        return self.username


class StudentProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    # Add Student-specific relationships here (e.g., Courses)


class FacultyProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="faculty_profile",
    )
    # Add Faculty-specific relationships here (e.g., Research Papers)


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == Roles.STUDENT:
            StudentProfile.objects.get_or_create(user=instance)
        elif instance.role == Roles.FACULTY:
            FacultyProfile.objects.get_or_create(user=instance)
