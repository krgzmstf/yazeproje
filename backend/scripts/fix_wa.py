import os
path = r"D:\yazılım\yazesym\whatsapp-service\index.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Ekleme işlemi:
# 1. Browser eklenecek
if "browser:" not in content:
    content = content.replace("markOnlineOnConnect: false,", "markOnlineOnConnect: false,\n      browser: ['Ubuntu', 'Chrome', '20.0.04'],")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully")