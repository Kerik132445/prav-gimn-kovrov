import os

pdf_dir = 'documents/newspaper'
files = [f for f in os.listdir(pdf_dir) if f.endswith('.pdf')]
print("Files count:", len(files))

# Verify all exist and have non-zero size
for f in sorted(files):
    sz = os.path.getsize(os.path.join(pdf_dir, f))
    if sz == 0:
        print("ZERO SIZE:", f)
print("All non-zero verification complete!")
