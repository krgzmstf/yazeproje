import os

path = r'D:\yazılım\yazesym\frontend\src\pages\auth\LoginPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

old = "navigate('/uygulama-sec')"
new = """if (user.rol === 'sakin' || user.rol === 'goruntule') { 
        navigate('/portal')
      } else if (user.rol === 'super_admin') {
        navigate('/site-sec')
      } else {
        navigate('/panel')
      }"""
c = c.replace(old, new)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('LoginPage fixed')
