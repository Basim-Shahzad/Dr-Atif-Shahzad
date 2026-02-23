from django.contrib import admin
from .models import CustomUser, FacultyProfile, StudentProfile


# Register your models here.

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
   list_display = ( 'email', 'kau_id', 'role', 'is_staff', 'is_active')

admin.site.register(FacultyProfile)
admin.site.register(StudentProfile)

