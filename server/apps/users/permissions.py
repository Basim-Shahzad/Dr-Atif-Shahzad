from rest_framework import permissions

# Permission Classes
class IsFaculty(permissions.BasePermission):
   def has_permission(self, request, view):
      return request.user.is_authenticated and request.user.role == 'FACULTY'

class IsStudent(permissions.BasePermission):
   def has_permission(self, request, view):
      return request.user.is_authenticated and request.user.role == 'STUDENT'