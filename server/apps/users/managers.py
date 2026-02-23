from django.contrib.auth.base_user import BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, kau_id=None, username=None, **extra_fields):
        if not email:
            raise ValueError("The Email must be set")

        # Logic: If it's not staff, they MUST have a kau_id
        if not kau_id and not extra_fields.get("is_staff"):
            raise ValueError("The Kau_ID must be set")

        email = self.normalize_email(email)

        if not username:
            username = email.split("@")[0]

        # Ensure kau_id is saved to the model
        user = self.model(email=email, username=username, kau_id=kau_id, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, username=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(
            email, password, kau_id=None, username=username, **extra_fields
        )
