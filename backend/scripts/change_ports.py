import os

path = r'D:\yazılım\yazesym\docker-compose.yml'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace ports directly
c = c.replace('- "2002:5432"', '- "2012:5432"')
c = c.replace('- "2001:8000"', '- "2011:8000"')
c = c.replace('- "2000:80"', '- "2010:80"')
c = c.replace('- "2003:3001"', '- "2013:3001"')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Ports updated to 2010-2013 in docker-compose.yml')
