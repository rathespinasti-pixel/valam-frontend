"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { ValamUser, CropGuide, CropStageAdvice, AdminActivityLog } from "@/lib/types";
import { getDefaultStagesForCrop } from "@/lib/lifecycle";
import { useLanguage } from "@/context/LanguageContext";
import {
  Users,
  Sprout,
  ShieldCheck,
  History,
  Search,
  Filter,
  Ban,
  UserCheck,
  Trash2,
  Plus,
  Edit,
  Layers,
  Save,
  X,
  LogOut,
  Lock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UserPlus,
} from "lucide-react";

type AdminTab = "users" | "crops" | "admins" | "logs";

export default function AdminPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [user, setUser] = useState<ValamUser | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  // 1. User Management State
  const [usersList, setUsersList] = useState<ValamUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userCategoryFilter, setUserCategoryFilter] = useState("All");
  const [userDistrictFilter, setUserDistrictFilter] = useState("All");
  const [userStatusFilter, setUserStatusFilter] = useState("All");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Deletion Modal for User
  const [userToDelete, setUserToDelete] = useState<ValamUser | null>(null);

  // 2. Crop Management State
  const [guides, setGuides] = useState<CropGuide[]>([]);
  const [cropSearch, setCropSearch] = useState("");
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [editingGuideId, setEditingGuideId] = useState<number | null>(null);
  const [cropToDelete, setCropToDelete] = useState<CropGuide | null>(null);

  // Crop Form fields
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [season, setSeason] = useState("Yala & Maha");
  const [waterReq, setWaterReq] = useState("");
  const [fertGuidance, setFertGuidance] = useState("");
  const [commonProblems, setCommonProblems] = useState("");
  const [basicSolutions, setBasicSolutions] = useState("");
  const [stages, setStages] = useState<CropStageAdvice[]>([]);

  // 3. Admin Accounts State (Super Admin Only)
  const [adminAccounts, setAdminAccounts] = useState<ValamUser[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<number | string | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<ValamUser | null>(null);

  // Admin Account Form fields
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminRole, setAdminRole] = useState<"admin" | "super_admin">("admin");
  const [adminStatus, setAdminStatus] = useState<"active" | "banned">("active");

  // 4. Audit Activity Logs State
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [logPage, setLogPage] = useState(1);

  async function loadData() {
    try {
      setLoading(true);
      const u = await ValamAPI.me();
      setUser(u);

      const [usersRes, guidesRes, logsRes] = await Promise.allSettled([
        ValamAPI.getAdminUsers({ search: userSearch, category: userCategoryFilter, district: userDistrictFilter, status: userStatusFilter, page: userPage }),
        ValamAPI.getCropGuides(),
        ValamAPI.getAdminLogs(logPage),
      ]);

      if (usersRes.status === "fulfilled") {
        setUsersList(usersRes.value.items);
        setUserTotalPages(usersRes.value.pages || 1);
      }

      if (guidesRes.status === "fulfilled") {
        setGuides(guidesRes.value.items);
      }

      if (logsRes.status === "fulfilled") {
        setLogs(logsRes.value.items);
      }

      if (u.role === "super_admin") {
        const accountsRes = await ValamAPI.getAdminAccounts().catch(() => []);
        setAdminAccounts(accountsRes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }
    loadData();
  }, [router, userPage, userSearch, userCategoryFilter, userDistrictFilter, userStatusFilter, logPage]);

  async function handleAdminLogout() {
    await ValamAPI.logout();
    router.push("/login");
  }

  // --- USER MANAGEMENT HANDLERS ---
  async function handleToggleBanUser(u: ValamUser) {
    try {
      const nextStatus = u.status === "banned" ? "active" : "banned";
      const updated = await ValamAPI.banUser(u.id, nextStatus);
      setStatusMsg({ type: "ok", text: `User ${u.email} status updated to ${nextStatus}` });
      setUsersList((prev) => prev.map((item) => (item.id === u.id ? { ...item, status: nextStatus } : item)));
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update user status." });
    }
  }

  async function handleConfirmDeleteUser() {
    if (!userToDelete) return;
    try {
      await ValamAPI.deleteAdminUser(userToDelete.id);
      setStatusMsg({ type: "ok", text: `User ${userToDelete.email} permanently deleted.` });
      setUsersList((prev) => prev.filter((item) => item.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to delete user." });
    }
  }

  // --- CROP MANAGEMENT HANDLERS ---
  function openCreateCropForm() {
    setEditingGuideId(null);
    setCropName("Tomato");
    setVariety("Thilina / KC1");
    setSeason("Yala & Maha");
    setWaterReq("3.5 - 4.5 L/m² daily");
    setFertGuidance("Basal compost + Top dress Urea/MOP");
    setCommonProblems("Bacterial Wilt, Early Blight");
    setBasicSolutions("Resistant varieties, neem oil spray");
    setStages(getDefaultStagesForCrop("Tomato"));
    setShowAddCropModal(true);
  }

  function openEditCropForm(g: CropGuide) {
    setEditingGuideId(g.id);
    setCropName(g.crop_name);
    setVariety(g.variety || "");
    setSeason(g.recommended_season || "Yala & Maha");
    setWaterReq(g.water_requirements || "");
    setFertGuidance(g.fertilizer_guidance || "");
    setCommonProblems(g.common_problems || "");
    setBasicSolutions(g.basic_solutions || "");

    const existingStages = g.growth_stages && g.growth_stages.length > 0 ? g.growth_stages : getDefaultStagesForCrop(g.crop_name);
    setStages(existingStages);
    setShowAddCropModal(true);
  }

  function handleStageChange(index: number, field: keyof CropStageAdvice, value: any) {
    setStages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function handleTaskTextChange(stageIndex: number, taskText: string) {
    const taskList = taskText.split("\n").filter((t) => t.trim().length > 0);
    handleStageChange(stageIndex, "daily_tasks", taskList);
  }

  async function handleSaveCrop(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: Partial<CropGuide> = {
        crop_name: cropName,
        variety,
        recommended_season: season,
        water_requirements: waterReq,
        fertilizer_guidance: fertGuidance,
        common_problems: commonProblems,
        basic_solutions: basicSolutions,
        growth_stages: stages,
      };

      if (editingGuideId) {
        await ValamAPI.updateCropGuide(editingGuideId, payload);
        setStatusMsg({ type: "ok", text: `Crop ${cropName} updated successfully!` });
      } else {
        await ValamAPI.createCropGuide(payload);
        setStatusMsg({ type: "ok", text: `New crop ${cropName} created successfully!` });
      }

      setShowAddCropModal(false);
      const res = await ValamAPI.getCropGuides();
      setGuides(res.items);
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to save crop guide." });
    }
  }

  async function handleConfirmDeleteCrop() {
    if (!cropToDelete) return;
    try {
      await ValamAPI.deleteCropGuide(cropToDelete.id);
      setStatusMsg({ type: "ok", text: `Crop ${cropToDelete.crop_name} deleted.` });
      setGuides((prev) => prev.filter((g) => g.id !== cropToDelete.id));
      setCropToDelete(null);
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to delete crop." });
    }
  }

  // --- ADMIN ACCOUNTS HANDLERS (SUPER ADMIN ONLY) ---
  function openCreateAdminModal() {
    setEditingAdminId(null);
    setAdminName("");
    setAdminEmail("");
    setAdminPassword("");
    setAdminRole("admin");
    setAdminStatus("active");
    setShowAdminModal(true);
  }

  function openEditAdminModal(a: ValamUser) {
    setEditingAdminId(a.id);
    setAdminName(a.full_name);
    setAdminEmail(a.email);
    setAdminPassword("");
    setAdminRole((a.role as "admin" | "super_admin") || "admin");
    setAdminStatus((a.status as "active" | "banned") || "active");
    setShowAdminModal(true);
  }

  async function handleSaveAdmin(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingAdminId) {
        await ValamAPI.updateAdminAccount(editingAdminId, {
          full_name: adminName,
          email: adminEmail,
          role: adminRole,
          status: adminStatus,
          password: adminPassword.trim() ? adminPassword : undefined,
        });
        setStatusMsg({ type: "ok", text: `Admin account ${adminEmail} updated.` });
      } else {
        await ValamAPI.createAdminAccount({
          full_name: adminName,
          email: adminEmail,
          password: adminPassword,
          role: adminRole,
        });
        setStatusMsg({ type: "ok", text: `Admin account ${adminEmail} created.` });
      }

      setShowAdminModal(false);
      const res = await ValamAPI.getAdminAccounts();
      setAdminAccounts(res);
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to save admin account." });
    }
  }

  async function handleConfirmDeleteAdmin() {
    if (!adminToDelete) return;
    try {
      await ValamAPI.deleteAdminAccount(adminToDelete.id);
      setStatusMsg({ type: "ok", text: `Admin account ${adminToDelete.email} deleted.` });
      setAdminAccounts((prev) => prev.filter((a) => a.id !== adminToDelete.id));
      setAdminToDelete(null);
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to delete admin account." });
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <Navbar active="dashboard" />
        <div style={{ minHeight: "65vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 18, color: "#1B4D3E", fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
            <RefreshCw size={24} className="spin" /> Loading Admin Portal...
          </div>
        </div>
        <Footer />
      </AuthGuard>
    );
  }

  // Non-Admin Access Control Screen
  if (user && user.role !== "admin" && user.role !== "super_admin") {
    return (
      <AuthGuard>
        <Navbar active="dashboard" />
        <div style={{ minHeight: "65vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", padding: 24 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 40, maxWidth: 480, width: "100%", textAlign: "center", border: "1px solid #E2E8F0", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FEF2F2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Lock size={32} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1E293B", margin: 0 }}>
              Admin Access Restricted
            </h2>
            <p style={{ fontSize: 14, color: "#64748B", marginTop: 8, lineHeight: 1.6 }}>
              You are currently logged in as <strong>{user.full_name}</strong> (Farmer role). This section requires administrator credentials.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
              <button onClick={handleAdminLogout} className="btn btn-sun" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12 }}>
                <LogOut size={18} /> Switch / Login as Admin
              </button>
              <button onClick={() => router.push("/dashboard")} className="btn btn-outline" style={{ width: "100%", padding: 12 }}>
                Return to Farmer Dashboard
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </AuthGuard>
    );
  }

  const isSuperAdmin = user?.role === "super_admin";

  return (
    <AuthGuard>
      <Navbar active="dashboard" pageTitle={t("adminPortalTitle")} />

      {/* Hero Header */}
      <section className="page-hero" style={{ padding: "32px 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="crumb" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Valam / Admin Portal</span>
              <span style={{ background: isSuperAdmin ? "#F59E0B" : "#10B981", color: "#FFF", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                {isSuperAdmin ? "👑 Super Admin Session" : "🛡️ Admin Session"}: {user?.full_name}
              </span>
            </div>
            <h1 style={{ fontSize: 30, marginTop: 6 }}>System Administration &amp; Operations</h1>
            <p style={{ marginTop: 6, color: "#CFE3D5", maxWidth: 640, fontSize: 14 }}>
              Manage users, ban/unban accounts, configure crop growth lifecycles, assign administrator permissions, and audit logs.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {activeTab === "crops" && (
              <button onClick={openCreateCropForm} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Plus size={18} /> Add Crop Guide
              </button>
            )}
            {activeTab === "admins" && isSuperAdmin && (
              <button onClick={openCreateAdminModal} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserPlus size={18} /> Add New Admin
              </button>
            )}
            <button onClick={handleAdminLogout} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: 6, borderColor: "rgba(255,255,255,0.4)", color: "#FFF" }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7", minHeight: "65vh" }}>
        <div className="container">

          {/* Status Message Notification Toast */}
          {statusMsg && (
            <div
              style={{
                padding: "14px 20px",
                borderRadius: 12,
                marginBottom: 20,
                background: statusMsg.type === "ok" ? "#DCFCE7" : "#FEE2E2",
                border: statusMsg.type === "ok" ? "1px solid #A7F3D0" : "1px solid #FCA5A5",
                color: statusMsg.type === "ok" ? "#166534" : "#991B1B",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {statusMsg.type === "ok" ? <CheckCircle2 size={20} color="#166534" /> : <AlertTriangle size={20} color="#991B1B" />}
                <span>{statusMsg.text}</span>
              </div>
              <button onClick={() => setStatusMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                <X size={18} />
              </button>
            </div>
          )}

          {/* Navigation Tabs Bar */}
          <div style={{ display: "flex", gap: 10, borderBottom: "2px solid #E2E8F0", marginBottom: 24, flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTab("users")}
              style={{
                padding: "12px 20px",
                fontWeight: 700,
                fontSize: 15,
                color: activeTab === "users" ? "#10B981" : "#64748B",
                borderBottom: activeTab === "users" ? "3px solid #10B981" : "3px solid transparent",
                background: "none",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Users size={19} /> User Management
            </button>

            <button
              onClick={() => setActiveTab("crops")}
              style={{
                padding: "12px 20px",
                fontWeight: 700,
                fontSize: 15,
                color: activeTab === "crops" ? "#10B981" : "#64748B",
                borderBottom: activeTab === "crops" ? "3px solid #10B981" : "3px solid transparent",
                background: "none",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Sprout size={19} /> Crop Management
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab("admins")}
                style={{
                  padding: "12px 20px",
                  fontWeight: 700,
                  fontSize: 15,
                  color: activeTab === "admins" ? "#F59E0B" : "#64748B",
                  borderBottom: activeTab === "admins" ? "3px solid #F59E0B" : "3px solid transparent",
                  background: "none",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ShieldCheck size={19} /> Admin Accounts (Super Admin)
              </button>
            )}

            <button
              onClick={() => setActiveTab("logs")}
              style={{
                padding: "12px 20px",
                fontWeight: 700,
                fontSize: 15,
                color: activeTab === "logs" ? "#10B981" : "#64748B",
                borderBottom: activeTab === "logs" ? "3px solid #10B981" : "3px solid transparent",
                background: "none",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <History size={19} /> Audit Logs
            </button>
          </div>

          {/* TAB 1: USER MANAGEMENT MODULE */}
          {activeTab === "users" && (
            <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>
                  Registered Farmer Directory
                </h2>

                {/* Filters */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative", minWidth: 220 }}>
                    <Search size={16} color="#64748B" style={{ position: "absolute", left: 12, top: 12 }} />
                    <input
                      type="text"
                      placeholder="Search name, email, phone..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      style={{ padding: "8px 12px 8px 36px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, width: "100%" }}
                    />
                  </div>

                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, background: "#FFF" }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="banned">Banned Only</option>
                  </select>

                  <select
                    value={userDistrictFilter}
                    onChange={(e) => setUserDistrictFilter(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, background: "#FFF" }}
                  >
                    <option value="All">All Districts</option>
                    <option value="Vavuniya">Vavuniya</option>
                    <option value="Jaffna">Jaffna</option>
                    <option value="Kilinochchi">Kilinochchi</option>
                    <option value="Mannar">Mannar</option>
                    <option value="Mullaitivu">Mullaitivu</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", color: "#475569", fontWeight: 700 }}>
                      <th style={{ padding: 12 }}>Name</th>
                      <th style={{ padding: 12 }}>Email</th>
                      <th style={{ padding: 12 }}>Phone</th>
                      <th style={{ padding: 12 }}>Category</th>
                      <th style={{ padding: 12 }}>District</th>
                      <th style={{ padding: 12 }}>Status</th>
                      <th style={{ padding: 12 }}>Registration Date</th>
                      <th style={{ padding: 12, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length > 0 ? (
                      usersList.map((u) => (
                        <tr key={u.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: 12, fontWeight: 700, color: "#1E293B" }}>
                            {u.full_name}
                            {u.role === "super_admin" && (
                              <span style={{ marginLeft: 6, fontSize: 10, background: "#F59E0B", color: "#FFF", padding: "2px 6px", borderRadius: 8 }}>Super Admin</span>
                            )}
                          </td>
                          <td style={{ padding: 12, color: "#475569" }}>{u.email}</td>
                          <td style={{ padding: 12, color: "#475569" }}>{u.phone || "—"}</td>
                          <td style={{ padding: 12, color: "#334155" }}>{u.farming_category || "Farmer"}</td>
                          <td style={{ padding: 12, color: "#334155" }}>{u.district || "Vavuniya"}</td>
                          <td style={{ padding: 12 }}>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 700,
                                background: u.status === "banned" ? "#FEE2E2" : "#DCFCE7",
                                color: u.status === "banned" ? "#991B1B" : "#15803D",
                                border: u.status === "banned" ? "1px solid #FCA5A5" : "1px solid #A7F3D0",
                              }}
                            >
                              {u.status === "banned" ? "Banned 🚫" : "Active ✓"}
                            </span>
                          </td>
                          <td style={{ padding: 12, color: "#64748B", fontSize: 13 }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Recent"}
                          </td>
                          <td style={{ padding: 12, textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              {u.role !== "super_admin" && (
                                <button
                                  onClick={() => handleToggleBanUser(u)}
                                  title={u.status === "banned" ? "Unban User" : "Ban User"}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    border: u.status === "banned" ? "1px solid #10B981" : "1px solid #F59E0B",
                                    background: u.status === "banned" ? "#ECFDF5" : "#FEF3C7",
                                    color: u.status === "banned" ? "#047857" : "#B45309",
                                    fontWeight: 700,
                                    fontSize: 12,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  {u.status === "banned" ? <UserCheck size={14} /> : <Ban size={14} />}
                                  {u.status === "banned" ? "Unban" : "Ban"}
                                </button>
                              )}

                              {isSuperAdmin && u.id !== user?.id && (
                                <button
                                  onClick={() => setUserToDelete(u)}
                                  title="Delete User Permanently"
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #EF4444",
                                    background: "#FEE2E2",
                                    color: "#991B1B",
                                    cursor: "pointer",
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ padding: 24, textAlign: "center", color: "#64748B" }}>
                          No registered users found matching the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {userTotalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                  <span style={{ fontSize: 13, color: "#64748B" }}>Page {userPage} of {userTotalPages}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#FFF", cursor: userPage <= 1 ? "not-allowed" : "pointer" }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      disabled={userPage >= userTotalPages}
                      onClick={() => setUserPage((p) => p + 1)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#FFF", cursor: userPage >= userTotalPages ? "not-allowed" : "pointer" }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CROP MANAGEMENT MODULE */}
          {activeTab === "crops" && (
            <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>
                  Crop Lifecycle &amp; Botanical Database
                </h2>
                <button onClick={openCreateCropForm} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Plus size={18} /> Add New Crop Guide
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                {guides.map((g) => (
                  <div key={g.id} style={{ background: "#F8FAFC", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>{g.crop_name}</h3>
                          <div style={{ fontSize: 13, color: "#64748B", fontStyle: "italic" }}>{g.variety || "Standard Variety"}</div>
                        </div>
                        <span style={{ background: "#DCFCE7", color: "#15803D", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                          5 Growth Stages
                        </span>
                      </div>

                      <div style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>
                        <strong>Season:</strong> {g.recommended_season || "Yala & Maha"}
                      </div>
                      <div style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>
                        <strong>Watering:</strong> {g.water_requirements || "Regular"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 16, borderTop: "1px solid #E2E8F0", paddingTop: 14 }}>
                      <button
                        onClick={() => openEditCropForm(g)}
                        style={{
                          flex: 1,
                          padding: "8px 14px",
                          borderRadius: 10,
                          border: "1px solid #10B981",
                          background: "#ECFDF5",
                          color: "#047857",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Edit size={16} /> Edit Guide
                      </button>
                      <button
                        onClick={() => setCropToDelete(g)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 10,
                          border: "1px solid #EF4444",
                          background: "#FEE2E2",
                          color: "#991B1B",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN ACCOUNTS MANAGEMENT MODULE (SUPER ADMIN ONLY) */}
          {activeTab === "admins" && isSuperAdmin && (
            <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>
                    Administrator Accounts Directory
                  </h2>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                    Manage system administrators and assign Super Admin vs Admin privileges.
                  </div>
                </div>
                <button onClick={openCreateAdminModal} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <UserPlus size={18} /> Add Administrator
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", color: "#475569", fontWeight: 700 }}>
                      <th style={{ padding: 12 }}>Admin Name</th>
                      <th style={{ padding: 12 }}>Email Address</th>
                      <th style={{ padding: 12 }}>Role</th>
                      <th style={{ padding: 12 }}>Status</th>
                      <th style={{ padding: 12 }}>Created Date</th>
                      <th style={{ padding: 12, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminAccounts.map((a) => (
                      <tr key={a.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: 12, fontWeight: 700, color: "#1E293B" }}>{a.full_name}</td>
                        <td style={{ padding: 12, color: "#475569" }}>{a.email}</td>
                        <td style={{ padding: 12 }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 700,
                              background: a.role === "super_admin" ? "#FEF3C7" : "#E0F2FE",
                              color: a.role === "super_admin" ? "#B45309" : "#0369A1",
                              border: a.role === "super_admin" ? "1px solid #FDE68A" : "1px solid #BAE6FD",
                            }}
                          >
                            {a.role === "super_admin" ? "👑 Super Admin" : "🛡️ Admin"}
                          </span>
                        </td>
                        <td style={{ padding: 12 }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 700,
                              background: a.status === "banned" ? "#FEE2E2" : "#DCFCE7",
                              color: a.status === "banned" ? "#991B1B" : "#15803D",
                            }}
                          >
                            {a.status === "banned" ? "Suspended" : "Active ✓"}
                          </span>
                        </td>
                        <td style={{ padding: 12, color: "#64748B", fontSize: 13 }}>
                          {a.created_at ? new Date(a.created_at).toLocaleDateString() : "Initial"}
                        </td>
                        <td style={{ padding: 12, textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button
                              onClick={() => openEditAdminModal(a)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: "1px solid #10B981",
                                background: "#ECFDF5",
                                color: "#047857",
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Edit size={14} /> Edit
                            </button>

                            {a.id !== user?.id && (
                              <button
                                onClick={() => setAdminToDelete(a)}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  border: "1px solid #EF4444",
                                  background: "#FEE2E2",
                                  color: "#991B1B",
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT ACTIVITY LOGS MODULE */}
          {activeTab === "logs" && (
            <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>
                  Administrative Audit Activity Logs
                </h2>
                <span style={{ fontSize: 12, color: "#64748B" }}>Total Records: {logs.length}</span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", color: "#475569", fontWeight: 700 }}>
                      <th style={{ padding: 12 }}>Action</th>
                      <th style={{ padding: 12 }}>Performed By</th>
                      <th style={{ padding: 12 }}>Details</th>
                      <th style={{ padding: 12 }}>Date</th>
                      <th style={{ padding: 12 }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? (
                      logs.map((l) => (
                        <tr key={l.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: 12 }}>
                            <span style={{ padding: "4px 10px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: "#E0F2FE", color: "#0369A1" }}>
                              {l.action}
                            </span>
                          </td>
                          <td style={{ padding: 12, fontWeight: 700, color: "#1E293B" }}>{l.performed_by}</td>
                          <td style={{ padding: 12, color: "#475569" }}>{l.details || "—"}</td>
                          <td style={{ padding: 12, color: "#64748B" }}>{l.date || (l.created_at ? new Date(l.created_at).toLocaleDateString() : "Today")}</td>
                          <td style={{ padding: 12, color: "#64748B" }}>{l.time || (l.created_at ? new Date(l.created_at).toLocaleTimeString() : "—")}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#64748B" }}>
                          No administrative activity logs recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* --- MODALS --- */}

      {/* 1. Add / Edit Crop Lifecycle Modal */}
      {showAddCropModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 32, maxWidth: 840, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>
                {editingGuideId ? "Edit Crop Lifecycle Config" : "Create New Crop Lifecycle Config"}
              </h2>
              <button onClick={() => setShowAddCropModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveCrop}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Crop Name *</label>
                  <input type="text" required placeholder="e.g. Tomato, Okra, Chili" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={cropName} onChange={(e) => setCropName(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Variety</label>
                  <input type="text" placeholder="e.g. Thilina / Local" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={variety} onChange={(e) => setVariety(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Season</label>
                  <input type="text" placeholder="e.g. Yala & Maha" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={season} onChange={(e) => setSeason(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Water Requirements</label>
                  <textarea rows={2} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={waterReq} onChange={(e) => setWaterReq(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Fertilizer Guidance</label>
                  <textarea rows={2} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={fertGuidance} onChange={(e) => setFertGuidance(e.target.value)} />
                </div>
              </div>

              {/* 5 Stages Configurator */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1B4D3E", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Layers size={18} /> Configure 5 Growth Stages
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                {stages.map((st, idx) => (
                  <div key={idx} style={{ background: "#F8FAFC", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: "#10B981" }}>Stage {idx + 1}:</span>
                      <input
                        type="text"
                        value={st.stage_name}
                        onChange={(e) => handleStageChange(idx, "stage_name", e.target.value)}
                        placeholder="Stage Title"
                        style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontWeight: 700 }}
                      />
                      <input
                        type="number"
                        value={st.start_day}
                        onChange={(e) => handleStageChange(idx, "start_day", parseInt(e.target.value, 10))}
                        placeholder="Start Day"
                        style={{ width: 80, padding: 8, borderRadius: 6, border: "1px solid #CBD5E1" }}
                      />
                      <span>to</span>
                      <input
                        type="number"
                        value={st.end_day}
                        onChange={(e) => handleStageChange(idx, "end_day", parseInt(e.target.value, 10))}
                        placeholder="End Day"
                        style={{ width: 80, padding: 8, borderRadius: 6, border: "1px solid #CBD5E1" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Expected Appearance</label>
                        <input
                          type="text"
                          value={st.expected_appearance || ""}
                          onChange={(e) => handleStageChange(idx, "expected_appearance", e.target.value)}
                          placeholder="e.g. Young green shoots"
                          style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Daily Tasks (1 per line)</label>
                        <textarea
                          rows={2}
                          value={(st.daily_tasks || []).join("\n")}
                          onChange={(e) => handleTaskTextChange(idx, e.target.value)}
                          placeholder="e.g. Water morning\nShield sun"
                          style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setShowAddCropModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Save size={16} /> Save Crop Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add / Edit Admin Modal */}
      {showAdminModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 32, maxWidth: 500, width: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>
                {editingAdminId ? "Edit Admin Account" : "Create New Admin Account"}
              </h2>
              <button onClick={() => setShowAdminModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Admin Officer"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {editingAdminId ? "Password (leave blank to keep unchanged)" : "Password *"}
                </label>
                <input
                  type="password"
                  required={!editingAdminId}
                  minLength={6}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Admin Role *</label>
                  <select
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value as any)}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC", background: "#FFF" }}
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                {editingAdminId && (
                  <div>
                    <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Status</label>
                    <select
                      value={adminStatus}
                      onChange={(e) => setAdminStatus(e.target.value as any)}
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC", background: "#FFF" }}
                    >
                      <option value="active">Active</option>
                      <option value="banned">Suspended</option>
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setShowAdminModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Save size={16} /> Save Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modals */}
      {userToDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 440, width: "100%", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEE2E2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={28} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", margin: 0 }}>Permanently Delete User?</h3>
            <p style={{ fontSize: 14, color: "#64748B", marginTop: 8 }}>
              Are you sure you want to delete <strong>{userToDelete.full_name}</strong> ({userToDelete.email})? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
              <button onClick={() => setUserToDelete(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleConfirmDeleteUser} className="btn" style={{ flex: 1, background: "#EF4444", color: "#FFF", border: "none" }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {cropToDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 440, width: "100%", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEE2E2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={28} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", margin: 0 }}>Delete Crop Guide?</h3>
            <p style={{ fontSize: 14, color: "#64748B", marginTop: 8 }}>
              Are you sure you want to delete <strong>{cropToDelete.crop_name}</strong> from the crop guide database?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
              <button onClick={() => setCropToDelete(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleConfirmDeleteCrop} className="btn" style={{ flex: 1, background: "#EF4444", color: "#FFF", border: "none" }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {adminToDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 440, width: "100%", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEE2E2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={28} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", margin: 0 }}>Delete Admin Account?</h3>
            <p style={{ fontSize: 14, color: "#64748B", marginTop: 8 }}>
              Are you sure you want to delete administrator <strong>{adminToDelete.full_name}</strong> ({adminToDelete.email})?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
              <button onClick={() => setAdminToDelete(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleConfirmDeleteAdmin} className="btn" style={{ flex: 1, background: "#EF4444", color: "#FFF", border: "none" }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </AuthGuard>
  );
}
