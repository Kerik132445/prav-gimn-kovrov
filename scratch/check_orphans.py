import sqlite3

con = sqlite3.connect("backend/gymnasium.db")
cur = con.cursor()

# Check news_images -> news
orphaned_images = cur.execute("""
    SELECT count(*) FROM news_images WHERE news_id NOT IN (SELECT id FROM news)
""").fetchone()[0]
print(f"Orphaned news_images: {orphaned_images}")

# Check admin_sessions -> admins
orphaned_sessions = cur.execute("""
    SELECT count(*) FROM admin_sessions WHERE admin_id NOT IN (SELECT id FROM admins)
""").fetchone()[0]
print(f"Orphaned admin_sessions: {orphaned_sessions}")

# Check schedule_lessons -> school_classes
orphaned_lessons = cur.execute("""
    SELECT count(*) FROM schedule_lessons WHERE class_id NOT IN (SELECT id FROM school_classes)
""").fetchone()[0]
print(f"Orphaned schedule_lessons: {orphaned_lessons}")

# Check schedule_lessons -> teachers
orphaned_teachers = cur.execute("""
    SELECT count(*) FROM schedule_lessons WHERE teacher_id IS NOT NULL AND teacher_id NOT IN (SELECT id FROM teachers)
""").fetchone()[0]
print(f"Orphaned teacher links in schedule: {orphaned_teachers}")

# Check menu_items -> menu_day_meals
orphaned_menu_items = cur.execute("""
    SELECT count(*) FROM menu_items WHERE meal_id NOT IN (SELECT id FROM menu_day_meals)
""").fetchone()[0]
print(f"Orphaned menu_items: {orphaned_menu_items}")
