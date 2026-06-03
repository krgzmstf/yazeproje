"""
Models package – import all models so Alembic and Base.metadata see them.
"""

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.user import User, UserRole
from app.models.project import (
    ArchitectureProject,
    ProjectPhase,
    ProjectCategory,
    ProjectStatus,
    PhaseStatus,
)
from app.models.regulation import Regulation, RegulationCategory
from app.models.real_estate import (
    RealEstateListing,
    ScrapedMarketLead,
    ListingType,
    PropertyType,
    LeadSource,
)
from app.models.content import (
    AutomatedNews,
    Comment,
    Announcement,
    Event,
    NewsSource,
    CommentStatus,
)
from app.models.product import (
    SoftwareProduct,
    ProductForSale,
    SoftwareProductCategory,
)
from app.models.contact import (
    ContactMessage,
    NewsletterSubscriber,
    SmsSubscriber,
    ContactMessageStatus,
)
from app.models.scraper import ScraperLog, ScraperStatus
from app.models.settings import SiteSetting, QuickMenuItem
from app.models.order import (
    Order,
    OrderItem,
    PaymentTransaction,
    OrderStatus,
    PaymentProvider,
    PaymentStatus,
)

__all__ = [
    # Base
    "Base",
    "TimestampMixin",
    "UUIDPrimaryKeyMixin",
    # User
    "User",
    "UserRole",
    # Project
    "ArchitectureProject",
    "ProjectPhase",
    "ProjectCategory",
    "ProjectStatus",
    "PhaseStatus",
    # Regulation
    "Regulation",
    "RegulationCategory",
    # Real Estate
    "RealEstateListing",
    "ScrapedMarketLead",
    "ListingType",
    "PropertyType",
    "LeadSource",
    # Content
    "AutomatedNews",
    "Comment",
    "Announcement",
    "Event",
    "NewsSource",
    "CommentStatus",
    # Product
    "SoftwareProduct",
    "ProductForSale",
    "SoftwareProductCategory",
    # Contact
    "ContactMessage",
    "NewsletterSubscriber",
    "SmsSubscriber",
    "ContactMessageStatus",
    # Scraper
    "ScraperLog",
    "ScraperStatus",
    # Settings
    "SiteSetting",
    "QuickMenuItem",
    # Order
    "Order",
    "OrderItem",
    "PaymentTransaction",
    "OrderStatus",
    "PaymentProvider",
    "PaymentStatus",
]
