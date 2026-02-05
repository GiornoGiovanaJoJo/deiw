from .database import SessionLocal, engine, Base
from . import models
from . import utils

# Create tables
models.Base.metadata.create_all(bind=engine)

def create_users():
    db = SessionLocal()
    try:
        # 1. Create Default Superuser for /BenutzerLogin
        # Checking if 'admin' exists, if not creating it.
        if not db.query(models.User).filter(models.User.username == "admin").first():
            admin_user = models.User(
                username="admin",
                email="admin@example.com",
                hashed_password=utils.get_password_hash("admin"), # Default password
                is_superuser=True,
                is_active=True,
                vorname="Super",
                nachname="Admin",
                position="Administrator"
            )
            db.add(admin_user)
            print("Superuser 'admin' created with password 'admin'.")
        else:
            print("Superuser 'admin' already exists.")

        # 2. Create Regular User 'granpainside@yandex.ru'
        email = "granpainside@yandex.ru"
        username = "granpainside" # Derived from email or set explicitly
        password = "Nikitoso02-"
        
        if not db.query(models.User).filter(models.User.email == email).first():
            user = models.User(
                username=username,
                email=email,
                hashed_password=utils.get_password_hash(password),
                is_superuser=False,
                is_active=True,
                vorname="Nikita", # Placeholder
                nachname="User",   # Placeholder
                position="Client"
            )
            db.add(user)
            print(f"User '{email}' created.")
        else:
            print(f"User '{email}' already exists.")

        db.commit()

    except Exception as e:
        print(f"Error creating users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_users()
