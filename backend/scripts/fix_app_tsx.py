import os

path = r'D:\yazılım\yazesym\frontend\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace SakinRoute
start_idx = c.find('function SakinRoute')
end_idx = c.find('function RootPage')
old_sakin = c[start_idx:end_idx]
new_sakin = """function SakinRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated())
  const user = useAuthStore(s => s.user)
  const activeSiteId = useAuthStore(s => s.activeSiteId)
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (user?.rol === 'sakin' || user?.rol === 'goruntule') return <Navigate to="/portal" replace />
  if (user?.rol === 'super_admin' && !activeSiteId) return <Navigate to="/site-sec" replace />
  return <>{children}</>
}

"""
c = c.replace(old_sakin, new_sakin)

# Replace RootPage
start_idx2 = c.find('function RootPage')
end_idx2 = c.find('function AuthBootstrap')
old_root = c[start_idx2:end_idx2]
new_root = """function RootPage() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated())       
  if (!isAuthenticated) return <LandingPage />
  return <Navigate to="/uygulama-sec" replace />
}

"""
c = c.replace(old_root, new_root)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("App.tsx fixed successfully")
