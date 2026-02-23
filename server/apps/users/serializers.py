from rest_framework import serializers
from .models import StudentProfile, FacultyProfile, CustomUser
from dj_rest_auth.registration.serializers import RegisterSerializer

class UserSerializer(serializers.ModelSerializer):
   # This will hold the nested data
   profile_data = serializers.SerializerMethodField()

   class Meta:
      model = CustomUser
      fields = ['id', 'email', 'password', 'role', 'profile_data', 'kau_id']
      extra_kwargs = {'password': {'write_only': True}}

   def get_profile_data(self, obj):
      """Returns the profile data based on the user's role"""
      if obj.role == CustomUser.Roles.STUDENT and hasattr(obj, 'student_profile'):
         return StudentProfileSerializer(obj.student_profile).data
      elif obj.role == CustomUser.Roles.FACULTY and hasattr(obj, 'faculty_profile'):
         return FacultyProfileSerializer(obj.faculty_profile).data
      return None

class StudentProfileSerializer(serializers.ModelSerializer):
   class Meta:
      model = StudentProfile
      fields = []

class FacultyProfileSerializer(serializers.ModelSerializer):
   class Meta:
      model = FacultyProfile
      fields = []

class CustomRegisterSerializer(RegisterSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop('password2', None)

    def to_internal_value(self, data):
        if 'password_1' in data:
            data['password1'] = data.pop('password_1')
        return super().to_internal_value(data)

    def validate(self, data):
        if 'password_1' in data:
            data['password1'] = data.pop('password_1')
        data["password2"] = data.get("password1")
        return super().validate(data)