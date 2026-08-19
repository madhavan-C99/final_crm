from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from datetime import date
from .role import Role


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        if not username:
            raise ValueError('Users must have a username.')
        if not email:
            raise ValueError('Users must have an email address.')

        user = self.model(username=self.normalize_username(username), email=self.normalize_email(email))
        user.is_active = True
        user.set_password(password)
        user.save()
        return user

    def normalize_username(self, username):
        return username.strip().lower()


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
    
    # 1 User = 1 Role (ForeignKey relationship)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name="adm_users")
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

    # Avoid reverse accessor clash with telecalling.User
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='adm_user_groups',
        related_query_name='adm_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='adm_user_permissions',
        related_query_name='adm_user',
    )

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'mobile']

    objects = UserManager()

    class Meta:
        db_table = "adm_user"
        verbose_name = "Admin User"
        verbose_name_plural = "Admin Users"

    def __str__(self):
        return self.username

    def get_perms(self):
        if not self.role:
            return []
        if self.role.code == 'DEV' or self.role.name == 'developer' or self.is_superuser:
            from .perms import Perm
            return list(Perm.objects.values_list("name", flat=True))
        return list(self.role.perms.values_list("name", flat=True))