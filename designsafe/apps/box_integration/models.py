from django.db import models
from django.conf import settings


class BoxUserToken(models.Model):
    """
    Represents an OAuth Token for a Box.com user
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    access_token = models.CharField(max_length=255)
    refresh_token = models.CharField(max_length=255)

    def update_tokens(self, access_token, refresh_token):
        """
        Callable method that should be passed as the store_tokens callable
        for the BoxDSK OAuth2 object.

        Args:
            access_token: the updated access token
            refresh_token: the updated refresh token

        Returns:
            None
        """
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.save()

    def get_token(self):
        """
        Convenience method to get current token.

        Returns:
            (access_token, refresh_token)

        """
        return self.access_token, self.refresh_token

