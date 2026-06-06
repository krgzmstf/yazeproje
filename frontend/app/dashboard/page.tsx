"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { 
  Building2, Home, Newspaper, LayoutDashboard, Plus, Trash2, Edit, LogOut, 
  User, Users, ShieldCheck, ShieldAlert, RefreshCw, MapPin, Search, ArrowUpDown, ChevronRight,
  TrendingUp, Activity, CheckCircle2, Clock, Eye, EyeOff, Phone, Lock, AlertCircle, Laptop, Mail,
  FileText, Calculator, BookOpen, Layers, Link as LinkIcon, Download, 
  Image as ImageIcon, Info, HelpCircle, ArrowUp, ArrowDown
} from "lucide-react";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";
import { getUsers, updateUserRole, updateUserStatus, deleteUser } from "@/lib/api";



interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

// Dynamically load MapSelector for coordinates selection in form
const MapSelector = dynamic(() => import("@/components/ui/MapSelector"), {
  ssr: false,
  loading: () => <div className="w-full h-[220px] bg-navy-dark rounded-xl flex items-center justify-center text-[10px] text-cream/40">Seçici Yükleniyor...</div>
});

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    if (window.location.hostname.includes("yazeproje.com")) {
      return "https://api.yazeproje.com/api/v1";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:1002/api/v1";
};

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Data states
  const [projects, setProjects] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [software, setSoftware] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  
  // UX States
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"project" | "listing" | "news" | "software" | "announcement" | "event">("project");
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [formData, setFormData] = useState<any>({});
  const [quickInfoPoolMode, setQuickInfoPoolMode] = useState<"visual" | "json">("visual");

  // Profile settings states
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [showProfileConfirmPassword, setShowProfileConfirmPassword] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [isProfilePasswordValid, setIsProfilePasswordValid] = useState(false);

  // User Management States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersSearchQuery, setUsersSearchQuery] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState("all");
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<any | null>(null);
  const [deleteInputVerify, setDeleteInputVerify] = useState("");
  const [updatingUserRoleMap, setUpdatingUserRoleMap] = useState<Record<string, boolean>>({});
  const [updatingUserStatusMap, setUpdatingUserStatusMap] = useState<Record<string, boolean>>({});

  const fetchUsersList = async (authToken: string) => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const data = await getUsers(authToken);
      setUsersList(data);
    } catch (err: any) {
      setUsersError(err.message || "Kullanıcı listesi yüklenemedi.");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleRoleChange = async (targetUser: any, newRole: string) => {
    if (!token) return;
    if (targetUser.id === user?.id) {
      alert("Kendi rolünüzü değiştiremezsiniz.");
      return;
    }
    
    setUpdatingUserRoleMap((prev) => ({ ...prev, [targetUser.id]: true }));
    try {
      await updateUserRole(targetUser.id, newRole, token);
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.message || "Rol güncellenirken bir hata oluştu.");
    } finally {
      setUpdatingUserRoleMap((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const handleStatusToggle = async (targetUser: any) => {
    if (!token) return;
    if (targetUser.id === user?.id) {
      alert("Kendi hesabınızı askıya alamazsınız.");
      return;
    }
    
    const newStatus = !targetUser.is_active;
    
    setUpdatingUserStatusMap((prev) => ({ ...prev, [targetUser.id]: true }));
    try {
      await updateUserStatus(targetUser.id, newStatus, token);
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: newStatus } : u))
      );
    } catch (err: any) {
      alert(err.message || "Kullanıcı durumu güncellenirken bir hata oluştu.");
    } finally {
      setUpdatingUserStatusMap((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const handleUserDelete = async () => {
    if (!token || !deleteConfirmUser) return;
    if (deleteConfirmUser.id === user?.id) {
      alert("Kendi hesabınızı silemezsiniz.");
      return;
    }

    if (deleteInputVerify.trim() !== "SİL") {
      alert("Lütfen onaylamak için 'SİL' yazın.");
      return;
    }

    try {
      await deleteUser(deleteConfirmUser.id, token);
      setUsersList((prev) => prev.filter((u) => u.id !== deleteConfirmUser.id));
      setDeleteConfirmUser(null);
      setDeleteInputVerify("");
    } catch (err: any) {
      alert(err.message || "Kullanıcı silinirken bir hata oluştu.");
    }
  };

  useEffect(() => {
    if (activeTab === "users" && token) {
      fetchUsersList(token);
    }
  }, [activeTab, token]);


  // Location API states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [locLoading, setLocLoading] = useState(false);

  const loadProvinces = async () => {
    try {
      const res = await fetch("https://api.turkiyeapi.dev/v1/provinces");
      if (res.ok) {
        const json = await res.json();
        const sorted = (json.data || []).sort((a: any, b: any) => a.name.localeCompare(b.name, "tr-TR"));
        setProvinces(sorted);
        return sorted;
      }
    } catch (err) {
      console.error("Error loading provinces:", err);
    }
    return [];
  };

  const loadDistricts = async (provName: string, provList: any[]) => {
    setLocLoading(true);
    try {
      const prov = provList.find(p => p.name.toLocaleLowerCase('tr-TR') === provName.toLocaleLowerCase('tr-TR'));
      if (prov) {
        const res = await fetch(`https://api.turkiyeapi.dev/v1/provinces/${prov.id}`);
        if (res.ok) {
          const json = await res.json();
          const sorted = (json.data?.districts || []).sort((a: any, b: any) => a.name.localeCompare(b.name, "tr-TR"));
          setDistricts(sorted);
          return sorted;
        }
      }
    } catch (err) {
      console.error("Error loading districts:", err);
    } finally {
      setLocLoading(false);
    }
    setDistricts([]);
    return [];
  };

  const loadNeighborhoods = async (distName: string, distList: any[]) => {
    setLocLoading(true);
    try {
      const dist = distList.find(d => d.name.toLocaleLowerCase('tr-TR') === distName.toLocaleLowerCase('tr-TR'));
      if (dist) {
        const res = await fetch(`https://api.turkiyeapi.dev/v1/districts/${dist.id}`);
        if (res.ok) {
          const json = await res.json();
          const sorted = (json.data?.neighborhoods || []).sort((a: any, b: any) => a.name.localeCompare(b.name, "tr-TR"));
          setNeighborhoods(sorted);
          return sorted;
        }
      }
    } catch (err) {
      console.error("Error loading neighborhoods:", err);
    } finally {
      setLocLoading(false);
    }
    setNeighborhoods([]);
    return [];
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!savedToken || !savedUser) {
      router.push("/dashboard/login");
    } else {
      setToken(savedToken);
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setProfileName(parsed.full_name || "");
      setProfileEmail(parsed.email || "");
      setProfilePhone(parsed.phone || "");
      fetchData(savedToken);
    }
  }, [router]);


  const fetchData = async (authToken: string) => {
    setLoading(true);
    try {
      const apiBase = getApiBaseUrl();
      // Validate token with auth/me
      const resMe = await fetch(`${apiBase}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (!resMe.ok) {
        if (resMe.status === 401) {
          // Clear credentials and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("storage"));
          router.push("/dashboard/login");
          return;
        }
      } else {
        const freshUser = await resMe.json();
        localStorage.setItem("user", JSON.stringify(freshUser));
        setUser(freshUser);
        setProfileName(freshUser.full_name || "");
        setProfileEmail(freshUser.email || "");
        setProfilePhone(freshUser.phone || "");
      }

      const parsedUser = JSON.parse(localStorage.getItem("user") || "{}");


      const isArchitectOrAdmin = parsedUser.role === "admin" || parsedUser.role === "architect";
      const resProj = await fetch(`${apiBase}/projects${isArchitectOrAdmin ? "/admin" : "/"}`, {
        headers: isArchitectOrAdmin ? { Authorization: `Bearer ${authToken}` } : {}
      });
      if (resProj.ok) setProjects(await resProj.json());

      const isAgentOrAdmin = parsedUser.role === "admin" || parsedUser.role === "agent";
      const resList = await fetch(`${apiBase}/listings${isAgentOrAdmin ? "/admin" : "/"}`, {
        headers: isAgentOrAdmin ? { Authorization: `Bearer ${authToken}` } : {}
      });
      if (resList.ok) setListings(await resList.json());

      const isEditorOrAdmin = parsedUser.role === "admin" || parsedUser.role === "editor";
      const resNews = await fetch(`${apiBase}/news${isEditorOrAdmin ? "/admin" : ""}`, {
        headers: isEditorOrAdmin ? { Authorization: `Bearer ${authToken}` } : {}
      });
      if (resNews.ok) setNews(await resNews.json());

      const resAnn = await fetch(`${apiBase}/announcements${isEditorOrAdmin ? "/admin" : ""}`, {
        headers: isEditorOrAdmin ? { Authorization: `Bearer ${authToken}` } : {}
      });
      if (resAnn.ok) setAnnouncements(await resAnn.json());

      const resEvt = await fetch(`${apiBase}/events${isEditorOrAdmin ? "/admin" : ""}`, {
        headers: isEditorOrAdmin ? { Authorization: `Bearer ${authToken}` } : {}
      });
      if (resEvt.ok) setEvents(await resEvt.json());

      // Fetch software products
      const isDeveloperOrAdmin = parsedUser.role === "admin" || parsedUser.role === "developer";
      const resSoft = await fetch(`${apiBase}/software${isDeveloperOrAdmin ? "/admin" : ""}`, {
        headers: isDeveloperOrAdmin ? { Authorization: `Bearer ${authToken}` } : {}
      });
      if (resSoft.ok) setSoftware(await resSoft.json());

      // Fetch contact messages
      if (parsedUser.role === "admin" || parsedUser.role === "editor") {
        const resMsg = await fetch(`${apiBase}/contact-messages`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        if (resMsg.ok) setMessages(await resMsg.json());
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    router.push("/dashboard/login");
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (profilePassword && !isProfilePasswordValid) {
      setProfileError("Yeni şifreniz yeterince güçlü değil veya kuralları karşılamıyor.");
      return;
    }

    if (profilePassword !== profileConfirmPassword) {
      setProfileError("Şifreler uyuşmuyor.");
      return;
    }

    setProfileSubmitting(true);
    try {
      const apiBase = getApiBaseUrl();
      const payload: any = {
        full_name: profileName,
        email: profileEmail,
        phone: profilePhone || null,
      };
      if (profilePassword) {
        payload.password = profilePassword;
      }

      const res = await fetch(`${apiBase}/auth/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Profil güncellenemedi.");
      }

      const updatedUser = await res.json();
      
      const emailChanged = profileEmail.toLowerCase() !== user?.email.toLowerCase();
      const passwordChanged = !!profilePassword;

      if (emailChanged || passwordChanged) {
        setProfileSuccess("Profil bilgileriniz güncellendi. Güvenlik nedeniyle oturumunuz kapatılıyor, lütfen tekrar giriş yapın...");
        setTimeout(() => {
          handleLogout();
        }, 3000);
      } else {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setProfileSuccess("Profil bilgileriniz başarıyla güncellendi.");
        setProfilePassword("");
        setProfileConfirmPassword("");
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err: any) {
      setProfileError(err.message || "Bir hata oluştu.");
    } finally {
      setProfileSubmitting(false);
    }
  };


  const hasAccess = (tabName: string) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (tabName === "projects" && user.role === "architect") return true;
    if (tabName === "listings" && user.role === "agent") return true;
    if (tabName === "news" && user.role === "editor") return true;
    if (tabName === "announcements" && user.role === "editor") return true;
    if (tabName === "events" && user.role === "editor") return true;
    if (tabName === "software" && user.role === "developer") return true;
    if (tabName === "messages" && (user.role === "admin" || user.role === "editor")) return true;
    if (tabName === "overview") return true;
    return false;
  };

  // CRUD Actions
  const handleDelete = async (type: "projects" | "listings" | "news" | "software" | "contact-messages" | "announcements" | "events", id: string) => {
    if (!window.confirm("Bu öğeyi kalıcı olarak silmek istediğinize emin misiniz?")) return;

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/${type}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Silme işlemi başarısız.");
      }

      alert("Başarıyla silindi.");
      if (token) fetchData(token);
    } catch (err: any) {
      alert(err.message || "Bir hata oluştu.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Yükleme başarısız.");
      }

      const data = await res.json();
      setFormData((prev: any) => ({ ...prev, cover_image_url: data.url }));
      alert("Görsel başarıyla yüklendi ve optimize edildi.");
    } catch (err: any) {
      alert(err.message || "Görsel yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileAndInstallerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/upload/file`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Dosya yükleme başarısız.");
      }

      const data = await res.json();
      setFormData((prev: any) => ({ ...prev, download_url: data.url }));
      alert("Yükleyici dosyası başarıyla yüklendi.");
    } catch (err: any) {
      alert(err.message || "Dosya yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  // ── Site Settings Custom CMS States & Handlers ───────────────────────
  const [settingsList, setSettingsList] = useState<any[]>([]);
  const [settingsData, setSettingsData] = useState<Record<string, any>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [activeSettingsGroup, setActiveSettingsGroup] = useState("general");

  const fetchSettings = async (authToken: string) => {
    setSettingsLoading(true);
    try {
      const { getAdminSettings } = await import("@/lib/api");
      const list = await getAdminSettings(authToken);
      setSettingsList(list);
      
      const flat: Record<string, any> = {};
      list.forEach((item: any) => {
        flat[item.key] = item.value_json !== null ? item.value_json : item.value;
      });
      setSettingsData(flat);
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      const { updateSiteSettingsBulk } = await import("@/lib/api");
      if (!token) return;
      const res = await updateSiteSettingsBulk(settingsData, token);
      alert(res.message || "Ayarlar başarıyla güncellendi.");
      fetchSettings(token);
    } catch (err: any) {
      alert(err.message || "Ayarlar kaydedilirken hata oluştu.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleSettingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Yükleme başarısız.");
      }

      const data = await res.json();
      setSettingsData((prev: any) => ({ ...prev, [key]: data.url }));
      alert("Görsel başarıyla yüklendi ve optimize edildi.");
    } catch (err: any) {
      alert(err.message || "Görsel yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "settings" && token) {
      fetchSettings(token);
    }
  }, [activeTab, token]);

  const handlePillarChange = (index: number, field: string, value: string) => {
    setSettingsData((prev: any) => {
      const pillars = [...(prev.quality_pillars || [])];
      while (pillars.length <= index) {
        pillars.push({ title: "", desc: "", icon: "HelpCircle" });
      }
      pillars[index] = { ...pillars[index], [field]: value };
      return { ...prev, quality_pillars: pillars };
    });
  };

  const updatePoolItem = (index: number, key: string, value: any) => {
    setSettingsData((prev: any) => {
      let pool = [];
      if (typeof prev.quick_info_pool === 'string') {
        try {
          pool = JSON.parse(prev.quick_info_pool);
        } catch (err) {
          pool = [];
        }
      } else if (Array.isArray(prev.quick_info_pool)) {
        pool = [...prev.quick_info_pool];
      }
      
      while (pool.length <= index) {
        pool.push({ title: "", desc: "", icon: "HelpCircle", href: "" });
      }
      pool[index] = { ...pool[index], [key]: value };
      return { ...prev, quick_info_pool: pool };
    });
  };

  const addPoolItem = () => {
    setSettingsData((prev: any) => {
      let pool = [];
      if (typeof prev.quick_info_pool === 'string') {
        try {
          pool = JSON.parse(prev.quick_info_pool);
        } catch (err) {
          pool = [];
        }
      } else if (Array.isArray(prev.quick_info_pool)) {
        pool = [...prev.quick_info_pool];
      }
      pool.push({ title: "", desc: "", icon: "HelpCircle", href: "" });
      return { ...prev, quick_info_pool: pool };
    });
  };

  const removePoolItem = (index: number) => {
    setSettingsData((prev: any) => {
      let pool = [];
      if (typeof prev.quick_info_pool === 'string') {
        try {
          pool = JSON.parse(prev.quick_info_pool);
        } catch (err) {
          pool = [];
        }
      } else if (Array.isArray(prev.quick_info_pool)) {
        pool = [...prev.quick_info_pool];
      }
      pool.splice(index, 1);
      return { ...prev, quick_info_pool: pool };
    });
  };

  const movePoolItem = (index: number, direction: 'up' | 'down') => {
    setSettingsData((prev: any) => {
      let pool = [];
      if (typeof prev.quick_info_pool === 'string') {
        try {
          pool = JSON.parse(prev.quick_info_pool);
        } catch (err) {
          pool = [];
        }
      } else if (Array.isArray(prev.quick_info_pool)) {
        pool = [...prev.quick_info_pool];
      }
      
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= pool.length) return prev;
      
      const temp = pool[index];
      pool[index] = pool[targetIndex];
      pool[targetIndex] = temp;
      
      return { ...prev, quick_info_pool: pool };
    });
  };

  const handlePoolItemFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, isImage: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const apiBase = getApiBaseUrl();
      const endpoint = isImage ? "/upload/image" : "/upload/file";
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Yükleme başarısız.");
      }

      const data = await res.json();
      const fileUrl = data.relative_path || data.url;
      
      setSettingsData((prev: any) => {
        let pool = [];
        if (typeof prev.quick_info_pool === 'string') {
          try { pool = JSON.parse(prev.quick_info_pool); } catch (err) { pool = []; }
        } else if (Array.isArray(prev.quick_info_pool)) {
          pool = [...prev.quick_info_pool];
        }
        while (pool.length <= index) {
          pool.push({ title: "", desc: "", icon: "HelpCircle", href: "" });
        }
        pool[index] = { ...pool[index], href: fileUrl };
        return { ...prev, quick_info_pool: pool };
      });

      alert("Dosya başarıyla yüklendi.");
    } catch (err: any) {
      alert(err.message || "Dosya yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };


  const openAddModal = (type: "project" | "listing" | "news" | "software" | "announcement" | "event") => {
    setModalType(type);
    setEditId(null);
    if (type === "project") {
      setFormData({
        title: "",
        category: "residential",
        status: "in_progress",
        description: "",
        client_name: "",
        location: "",
        area_sqm: 0,
        budget_try: 0,
        start_date: "",
        end_date: "",
        cover_image_url: "",
        is_featured: false,
        is_published: true,
      });
    } else if (type === "listing") {
      setFormData({
        title: "",
        listing_type: "sale",
        property_type: "villa",
        description: "",
        price: 0,
        currency: "TRY",
        area_sqm: 0,
        room_count: "3+1",
        floor_number: 1,
        total_floors: 3,
        building_age: 0,
        heating_type: "Yerden Isıtma",
        city: "Ankara",
        district: "Gölbaşı",
        neighborhood: "Karşıyaka Mah.",
        street: "",
        building_no: "",
        address: "",
        latitude: 39.7925,
        longitude: 32.8130,
        cover_image_url: "",
        is_featured: false,
        is_published: true,
      });
      loadProvinces().then(async (provs) => {
        const dists = await loadDistricts("Ankara", provs);
        await loadNeighborhoods("Gölbaşı", dists);
      });
    } else if (type === "news") {
      setFormData({
        title: "",
        source: "manual",
        source_url: "",
        summary: "",
        content: "",
        cover_image_url: "",
        is_featured: false,
        is_published: true,
      });
    } else if (type === "software") {
      setFormData({
        name: "",
        category: "calculation",
        short_description: "",
        description: "",
        price: 0,
        currency: "TRY",
        is_free: false,
        download_url: "",
        demo_url: "",
        cover_image_url: "",
        version: "v1.0.0",
        is_published: true,
        is_featured: false,
        sort_order: 0,
      });
    } else if (type === "announcement") {
      setFormData({
        title: "",
        content: "",
        cover_image_url: "",
        is_published: true,
        is_pinned: false,
        published_at: new Date().toISOString().split("T")[0],
      });
    } else if (type === "event") {
      setFormData({
        title: "",
        description: "",
        location: "",
        event_date: new Date().toISOString().slice(0, 16),
        event_end_date: new Date().toISOString().slice(0, 16),
        cover_image_url: "",
        registration_url: "",
        is_published: true,
        is_featured: false,
        max_attendees: 100,
      });
    }
    setModalOpen(true);
  };

  const openEditModal = (type: "project" | "listing" | "news" | "software" | "announcement" | "event", item: any) => {
    setModalType(type);
    setEditId(item.id);
    if (type === "listing") {
      let street = "";
      let buildingNo = "";
      if (item.address) {
        const parts = item.address.split(" No: ");
        street = parts[0] || "";
        buildingNo = parts[1] || "";
      }
      setFormData({
        ...item,
        street: street,
        building_no: buildingNo
      });
      loadProvinces().then(async (provs) => {
        const dists = await loadDistricts(item.city || "Ankara", provs);
        await loadNeighborhoods(item.district || "Gölbaşı", dists);
      });
    } else {
      setFormData({ ...item });
    }
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const path = modalType === "project" 
        ? "projects" 
        : modalType === "listing" 
          ? "listings" 
          : modalType === "news" 
            ? "news" 
            : modalType === "software"
              ? "software"
              : modalType === "announcement"
                ? "announcements"
                : "events";
      const method = editId ? "PUT" : "POST";
      const apiBase = getApiBaseUrl();
      const hasNoTrailingSlash = path === "news" || path === "announcements" || path === "events";
      const url = editId 
        ? `${apiBase}/${path}/${editId}` 
        : `${apiBase}/${path}${hasNoTrailingSlash ? "" : "/"}`;

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Kaydedilemedi.");
      }

      alert("Öğe başarıyla kaydedildi.");
      setModalOpen(false);
      if (token) fetchData(token);
    } catch (err: any) {
      alert(err.message || "Kaydetme hatası.");
    }
  };

  // Helper: Filter & Sort items on client side
  const getProcessedItems = (items: any[]) => {
    let result = [...items];
    
    // Filter
    if (searchQuery) {
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.neighborhood && item.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "price_high") {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortBy === "price_low") {
        return (a.price || 0) - (b.price || 0);
      }
      return 0;
    });

    return result;
  };

  const roleLabels: Record<string, string> = {
    admin: "Sistem Yöneticisi",
    architect: "Mimar / Tasarımcı",
    agent: "Gayrimenkul Danışmanı",
    developer: "Yazılım Geliştirici",
    editor: "Haber Editörü",
  };

  if (!user) return <div className="min-h-screen bg-navy text-cream flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="bg-navy-dark min-h-screen text-cream flex flex-col lg:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-navy border-r border-gold/10 flex flex-col justify-between p-6 shrink-0 relative z-30">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-gold-dark to-gold-light rounded-lg flex items-center justify-center shadow-lg shadow-gold/30 font-playfair font-bold text-navy-dark text-xl">Y</div>
            <div className="flex flex-col">
              <span className="font-playfair text-base font-bold tracking-wider text-gold">YAZE PANEL</span>
              <span className="text-[9px] uppercase tracking-widest text-gold-light/80 font-bold mt-0.5">Management Studio</span>
            </div>
          </div>

          {/* User Widget */}
          <div className="bg-navy-dark/60 border border-gold/10 rounded-xl p-4 mb-6 shadow-inner flex items-center space-x-3">
            <div className="p-2 bg-navy border border-gold/15 rounded-lg">
              <User className="w-4 h-4 text-gold" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-xs text-cream truncate">{user.full_name}</span>
              <span className="text-[8px] uppercase tracking-wider text-gold font-bold mt-0.5">{roleLabels[user.role] || user.role}</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab("overview"); setSearchQuery(""); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                activeTab === "overview" ? "bg-gold text-navy-dark shadow-md" : "text-cream/70 hover:bg-navy-dark hover:text-gold"
              }`}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Genel Bakış</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "overview" ? "text-navy-dark" : "text-gold"}`} />
            </button>

            {hasAccess("projects") && (
              <button
                onClick={() => { setActiveTab("projects"); setSearchQuery(""); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                  activeTab === "projects" ? "bg-gold text-navy-dark shadow-md" : "text-cream/70 hover:bg-navy-dark hover:text-gold"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="w-4 h-4" />
                  <span>Mimari Projeler</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "projects" ? "text-navy-dark" : "text-gold"}`} />
              </button>
            )}

            {hasAccess("listings") && (
              <button
                onClick={() => { setActiveTab("listings"); setSearchQuery(""); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                  activeTab === "listings" ? "bg-gold text-navy-dark shadow-md" : "text-cream/70 hover:bg-navy-dark hover:text-gold"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Home className="w-4 h-4" />
                  <span>Emlak İlanları</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "listings" ? "text-navy-dark" : "text-gold"}`} />
              </button>
            )}

            {hasAccess("news") && (
              <button
                onClick={() => { setActiveTab("news"); setSearchQuery(""); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                  activeTab === "news" ? "bg-gold text-navy-dark shadow-md" : "text-cream/70 hover:bg-navy-dark hover:text-gold"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Newspaper className="w-4 h-4" />
                  <span>Yerel Haberler</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "news" ? "text-navy-dark" : "text-gold"}`} />
              </button>
            )}

            {hasAccess("announcements") && (
              <button
                onClick={() => { setActiveTab("announcements"); setSearchQuery(""); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                  activeTab === "announcements" ? "bg-gold text-navy-dark shadow-md" : "text-cream/70 hover:bg-navy-dark hover:text-gold"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Layers className="w-4 h-4" />
                  <span>İmar & Askı İlanları</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "announcements" ? "text-navy-dark" : "text-gold"}`} />
              </button>
            )}

            {hasAccess("events") && (
              <button
                onClick={() => { setActiveTab("events"); setSearchQuery(""); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                  activeTab === "events" ? "bg-gold text-navy-dark shadow-md" : "text-cream/70 hover:bg-navy-dark hover:text-gold"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4" />
                  <span>Kültürel Etkinlikler</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "events" ? "text-navy-dark" : "text-gold"}`} />
              </button>
            )}

            {hasAccess("software") && (
              <button
                onClick={() => { setActiveTab("software"); setSearchQuery(""); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                  activeTab === "software" ? "bg-gold text-navy-dark shadow-md" : "text-cream/70 hover:bg-navy-dark hover:text-gold"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Laptop className="w-4 h-4" />
                  <span>Yazılım Ürünleri</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "software" ? "text-navy-dark" : "text-gold"}`} />
              </button>
            )}

            {user.role === "admin" && (
              <>
                <button
                  onClick={() => { setActiveTab("users"); setSearchQuery(""); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                    activeTab === "users" ? "bg-gold text-navy-dark shadow-md" : "text-cream/70 hover:bg-navy-dark hover:text-gold"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4" />
                    <span>Kullanıcı Yönetimi</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "users" ? "text-navy-dark" : "text-gold"}`} />
                </button>

                <button
                  onClick={() => { setActiveTab("settings"); setSearchQuery(""); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                    activeTab === "settings" ? "bg-gold text-navy-dark shadow-md" : "text-cream/70 hover:bg-navy-dark hover:text-gold"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Site Ayarları (CMS)</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "settings" ? "text-navy-dark" : "text-gold"}`} />
                </button>
              </>
            )}

            {hasAccess("messages") && (
              <button
                onClick={() => { setActiveTab("messages"); setSearchQuery(""); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                  activeTab === "messages" ? "bg-gold text-navy-dark shadow-md" : "text-cream/70 hover:bg-navy-dark hover:text-gold"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4" />
                  <span>Gelen Mesajlar</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "messages" ? "text-navy-dark" : "text-gold"}`} />
              </button>
            )}

            <button
              onClick={() => { setActiveTab("profile"); setSearchQuery(""); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                activeTab === "profile" ? "bg-gold text-navy-dark shadow-md" : "text-cream/70 hover:bg-navy-dark hover:text-gold"
              }`}
            >
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4" />
                <span>Profil Ayarları</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === "profile" ? "text-navy-dark" : "text-gold"}`} />
            </button>

          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/20 hover:text-red-300 border border-transparent hover:border-red-500/10 transition-all mt-8"
        >
          <LogOut className="w-4 h-4" />
          <span>Oturumu Kapat</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden relative z-10">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <RefreshCw className="w-7 h-7 text-gold animate-spin" />
            <span className="text-[10px] uppercase font-bold text-cream/40 tracking-widest">Sistem verileri taranıyor...</span>
          </div>
        ) : (
          <>
            {/* ── Tab: Overview (Genel Bakış) ─────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fade-in-up">
                
                {/* Header Welcome banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-navy via-navy to-navy-dark border border-gold/15 p-8 rounded-2xl shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="space-y-2">
                    <h1 className="font-playfair text-2xl md:text-3xl font-bold text-cream">Yazılım Yönetim Hub'ı</h1>
                    <p className="text-xs text-cream/60 leading-relaxed max-w-xl">
                      Merhaba <strong>{user.full_name}</strong>. Emlak robotları, mimari veri havuzu ve haber bültenlerinizi kontrol etmek için sistem paneli tamamen aktiftir.
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-gold/10 border border-gold/20 px-4 py-2.5 rounded-full text-[9px] font-bold text-gold uppercase tracking-wider shadow-inner self-start md:self-auto">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Güvenli Yetki Aktif</span>
                  </div>
                </div>

                {/* Stats Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-navy border border-gold/10 p-6 rounded-xl relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all duration-300" />
                    <Building2 className="absolute right-4 bottom-4 w-12 h-12 text-gold/5" />
                    <span className="text-[9px] uppercase font-bold text-cream/40 tracking-wider">Mimarlık Projeleri</span>
                    <h3 className="text-3xl font-bold text-cream mt-2">{projects.length}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-gold mt-4 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+%8 büyüme bu ay</span>
                    </div>
                  </div>

                  <div className="bg-navy border border-gold/10 p-6 rounded-xl relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all duration-300" />
                    <Home className="absolute right-4 bottom-4 w-12 h-12 text-gold/5" />
                    <span className="text-[9px] uppercase font-bold text-cream/40 tracking-wider">Gayrimenkul Portföyü</span>
                    <h3 className="text-3xl font-bold text-cream mt-2">{listings.length}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-green-400 mt-4 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aktif & Haritalanmış</span>
                    </div>
                  </div>

                  <div className="bg-navy border border-gold/10 p-6 rounded-xl relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all duration-300" />
                    <Newspaper className="absolute right-4 bottom-4 w-12 h-12 text-gold/5" />
                    <span className="text-[9px] uppercase font-bold text-cream/40 tracking-wider">Haber & Belediye Duyuruları</span>
                    <h3 className="text-3xl font-bold text-cream mt-2">{news.length}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-cream/50 mt-4 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-gold/70" />
                      <span>Botlar otomatik tarıyor</span>
                    </div>
                  </div>
                </div>

                {/* Analytical Dashboard Section with SVG charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Analytic Chart (SVG Area Chart) */}
                  <div className="lg:col-span-8 bg-navy border border-gold/10 p-6 rounded-xl shadow-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-gold/5 pb-3">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-gold" />
                        <h3 className="font-bold text-xs uppercase text-cream tracking-wider">İlan Görüntülenme Analitiği</h3>
                      </div>
                      <span className="text-[9px] font-bold text-gold uppercase bg-gold/10 px-2.5 py-1 rounded">Canlı Veri</span>
                    </div>

                    {/* Premium Area Chart SVG */}
                    <div className="h-60 w-full relative">
                      <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="0" y1="50" x2="500" y2="50" stroke="#d4af37" strokeOpacity="0.05" strokeWidth="0.5" />
                        <line x1="0" y1="100" x2="500" y2="100" stroke="#d4af37" strokeOpacity="0.05" strokeWidth="0.5" />
                        <line x1="0" y1="150" x2="500" y2="150" stroke="#d4af37" strokeOpacity="0.05" strokeWidth="0.5" />
                        
                        {/* Area Path */}
                        <path d="M 0 170 Q 80 120 160 140 T 320 80 T 480 50 L 500 50 L 500 190 L 0 190 Z" fill="url(#chartGlow)" />
                        
                        {/* Line Path */}
                        <path d="M 0 170 Q 80 120 160 140 T 320 80 T 480 50 L 500 50" fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" />
                        
                        {/* Data Points */}
                        <circle cx="80" cy="138" r="4" fill="#1e293b" stroke="#d4af37" strokeWidth="2" />
                        <circle cx="200" cy="130" r="4" fill="#1e293b" stroke="#d4af37" strokeWidth="2" />
                        <circle cx="320" cy="80" r="4" fill="#1e293b" stroke="#d4af37" strokeWidth="2" />
                        <circle cx="440" cy="55" r="4" fill="#1e293b" stroke="#d4af37" strokeWidth="2" />
                      </svg>
                      
                      {/* X-Axis labels */}
                      <div className="flex justify-between text-[8px] text-cream/40 uppercase font-bold tracking-wider pt-2 px-1">
                        <span>Pazartesi</span>
                        <span>Çarşamba</span>
                        <span>Cuma</span>
                        <span>Pazar</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Activity Logs */}
                  <div className="lg:col-span-4 bg-navy border border-gold/10 p-6 rounded-xl shadow-xl space-y-4">
                    <div className="flex items-center space-x-2 border-b border-gold/5 pb-3">
                      <Clock className="w-4 h-4 text-gold" />
                      <h3 className="font-bold text-xs uppercase text-cream tracking-wider">Son Aktiviteler</h3>
                    </div>
                    
                    <div className="space-y-4 max-h-56 overflow-y-auto">
                      <div className="flex items-start space-x-3 text-[10px] leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5 animate-ping" />
                        <div>
                          <p className="text-cream/90 font-medium">Yeni Gayrimenkul İlanı Haritaya Eklendi</p>
                          <span className="text-[8px] text-gold font-bold uppercase tracking-wider block">Fatma Emlakçı • 5 dk önce</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 text-[10px] leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-cream/30 shrink-0 mt-1.5" />
                        <div>
                          <p className="text-cream/70 font-medium">Gölbaşı Premium Projesi Güncellendi</p>
                          <span className="text-[8px] text-cream/40 font-bold uppercase tracking-wider block">Selim Mimaroğlu • 2 saat önce</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 text-[10px] leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-cream/30 shrink-0 mt-1.5" />
                        <div>
                          <p className="text-cream/70 font-medium">Belediye Plan Askı Duyurusu İçe Aktarıldı</p>
                          <span className="text-[8px] text-cream/40 font-bold uppercase tracking-wider block">İmar Botu • 1 gün önce</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ── Tab: Projects (Mimarlık Projeleri) ─────────────────────────── */}
            {activeTab === "projects" && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/10 pb-5">
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-cream">Mimari Projeler</h2>
                    <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1">PROJE PORTFÖYÜ VE DURUM KONTROLÜ</p>
                  </div>
                  <button
                    onClick={() => openAddModal("project")}
                    className="flex items-center space-x-2 bg-gradient-to-r from-gold-dark to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-gold/15 shrink-0 self-start md:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Proje Ekle</span>
                  </button>
                </div>

                {/* Filter / Search Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy/60 border border-gold/5 p-4 rounded-xl">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-cream/40" />
                    <input
                      type="text"
                      placeholder="Projelerde ara (Başlık, kategori)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-9 pr-4 py-2.5 text-xs text-cream outline-none placeholder-cream/30"
                    />
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <ArrowUpDown className="w-4 h-4 text-gold" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-xs text-cream outline-none"
                    >
                      <option value="newest">En Yeni Eklenen</option>
                      <option value="title">Alfabetik (A-Z)</option>
                    </select>
                  </div>
                </div>

                {/* Table List */}
                <div className="bg-navy border border-gold/10 rounded-xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-navy-dark text-[9px] uppercase font-bold text-gold/70 border-b border-gold/10 tracking-widest">
                          <th className="p-4 w-12">Resim</th>
                          <th className="p-4">Proje Adı</th>
                          <th className="p-4">Kategori</th>
                          <th className="p-4">Durum</th>
                          <th className="p-4 text-right">Eylemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold/5">
                        {getProcessedItems(projects).map((proj) => (
                          <tr key={proj.id} className="hover:bg-navy-dark/40 transition-colors">
                            <td className="p-4">
                              <div className="w-12 h-12 rounded overflow-hidden bg-navy-dark border border-gold/10 relative">
                                <img
                                  src={proj.cover_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=80&q=80"}
                                  alt=""
                                  className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-cream">{proj.title}</td>
                            <td className="p-4 text-cream/70 capitalize">{proj.category}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  proj.status === "completed" ? "bg-green-400" : proj.status === "in_progress" ? "bg-gold animate-pulse" : "bg-cream/40"
                                }`} />
                                <span className="uppercase text-[9px] font-bold text-cream/80">{proj.status}</span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-3">
                                <button
                                  onClick={() => openEditModal("project", proj)}
                                  className="p-1.5 bg-navy-dark hover:bg-navy border border-gold/10 hover:border-gold text-cream/60 hover:text-gold rounded transition-all"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete("projects", proj.id)}
                                  className="p-1.5 bg-navy-dark hover:bg-red-950/20 border border-gold/10 hover:border-red-500/30 text-cream/60 hover:text-red-400 rounded transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Listings (Emlak İlanları) ─────────────────────────── */}
            {activeTab === "listings" && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/10 pb-5">
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-cream">Gayrimenkul Portföyü</h2>
                    <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1">EMLAK VİTRİNİ VE HARİTA PIN YÖNETİMİ</p>
                  </div>
                  <button
                    onClick={() => openAddModal("listing")}
                    className="flex items-center space-x-2 bg-gradient-to-r from-gold-dark to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-gold/15 shrink-0 self-start md:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni İlan Oluştur</span>
                  </button>
                </div>

                {/* Filter / Search Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy/60 border border-gold/5 p-4 rounded-xl">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-cream/40" />
                    <input
                      type="text"
                      placeholder="İlanlarda ara (Başlık, mahalle, oda)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-9 pr-4 py-2.5 text-xs text-cream outline-none placeholder-cream/30"
                    />
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <ArrowUpDown className="w-4 h-4 text-gold" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-xs text-cream outline-none"
                    >
                      <option value="newest">En Yeni Eklenen</option>
                      <option value="price_high">Fiyat (En Yüksek)</option>
                      <option value="price_low">Fiyat (En Düşük)</option>
                      <option value="title">Alfabetik (A-Z)</option>
                    </select>
                  </div>
                </div>

                {/* Table List */}
                <div className="bg-navy border border-gold/10 rounded-xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-navy-dark text-[9px] uppercase font-bold text-gold/70 border-b border-gold/10 tracking-widest">
                          <th className="p-4 w-12">Görsel</th>
                          <th className="p-4">İlan Başlığı</th>
                          <th className="p-4">Fiyat</th>
                          <th className="p-4">Harita Konumu</th>
                          <th className="p-4 text-right">Eylemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold/5">
                        {getProcessedItems(listings).map((list) => (
                          <tr key={list.id} className="hover:bg-navy-dark/40 transition-colors">
                            <td className="p-4">
                              <div className="w-12 h-12 rounded overflow-hidden bg-navy-dark border border-gold/10 relative">
                                <img
                                  src={list.cover_image_url || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=80&q=80"}
                                  alt=""
                                  className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-cream">{list.title}</td>
                            <td className="p-4 text-gold font-bold">
                              {list.price ? `${list.price.toLocaleString("tr-TR")} ${list.currency}` : "Sorunuz"}
                            </td>
                            <td className="p-4 text-cream/60">
                              {list.latitude && list.longitude ? (
                                <span className="flex items-center gap-1 text-[10px] text-cream">
                                  <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                                  {list.latitude.toFixed(4)}, {list.longitude.toFixed(4)}
                                </span>
                              ) : (
                                <span className="text-[10px] text-cream/35 italic flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5 text-cream/30" /> Konumsuz
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-3">
                                <button
                                  onClick={() => openEditModal("listing", list)}
                                  className="p-1.5 bg-navy-dark hover:bg-navy border border-gold/10 hover:border-gold text-cream/60 hover:text-gold rounded transition-all"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete("listings", list.id)}
                                  className="p-1.5 bg-navy-dark hover:bg-red-950/20 border border-gold/10 hover:border-red-500/30 text-cream/60 hover:text-red-400 rounded transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: News (Haber Portalı) ─────────────────────────── */}
            {activeTab === "news" && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/10 pb-5">
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-cream">Haberler ve Duyurular</h2>
                    <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1">İMAR PLAN ASKILARI VE YEREL HABERLER</p>
                  </div>
                  <button
                    onClick={() => openAddModal("news")}
                    className="flex items-center space-x-2 bg-gradient-to-r from-gold-dark to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-gold/15 shrink-0 self-start md:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Haber Ekle</span>
                  </button>
                </div>

                {/* Filter / Search Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy/60 border border-gold/5 p-4 rounded-xl">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-cream/40" />
                    <input
                      type="text"
                      placeholder="Haberlerde ara (Başlık, özet)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-9 pr-4 py-2.5 text-xs text-cream outline-none placeholder-cream/30"
                    />
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <ArrowUpDown className="w-4 h-4 text-gold" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-xs text-cream outline-none"
                    >
                      <option value="newest">En Yeni Eklenen</option>
                      <option value="title">Alfabetik (A-Z)</option>
                    </select>
                  </div>
                </div>

                {/* Table List */}
                <div className="bg-navy border border-gold/10 rounded-xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-navy-dark text-[9px] uppercase font-bold text-gold/70 border-b border-gold/10 tracking-widest">
                          <th className="p-4 w-12">Önizleme</th>
                          <th className="p-4">Haber Başlığı</th>
                          <th className="p-4">Kaynak</th>
                          <th className="p-4 text-right">Eylemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold/5">
                        {getProcessedItems(news).map((n) => (
                          <tr key={n.id} className="hover:bg-navy-dark/40 transition-colors">
                            <td className="p-4">
                              <div className="w-12 h-12 rounded overflow-hidden bg-navy-dark border border-gold/10 relative">
                                <img
                                  src={n.cover_image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=80&q=80"}
                                  alt=""
                                  className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-cream line-clamp-2 max-w-sm leading-relaxed">{n.title}</td>
                            <td className="p-4 text-gold font-semibold capitalize">{n.source}</td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-3">
                                <button
                                  onClick={() => openEditModal("news", n)}
                                  className="p-1.5 bg-navy-dark hover:bg-navy border border-gold/10 hover:border-gold text-cream/60 hover:text-gold rounded transition-all"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete("news", n.id)}
                                  className="p-1.5 bg-navy-dark hover:bg-red-950/20 border border-gold/10 hover:border-red-500/30 text-cream/60 hover:text-red-400 rounded transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Announcements (İmar & Askı İlanları) ─────────────────────────── */}
            {activeTab === "announcements" && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/10 pb-5">
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-cream">İmar ve Plan Askı İlanları</h2>
                    <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1">Belediye İmar Plan Askıları ve Resmi Duyurular</p>
                  </div>
                  <button
                    onClick={() => openAddModal("announcement")}
                    className="flex items-center space-x-2 bg-gradient-to-r from-gold-dark to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-gold/15 shrink-0 self-start md:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Duyuru Ekle</span>
                  </button>
                </div>

                {/* Filter / Search Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy/60 border border-gold/5 p-4 rounded-xl">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-cream/40" />
                    <input
                      type="text"
                      placeholder="Duyurularda ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-9 pr-4 py-2.5 text-xs text-cream outline-none placeholder-cream/30"
                    />
                  </div>
                </div>

                {/* Table List */}
                <div className="bg-navy border border-gold/10 rounded-xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-navy-dark text-[9px] uppercase font-bold text-gold/70 border-b border-gold/10 tracking-widest">
                          <th className="p-4 w-12">Önizleme</th>
                          <th className="p-4">Duyuru Başlığı</th>
                          <th className="p-4">Tarih</th>
                          <th className="p-4">Sabit</th>
                          <th className="p-4">Durum</th>
                          <th className="p-4 text-right">Eylemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold/5">
                        {announcements
                          .filter(a => 
                            !searchQuery || 
                            (a.title && a.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (a.content && a.content.toLowerCase().includes(searchQuery.toLowerCase()))
                          ).map((ann) => (
                          <tr key={ann.id} className="hover:bg-navy-dark/40 transition-colors">
                            <td className="p-4">
                              <div className="w-12 h-12 rounded overflow-hidden bg-navy-dark border border-gold/10 relative">
                                <img
                                  src={ann.cover_image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=80&q=80"}
                                  alt=""
                                  className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-cream line-clamp-2 max-w-sm leading-relaxed">{ann.title}</td>
                            <td className="p-4 text-cream/70">{ann.published_at || "-"}</td>
                            <td className="p-4">
                              {ann.is_pinned ? (
                                <span className="bg-gold/10 text-gold px-2.5 py-1 rounded font-bold uppercase text-[9px] tracking-wider">Sabitlendi</span>
                              ) : (
                                <span className="text-cream/35">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  ann.is_published ? "bg-green-400" : "bg-red-400"
                                }`} />
                                <span className="uppercase text-[9px] font-bold text-cream/80">{ann.is_published ? "Yayında" : "Taslak"}</span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-3">
                                <button
                                  onClick={() => openEditModal("announcement", ann)}
                                  className="p-1.5 bg-navy-dark hover:bg-navy border border-gold/10 hover:border-gold text-cream/60 hover:text-gold rounded transition-all"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete("announcements", ann.id)}
                                  className="p-1.5 bg-navy-dark hover:bg-red-950/20 border border-gold/10 hover:border-red-500/30 text-cream/60 hover:text-red-400 rounded transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {announcements.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-cream/35 italic">Henüz hiç duyuru bulunmuyor.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Events (Kültürel Etkinlikler) ─────────────────────────── */}
            {activeTab === "events" && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/10 pb-5">
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-cream">Kültürel ve Eğitsel Etkinlikler</h2>
                    <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1">Seminerler, Konferanslar ve Sosyal Etkinlik Yönetimi</p>
                  </div>
                  <button
                    onClick={() => openAddModal("event")}
                    className="flex items-center space-x-2 bg-gradient-to-r from-gold-dark to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-gold/15 shrink-0 self-start md:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Etkinlik Ekle</span>
                  </button>
                </div>

                {/* Filter / Search Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy/60 border border-gold/5 p-4 rounded-xl">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-cream/40" />
                    <input
                      type="text"
                      placeholder="Etkinliklerde ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-9 pr-4 py-2.5 text-xs text-cream outline-none placeholder-cream/30"
                    />
                  </div>
                </div>

                {/* Table List */}
                <div className="bg-navy border border-gold/10 rounded-xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-navy-dark text-[9px] uppercase font-bold text-gold/70 border-b border-gold/10 tracking-widest">
                          <th className="p-4 w-12">Önizleme</th>
                          <th className="p-4">Etkinlik Adı</th>
                          <th className="p-4">Tarih</th>
                          <th className="p-4">Konum</th>
                          <th className="p-4">Katılımcı Limiti</th>
                          <th className="p-4">Durum</th>
                          <th className="p-4 text-right">Eylemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold/5">
                        {events
                          .filter(e => 
                            !searchQuery || 
                            (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()))
                          ).map((evt) => (
                          <tr key={evt.id} className="hover:bg-navy-dark/40 transition-colors">
                            <td className="p-4">
                              <div className="w-12 h-12 rounded overflow-hidden bg-navy-dark border border-gold/10 relative">
                                <img
                                  src={evt.cover_image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=80&q=80"}
                                  alt=""
                                  className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-cream line-clamp-2 max-w-xs leading-relaxed">{evt.title}</td>
                            <td className="p-4 text-cream/70 font-semibold">{evt.event_date ? new Date(evt.event_date).toLocaleString("tr-TR") : "-"}</td>
                            <td className="p-4 text-cream/60">{evt.location || "-"}</td>
                            <td className="p-4 text-gold">
                              {evt.max_attendees ? `${evt.current_attendees} / ${evt.max_attendees}` : "Sınırsız"}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  evt.is_published ? "bg-green-400" : "bg-red-400"
                                }`} />
                                <span className="uppercase text-[9px] font-bold text-cream/80">{evt.is_published ? "Yayında" : "Taslak"}</span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-3">
                                <button
                                  onClick={() => openEditModal("event", evt)}
                                  className="p-1.5 bg-navy-dark hover:bg-navy border border-gold/10 hover:border-gold text-cream/60 hover:text-gold rounded transition-all"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete("events", evt.id)}
                                  className="p-1.5 bg-navy-dark hover:bg-red-950/20 border border-gold/10 hover:border-red-500/30 text-cream/60 hover:text-red-400 rounded transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {events.length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-cream/35 italic">Henüz hiç etkinlik bulunmuyor.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Software (Yazılım Ürünleri) ─────────────────────────── */}
            {activeTab === "software" && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/10 pb-5">
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-cream">Yazılım Ürünleri</h2>
                    <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1">YAZILIM VİTRİNİ VE İNDİRME LİNKLERİ YÖNETİMİ</p>
                  </div>
                  <button
                    onClick={() => openAddModal("software")}
                    className="flex items-center space-x-2 bg-gradient-to-r from-gold-dark to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-gold/15 shrink-0 self-start md:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Yazılım Ekle</span>
                  </button>
                </div>

                {/* Filter / Search Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy/60 border border-gold/5 p-4 rounded-xl">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-cream/40" />
                    <input
                      type="text"
                      placeholder="Yazılımlarda ara (İsim, kategori, versiyon)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-9 pr-4 py-2.5 text-xs text-cream outline-none placeholder-cream/30"
                    />
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <ArrowUpDown className="w-4 h-4 text-gold" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-xs text-cream outline-none"
                    >
                      <option value="newest">En Yeni Eklenen</option>
                      <option value="title">Alfabetik (A-Z)</option>
                    </select>
                  </div>
                </div>

                {/* Table List */}
                <div className="bg-navy border border-gold/10 rounded-xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-navy-dark text-[9px] uppercase font-bold text-gold/70 border-b border-gold/10 tracking-widest">
                          <th className="p-4 w-12">Görsel</th>
                          <th className="p-4">Yazılım Adı</th>
                          <th className="p-4">Kategori</th>
                          <th className="p-4">Versiyon</th>
                          <th className="p-4">Durum</th>
                          <th className="p-4 text-right">Eylemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold/5">
                        {software.filter(s => 
                          !searchQuery || 
                          (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()))
                        ).map((s) => (
                          <tr key={s.id} className="hover:bg-navy-dark/40 transition-colors">
                            <td className="p-4">
                              <div className="w-12 h-12 rounded overflow-hidden bg-navy-dark border border-gold/10 relative">
                                <img
                                  src={s.cover_image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=80&q=80"}
                                  alt=""
                                  className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-cream">
                              <div>{s.name}</div>
                              <div className="text-[10px] text-cream/40 font-normal">{s.short_description}</div>
                            </td>
                            <td className="p-4 text-cream/70 uppercase text-[10px]">{s.category}</td>
                            <td className="p-4 text-gold font-semibold">{s.version}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  s.is_published ? "bg-green-400" : "bg-red-400"
                                }`} />
                                <span className="uppercase text-[9px] font-bold text-cream/80">{s.is_published ? "Yayında" : "Taslak"}</span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-3">
                                <button
                                  onClick={() => openEditModal("software", s)}
                                  className="p-1.5 bg-navy-dark hover:bg-navy border border-gold/10 hover:border-gold text-cream/60 hover:text-gold rounded transition-all"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete("software", s.id)}
                                  className="p-1.5 bg-navy-dark hover:bg-red-950/20 border border-gold/10 hover:border-red-500/30 text-cream/60 hover:text-red-400 rounded transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/10 pb-5">
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-cream">Site Ayarları (CMS)</h2>
                    <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1">SAYFA İÇERİKLERİ VE TASARIM AYARLARI</p>
                  </div>
                </div>

                {/* Settings Sub-tabs */}
                <div className="flex flex-wrap gap-2 border-b border-gold/10 pb-4">
                  {[
                    { id: "general", label: "Genel Kimlik" },
                    { id: "header", label: "Ana Menü (Header)" },
                    { id: "quick_menu", label: "Hızlı Menü" },
                    { id: "quick_info_pool", label: "Hızlı Bilgi Havuzu" },
                    { id: "hero", label: "Giriş (Hero) Bölümü" },
                    { id: "about", label: "Hakkımızda" },
                    { id: "mission_vision", label: "Misyon & Vizyon" },
                    { id: "quality_policy", label: "Kalite Politikası" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setActiveSettingsGroup(g.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        activeSettingsGroup === g.id
                          ? "bg-gold/15 text-gold border border-gold/30"
                          : "text-cream/60 hover:text-cream border border-transparent hover:bg-navy/40"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                {settingsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <RefreshCw className="w-5 h-5 text-gold animate-spin" />
                    <span className="text-[10px] text-cream/40 uppercase tracking-wider">Ayarlar yükleniyor...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSettingsSubmit} className="space-y-6 text-xs bg-navy p-6 rounded-2xl border border-gold/10 shadow-2xl">
                    
                    {/* 1. GENERAL IDENTITY */}
                    {activeSettingsGroup === "general" && (
                      <div className="space-y-5">
                        <span className="text-[10px] font-bold text-gold uppercase tracking-wider block border-b border-gold/10 pb-2">Genel Ayarlar</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Site Adı / Başlığı</label>
                            <input
                              type="text"
                              value={settingsData.site_title || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, site_title: e.target.value })}
                              className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Telif Hakkı (Footer Yazısı)</label>
                            <input
                              type="text"
                              value={settingsData.footer_text || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, footer_text: e.target.value })}
                              className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Logo URL adresi</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={settingsData.logo_url || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, logo_url: e.target.value })}
                              className="flex-1 bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                            />
                            <label className="flex items-center justify-center px-4 py-2.5 bg-gold/10 hover:bg-gold hover:text-navy-dark text-gold border border-gold/25 rounded-lg cursor-pointer font-bold transition-all text-xs select-none shrink-0">
                              {uploading ? "Yükleniyor..." : "Logo Yükle"}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploading}
                                onChange={(e) => handleSettingImageUpload(e, "logo_url")}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">İletişim Telefonu</label>
                            <input
                              type="text"
                              value={settingsData.contact_phone || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, contact_phone: e.target.value })}
                              className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">İletişim E-postası</label>
                            <input
                              type="email"
                              value={settingsData.contact_email || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, contact_email: e.target.value })}
                              className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">İletişim Adresi</label>
                          <textarea
                            rows={3}
                            value={settingsData.contact_address || ""}
                            onChange={(e) => setSettingsData({ ...settingsData, contact_address: e.target.value })}
                            className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none resize-none"
                          />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gold/10">
                          <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">Sosyal Medya Hesapları</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Facebook</label>
                              <input
                                type="text"
                                placeholder="https://facebook.com/..."
                                value={settingsData.social_facebook || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, social_facebook: e.target.value })}
                                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Instagram</label>
                              <input
                                type="text"
                                placeholder="https://instagram.com/..."
                                value={settingsData.social_instagram || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, social_instagram: e.target.value })}
                                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Twitter / X</label>
                              <input
                                type="text"
                                placeholder="https://x.com/..."
                                value={settingsData.social_twitter || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, social_twitter: e.target.value })}
                                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">YouTube</label>
                              <input
                                type="text"
                                placeholder="https://youtube.com/..."
                                value={settingsData.social_youtube || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, social_youtube: e.target.value })}
                                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">LinkedIn</label>
                              <input
                                type="text"
                                placeholder="https://linkedin.com/..."
                                value={settingsData.social_linkedin || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, social_linkedin: e.target.value })}
                                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* HEADER SETTINGS */}
                    {activeSettingsGroup === "header" && (
                      <div className="space-y-5">
                        <span className="text-[10px] font-bold text-gold uppercase tracking-wider block border-b border-gold/10 pb-2">Ana Menü (Header) Ayarları</span>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2 flex justify-between">
                            <span>Ana Menü Yapısı (JSON)</span>
                            <span className="text-[8px] text-gold">Geçerli bir JSON dizisi formatında olmalıdır.</span>
                          </label>
                          <textarea
                            value={typeof settingsData.nav_items === 'string' ? settingsData.nav_items : JSON.stringify(settingsData.nav_items || [], null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                setSettingsData({ ...settingsData, nav_items: parsed });
                              } catch (err) {
                                setSettingsData({ ...settingsData, nav_items: e.target.value });
                              }
                            }}
                            className="w-full h-96 bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none font-mono text-[10px]"
                            spellCheck="false"
                          />
                        </div>
                      </div>
                    )}

                    {/* QUICK MENU SETTINGS */}
                    {activeSettingsGroup === "quick_menu" && (
                      <div className="space-y-5">
                        <span className="text-[10px] font-bold text-gold uppercase tracking-wider block border-b border-gold/10 pb-2">Hızlı Menü Ayarları</span>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2 flex justify-between">
                            <span>Hızlı Menü Öğeleri (JSON)</span>
                            <span className="text-[8px] text-gold">Geçerli bir JSON dizisi formatında olmalıdır. İkonlar Lucide kütüphanesinden alınır.</span>
                          </label>
                          <textarea
                            value={typeof settingsData.quick_menu_items === 'string' ? settingsData.quick_menu_items : JSON.stringify(settingsData.quick_menu_items || [], null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                setSettingsData({ ...settingsData, quick_menu_items: parsed });
                              } catch (err) {
                                setSettingsData({ ...settingsData, quick_menu_items: e.target.value });
                              }
                            }}
                            className="w-full h-96 bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none font-mono text-[10px]"
                            spellCheck="false"
                          />
                        </div>
                      </div>
                    )}

                    {/* QUICK INFO POOL SETTINGS */}
                    {activeSettingsGroup === "quick_info_pool" && (
                      <div className="space-y-5">
                        <div className="flex justify-between items-center border-b border-gold/10 pb-2">
                          <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Hızlı Bilgi Havuzu Ayarları</span>
                          <div className="flex bg-navy-dark border border-gold/10 p-0.5 rounded-lg">
                            <button
                              type="button"
                              onClick={() => setQuickInfoPoolMode("visual")}
                              className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all duration-200 ${
                                quickInfoPoolMode === "visual"
                                  ? "bg-gold text-navy-dark"
                                  : "text-cream/55 hover:text-cream"
                              }`}
                            >
                              Görsel Arayüz
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuickInfoPoolMode("json")}
                              className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all duration-200 ${
                                quickInfoPoolMode === "json"
                                  ? "bg-gold text-navy-dark"
                                  : "text-cream/55 hover:text-cream"
                              }`}
                            >
                              JSON Kod
                            </button>
                          </div>
                        </div>

                        {quickInfoPoolMode === "json" ? (
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2 flex justify-between">
                              <span>Bilgi Havuzu Öğeleri (JSON)</span>
                              <span className="text-[8px] text-gold">Geçerli bir JSON dizisi formatında olmalıdır. İkonlar Lucide kütüphanesinden alınır.</span>
                            </label>
                            <textarea
                              value={typeof settingsData.quick_info_pool === 'string' ? settingsData.quick_info_pool : JSON.stringify(settingsData.quick_info_pool || [], null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  setSettingsData({ ...settingsData, quick_info_pool: parsed });
                                } catch (err) {
                                  setSettingsData({ ...settingsData, quick_info_pool: e.target.value });
                                }
                              }}
                              className="w-full h-96 bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none font-mono text-[10px]"
                              spellCheck="false"
                            />
                          </div>
                        ) : (() => {
                          let pool: any[] = [];
                          if (typeof settingsData.quick_info_pool === 'string') {
                            try { pool = JSON.parse(settingsData.quick_info_pool); } catch (err) { pool = []; }
                          } else if (Array.isArray(settingsData.quick_info_pool)) {
                            pool = settingsData.quick_info_pool;
                          }

                          return (
                            <div className="space-y-4">
                              <p className="text-[10px] text-cream/50 leading-relaxed font-light">
                                Mimarlık & Yapı sayfasının sağ tarafında bulunan "Hızlı Bilgi Havuzu" kartlarını buradan ekleyebilir, silebilir, sıralayabilir ve dosyalarını/linklerini güncelleyebilirsiniz.
                              </p>

                              {pool.length === 0 ? (
                                <div className="border border-dashed border-gold/15 rounded-xl p-8 text-center text-cream/40">
                                  Havuzda henüz hiçbir öğe yok. Başlamak için "Yeni Öğe Ekle" butonuna basın.
                                </div>
                              ) : (
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                                  {pool.map((item: any, idx: number) => {
                                    const IconComponent = (() => {
                                      switch (item.icon) {
                                        case "FileText": return FileText;
                                        case "Calculator": return Calculator;
                                        case "BookOpen": return BookOpen;
                                        case "Layers": return Layers;
                                        case "Link": return LinkIcon;
                                        case "HelpCircle": return HelpCircle;
                                        case "Info": return Info;
                                        case "Download": return Download;
                                        case "Image": return ImageIcon;
                                        default: return HelpCircle;
                                      }
                                    })();

                                    return (
                                      <div key={idx} className="bg-navy-dark p-4 rounded-xl border border-gold/10 space-y-3 relative group">
                                        <div className="absolute top-3 right-3 flex items-center space-x-1.5 opacity-65 group-hover:opacity-100 transition-opacity">
                                          <button
                                            type="button"
                                            onClick={() => movePoolItem(idx, "up")}
                                            disabled={idx === 0}
                                            className="p-1 hover:bg-gold/15 text-gold rounded-lg disabled:text-cream/20 disabled:hover:bg-transparent"
                                            title="Yukarı Taşı"
                                          >
                                            <ArrowUp className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => movePoolItem(idx, "down")}
                                            disabled={idx === pool.length - 1}
                                            className="p-1 hover:bg-gold/15 text-gold rounded-lg disabled:text-cream/20 disabled:hover:bg-transparent"
                                            title="Aşağı Taşı"
                                          >
                                            <ArrowDown className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => removePoolItem(idx)}
                                            className="p-1 hover:bg-red-500/15 text-red-400 hover:text-red-300 rounded-lg"
                                            title="Sil"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pr-24">
                                          <div className="md:col-span-8">
                                            <label className="block text-[8px] uppercase font-bold text-cream/55 mb-1">Başlık (Link Adı)</label>
                                            <input
                                              type="text"
                                              value={item.title || ""}
                                              onChange={(e) => updatePoolItem(idx, "title", e.target.value)}
                                              className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-2.5 py-1.5 text-cream outline-none text-[10px]"
                                              placeholder="örn: İnşaat Ruhsatı Rehberi"
                                            />
                                          </div>
                                          <div className="md:col-span-4">
                                            <label className="block text-[8px] uppercase font-bold text-cream/55 mb-1">İkon</label>
                                            <div className="flex items-center space-x-2">
                                              <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
                                                <IconComponent className="w-4 h-4" />
                                              </div>
                                              <select
                                                value={item.icon || "HelpCircle"}
                                                onChange={(e) => updatePoolItem(idx, "icon", e.target.value)}
                                                className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-2.5 py-1.5 text-cream outline-none text-[10px] font-mono"
                                              >
                                                <option value="FileText">Doküman (FileText)</option>
                                                <option value="Calculator">Hesap (Calculator)</option>
                                                <option value="BookOpen">Rehber (BookOpen)</option>
                                                <option value="Layers">İmar (Layers)</option>
                                                <option value="Link">Bağlantı (Link)</option>
                                                <option value="Download">İndirme (Download)</option>
                                                <option value="Image">Görsel (Image)</option>
                                                <option value="Info">Bilgi (Info)</option>
                                                <option value="HelpCircle">Yardım (HelpCircle)</option>
                                              </select>
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-[8px] uppercase font-bold text-cream/55 mb-1">Kısa Açıklama</label>
                                          <input
                                            type="text"
                                            value={item.desc || ""}
                                            onChange={(e) => updatePoolItem(idx, "desc", e.target.value)}
                                            className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-2.5 py-1.5 text-cream outline-none text-[10px]"
                                            placeholder="örn: Gerekli belgeler ve başvuru süreci detayları."
                                          />
                                        </div>

                                        <div className="bg-navy/40 p-3 rounded-lg border border-gold/5 space-y-2">
                                          <div className="flex justify-between items-center">
                                            <span className="text-[8px] uppercase font-bold text-cream/55">Bağlantı Tipi & Adresi</span>
                                            <span className="text-[8px] text-gold/60">Ekleyeceğiniz link PDF, DOC, JPEG vb. bir dosya ise yükleyin.</span>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                            <div className="md:col-span-8">
                                              <input
                                                type="text"
                                                value={item.href || ""}
                                                onChange={(e) => updatePoolItem(idx, "href", e.target.value)}
                                                className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-2.5 py-1.5 text-cream outline-none text-[10px] font-mono"
                                                placeholder="Harici URL (örn: https://...) veya dosya yolu"
                                              />
                                            </div>
                                            <div className="md:col-span-4">
                                              <label className="flex items-center justify-center w-full px-3 py-1.5 bg-gold/10 hover:bg-gold hover:text-navy-dark text-gold border border-gold/25 rounded-lg cursor-pointer font-bold transition-all text-[10px] select-none text-center">
                                                {uploading ? "Yükleniyor..." : "Dosya / Belge Yükle"}
                                                <input
                                                  type="file"
                                                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                                  disabled={uploading}
                                                  onChange={(e) => handlePoolItemFileUpload(e, idx)}
                                                  className="hidden"
                                                />
                                              </label>
                                            </div>
                                          </div>
                                          {item.href && (
                                            <div className="flex items-center space-x-1.5 text-[8px] text-gold">
                                              <span>Mevcut Dosya/Bağlantı:</span>
                                              <a href={item.href.startsWith("http") ? item.href : `${getApiBaseUrl()}${item.href}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-gold-light truncate max-w-md">
                                                {item.href}
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={addPoolItem}
                                className="w-full py-2.5 bg-gold/5 hover:bg-gold/15 text-gold border border-dashed border-gold/25 rounded-xl font-bold transition-all text-[10px] flex items-center justify-center space-x-2"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Yeni Bilgi Havuzu Öğesi Ekle</span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* 2. HERO SECTION */}
                    {activeSettingsGroup === "hero" && (
                      <div className="space-y-5">
                        <span className="text-[10px] font-bold text-gold uppercase tracking-wider block border-b border-gold/10 pb-2">Giriş Alanı (Hero) Ayarları</span>
                        
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Ana Başlık (Title)</label>
                          <input
                            type="text"
                            value={settingsData.hero_title || ""}
                            onChange={(e) => setSettingsData({ ...settingsData, hero_title: e.target.value })}
                            className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Alt Başlık / Açıklama (Subtitle)</label>
                          <textarea
                            rows={3}
                            value={settingsData.hero_subtitle || ""}
                            onChange={(e) => setSettingsData({ ...settingsData, hero_subtitle: e.target.value })}
                            className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Arka Plan Görsel URL</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={settingsData.hero_bg_image || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, hero_bg_image: e.target.value })}
                              className="flex-1 bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                            />
                            <label className="flex items-center justify-center px-4 py-2.5 bg-gold/10 hover:bg-gold hover:text-navy-dark text-gold border border-gold/25 rounded-lg cursor-pointer font-bold transition-all text-xs select-none shrink-0">
                              {uploading ? "Yükleniyor..." : "Görsel Yükle"}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploading}
                                onChange={(e) => handleSettingImageUpload(e, "hero_bg_image")}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-navy-dark/30 p-4 rounded-xl border border-gold/5">
                          <div className="space-y-3">
                            <span className="text-[9px] font-bold text-gold uppercase tracking-wider block">Sol (Ana) Buton</span>
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-cream/55 mb-1">Yazı (Label)</label>
                              <input
                                type="text"
                                value={settingsData.hero_cta_text_1 || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, hero_cta_text_1: e.target.value })}
                                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-cream outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-cream/55 mb-1">Bağlantı (Link / Rota)</label>
                              <input
                                type="text"
                                value={settingsData.hero_cta_link_1 || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, hero_cta_link_1: e.target.value })}
                                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-cream outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <span className="text-[9px] font-bold text-gold uppercase tracking-wider block">Sağ (Oynat) Buton</span>
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-cream/55 mb-1">Yazı (Label)</label>
                              <input
                                type="text"
                                value={settingsData.hero_cta_text_2 || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, hero_cta_text_2: e.target.value })}
                                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-cream outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-cream/55 mb-1">Bağlantı (Link / Rota)</label>
                              <input
                                type="text"
                                value={settingsData.hero_cta_link_2 || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, hero_cta_link_2: e.target.value })}
                                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-cream outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. ABOUT SECTION */}
                    {activeSettingsGroup === "about" && (
                      <div className="space-y-5">
                        <span className="text-[10px] font-bold text-gold uppercase tracking-wider block border-b border-gold/10 pb-2">Hakkımızda Bölümü Ayarları</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="md:col-span-1">
                            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Küçük Etiket (Badge)</label>
                            <input
                              type="text"
                              value={settingsData.about_badge || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, about_badge: e.target.value })}
                              className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Bölüm Ana Başlığı</label>
                            <input
                              type="text"
                              value={settingsData.about_title || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, about_title: e.target.value })}
                              className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Hakkımızda 1. Paragraf</label>
                          <textarea
                            rows={4}
                            value={settingsData.about_paragraph_1 || ""}
                            onChange={(e) => setSettingsData({ ...settingsData, about_paragraph_1: e.target.value })}
                            className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Hakkımızda 2. Paragraf</label>
                          <textarea
                            rows={4}
                            value={settingsData.about_paragraph_2 || ""}
                            onChange={(e) => setSettingsData({ ...settingsData, about_paragraph_2: e.target.value })}
                            className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Görsel URL</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={settingsData.about_image || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, about_image: e.target.value })}
                              className="flex-1 bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                            />
                            <label className="flex items-center justify-center px-4 py-2.5 bg-gold/10 hover:bg-gold hover:text-navy-dark text-gold border border-gold/25 rounded-lg cursor-pointer font-bold transition-all text-xs select-none shrink-0">
                              {uploading ? "Yükleniyor..." : "Görsel Yükle"}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploading}
                                onChange={(e) => handleSettingImageUpload(e, "about_image")}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-navy-dark/30 p-4 rounded-xl border border-gold/5">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Ofis Kutusu Başlığı (Badge)</label>
                            <input
                              type="text"
                              value={settingsData.about_office_badge || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, about_office_badge: e.target.value })}
                              className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3.5 py-2.5 text-cream outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Ofis Kutusu Adres Metni</label>
                            <input
                              type="text"
                              value={settingsData.about_office_address || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, about_office_address: e.target.value })}
                              className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3.5 py-2.5 text-cream outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. MISSION & VISION */}
                    {activeSettingsGroup === "mission_vision" && (
                      <div className="space-y-6">
                        <span className="text-[10px] font-bold text-gold uppercase tracking-wider block border-b border-gold/10 pb-2">Misyon & Vizyon Ayarları</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Mission Form block */}
                          <div className="bg-navy-dark/35 p-5 rounded-xl border border-gold/5 space-y-4">
                            <span className="text-[10px] font-bold text-gold uppercase tracking-wider block border-b border-gold/10 pb-1.5">Misyonumuz Kartı</span>
                            
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-cream/55 mb-1.5">Misyon Başlığı</label>
                              <input
                                type="text"
                                value={settingsData.mission_title || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, mission_title: e.target.value })}
                                className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-cream outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-cream/55 mb-1.5">Misyon Alt Etiket (Badge)</label>
                              <input
                                type="text"
                                value={settingsData.mission_badge || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, mission_badge: e.target.value })}
                                className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-cream outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] uppercase font-bold text-cream/55 mb-1.5">Misyon Açıklaması</label>
                              <textarea
                                rows={4}
                                value={settingsData.mission_desc || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, mission_desc: e.target.value })}
                                className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-cream outline-none resize-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] uppercase font-bold text-cream/55 mb-1.5">Misyon İkonu (Lucide)</label>
                              <select
                                value={settingsData.mission_icon || "Target"}
                                onChange={(e) => setSettingsData({ ...settingsData, mission_icon: e.target.value })}
                                className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-cream outline-none font-mono"
                              >
                                {["Target", "Compass", "Eye", "ShieldCheck", "Heart", "Zap", "Award", "CheckCircle2", "Telescope", "HelpCircle"].map(icon => (
                                  <option key={icon} value={icon}>{icon}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Vision Form block */}
                          <div className="bg-navy-dark/35 p-5 rounded-xl border border-gold/5 space-y-4">
                            <span className="text-[10px] font-bold text-gold uppercase tracking-wider block border-b border-gold/10 pb-1.5">Vizyonumuz Kartı</span>
                            
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-cream/55 mb-1.5">Vizyon Başlığı</label>
                              <input
                                type="text"
                                value={settingsData.vision_title || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, vision_title: e.target.value })}
                                className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-cream outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-cream/55 mb-1.5">Vizyon Alt Etiket (Badge)</label>
                              <input
                                type="text"
                                value={settingsData.vision_badge || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, vision_badge: e.target.value })}
                                className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-cream outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] uppercase font-bold text-cream/55 mb-1.5">Vizyon Açıklaması</label>
                              <textarea
                                rows={4}
                                value={settingsData.vision_desc || ""}
                                onChange={(e) => setSettingsData({ ...settingsData, vision_desc: e.target.value })}
                                className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-cream outline-none resize-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] uppercase font-bold text-cream/55 mb-1.5">Vizyon İkonu (Lucide)</label>
                              <select
                                value={settingsData.vision_icon || "Eye"}
                                onChange={(e) => setSettingsData({ ...settingsData, vision_icon: e.target.value })}
                                className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-cream outline-none font-mono"
                              >
                                {["Target", "Compass", "Eye", "ShieldCheck", "Heart", "Zap", "Award", "CheckCircle2", "Telescope", "HelpCircle"].map(icon => (
                                  <option key={icon} value={icon}>{icon}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 5. QUALITY POLICY */}
                    {activeSettingsGroup === "quality_policy" && (
                      <div className="space-y-5">
                        <span className="text-[10px] font-bold text-gold uppercase tracking-wider block border-b border-gold/10 pb-2">Kalite Politikası Ayarları</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Bölüm Üst Etiket (Badge)</label>
                            <input
                              type="text"
                              value={settingsData.quality_badge || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, quality_badge: e.target.value })}
                              className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Bölüm Başlığı</label>
                            <input
                              type="text"
                              value={settingsData.quality_title || ""}
                              onChange={(e) => setSettingsData({ ...settingsData, quality_title: e.target.value })}
                              className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Kalite Politikası Genel Giriş Açıklaması</label>
                          <textarea
                            rows={3}
                            value={settingsData.quality_desc || ""}
                            onChange={(e) => setSettingsData({ ...settingsData, quality_desc: e.target.value })}
                            className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none resize-none"
                          />
                        </div>

                        {/* List of 5 Pillars */}
                        <div className="space-y-4">
                          <span className="text-[10px] font-bold text-gold uppercase tracking-wider block border-b border-gold/10 pb-1.5">5 Temel İlke Sütunları (Pillars)</span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {[0, 1, 2, 3, 4].map((index) => {
                              const pillar = (settingsData.quality_pillars || [])[index] || { title: "", desc: "", icon: "HelpCircle" };
                              return (
                                <div key={index} className="bg-navy-dark/45 border border-gold/5 hover:border-gold/25 p-4 rounded-xl space-y-3 relative">
                                  <span className="absolute top-2 right-3 text-[9px] font-bold text-gold/30">İlke #{index+1}</span>
                                  <div>
                                    <label className="block text-[8px] uppercase font-bold text-cream/55 mb-1 mt-1">Başlık</label>
                                    <input
                                      type="text"
                                      value={pillar.title || ""}
                                      onChange={(e) => handlePillarChange(index, "title", e.target.value)}
                                      className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-2.5 py-1.5 text-cream outline-none"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-[8px] uppercase font-bold text-cream/55 mb-1">Açıklama</label>
                                    <textarea
                                      rows={4}
                                      value={pillar.desc || pillar.description || ""}
                                      onChange={(e) => handlePillarChange(index, "desc", e.target.value)}
                                      className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-2.5 py-1.5 text-cream outline-none resize-none text-[10px]"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[8px] uppercase font-bold text-cream/55 mb-1">İkon (Lucide)</label>
                                    <select
                                      value={pillar.icon || "HelpCircle"}
                                      onChange={(e) => handlePillarChange(index, "icon", e.target.value)}
                                      className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-2.5 py-1.5 text-cream outline-none font-mono"
                                    >
                                      {["Target", "Compass", "Eye", "ShieldCheck", "Heart", "Zap", "Award", "CheckCircle2", "Telescope", "HelpCircle"].map(icon => (
                                        <option key={icon} value={icon}>{icon}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Actions */}
                    <div className="flex justify-end pt-5 border-t border-gold/10 space-x-3">
                      <button
                        type="button"
                        onClick={() => fetchSettings(token || "")}
                        disabled={settingsSaving}
                        className="px-6 py-2.5 bg-navy-dark hover:bg-navy border border-gold/10 rounded-lg font-bold"
                      >
                        Sıfırla
                      </button>
                      <button
                        type="submit"
                        disabled={settingsSaving}
                        className="px-7 py-2.5 bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-dark text-navy-dark rounded-lg font-bold shadow-md shadow-gold/10 flex items-center space-x-2"
                      >
                        {settingsSaving ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Kaydediliyor...</span>
                          </>
                        ) : (
                          <span>Ayarları Kaydet (CMS)</span>
                        )}
                      </button>
                    </div>

                  </form>
                )}

              </div>
            )}

            {activeTab === "messages" && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/10 pb-5">
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-cream">İletişim & Teklif Mesajları</h2>
                    <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1">Ziyaretçiler tarafından gönderilen teklif ve iletişim talepleri</p>
                  </div>
                </div>

                {/* Filter / Search Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy/60 border border-gold/5 p-4 rounded-xl">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-cream/40" />
                    <input
                      type="text"
                      placeholder="Mesajlarda ara (İsim, konu, mesaj içeriği)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-9 pr-4 py-2.5 text-xs text-cream outline-none placeholder-cream/30"
                    />
                  </div>
                </div>

                {/* Messages List */}
                <div className="bg-navy border border-gold/10 rounded-xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-navy-dark text-[9px] uppercase font-bold text-gold/70 border-b border-gold/10 tracking-widest">
                          <th className="p-4">Gönderen</th>
                          <th className="p-4">İletişim Bilgileri</th>
                          <th className="p-4">İlgi Alanı / Konu</th>
                          <th className="p-4">Mesaj</th>
                          <th className="p-4 text-right">Eylemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold/5">
                        {messages
                          .filter(msg => 
                            !searchQuery ||
                            (msg.full_name && msg.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (msg.subject && msg.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (msg.message && msg.message.toLowerCase().includes(searchQuery.toLowerCase()))
                          )
                          .map((msg) => (
                            <tr key={msg.id} className="hover:bg-navy-dark/40 transition-colors">
                              <td className="p-4 font-semibold text-cream">{msg.full_name}</td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  <div className="text-cream/80">{msg.email}</div>
                                  {msg.phone && <div className="text-cream/50">{msg.phone}</div>}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="bg-gold/10 text-gold px-2.5 py-1 rounded font-semibold uppercase text-[9px] tracking-wider">
                                  {msg.subject === "yapi" ? "Yapı & İnşaat" : msg.subject === "mimarlik" ? "Mimarlık & Tasarım" : msg.subject === "gayrimenkul" ? "Gayrimenkul" : msg.subject === "yazilim" ? "Yazılım Çözümleri" : msg.subject}
                                </span>
                              </td>
                              <td className="p-4 text-cream/70 max-w-sm whitespace-pre-wrap leading-relaxed">{msg.message}</td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end space-x-3">
                                  {user.role === "admin" && (
                                    <button
                                      onClick={() => handleDelete("contact-messages", msg.id)}
                                      className="p-1.5 bg-navy-dark hover:bg-red-950/20 border border-gold/10 hover:border-red-500/30 text-cream/60 hover:text-red-400 rounded transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        {messages.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-cream/35 italic">Henüz hiç mesaj bulunmuyor.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Header */}
                <div className="border-b border-gold/10 pb-5">
                  <h2 className="font-playfair text-2xl font-bold text-cream">Profil Ayarları</h2>
                  <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1">Kişisel bilgilerinizi ve şifrenizi güncelleyin</p>
                </div>

                {/* Form Wrapper */}
                <div className="max-w-2xl bg-navy border border-gold/10 rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

                  {profileError && (
                    <div className="flex items-center space-x-2 bg-red-950/40 border border-red-500/20 text-red-200 text-xs px-4 py-3 rounded-lg mb-6">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="flex items-center space-x-2 bg-green-950/40 border border-green-500/20 text-green-200 text-xs px-4 py-3 rounded-lg mb-6">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Ad Soyad</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-cream/40" />
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="Mustafa Karagöz"
                          className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-4 py-3 text-xs text-cream outline-none placeholder-cream/35 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">E-posta Adresi</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-cream/40" />
                        <input
                          type="email"
                          required
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          placeholder="ornek@yazeproje.com"
                          className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-4 py-3 text-xs text-cream outline-none placeholder-cream/35 transition-colors"
                        />
                      </div>
                      <p className="text-[9px] text-cream/40 mt-1">E-posta adresinizi değiştirirseniz oturumunuz kapatılacaktır.</p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Telefon Numarası</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-cream/40" />
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="0532..."
                          className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-4 py-3 text-xs text-cream outline-none placeholder-cream/35 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Password Fields Info */}
                    <div className="border-t border-gold/10 pt-5 mt-5">
                      <h3 className="text-xs font-bold text-gold mb-1">Şifre Değiştir</h3>
                      <p className="text-[9px] text-cream/50 mb-4">Şifrenizi güncellemek istemiyorsanız aşağıdaki alanları boş bırakabilirsiniz.</p>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Yeni Şifre</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cream/40" />
                        <input
                          type={showProfilePassword ? "text" : "password"}
                          value={profilePassword}
                          onChange={(e) => setProfilePassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-10 py-3 text-xs text-cream outline-none placeholder-cream/35 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowProfilePassword(!showProfilePassword)}
                          className="absolute right-3.5 top-3.5 text-cream/45 hover:text-gold transition-colors focus:outline-none"
                        >
                          {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <PasswordStrengthMeter password={profilePassword} onValidationChange={setIsProfilePasswordValid} />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Yeni Şifre Tekrar</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cream/40" />
                        <input
                          type={showProfileConfirmPassword ? "text" : "password"}
                          value={profileConfirmPassword}
                          onChange={(e) => setProfileConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-10 py-3 text-xs text-cream outline-none placeholder-cream/35 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowProfileConfirmPassword(!showProfileConfirmPassword)}
                          className="absolute right-3.5 top-3.5 text-cream/45 hover:text-gold transition-colors focus:outline-none"
                        >
                          {showProfileConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={profileSubmitting || (!!profilePassword && !isProfilePasswordValid)}
                        className="px-8 py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark font-bold text-xs rounded-lg transition-all shadow-lg hover:shadow-gold/15 active:scale-98 disabled:opacity-50 flex items-center space-x-2"
                      >
                        {profileSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Güncelleniyor...</span>
                          </>
                        ) : (
                          <span>Profil Bilgilerini Kaydet</span>
                        )}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

            {activeTab === "users" && user.role === "admin" && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Header */}
                <div className="border-b border-gold/10 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-cream">Kullanıcı Yönetimi</h2>
                    <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1">Sistemdeki tüm kullanıcıları görüntüleyin, rollerini ve durumlarını yönetin</p>
                  </div>
                  {/* Stats Counter */}
                  <div className="bg-navy-dark border border-gold/10 px-4 py-2 rounded-xl flex items-center space-x-4 text-[10px]">
                    <div className="flex flex-col">
                      <span className="text-cream/50 uppercase">Toplam</span>
                      <span className="text-gold font-bold text-sm">{usersList.length}</span>
                    </div>
                    <div className="h-6 w-px bg-gold/10" />
                    <div className="flex flex-col">
                      <span className="text-cream/50 uppercase">Aktif</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {usersList.filter(u => u.is_active).length}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-gold/10" />
                    <div className="flex flex-col">
                      <span className="text-cream/50 uppercase">Askıda</span>
                      <span className="text-red-400 font-bold text-sm">
                        {usersList.filter(u => !u.is_active).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-navy border border-gold/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Search */}
                  <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-cream/35" />
                    <input
                      type="text"
                      placeholder="Ad, Soyad veya E-posta ara..."
                      value={usersSearchQuery}
                      onChange={(e) => setUsersSearchQuery(e.target.value)}
                      className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-4 py-2.5 text-xs text-cream placeholder-cream/35 outline-none transition-colors"
                    />
                  </div>

                  {/* Filter */}
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <span className="text-[10px] uppercase font-bold text-cream/50 tracking-wider shrink-0">Rol Filtresi:</span>
                    <select
                      value={usersRoleFilter}
                      onChange={(e) => setUsersRoleFilter(e.target.value)}
                      className="bg-navy-dark border border-gold/10 text-cream text-xs rounded-lg px-3 py-2 outline-none focus:border-gold"
                    >
                      <option value="all">Tüm Roller</option>
                      <option value="admin">Yönetici (Admin)</option>
                      <option value="architect">Mimar (Architect)</option>
                      <option value="agent">Emlak Danışmanı (Agent)</option>
                      <option value="developer">Yazılımcı (Developer)</option>
                      <option value="editor">Editör (Editor)</option>
                      <option value="subscriber">Abone (Subscriber)</option>
                    </select>
                  </div>
                </div>

                {/* Users Table / Grid */}
                {usersLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <RefreshCw className="w-6 h-6 text-gold animate-spin" />
                    <span className="text-[10px] text-cream/40 uppercase tracking-wider">Kullanıcılar yükleniyor...</span>
                  </div>
                ) : usersError ? (
                  <div className="bg-red-950/40 border border-red-500/20 text-red-200 text-xs px-4 py-3 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{usersError}</span>
                  </div>
                ) : (
                  <div className="bg-navy border border-gold/10 rounded-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-cream">
                        <thead>
                          <tr className="bg-navy-dark/60 border-b border-gold/10 text-[10px] uppercase font-bold tracking-wider text-cream/60">
                            <th className="py-4 px-6">Kullanıcı</th>
                            <th className="py-4 px-6">Rol Yetkisi</th>
                            <th className="py-4 px-6">Doğrulama & Durum</th>
                            <th className="py-4 px-6">Kayıt Tarihi</th>
                            <th className="py-4 px-6 text-right">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gold/5 text-xs">
                          {usersList
                            .filter((u) => {
                              const matchQuery =
                                u.full_name?.toLowerCase().includes(usersSearchQuery.toLowerCase()) ||
                                u.email?.toLowerCase().includes(usersSearchQuery.toLowerCase());
                              const matchRole =
                                usersRoleFilter === "all" || u.role === usersRoleFilter;
                              return matchQuery && matchRole;
                            })
                            .map((u) => {
                              const isSelf = u.id === user?.id;
                              return (
                                <tr key={u.id} className="hover:bg-navy-dark/30 transition-colors">
                                  {/* User Details */}
                                  <td className="py-4 px-6">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center font-bold text-gold text-sm shrink-0">
                                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-cream">{u.full_name} {isSelf && <span className="text-[10px] text-gold font-bold ml-1.5 px-1.5 py-0.5 bg-gold/15 rounded border border-gold/20">Siz</span>}</span>
                                        <span className="text-[10px] text-cream/40">{u.email}</span>
                                        {u.phone && <span className="text-[10px] text-cream/40 mt-0.5">{u.phone}</span>}
                                      </div>
                                    </div>
                                  </td>

                                  {/* User Role */}
                                  <td className="py-4 px-6">
                                    {isSelf ? (
                                      <span className="text-cream/80 text-[11px] font-medium capitalize">
                                        {u.role === "admin" ? "Yönetici (Admin)" : u.role}
                                      </span>
                                    ) : (
                                      <div className="flex items-center space-x-2">
                                        <select
                                          value={u.role}
                                          disabled={updatingUserRoleMap[u.id]}
                                          onChange={(e) => handleRoleChange(u, e.target.value)}
                                          className="bg-navy-dark border border-gold/10 text-cream text-[11px] rounded px-2.5 py-1.5 outline-none focus:border-gold disabled:opacity-50"
                                        >
                                          <option value="admin">Yönetici (Admin)</option>
                                          <option value="architect">Mimar (Architect)</option>
                                          <option value="agent">Emlak Danışmanı (Agent)</option>
                                          <option value="developer">Yazılımcı (Developer)</option>
                                          <option value="editor">Editör (Editor)</option>
                                          <option value="subscriber">Abone (Subscriber)</option>
                                        </select>
                                        {updatingUserRoleMap[u.id] && (
                                          <RefreshCw className="w-3.5 h-3.5 text-gold animate-spin shrink-0" />
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  {/* Verification & Status */}
                                  <td className="py-4 px-6">
                                    <div className="flex flex-col space-y-2">
                                      {/* Verification status badge */}
                                      <div className="flex items-center space-x-1.5">
                                        {u.is_verified ? (
                                          <span className="inline-flex items-center gap-1 text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-bold uppercase tracking-wide border border-green-500/20">
                                            Doğrulanmış
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[9px] bg-gray-500/10 text-cream/40 px-2 py-0.5 rounded font-bold uppercase tracking-wide border border-gold/5">
                                            Doğrulanmamış
                                          </span>
                                        )}
                                      </div>

                                      {/* Active toggle */}
                                      <div className="flex items-center space-x-2">
                                        {isSelf ? (
                                          <span className="text-[10px] text-green-400 font-bold uppercase">Aktif</span>
                                        ) : (
                                          <>
                                            <button
                                              onClick={() => handleStatusToggle(u)}
                                              disabled={updatingUserStatusMap[u.id]}
                                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                u.is_active ? "bg-emerald-500" : "bg-red-500/30"
                                              }`}
                                            >
                                              <span
                                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                  u.is_active ? "translate-x-4" : "translate-x-0"
                                                }`}
                                              />
                                            </button>
                                            <span className={`text-[10px] font-bold uppercase ${u.is_active ? "text-emerald-400" : "text-red-400"}`}>
                                              {u.is_active ? "Aktif" : "Askıda"}
                                            </span>
                                            {updatingUserStatusMap[u.id] && (
                                              <RefreshCw className="w-3.5 h-3.5 text-gold animate-spin shrink-0" />
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Created At Date */}
                                  <td className="py-4 px-6 text-cream/60 text-[11px]">
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString("tr-TR", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }) : "-"}
                                  </td>

                                  {/* Actions */}
                                  <td className="py-4 px-6 text-right">
                                    {isSelf ? (
                                      <span className="text-cream/30 text-[10px] italic">Yönetici</span>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setDeleteConfirmUser(u);
                                          setDeleteInputVerify("");
                                        }}
                                        className="inline-flex p-2 bg-red-950/20 hover:bg-red-650/35 border border-red-500/10 hover:border-red-500/30 text-red-400 rounded-lg transition-colors cursor-pointer"
                                        title="Kullanıcıyı Sil"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>

        )}
      </main>

      {/* ── Dynamic CMS Entry Form Modal ────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-center items-center p-4">
          <div className="bg-navy border border-gold/25 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="bg-navy-dark border-b border-gold/15 p-5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gold" />
                <h3 className="font-playfair text-sm md:text-base font-bold text-gold">
                  {editId ? "Öğeyi Düzenle" : "Yeni İçerik Oluştur"} &rarr; {modalType === "project" ? "Mimarlık Projesi" : modalType === "listing" ? "Emlak İlanı" : modalType === "news" ? "Yerel Haber" : modalType === "software" ? "Yazılım Ürünü" : modalType === "announcement" ? "Plan/İmar Askı İlanı" : "Kültürel Etkinlik"}
                </h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-cream/50 hover:text-cream text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-navy border border-gold/10 hover:border-gold transition-colors"
              >
                Kapat
              </button>
            </div>

            {/* Modal Form content */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[75vh] space-y-5 text-xs">
              
              {/* Row 1: Common Title */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">
                  {modalType === "software" ? "Yazılım Adı" : "Başlık / İsim"}
                </label>
                <input
                  type="text"
                  required
                  value={modalType === "software" ? (formData.name || "") : (formData.title || "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (modalType === "software") {
                      setFormData({ ...formData, name: val });
                    } else {
                      setFormData({ ...formData, title: val });
                    }
                  }}
                  placeholder={modalType === "software" ? "Yazılım adını yazın..." : "Başlık metnini yazın..."}
                  className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-3 text-cream outline-none transition-colors"
                />
              </div>

              {/* PROJECT FORM FIELDS */}
              {modalType === "project" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-navy-dark/45 p-5 rounded-xl border border-gold/5">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Proje Kategorisi</label>
                    <select
                      value={formData.category || "residential"}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2.5 text-cream outline-none"
                    >
                      <option value="residential">Konut Projesi</option>
                      <option value="commercial">Ticari Proje</option>
                      <option value="industrial">Sanayi Yapısı</option>
                      <option value="landscape">Peyzaj Geliştirme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Durum</label>
                    <select
                      value={formData.status || "in_progress"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2.5 text-cream outline-none"
                    >
                      <option value="in_progress">Devam Ediyor</option>
                      <option value="completed">Tamamlandı</option>
                      <option value="on_hold">Beklemede</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Müşteri / Kurum</label>
                    <input
                      type="text"
                      value={formData.client_name || ""}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      placeholder="Müşteri adını girin..."
                      className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Konum Bilgisi</label>
                    <input
                      type="text"
                      value={formData.location || ""}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Mahalle, Cadde..."
                      className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Alan (m²)</label>
                    <input
                      type="number"
                      value={formData.area_sqm || 0}
                      onChange={(e) => setFormData({ ...formData, area_sqm: parseFloat(e.target.value) })}
                      className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Bütçe (TL)</label>
                    <input
                      type="number"
                      value={formData.budget_try || 0}
                      onChange={(e) => setFormData({ ...formData, budget_try: parseFloat(e.target.value) })}
                      className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                    />
                  </div>
                </div>
              )}

              {/* LISTING FORM FIELDS (WITH DUAL MAP SELECTOR) */}
              {modalType === "listing" && (
                <div className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-navy-dark/45 p-5 rounded-xl border border-gold/5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">İşlem Türü</label>
                      <select
                        value={formData.listing_type || "sale"}
                        onChange={(e) => setFormData({ ...formData, listing_type: e.target.value })}
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2.5 text-cream outline-none"
                      >
                        <option value="sale">Satılık</option>
                        <option value="rent">Kiralık</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Mülk Türü</label>
                      <select
                        value={formData.property_type || "villa"}
                        onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2.5 text-cream outline-none"
                      >
                        <option value="villa">Villa</option>
                        <option value="apartment">Daire / Konut</option>
                        <option value="land">Arsa / Arazi</option>
                        <option value="office">İş Yeri / Ofis</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Fiyat (TL)</label>
                      <input
                        type="number"
                        value={formData.price || 0}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Alan (m²)</label>
                      <input
                        type="number"
                        value={formData.area_sqm || 0}
                        onChange={(e) => setFormData({ ...formData, area_sqm: parseFloat(e.target.value) })}
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Oda Sayısı</label>
                      <input
                        type="text"
                        value={formData.room_count || "3+1"}
                        onChange={(e) => setFormData({ ...formData, room_count: e.target.value })}
                        placeholder="Örn: 4+2"
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                      />
                    </div>
                  </div>

                  {/* Address Selection Hierarchy */}
                  <div className="bg-navy-dark/45 p-5 rounded-xl border border-gold/5 space-y-4">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider block border-b border-gold/10 pb-2">Konum / Adres Bilgileri</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">İl (Şehir)</label>
                        <select
                          disabled={locLoading || provinces.length === 0}
                          value={formData.city || ""}
                          onChange={async (e) => {
                            const newCity = e.target.value;
                            setFormData((prev: any) => ({ ...prev, city: newCity, district: "", neighborhood: "" }));
                            const dists = await loadDistricts(newCity, provinces);
                            if (dists.length > 0) {
                              const firstDistrict = dists[0].name;
                              setFormData((prev: any) => ({ ...prev, district: firstDistrict }));
                              const neighs = await loadNeighborhoods(firstDistrict, dists);
                              if (neighs.length > 0) {
                                setFormData((prev: any) => ({ ...prev, neighborhood: neighs[0].name }));
                              }
                            }
                          }}
                          className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2.5 text-cream outline-none"
                        >
                          <option value="" disabled>Seçiniz...</option>
                          {provinces.map((city) => (
                            <option key={city.id} value={city.name}>{city.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">İlçe</label>
                        <select
                          disabled={locLoading || districts.length === 0}
                          value={formData.district || ""}
                          onChange={async (e) => {
                            const newDistrict = e.target.value;
                            setFormData((prev: any) => ({ ...prev, district: newDistrict, neighborhood: "" }));
                            const neighs = await loadNeighborhoods(newDistrict, districts);
                            if (neighs.length > 0) {
                              setFormData((prev: any) => ({ ...prev, neighborhood: neighs[0].name }));
                            }
                          }}
                          className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2.5 text-cream outline-none"
                        >
                          {districts.length === 0 && <option value="">Önce İl Seçiniz</option>}
                          {districts.map((dist) => (
                            <option key={dist.id} value={dist.name}>{dist.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Mahalle</label>
                        <select
                          disabled={locLoading || neighborhoods.length === 0}
                          value={formData.neighborhood || ""}
                          onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                          className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2.5 text-cream outline-none"
                        >
                          {neighborhoods.length === 0 && <option value="">Önce İlçe Seçiniz</option>}
                          {neighborhoods.map((mah) => (
                            <option key={mah.id} value={mah.name}>{mah.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Cadde / Sokak / Bulvar</label>
                        <input
                          type="text"
                          required
                          value={formData.street || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const combined = formData.building_no ? `${val} No: ${formData.building_no}` : val;
                            setFormData({ ...formData, street: val, address: combined });
                          }}
                          placeholder="Örn: Ata Caddesi, 142. Sokak..."
                          className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">No / Kapı No</label>
                        <input
                          type="text"
                          required
                          value={formData.building_no || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const combined = val ? `${formData.street || ""} No: ${val}` : (formData.street || "");
                            setFormData({ ...formData, building_no: val, address: combined });
                          }}
                          placeholder="Örn: 24/A"
                          className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Map Selector Integration */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-navy-dark/45 p-5 rounded-xl border border-gold/15 shadow-inner">
                    
                    {/* Left inputs */}
                    <div className="md:col-span-4 space-y-4 self-center">
                      <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">Harita Koordinatları</span>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-cream/55 mb-1.5">Enlem (Latitude)</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={formData.latitude || 39.7925}
                          onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                          className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3.5 py-2 text-cream outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-cream/55 mb-1.5">Boylam (Longitude)</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={formData.longitude || 32.8130}
                          onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                          className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3.5 py-2 text-cream outline-none"
                        />
                      </div>
                    </div>

                    {/* Right Mini-map */}
                    <div className="md:col-span-8 h-[240px]">
                      <MapSelector 
                        lat={formData.latitude || 39.7925} 
                        lng={formData.longitude || 32.8130} 
                        onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                      />
                    </div>

                  </div>

                </div>
              )}

              {/* ANNOUNCEMENT FORM FIELDS */}
              {modalType === "announcement" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-navy-dark/45 p-5 rounded-xl border border-gold/5">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Yayınlanma Tarihi</label>
                    <input
                      type="date"
                      value={formData.published_at || ""}
                      onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                      className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="ann_is_published"
                        checked={formData.is_published || false}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                        className="w-4 h-4 rounded border-gold/20 text-gold bg-navy-dark"
                      />
                      <label htmlFor="ann_is_published" className="text-[10px] font-bold text-cream/65 uppercase tracking-wider select-none cursor-pointer">Yayında</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="ann_is_pinned"
                        checked={formData.is_pinned || false}
                        onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                        className="w-4 h-4 rounded border-gold/20 text-gold bg-navy-dark"
                      />
                      <label htmlFor="ann_is_pinned" className="text-[10px] font-bold text-cream/65 uppercase tracking-wider select-none cursor-pointer">Üste Sabitle</label>
                    </div>
                  </div>
                </div>
              )}

              {/* EVENT FORM FIELDS */}
              {modalType === "event" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-navy-dark/45 p-5 rounded-xl border border-gold/5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Etkinlik Başlangıç Tarihi</label>
                      <input
                        type="datetime-local"
                        value={formData.event_date ? formData.event_date.slice(0, 16) : ""}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Etkinlik Bitiş Tarihi</label>
                      <input
                        type="datetime-local"
                        value={formData.event_end_date ? formData.event_end_date.slice(0, 16) : ""}
                        onChange={(e) => setFormData({ ...formData, event_end_date: e.target.value })}
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Etkinlik Konumu</label>
                      <input
                        type="text"
                        value={formData.location || ""}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Örn: YAZE Kültür Merkezi"
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Kayıt URL (Opsiyonel)</label>
                      <input
                        type="text"
                        value={formData.registration_url || ""}
                        onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Maksimum Katılımcı</label>
                      <input
                        type="number"
                        value={formData.max_attendees || 0}
                        onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) })}
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-6 mt-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="evt_is_published"
                          checked={formData.is_published || false}
                          onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                          className="w-4 h-4 rounded border-gold/20 text-gold bg-navy-dark"
                        />
                        <label htmlFor="evt_is_published" className="text-[10px] font-bold text-cream/65 uppercase tracking-wider select-none cursor-pointer">Yayında</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="evt_is_featured"
                          checked={formData.is_featured || false}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                          className="w-4 h-4 rounded border-gold/20 text-gold bg-navy-dark"
                        />
                        <label htmlFor="evt_is_featured" className="text-[10px] font-bold text-cream/65 uppercase tracking-wider select-none cursor-pointer">Öne Çıkar</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NEWS FORM FIELDS */}
              {modalType === "news" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-navy-dark/45 p-5 rounded-xl border border-gold/5">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Haber Kaynağı</label>
                    <select
                      value={formData.source || "manual"}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2.5 text-cream outline-none"
                    >
                      <option value="manual">Yerel Giriş (YAZE)</option>
                      <option value="resmi_gazete">Resmi Gazete</option>
                      <option value="csbe">Bakanlık İlanı</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Kaynak Bağlantı URL</label>
                    <input
                      type="text"
                      value={formData.source_url || ""}
                      onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                    />
                  </div>
                </div>
              )}

              {/* SOFTWARE FORM FIELDS */}
              {modalType === "software" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-navy-dark/45 p-5 rounded-xl border border-gold/5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Yazılım Kategorisi</label>
                      <select
                        value={formData.category || "calculation"}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2.5 text-cream outline-none"
                      >
                        <option value="cad_tool">CAD Aracı</option>
                        <option value="project_management">Proje Yönetimi</option>
                        <option value="bim">BIM Yazılımı</option>
                        <option value="calculation">Hesaplama / Metraj</option>
                        <option value="visualization">Görselleştirme</option>
                        <option value="other">Diğer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Versiyon</label>
                      <input
                        type="text"
                        value={formData.version || "v1.0.0"}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        placeholder="Örn: v1.0.0"
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Kısa Açıklama</label>
                      <input
                        type="text"
                        value={formData.short_description || ""}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                        placeholder="Kısa özet..."
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Demo URL</label>
                      <input
                        type="text"
                        value={formData.demo_url || ""}
                        onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                        placeholder="https://demo.yaze.com"
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-navy-dark/45 p-5 rounded-xl border border-gold/5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Fiyat (Opsiyonel)</label>
                      <input
                        type="number"
                        value={formData.price || 0}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-2.5 text-cream outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Para Birimi</label>
                      <select
                        value={formData.currency || "TRY"}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full bg-navy border border-gold/10 focus:border-gold rounded-lg px-3 py-2.5 text-cream outline-none"
                      >
                        <option value="TRY">TRY</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-3 mt-4">
                      <input
                        type="checkbox"
                        id="is_free"
                        checked={formData.is_free || false}
                        onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                        className="w-4 h-4 rounded border-gold/20 text-gold bg-navy-dark"
                      />
                      <label htmlFor="is_free" className="text-[10px] font-bold text-cream/65 uppercase tracking-wider select-none cursor-pointer">Ücretsiz Yazılım</label>
                    </div>
                    <div className="flex items-center space-x-3 mt-4">
                      <input
                        type="checkbox"
                        id="is_published"
                        checked={formData.is_published || false}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                        className="w-4 h-4 rounded border-gold/20 text-gold bg-navy-dark"
                      />
                      <label htmlFor="is_published" className="text-[10px] font-bold text-cream/65 uppercase tracking-wider select-none cursor-pointer">Yayında</label>
                    </div>
                  </div>

                  {/* Installer / File Upload Section */}
                  <div className="bg-navy-dark/45 p-5 rounded-xl border border-gold/15 space-y-4">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider block border-b border-gold/10 pb-2">Kurulum Dosyası (Yükleyici / Installer)</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.download_url || ""}
                        onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                        placeholder="Kurulum dosyasının indirme bağlantısı (örn: /uploads/...)"
                        className="flex-1 bg-navy border border-gold/10 focus:border-gold rounded-lg px-4 py-3 text-cream outline-none transition-colors"
                      />
                      <label className="flex items-center justify-center px-4 py-3 bg-gold/10 hover:bg-gold hover:text-navy-dark text-gold border border-gold/25 rounded-lg cursor-pointer font-bold transition-all text-xs select-none">
                        {uploading ? "Yükleniyor..." : "Dosya Yükle"}
                        <input
                          type="file"
                          onChange={handleFileAndInstallerUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <p className="text-[9px] text-cream/45">Yüklenen exe, msi veya zip dosyası indirme butonu aracılığıyla indirilebilir hale gelecektir.</p>
                  </div>
                </div>
              )}

              {/* Description & Rich Areas */}
              {modalType !== "news" && modalType !== "announcement" ? (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">
                    {modalType === "event" ? "Etkinlik Detaylı Açıklaması" : "Detaylı Açıklama"}
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-3 text-cream outline-none resize-none"
                  />
                </div>
              ) : modalType === "announcement" ? (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Duyuru İçeriği</label>
                  <textarea
                    rows={6}
                    value={formData.content || ""}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-3 text-cream outline-none resize-none"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Kısa Özet</label>
                    <textarea
                      rows={2}
                      value={formData.summary || ""}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-3 text-cream outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Haber Detay İçeriği</label>
                    <textarea
                      rows={5}
                      value={formData.content || ""}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-3 text-cream outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Media URL / Upload */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Görsel / Kapak URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.cover_image_url || ""}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-4 py-3 text-cream outline-none transition-colors"
                  />
                  <label className="flex items-center justify-center px-4 py-3 bg-gold/10 hover:bg-gold hover:text-navy-dark text-gold border border-gold/25 rounded-lg cursor-pointer font-bold transition-all text-xs select-none">
                    {uploading ? "Yükleniyor..." : "Dosya Yükle"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-5 border-t border-gold/15 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 bg-navy-dark hover:bg-navy border border-gold/10 rounded-lg font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-dark text-navy-dark rounded-lg font-bold shadow-md shadow-gold/10"
                >
                  Kaydet & Yayına Al
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-center items-center p-4">
          <div className="bg-navy border border-red-500/35 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="bg-red-950/20 border-b border-red-500/25 p-5 flex items-center space-x-3 text-red-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="font-playfair text-base font-bold">Kullanıcıyı Sil - Çift Aşamalı Onay</h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-cream">
              <p className="leading-relaxed">
                <strong className="text-red-400">{deleteConfirmUser.full_name || deleteConfirmUser.email}</strong> kullanıcısını sistemden tamamen silmek üzeresiniz. Bu işlem <strong>geri alınamaz</strong> ve kullanıcının tüm ilişkili verileri silinecektir.
              </p>
              
              <div className="bg-navy-dark border border-gold/10 p-3 rounded-lg space-y-1">
                <p className="text-[10px] text-cream/50 uppercase font-bold tracking-wider">Silinecek Hesap Bilgileri</p>
                <p className="font-semibold text-gold">{deleteConfirmUser.full_name}</p>
                <p className="text-cream/75">{deleteConfirmUser.email}</p>
                <p className="text-cream/50">Rol: <span className="capitalize">{deleteConfirmUser.role}</span></p>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider">
                  Silmek için aşağıdaki kutuya büyük harflerle <span className="text-red-400 font-extrabold">SİL</span> yazın:
                </label>
                <input
                  type="text"
                  placeholder="SİL"
                  value={deleteInputVerify}
                  onChange={(e) => setDeleteInputVerify(e.target.value)}
                  className="w-full bg-navy-dark border border-red-500/25 focus:border-red-500 rounded-lg px-4 py-2.5 text-center font-bold tracking-widest text-red-200 outline-none placeholder-red-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3 p-5 border-t border-gold/10 justify-end bg-navy-dark/30">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmUser(null);
                  setDeleteInputVerify("");
                }}
                className="px-5 py-2.5 bg-navy-dark hover:bg-navy border border-gold/10 hover:border-gold/25 text-cream/70 hover:text-cream rounded-lg font-bold transition-all text-xs"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleUserDelete}
                disabled={deleteInputVerify.trim() !== "SİL"}
                className="px-6 py-2.5 bg-gradient-to-r from-red-700 to-red-650 hover:from-red-650 hover:to-red-700 text-white rounded-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs shadow-md shadow-red-950/20"
              >
                Kullanıcıyı Kalıcı Olarak Sil
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
