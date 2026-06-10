import os

path = r'D:\yazılım\yazesym\frontend\src\components\layout\Sidebar.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

if 'import { useAppSelectionStore }' not in c:
    c = c.replace("import { useAuthStore } from '@/store/auth'", "import { useAuthStore } from '@/store/auth'\nimport { useAppSelectionStore } from '@/store/appSelection'")

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Sidebar import fixed.")
