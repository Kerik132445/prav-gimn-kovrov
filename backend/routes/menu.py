import os
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from database import SessionLocal
from media import delete_file_by_url, ensure_upload_subdir, save_validated_image
from models import MenuDayMeal, MenuItem
from routes.auth import require_admin, require_csrf
from schemas import (
    MENU_AGE_GROUPS,
    MENU_MEAL_TYPES,
    MenuCopyDayRequest,
    MenuCopyWeekRequest,
    MenuDayMealOut,
    MenuDayMealPayload,
    MenuItemOut,
    MenuItemPayload,
    MenuReorderRequest,
)

router = APIRouter(
    prefix="/api/menu",
    tags=["Menu"],
)

ensure_upload_subdir("menu")

MEAL_ORDER = {meal: idx for idx, meal in enumerate(MENU_MEAL_TYPES)}
AGE_GROUP_LABELS = {
    "spassky": "1–4 классы (Спасский корпус)",
    "pokrovsky": "5–11 классы (Покровский корпус)",
}
MEAL_TYPE_LABELS = {
    "breakfast": "Завтрак",
    "lunch": "Обед",
    "snack": "Полдник",
}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _parse_optional_int(raw_value: str | int | None, field_label: str) -> int | None:
    if raw_value is None:
        return None
    if isinstance(raw_value, int):
        return raw_value
    text = str(raw_value).strip()
    if not text:
        return None
    try:
        return int(text)
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail=f"Поле «{field_label}» должно быть целым числом",
        )


def _parse_required_int(raw_value: str | int, field_label: str) -> int:
    parsed = _parse_optional_int(raw_value, field_label)
    if parsed is None:
        raise HTTPException(
            status_code=422,
            detail=f"Поле «{field_label}» обязательно для заполнения",
        )
    return parsed


def _validate_item_fields(
    *,
    age_group: str,
    week_number: int,
    day_of_week: int,
    meal_type: str,
    dish_category: str | None,
    name: str,
    weight: str | None,
    description: str | None,
    composition: str | None,
    sort_order: int,
) -> MenuItemPayload:
    try:
        return MenuItemPayload(
            age_group=age_group,
            week_number=week_number,
            day_of_week=day_of_week,
            meal_type=meal_type,
            dish_category=dish_category,
            name=name,
            weight=weight,
            description=description,
            composition=composition,
            sort_order=sort_order,
        )
    except ValidationError as exc:
        first_err = exc.errors()[0]
        msg = first_err.get("msg", "Некорректные данные")
        if msg.startswith("Value error, "):
            msg = msg[len("Value error, "):]
        raise HTTPException(status_code=422, detail=msg)


def _delete_menu_image_if_unused(
    db: Session,
    image_url: str | None,
    exclude_item_id: int | None = None,
) -> None:
    """Remove uploaded dish image only if no other menu item references it."""
    if not image_url:
        return
    query = db.query(MenuItem.id).filter(MenuItem.image == image_url)
    if exclude_item_id is not None:
        query = query.filter(MenuItem.id != exclude_item_id)
    if query.first() is not None:
        return
    delete_file_by_url(image_url, subdir="menu")


def _cleanup_orphaned_images(db: Session, candidate_urls: set[str | None]) -> None:
    for url in candidate_urls:
        if url:
            _delete_menu_image_if_unused(db, url)


def _check_duplicate_dish(
    db: Session,
    *,
    age_group: str,
    week_number: int,
    day_of_week: int,
    meal_type: str,
    name: str,
    exclude_item_id: int | None = None,
) -> None:
    target = name.strip().casefold()
    query = db.query(MenuItem).filter(
        MenuItem.age_group == age_group,
        MenuItem.week_number == week_number,
        MenuItem.day_of_week == day_of_week,
        MenuItem.meal_type == meal_type,
    )
    if exclude_item_id is not None:
        query = query.filter(MenuItem.id != exclude_item_id)

    for existing in query.all():
        if existing.name.strip().casefold() == target:
            meal_label = MEAL_TYPE_LABELS.get(meal_type, meal_type).lower()
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Блюдо «{existing.name}» уже добавлено в {meal_label} "
                    f"({week_number} неделя, {day_of_week} день)."
                ),
            )


def _validate_query_filters(
    *,
    age_group: str | None,
    week_number: int | None,
    day_of_week: int | None,
    meal_type: str | None,
) -> tuple[str | None, int | None, int | None, str | None]:
    cleaned_group = None
    if age_group is not None:
        cleaned_group = age_group.strip().lower()
        if cleaned_group not in MENU_AGE_GROUPS:
            raise HTTPException(status_code=400, detail="Некорректная возрастная группа")

    if week_number is not None and week_number not in (1, 2):
        raise HTTPException(status_code=400, detail="Номер недели должен быть 1 или 2")

    if day_of_week is not None and day_of_week not in (1, 2, 3, 4, 5):
        raise HTTPException(status_code=400, detail="День недели должен быть от 1 до 5")

    cleaned_meal = None
    if meal_type is not None:
        cleaned_meal = meal_type.strip().lower()
        if cleaned_meal not in MENU_MEAL_TYPES:
            raise HTTPException(status_code=400, detail="Некорректный тип приёма пищи")

    return cleaned_group, week_number, day_of_week, cleaned_meal


@router.get("/")
def get_menu(
    age_group: str | None = Query(default=None),
    week_number: int | None = Query(default=None),
    day_of_week: int | None = Query(default=None),
    meal_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    cleaned_group, valid_week, valid_day, cleaned_meal = _validate_query_filters(
        age_group=age_group,
        week_number=week_number,
        day_of_week=day_of_week,
        meal_type=meal_type,
    )

    items_query = db.query(MenuItem)
    meals_query = db.query(MenuDayMeal)

    if cleaned_group is not None:
        items_query = items_query.filter(MenuItem.age_group == cleaned_group)
        meals_query = meals_query.filter(MenuDayMeal.age_group == cleaned_group)
    if valid_week is not None:
        items_query = items_query.filter(MenuItem.week_number == valid_week)
        meals_query = meals_query.filter(MenuDayMeal.week_number == valid_week)
    if valid_day is not None:
        items_query = items_query.filter(MenuItem.day_of_week == valid_day)
        meals_query = meals_query.filter(MenuDayMeal.day_of_week == valid_day)
    if cleaned_meal is not None:
        items_query = items_query.filter(MenuItem.meal_type == cleaned_meal)
        meals_query = meals_query.filter(MenuDayMeal.meal_type == cleaned_meal)

    items = items_query.order_by(
        MenuItem.age_group.asc(),
        MenuItem.week_number.asc(),
        MenuItem.day_of_week.asc(),
        MenuItem.sort_order.asc(),
        MenuItem.id.asc(),
    ).all()
    items.sort(
        key=lambda row: (
            row.age_group,
            row.week_number,
            row.day_of_week,
            MEAL_ORDER.get(row.meal_type, 99),
            row.sort_order,
            row.id,
        )
    )

    summaries = meals_query.order_by(
        MenuDayMeal.age_group.asc(),
        MenuDayMeal.week_number.asc(),
        MenuDayMeal.day_of_week.asc(),
        MenuDayMeal.id.asc(),
    ).all()
    summaries.sort(
        key=lambda row: (
            row.age_group,
            row.week_number,
            row.day_of_week,
            MEAL_ORDER.get(row.meal_type, 99),
            row.id,
        )
    )

    return {
        "items": [MenuItemOut.model_validate(item).model_dump() for item in items],
        "meal_summaries": [MenuDayMealOut.model_validate(s).model_dump() for s in summaries],
    }


@router.get("/summary")
def get_menu_summary(db: Session = Depends(get_db)):
    items = db.query(
        MenuItem.age_group,
        MenuItem.week_number,
        MenuItem.day_of_week,
        MenuItem.meal_type,
    ).all()

    by_slot: dict[str, dict[str, int]] = {}
    group_totals = {group: 0 for group in MENU_AGE_GROUPS}

    for group in MENU_AGE_GROUPS:
        for week in (1, 2):
            for day in (1, 2, 3, 4, 5):
                by_slot[f"{group}:{week}:{day}"] = {
                    "total": 0,
                    "breakfast": 0,
                    "lunch": 0,
                    "snack": 0,
                }

    for age_group, week_number, day_of_week, meal_type in items:
        key = f"{age_group}:{week_number}:{day_of_week}"
        if key not in by_slot:
            by_slot[key] = {"total": 0, "breakfast": 0, "lunch": 0, "snack": 0}
        by_slot[key]["total"] += 1
        if meal_type in by_slot[key]:
            by_slot[key][meal_type] += 1
        if age_group in group_totals:
            group_totals[age_group] += 1

    return {
        "total_items": len(items),
        "group_totals": group_totals,
        "days": by_slot,
    }


@router.get("/items/{item_id}", response_model=MenuItemOut)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Блюдо не найдено")
    return item


@router.post("/items", response_model=MenuItemOut, status_code=status.HTTP_201_CREATED)
async def create_menu_item(
    age_group: str = Form(...),
    week_number: str = Form(...),
    day_of_week: str = Form(...),
    meal_type: str = Form(...),
    name: str = Form(...),
    dish_category: str | None = Form(None),
    weight: str | None = Form(None),
    description: str | None = Form(None),
    composition: str | None = Form(None),
    sort_order: str | None = Form(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    parsed_week = _parse_required_int(week_number, "Неделя")
    parsed_day = _parse_required_int(day_of_week, "День недели")
    parsed_order = _parse_optional_int(sort_order, "Порядок отображения")

    validated = _validate_item_fields(
        age_group=age_group,
        week_number=parsed_week,
        day_of_week=parsed_day,
        meal_type=meal_type,
        dish_category=dish_category,
        name=name,
        weight=weight,
        description=description,
        composition=composition,
        sort_order=parsed_order if parsed_order is not None else 0,
    )

    _check_duplicate_dish(
        db,
        age_group=validated.age_group,
        week_number=validated.week_number,
        day_of_week=validated.day_of_week,
        meal_type=validated.meal_type,
        name=validated.name,
    )

    if parsed_order is None:
        existing_orders = [
            row[0]
            for row in db.query(MenuItem.sort_order)
            .filter(
                MenuItem.age_group == validated.age_group,
                MenuItem.week_number == validated.week_number,
                MenuItem.day_of_week == validated.day_of_week,
                MenuItem.meal_type == validated.meal_type,
            )
            .all()
        ]
        resolved_order = (max(existing_orders) + 10) if existing_orders else 10
    else:
        resolved_order = validated.sort_order

    image_url: str | None = None
    if image and image.filename:
        image_url = await save_validated_image(image, "menu")

    item = MenuItem(
        age_group=validated.age_group,
        week_number=validated.week_number,
        day_of_week=validated.day_of_week,
        meal_type=validated.meal_type,
        dish_category=validated.dish_category,
        name=validated.name,
        weight=validated.weight,
        description=validated.description,
        composition=validated.composition,
        image=image_url,
        sort_order=resolved_order,
    )

    try:
        db.add(item)
        db.commit()
        db.refresh(item)
    except Exception:
        db.rollback()
        if image_url:
            delete_file_by_url(image_url, subdir="menu")
        raise

    return item


@router.patch("/items/reorder")
def reorder_menu_items(
    payload: MenuReorderRequest,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    order_map = {item.id: item.sort_order for item in payload.items}
    rows = db.query(MenuItem).filter(MenuItem.id.in_(order_map.keys())).all()
    if len(rows) != len(order_map):
        raise HTTPException(status_code=404, detail="Некоторые блюда не найдены")

    contexts = {
        (row.age_group, row.week_number, row.day_of_week, row.meal_type)
        for row in rows
    }
    if len(contexts) != 1:
        raise HTTPException(
            status_code=400,
            detail="Сортировка допускается только внутри одного приёма пищи выбранного дня",
        )

    for row in rows:
        row.sort_order = order_map[row.id]

    db.commit()
    return {"message": "Порядок блюд обновлён"}


@router.put("/items/{item_id}", response_model=MenuItemOut)
async def update_menu_item(
    item_id: int,
    age_group: str = Form(...),
    week_number: str = Form(...),
    day_of_week: str = Form(...),
    meal_type: str = Form(...),
    name: str = Form(...),
    dish_category: str | None = Form(None),
    weight: str | None = Form(None),
    description: str | None = Form(None),
    composition: str | None = Form(None),
    sort_order: str | None = Form(None),
    remove_image: bool = Form(False),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Блюдо не найдено")

    parsed_week = _parse_required_int(week_number, "Неделя")
    parsed_day = _parse_required_int(day_of_week, "День недели")
    parsed_order = _parse_optional_int(sort_order, "Порядок отображения")
    if parsed_order is None:
        parsed_order = item.sort_order

    validated = _validate_item_fields(
        age_group=age_group,
        week_number=parsed_week,
        day_of_week=parsed_day,
        meal_type=meal_type,
        dish_category=dish_category,
        name=name,
        weight=weight,
        description=description,
        composition=composition,
        sort_order=parsed_order,
    )

    _check_duplicate_dish(
        db,
        age_group=validated.age_group,
        week_number=validated.week_number,
        day_of_week=validated.day_of_week,
        meal_type=validated.meal_type,
        name=validated.name,
        exclude_item_id=item.id,
    )

    old_image_url = item.image
    new_image_url: str | None = None
    if image and image.filename:
        new_image_url = await save_validated_image(image, "menu")

    item.age_group = validated.age_group
    item.week_number = validated.week_number
    item.day_of_week = validated.day_of_week
    item.meal_type = validated.meal_type
    item.dish_category = validated.dish_category
    item.name = validated.name
    item.weight = validated.weight
    item.description = validated.description
    item.composition = validated.composition
    item.sort_order = validated.sort_order

    if new_image_url:
        item.image = new_image_url
    elif remove_image:
        item.image = None

    try:
        db.commit()
        db.refresh(item)
    except Exception:
        db.rollback()
        if new_image_url:
            delete_file_by_url(new_image_url, subdir="menu")
        raise

    if old_image_url and old_image_url != item.image:
        _delete_menu_image_if_unused(db, old_image_url, exclude_item_id=item.id)

    return item


@router.delete("/items/{item_id}")
def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Блюдо не найдено")

    image_url = item.image
    db.delete(item)
    db.commit()

    _delete_menu_image_if_unused(db, image_url)

    return {"message": "Блюдо удалено", "id": item_id}


@router.put("/meal-meta", response_model=MenuDayMealOut | dict)
def upsert_meal_meta(
    payload: MenuDayMealPayload,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    existing = (
        db.query(MenuDayMeal)
        .filter(
            MenuDayMeal.age_group == payload.age_group,
            MenuDayMeal.week_number == payload.week_number,
            MenuDayMeal.day_of_week == payload.day_of_week,
            MenuDayMeal.meal_type == payload.meal_type,
        )
        .first()
    )

    if not payload.price and not payload.kbju and not payload.note:
        if existing:
            db.delete(existing)
            db.commit()
        return {
            "id": None,
            "age_group": payload.age_group,
            "week_number": payload.week_number,
            "day_of_week": payload.day_of_week,
            "meal_type": payload.meal_type,
            "price": None,
            "kbju": None,
            "note": None,
        }

    if existing:
        existing.price = payload.price
        existing.kbju = payload.kbju
        existing.note = payload.note
        db.commit()
        db.refresh(existing)
        return existing

    created = MenuDayMeal(
        age_group=payload.age_group,
        week_number=payload.week_number,
        day_of_week=payload.day_of_week,
        meal_type=payload.meal_type,
        price=payload.price,
        kbju=payload.kbju,
        note=payload.note,
    )
    db.add(created)
    db.commit()
    db.refresh(created)
    return created


@router.delete("/clear")
def clear_menu_day(
    age_group: str = Query(...),
    week_number: int = Query(...),
    day_of_week: int | None = Query(default=None),
    meal_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    cleaned_group, valid_week, valid_day, cleaned_meal = _validate_query_filters(
        age_group=age_group,
        week_number=week_number,
        day_of_week=day_of_week,
        meal_type=meal_type,
    )

    items_query = db.query(MenuItem).filter(
        MenuItem.age_group == cleaned_group,
        MenuItem.week_number == valid_week,
    )
    meals_query = db.query(MenuDayMeal).filter(
        MenuDayMeal.age_group == cleaned_group,
        MenuDayMeal.week_number == valid_week,
    )

    if valid_day is not None:
        items_query = items_query.filter(MenuItem.day_of_week == valid_day)
        meals_query = meals_query.filter(MenuDayMeal.day_of_week == valid_day)
    if cleaned_meal is not None:
        items_query = items_query.filter(MenuItem.meal_type == cleaned_meal)
        meals_query = meals_query.filter(MenuDayMeal.meal_type == cleaned_meal)

    target_items = items_query.all()
    candidate_images = {row.image for row in target_items if row.image}
    deleted_items = len(target_items)
    for row in target_items:
        db.delete(row)

    deleted_meals = meals_query.delete(synchronize_session=False)
    db.commit()

    _cleanup_orphaned_images(db, candidate_images)

    return {
        "message": "Меню очищено",
        "deleted_items": deleted_items,
        "deleted_meals": deleted_meals,
    }


def _copy_slots(
    db: Session,
    *,
    source_items: list[MenuItem],
    source_meals: list[MenuDayMeal],
    target_age_group: str,
    target_week: int,
    day_mapper,
    overwrite: bool,
    target_day_filter: int | None = None,
) -> tuple[int, int]:
    if not source_items and not source_meals:
        raise HTTPException(
            status_code=400,
            detail="В выбранном источнике нет блюд для копирования",
        )

    existing_items_q = db.query(MenuItem).filter(
        MenuItem.age_group == target_age_group,
        MenuItem.week_number == target_week,
    )
    existing_meals_q = db.query(MenuDayMeal).filter(
        MenuDayMeal.age_group == target_age_group,
        MenuDayMeal.week_number == target_week,
    )
    if target_day_filter is not None:
        existing_items_q = existing_items_q.filter(MenuItem.day_of_week == target_day_filter)
        existing_meals_q = existing_meals_q.filter(MenuDayMeal.day_of_week == target_day_filter)

    existing_items = existing_items_q.all()
    existing_meals = existing_meals_q.all()

    if (existing_items or existing_meals) and not overwrite:
        target_label = AGE_GROUP_LABELS.get(target_age_group, target_age_group)
        scope_text = f"дне {target_day_filter} недели {target_week}" if target_day_filter else f"{target_week} неделе"
        raise HTTPException(
            status_code=409,
            detail=(
                f"В целевом меню ({target_label}, {scope_text}) уже есть {len(existing_items)} блюд. "
                "Подтвердите перезапись, чтобы заменить существующее меню."
            ),
        )

    candidate_images = {row.image for row in existing_items if row.image}
    if overwrite:
        for row in existing_items:
            db.delete(row)
        for row in existing_meals:
            db.delete(row)
        db.flush()

    copied_items = 0
    for src in source_items:
        db.add(
            MenuItem(
                age_group=target_age_group,
                week_number=target_week,
                day_of_week=day_mapper(src.day_of_week),
                meal_type=src.meal_type,
                dish_category=src.dish_category,
                name=src.name,
                weight=src.weight,
                description=src.description,
                composition=src.composition,
                image=src.image,
                sort_order=src.sort_order,
            )
        )
        copied_items += 1

    copied_meals = 0
    for src_meal in source_meals:
        db.add(
            MenuDayMeal(
                age_group=target_age_group,
                week_number=target_week,
                day_of_week=day_mapper(src_meal.day_of_week),
                meal_type=src_meal.meal_type,
                price=src_meal.price,
                kbju=src_meal.kbju,
                note=src_meal.note,
            )
        )
        copied_meals += 1

    db.commit()
    _cleanup_orphaned_images(db, candidate_images)
    return copied_items, copied_meals


@router.post("/copy-day")
def copy_day_menu(
    data: MenuCopyDayRequest,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    if (
        data.source_age_group == data.target_age_group
        and data.source_week == data.target_week
        and data.source_day == data.target_day
    ):
        raise HTTPException(status_code=400, detail="Исходный и целевой день совпадают")

    source_items = (
        db.query(MenuItem)
        .filter(
            MenuItem.age_group == data.source_age_group,
            MenuItem.week_number == data.source_week,
            MenuItem.day_of_week == data.source_day,
        )
        .order_by(MenuItem.sort_order.asc(), MenuItem.id.asc())
        .all()
    )
    source_meals = (
        db.query(MenuDayMeal)
        .filter(
            MenuDayMeal.age_group == data.source_age_group,
            MenuDayMeal.week_number == data.source_week,
            MenuDayMeal.day_of_week == data.source_day,
        )
        .all()
    )

    copied_items, copied_meals = _copy_slots(
        db,
        source_items=source_items,
        source_meals=source_meals,
        target_age_group=data.target_age_group,
        target_week=data.target_week,
        day_mapper=lambda _d: data.target_day,
        overwrite=data.overwrite,
        target_day_filter=data.target_day,
    )

    return {
        "message": f"Скопировано блюд: {copied_items}",
        "copied_items": copied_items,
        "copied_meals": copied_meals,
    }


@router.post("/copy-week")
def copy_week_menu(
    data: MenuCopyWeekRequest,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    if data.source_age_group == data.target_age_group and data.source_week == data.target_week:
        raise HTTPException(status_code=400, detail="Исходная и целевая недели совпадают")

    source_items = (
        db.query(MenuItem)
        .filter(
            MenuItem.age_group == data.source_age_group,
            MenuItem.week_number == data.source_week,
        )
        .order_by(MenuItem.day_of_week.asc(), MenuItem.sort_order.asc(), MenuItem.id.asc())
        .all()
    )
    source_meals = (
        db.query(MenuDayMeal)
        .filter(
            MenuDayMeal.age_group == data.source_age_group,
            MenuDayMeal.week_number == data.source_week,
        )
        .all()
    )

    copied_items, copied_meals = _copy_slots(
        db,
        source_items=source_items,
        source_meals=source_meals,
        target_age_group=data.target_age_group,
        target_week=data.target_week,
        day_mapper=lambda day: day,
        overwrite=data.overwrite,
        target_day_filter=None,
    )

    return {
        "message": f"Неделя скопирована (блюд: {copied_items})",
        "copied_items": copied_items,
        "copied_meals": copied_meals,
    }
