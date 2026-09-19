from getpass import getpass

from database import Base, engine, SessionLocal
from models import Admin
from auth import hash_password


# Создаём таблицы, если их ещё нет
Base.metadata.create_all(bind=engine)


db = SessionLocal()


try:

    username = input("Логин администратора: ").strip()

    if not username:
        print("Ошибка: логин не может быть пустым.")
        exit()

    password = getpass("Пароль администратора: ")

    if not password:
        print("Ошибка: пароль не может быть пустым.")
        exit()

    existing_admin = db.query(Admin).filter(
        Admin.username == username
    ).first()

    if existing_admin:

        print(
            f"Администратор '{username}' уже существует."
        )

        exit()

    admin = Admin(
        username=username,
        password_hash=hash_password(password)
    )

    db.add(admin)
    db.commit()

    print()
    print("Администратор успешно создан!")
    print(f"Логин: {username}")

finally:

    db.close()
