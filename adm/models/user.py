from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from datetime import date
from django.utils.crypto import get_random_string
from .role import Role


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        if not username:
            raise TypeError('Users must have a username.')
        if not email:
            raise TypeError('Users must have an email address.')

        user = self.model(username=self.normalize_username(username), email=self.normalize_email(email))
        user.is_active = True
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, email, password=None):
        if password is None:
            raise TypeError('Superusers must have a password.')

        user = self.create_user(username, email, password)
        user.is_active = True
        user.is_superuser = True
        user.is_staff = True
        user.save()
        return user

    def normalize_username(self, username):
        return username.strip().lower()

    def make_random_password(self, length=10):
        return get_random_string(length)


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(db_index=True, max_length=255, unique=True)
    email = models.EmailField(db_index=True, unique=True)
    user_profile = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    gender = models.CharField(max_length=100, null=True, blank=True)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    mobile = models.CharField(max_length=25, null=True, blank=True)
    user_type = models.CharField(max_length=25, null=True, blank=True)
    address = models.CharField(max_length=500, null=True, blank=True)
    wrong_pwd_counts = models.IntegerField(default=0)

    team = models.ForeignKey('adm.Team', on_delete=models.SET_NULL, null=True, blank=True, related_name='adm_members')

    starting_date = models.DateField(default=date.today)
    ending_date = models.DateField(null=True, blank=True)
    email_verified = models.BooleanField(default=False)
    last_pwd_changed_at = models.DateTimeField(blank=True, null=True)
    validate_token = models.CharField(max_length=20, blank=True, null=True)
    validated_at = models.DateTimeField(blank=True, null=True)
    deact_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    joining_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'mobile']

    objects = UserManager()

    class Meta:
        db_table = "adm_user"
        verbose_name = "Admin User"
        verbose_name_plural = "Admin Users"

    def __str__(self):
        return self.username

    def get_full_name(self):
        if not self.first_name and not self.last_name:
            return self.username
        return f"{self.first_name or ''} {self.last_name or ''}".strip()

    def get_short_name(self):
        return self.username

    # 🔑 Custom RBAC Permission Engine (adm_role_perms Table Query via UserRole)
    def get_perms(self):
        if self.is_superuser:
            from .perms import Perm
            return list(Perm.objects.values_list("name", flat=True))

        user_role_obj = self.user_roles.select_related('role').first()
        if not user_role_obj or not user_role_obj.role:
            return []

        role_obj = user_role_obj.role
        if role_obj.code == 'DEV' or role_obj.name == 'developer':
            from .perms import Perm
            return list(Perm.objects.values_list("name", flat=True))

        return list(role_obj.perms.values_list("name", flat=True))