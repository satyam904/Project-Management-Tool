from django.utils import timezone


class SoftDeleteMixin:
    """Adds soft delete — sets deleted_at instead of removing the row."""

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])
