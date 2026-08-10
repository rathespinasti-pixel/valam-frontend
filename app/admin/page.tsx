"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type {
  ValamUser,
  CropGuide,
  CropStageAdvice,
  AdminActivityLog,
  AdminOverviewStats,
  DiseaseCatalogItem,
  DiseaseDiagnosis,
  SystemNotificationItem,
  UserFeedbackItem,
  FAQItem,
} from "@/lib/types";
import { getDefaultStagesForCrop } from "@/lib/lifecycle";
import {
  BarChart3,
  Users,
  Sprout,
  Layers,
  Bug,
  Stethoscope,
  ShieldCheck,
  Bell,
  CloudSun,
  FileSpreadsheet,
  MessageSquare,
  HelpCircle,
  Settings,
  History,
  Search,
  Filter,
  Ban,
  UserCheck,
  Trash2,
  Plus,
  Edit,
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
  Send,
  Key,
  Download,
  Check,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
} from "lucide-react";

type ControlPanelTab =
  | "overview"
  | "users"
  | "crops"
  | "lifecycles"
  | "diseases"
  | "reports"
  | "admins"
  | "notifications"
  | "weather"
  | "analytics"
  | "feedback"
  | "faqs"
  | "settings"
  | "logs";

type AdminTheme = "light" | "dark" | "system";

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<ValamUser | null>(null);
  const [activeTab, setActiveTab] = useState<ControlPanelTab>("overview");
  const [theme, setTheme] = useState<AdminTheme>("system");
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  // Stats State
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);

  // 1. User Management State
  const [usersList, setUsersList] = useState<ValamUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userCategoryFilter, setUserCategoryFilter] = useState("All");
  const [userDistrictFilter, setUserDistrictFilter] = useState("All");
  const [userStatusFilter, setUserStatusFilter] = useState("All");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Modals for User Management
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | string | null>(null);
  const [userToDelete, setUserToDelete] = useState<ValamUser | null>(null);
  const [userToResetPass, setUserToResetPass] = useState<ValamUser | null>(null);
  const [newResetPassword, setNewResetPassword] = useState("");

  // User Form fields
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPhone, setUPhone] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uCategory, setUCategory] = useState("Farmer");
  const [uDistrict, setUDistrict] = useState("Vavuniya");

  // 2. Crop & Lifecycle State
  const [guides, setGuides] = useState<CropGuide[]>([]);
  const [cropSearch, setCropSearch] = useState("");
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [editingGuideId, setEditingGuideId] = useState<number | null>(null);
  const [cropToDelete, setCropToDelete] = useState<CropGuide | null>(null);

  // Crop Form fields
  const [cropName, setCropName] = useState("Tomato");
  const [variety, setVariety] = useState("Thilina");
  const [season, setSeason] = useState("Yala & Maha");
  const [waterReq, setWaterReq] = useState("3.5 - 4.5 L/m²");
  const [fertGuidance, setFertGuidance] = useState("Basal compost + Top dressing");
  const [commonProblems, setCommonProblems] = useState("Bacterial Wilt, Early Blight");
  const [basicSolutions, setBasicSolutions] = useState("Resistant varieties, neem oil spray");
  const [stages, setStages] = useState<CropStageAdvice[]>([]);

  // 3. Disease Catalog State
  const [diseaseCatalog, setDiseaseCatalog] = useState<DiseaseCatalogItem[]>([]);
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [editingDiseaseId, setEditingDiseaseId] = useState<number | null>(null);
  const [dName, setDName] = useState("");
  const [dCrop, setDCrop] = useState("Tomato");
  const [dSymptoms, setDSymptoms] = useState("");
  const [dCauses, setDCauses] = useState("");
  const [dOrganic, setDOrganic] = useState("");
  const [dChemical, setDChemical] = useState("");
  const [dPrevention, setDPrevention] = useState("");

  // 4. Farmer Disease Reports State
  const [farmerReports, setFarmerReports] = useState<DiseaseDiagnosis[]>([]);
  const [editingReport, setEditingReport] = useState<DiseaseDiagnosis | null>(null);
  const [reportRec, setReportRec] = useState("");
  const [reportStatus, setReportStatus] = useState("resolved");

  // 5. Admin Accounts State (Super Admin Only)
  const [adminAccounts, setAdminAccounts] = useState<ValamUser[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<number | string | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<ValamUser | null>(null);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminRole, setAdminRole] = useState<"admin" | "super_admin">("admin");
  const [adminStatus, setAdminStatus] = useState<"active" | "banned">("active");

  // 6. Notifications State
  const [notifications, setNotifications] = useState<SystemNotificationItem[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteMsg, setNoteMsg] = useState("");
  const [noteCategory, setNoteCategory] = useState("Alert");
  const [noteTargetType, setNoteTargetType] = useState("All Users");
  const [noteTargetVal, setNoteTargetVal] = useState("");

  // 7. Feedback State
  const [feedbackItems, setFeedbackItems] = useState<UserFeedbackItem[]>([]);
  const [replyFeedback, setReplyFeedback] = useState<UserFeedbackItem | null>(null);
  const [replyText, setReplyText] = useState("");

  // 8. FAQ State
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");
  const [faqCat, setFaqCat] = useState("General");

  // 9. System Settings State (Super Admin Only)
  const [sysSettings, setSysSettings] = useState<Record<string, string>>({});

  // 10. Audit Activity Logs State
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [logPage, setLogPage] = useState(1);

  useEffect(() => {
    const savedTheme = localStorage.getItem("valam-admin-theme") as AdminTheme | null;
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.adminTheme = resolved;
    };

    applyTheme();
    if (theme === "system") media.addEventListener("change", applyTheme);
    return () => {
      media.removeEventListener("change", applyTheme);
      delete document.documentElement.dataset.adminTheme;
    };
  }, [theme]);

  function handleThemeChange(nextTheme: AdminTheme) {
    setTheme(nextTheme);
    localStorage.setItem("valam-admin-theme", nextTheme);
  }

  async function loadData() {
    try {
      setLoading(true);
      const u = await ValamAPI.me();
      setUser(u);

      // Do not render the control panel for a farmer while the protected
      // API calls are being rejected in the background.
      if (u.role !== "admin" && u.role !== "super_admin") {
        router.replace("/dashboard");
        return;
      }

      const [statsRes, usersRes, guidesRes, diseasesRes, reportsRes, notesRes, feedbackRes, faqsRes, logsRes] =
        await Promise.allSettled([
          ValamAPI.getAdminStats(),
          ValamAPI.getAdminUsers({ search: userSearch, category: userCategoryFilter, district: userDistrictFilter, status: userStatusFilter, page: userPage }),
          ValamAPI.getCropGuides(),
          ValamAPI.getDiseaseCatalog(),
          ValamAPI.getFarmerDiseaseReports(),
          ValamAPI.getSystemNotifications(),
          ValamAPI.getUserFeedback(),
          ValamAPI.getAllAdminFAQs(),
          ValamAPI.getAdminLogs(logPage),
        ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (usersRes.status === "fulfilled") {
        setUsersList(usersRes.value.items);
        setUserTotalPages(usersRes.value.pages || 1);
      }
      if (guidesRes.status === "fulfilled") setGuides(guidesRes.value.items);
      if (diseasesRes.status === "fulfilled") setDiseaseCatalog(diseasesRes.value);
      if (reportsRes.status === "fulfilled") setFarmerReports(reportsRes.value);
      if (notesRes.status === "fulfilled") setNotifications(notesRes.value);
      if (feedbackRes.status === "fulfilled") setFeedbackItems(feedbackRes.value);
      if (faqsRes.status === "fulfilled") setFaqItems(faqsRes.value);
      if (logsRes.status === "fulfilled") setLogs(logsRes.value.items);

      if (u.role === "super_admin") {
        const [accountsRes, settingsRes] = await Promise.allSettled([
          ValamAPI.getAdminAccounts(),
          ValamAPI.getSystemSettings(),
        ]);
        if (accountsRes.status === "fulfilled") setAdminAccounts(accountsRes.value);
        if (settingsRes.status === "fulfilled") setSysSettings(settingsRes.value);
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
  function openCreateUserForm() {
    setEditingUserId(null);
    setUName("");
    setUEmail("");
    setUPhone("+94 77 000 0000");
    setUPassword("Valam@1234");
    setUCategory("Farmer");
    setUDistrict("Vavuniya");
    setShowUserModal(true);
  }

  function openEditUserForm(u: ValamUser) {
    setEditingUserId(u.id);
    setUName(u.full_name);
    setUEmail(u.email);
    setUPhone(u.phone || "");
    setUPassword("");
    setUCategory(u.farming_category || "Farmer");
    setUDistrict(u.district || "Vavuniya");
    setShowUserModal(true);
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingUserId) {
        await ValamAPI.updateAdminUserProfile(editingUserId, {
          full_name: uName,
          phone: uPhone,
          farming_category: uCategory as any,
          district: uDistrict,
        });
        setStatusMsg({ type: "ok", text: `User ${uEmail} profile updated!` });
      } else {
        await ValamAPI.createAdminUser({
          full_name: uName,
          email: uEmail,
          password: uPassword,
          phone: uPhone,
          farming_category: uCategory as any,
          district: uDistrict,
        });
        setStatusMsg({ type: "ok", text: `New user ${uEmail} created!` });
      }

      setShowUserModal(false);
      const res = await ValamAPI.getAdminUsers({ search: userSearch, page: userPage });
      setUsersList(res.items);
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to save user." });
    }
  }

  async function handleResetUserPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userToResetPass) return;
    try {
      await ValamAPI.resetUserPassword(userToResetPass.id, newResetPassword);
      setStatusMsg({ type: "ok", text: `Password reset successfully for ${userToResetPass.email}` });
      setUserToResetPass(null);
      setNewResetPassword("");
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to reset password." });
    }
  }

  async function handleToggleBanUser(u: ValamUser) {
    try {
      const nextStatus = u.status === "banned" ? "active" : "banned";
      await ValamAPI.banUser(u.id, nextStatus);
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

  // --- CROP & LIFECYCLE HANDLERS ---
  function openCreateCropForm() {
    setEditingGuideId(null);
    setCropName("Tomato");
    setVariety("Thilina");
    setSeason("Yala & Maha");
    setWaterReq("3.5 - 4.5 L/m²");
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
        setStatusMsg({ type: "ok", text: `Crop ${cropName} updated!` });
      } else {
        await ValamAPI.createCropGuide(payload);
        setStatusMsg({ type: "ok", text: `Crop ${cropName} created!` });
      }

      setShowAddCropModal(false);
      const res = await ValamAPI.getCropGuides();
      setGuides(res.items);
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to save crop." });
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

  // --- DISEASE CATALOG HANDLERS ---
  function openCreateDiseaseForm() {
    setEditingDiseaseId(null);
    setDName("");
    setDCrop("Tomato");
    setDSymptoms("");
    setDCauses("");
    setDOrganic("");
    setDChemical("");
    setDPrevention("");
    setShowDiseaseModal(true);
  }

  function openEditDiseaseForm(d: DiseaseCatalogItem) {
    setEditingDiseaseId(d.id);
    setDName(d.disease_name);
    setDCrop(d.crop_name);
    setDSymptoms(d.symptoms);
    setDCauses(d.causes || "");
    setDOrganic(d.organic_treatment || "");
    setDChemical(d.chemical_treatment || "");
    setDPrevention(d.prevention_tips || "");
    setShowDiseaseModal(true);
  }

  async function handleSaveDisease(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: Partial<DiseaseCatalogItem> = {
        disease_name: dName,
        crop_name: dCrop,
        symptoms: dSymptoms,
        causes: dCauses,
        organic_treatment: dOrganic,
        chemical_treatment: dChemical,
        prevention_tips: dPrevention,
      };

      if (editingDiseaseId) {
        await ValamAPI.updateDiseaseEntry(editingDiseaseId, payload);
        setStatusMsg({ type: "ok", text: `Disease ${dName} updated!` });
      } else {
        await ValamAPI.createDiseaseEntry(payload);
        setStatusMsg({ type: "ok", text: `Disease ${dName} added to catalog!` });
      }

      setShowDiseaseModal(false);
      const res = await ValamAPI.getDiseaseCatalog();
      setDiseaseCatalog(res);
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to save disease entry." });
    }
  }

  async function handleDeleteDisease(id: number) {
    try {
      await ValamAPI.deleteDiseaseEntry(id);
      setStatusMsg({ type: "ok", text: "Disease entry deleted." });
      setDiseaseCatalog((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to delete disease entry." });
    }
  }

  // --- FARMER DISEASE REPORT HANDLERS ---
  async function handleUpdateReportStatus(id: number, status: string, rec?: string) {
    try {
      const updated = await ValamAPI.updateFarmerDiseaseReport(id, { status, recommendations: rec });
      setStatusMsg({ type: "ok", text: `Disease report #${id} updated to ${status}` });
      setFarmerReports((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setEditingReport(null);
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update report." });
    }
  }

  // --- NOTIFICATION HANDLERS ---
  async function handleCreateNotification(e: React.FormEvent) {
    e.preventDefault();
    try {
      await ValamAPI.createSystemNotification({
        title: noteTitle,
        message: noteMsg,
        category: noteCategory,
        target_type: noteTargetType,
        target_value: noteTargetVal,
      });
      setStatusMsg({ type: "ok", text: `Notification '${noteTitle}' created & broadcasted!` });
      setShowNoteModal(false);
      setNoteTitle("");
      setNoteMsg("");
      const res = await ValamAPI.getSystemNotifications();
      setNotifications(res);
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to send notification." });
    }
  }

  async function handleDeleteNotification(id: number) {
    try {
      await ValamAPI.deleteSystemNotification(id);
      setStatusMsg({ type: "ok", text: "Notification record deleted." });
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to delete notification." });
    }
  }

  // --- ADMIN ACCOUNTS HANDLERS (SUPER ADMIN) ---
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

  // --- SYSTEM SETTINGS HANDLERS ---
  async function handleSaveSystemSettings(e: React.FormEvent) {
    e.preventDefault();
    try {
      await ValamAPI.updateSystemSettings(sysSettings);
      setStatusMsg({ type: "ok", text: "System Settings updated successfully!" });
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update settings." });
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F9F7" }}>
          <div style={{ fontSize: 18, color: "#1B4D3E", fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
            <RefreshCw size={24} className="spin" /> Loading Central Control Panel...
          </div>
        </div>
      </AuthGuard>
    );
  }

  const isSuperAdmin = user?.role === "super_admin";

  return (
    <AuthGuard>
      {/* Dedicated admin workspace — farmers never see this layout. */}
      <section className="page-hero admin-workspace" style={{ padding: "20px 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="crumb" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Valam / Central Control Panel</span>
              <span style={{ background: isSuperAdmin ? "#F59E0B" : "#10B981", color: "#FFF", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                {isSuperAdmin ? "👑 Super Admin Session" : "🛡️ Admin Session"}: {user?.full_name}
              </span>
            </div>
            <h1 style={{ fontSize: 28, marginTop: 4 }}>System Administration &amp; Operations Panel</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label className="admin-theme-picker" title="Choose control panel theme">
              {theme === "dark" ? <Moon size={15} /> : theme === "light" ? <Sun size={15} /> : <Monitor size={15} />}
              <select value={theme} onChange={(event) => handleThemeChange(event.target.value as AdminTheme)} aria-label="Control panel theme">
                <option value="light">Light</option>
                <option value="system">System</option>
                <option value="dark">Dark</option>
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </label>
            <button onClick={handleAdminLogout} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: 6, borderColor: "rgba(255,255,255,0.4)", color: "#FFF" }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7", minHeight: "70vh", padding: "24px 0" }}>
        <div className="container">

          {/* Toast Notification */}
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

          <div className="admin-control-layout" style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: 24, alignItems: "start" }}>

            {/* Sidebar Module Navigation Selector */}
            <aside style={{ background: "#FFFFFF", borderRadius: 16, padding: 12, border: "1px solid #E2E8F0", height: "fit-content", position: "sticky", top: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ padding: "8px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", color: "#94A3B8", fontWeight: 700 }}>
                Control Modules
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button onClick={() => setActiveTab("overview")} className={`admin-side-btn ${activeTab === "overview" ? "active" : ""}`}>
                  <BarChart3 size={18} /> Overview Stats
                </button>
                <button onClick={() => setActiveTab("users")} className={`admin-side-btn ${activeTab === "users" ? "active" : ""}`}>
                  <Users size={18} /> User Management
                </button>
                <button onClick={() => setActiveTab("crops")} className={`admin-side-btn ${activeTab === "crops" ? "active" : ""}`}>
                  <Sprout size={18} /> Crop Database
                </button>
                <button onClick={() => setActiveTab("lifecycles")} className={`admin-side-btn ${activeTab === "lifecycles" ? "active" : ""}`}>
                  <Layers size={18} /> Crop Lifecycles
                </button>
                <button onClick={() => setActiveTab("diseases")} className={`admin-side-btn ${activeTab === "diseases" ? "active" : ""}`}>
                  <Bug size={18} /> Disease Catalog
                </button>
                <button onClick={() => setActiveTab("reports")} className={`admin-side-btn ${activeTab === "reports" ? "active" : ""}`}>
                  <Stethoscope size={18} /> Farmer Reports
                </button>
                {isSuperAdmin && (
                  <button onClick={() => setActiveTab("admins")} className={`admin-side-btn ${activeTab === "admins" ? "active" : ""}`}>
                    <ShieldCheck size={18} /> Admin Accounts
                  </button>
                )}
                <button onClick={() => setActiveTab("notifications")} className={`admin-side-btn ${activeTab === "notifications" ? "active" : ""}`}>
                  <Bell size={18} /> Notifications
                </button>
                <button onClick={() => setActiveTab("weather")} className={`admin-side-btn ${activeTab === "weather" ? "active" : ""}`}>
                  <CloudSun size={18} /> Weather Config
                </button>
                <button onClick={() => setActiveTab("analytics")} className={`admin-side-btn ${activeTab === "analytics" ? "active" : ""}`}>
                  <FileSpreadsheet size={18} /> Reports &amp; Export
                </button>
                <button onClick={() => setActiveTab("feedback")} className={`admin-side-btn ${activeTab === "feedback" ? "active" : ""}`}>
                  <MessageSquare size={18} /> User Feedback
                </button>
                <button onClick={() => setActiveTab("faqs")} className={`admin-side-btn ${activeTab === "faqs" ? "active" : ""}`}>
                  <HelpCircle size={18} /> FAQ Knowledge
                </button>
                {isSuperAdmin && (
                  <button onClick={() => setActiveTab("settings")} className={`admin-side-btn ${activeTab === "settings" ? "active" : ""}`}>
                    <Settings size={18} /> System Settings
                  </button>
                )}
                <button onClick={() => setActiveTab("logs")} className={`admin-side-btn ${activeTab === "logs" ? "active" : ""}`}>
                  <History size={18} /> Audit Logs
                </button>
              </div>
            </aside>

            {/* Main Active Module Content Window */}
            <div>

              {/* MODULE 1: REAL-TIME OVERVIEW DASHBOARD */}
              {activeTab === "overview" && stats && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>System Overview &amp; Live Metrics</h2>

                  {/* Users Stats Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    <div className="stat-box admin-overview-card admin-overview-card--users">
                      <div className="stat-num">{stats.users.total}</div>
                      <div className="stat-label">Total Users</div>
                      <div className="stat-sub">{stats.users.new_today} registered today</div>
                    </div>
                    <div className="stat-box admin-overview-card admin-overview-card--active">
                      <div className="stat-num" style={{ color: "#10B981" }}>{stats.users.active}</div>
                      <div className="stat-label">Active Users</div>
                      <div className="stat-sub">{stats.users.farmers} Farmers</div>
                    </div>
                    <div className="stat-box admin-overview-card admin-overview-card--risk">
                      <div className="stat-num" style={{ color: "#EF4444" }}>{stats.users.banned}</div>
                      <div className="stat-label">Banned Users</div>
                      <div className="stat-sub">Suspended accounts</div>
                    </div>
                    <div className="stat-box admin-overview-card admin-overview-card--crops">
                      <div className="stat-num" style={{ color: "#F59E0B" }}>{stats.crops.total_supported}</div>
                      <div className="stat-label">Supported Crops</div>
                      <div className="stat-sub">Most: {stats.crops.most_cultivated}</div>
                    </div>
                  </div>

                  {/* Additional Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div className="admin-insight-card" style={{ background: "#FFF", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1B4D3E", marginBottom: 12 }}>User Category Breakdown</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Farmers:</span><strong>{stats.users.farmers}</strong></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Home Gardeners:</span><strong>{stats.users.home_gardeners}</strong></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Terrace Gardeners:</span><strong>{stats.users.terrace_gardeners}</strong></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Beginners:</span><strong>{stats.users.beginners}</strong></div>
                      </div>
                    </div>

                    <div className="admin-insight-card" style={{ background: "#FFF", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1B4D3E", marginBottom: 12 }}>Disease Reports Summary</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Total Reports:</span><strong>{stats.diseases.total}</strong></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Pending Review:</span><strong style={{ color: "#F59E0B" }}>{stats.diseases.pending}</strong></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Resolved:</span><strong style={{ color: "#10B981" }}>{stats.diseases.resolved}</strong></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Notifications Sent:</span><strong>{stats.system.total_notifications_sent}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 2: USER MANAGEMENT (FULL CRUD) */}
              {activeTab === "users" && (
                <div className="admin-user-directory-card" style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>Farmer Directory &amp; Account Control</h2>
                    {isSuperAdmin && (
                      <button onClick={openCreateUserForm} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <UserPlus size={16} /> Create User Account
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
                    <input
                      type="text"
                      placeholder="Search name, email, phone..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, minWidth: 220 }}
                    />
                    <select value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}>
                      <option value="All">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="banned">Banned Only</option>
                    </select>
                  </div>

                  <div className="admin-user-table" style={{ overflowX: "auto" }}>
                    <table style={{ width: "1000px", height: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", color: "#475569", fontWeight: 700 }}>
                          <th style={{ padding: 10 }}>Name</th>
                          <th style={{ padding: 10 }}>Email</th>
                          <th style={{ padding: 10 }}>Phone</th>
                          <th style={{ padding: 10 }}>Category</th>
                          <th style={{ padding: 10 }}>District</th>
                          <th style={{ padding: 10 }}>Status</th>
                          <th style={{ padding: 10, textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((u) => (
                          <tr key={u.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                            <td style={{ padding: 10, fontWeight: 700, color: "#1E293B" }}>{u.full_name}</td>
                            <td style={{ padding: 10, color: "#475569" }}>{u.email}</td>
                            <td style={{ padding: 10, color: "#475569" }}>{u.phone || "—"}</td>
                            <td style={{ padding: 10 }}>{u.farming_category || "Farmer"}</td>
                            <td style={{ padding: 10 }}>{u.district || "Vavuniya"}</td>
                            <td style={{ padding: 10 }}>
                              <span style={{ padding: "3px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: u.status === "banned" ? "#FEE2E2" : "#DCFCE7", color: u.status === "banned" ? "#991B1B" : "#15803D" }}>
                                {u.status === "banned" ? "Banned" : "Active"}
                              </span>
                            </td>
                            <td style={{ padding: 10, textAlign: "right" }}>
                              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                {isSuperAdmin && <>
                                  <button onClick={() => openEditUserForm(u)} title="Edit Profile" style={{ padding: 6, borderRadius: 6, border: "1px solid #CBD5E1", background: "#FFF" }}><Edit size={14} /></button>
                                  <button onClick={() => setUserToResetPass(u)} title="Reset Password" style={{ padding: 6, borderRadius: 6, border: "1px solid #F59E0B", background: "#FEF3C7", color: "#B45309" }}><Key size={14} /></button>
                                  {u.role !== "super_admin" && (
                                    <button onClick={() => handleToggleBanUser(u)} title={u.status === "banned" ? "Unban" : "Ban"} style={{ padding: "4px 8px", borderRadius: 6, border: u.status === "banned" ? "1px solid #10B981" : "1px solid #F59E0B", background: u.status === "banned" ? "#ECFDF5" : "#FEF3C7", color: u.status === "banned" ? "#047857" : "#B45309", fontSize: 12, fontWeight: 700 }}>
                                      {u.status === "banned" ? "Unban" : "Ban"}
                                    </button>
                                  )}
                                </>}
                                {isSuperAdmin && u.id !== user?.id && (
                                  <button onClick={() => setUserToDelete(u)} title="Delete User" style={{ padding: 6, borderRadius: 6, border: "1px solid #EF4444", background: "#FEE2E2", color: "#991B1B" }}><Trash2 size={14} /></button>
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

              {/* MODULE 3 & 4: CROP MANAGEMENT & LIFECYCLES */}
              {(activeTab === "crops" || activeTab === "lifecycles") && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>Crop Catalog &amp; 5 Growth Stages Configurator</h2>
                    <button onClick={openCreateCropForm} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Plus size={16} /> Add Crop Guide
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                    {guides.map((g) => (
                      <div key={g.id} style={{ background: "#F8FAFC", borderRadius: 14, padding: 18, border: "1px solid #E2E8F0" }}>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>{g.crop_name}</h3>
                        <div style={{ fontSize: 12, color: "#64748B", fontStyle: "italic", marginBottom: 8 }}>{g.variety}</div>
                        <div style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>Season: {g.recommended_season || "Yala & Maha"}</div>
                        <div style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>Watering: {g.water_requirements}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => openEditCropForm(g)} className="btn btn-outline" style={{ flex: 1, padding: "6px 10px", fontSize: 12 }}><Edit size={14} /> Edit Stages</button>
                          <button onClick={() => setCropToDelete(g)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #EF4444", background: "#FEE2E2", color: "#991B1B" }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 5: DISEASE CATALOG */}
              {activeTab === "diseases" && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>Agricultural Disease Knowledge Base</h2>
                    <button onClick={openCreateDiseaseForm} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={16} /> Add Disease Entry</button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                    {diseaseCatalog.map((d) => (
                      <div key={d.id} style={{ background: "#F8FAFC", borderRadius: 14, padding: 18, border: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#991B1B", margin: 0 }}>{d.disease_name}</h3>
                          <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{d.crop_name}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#475569", marginTop: 8, lineHeight: 1.4 }}>{d.symptoms}</p>
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button onClick={() => openEditDiseaseForm(d)} className="btn btn-outline" style={{ flex: 1, padding: 6, fontSize: 12 }}><Edit size={14} /> Edit</button>
                          <button onClick={() => handleDeleteDisease(d.id)} style={{ padding: 6, borderRadius: 8, border: "1px solid #EF4444", background: "#FEE2E2", color: "#991B1B" }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 6: FARMER DISEASE REPORTS REVIEW */}
              {activeTab === "reports" && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", marginBottom: 20 }}>Farmer AI Disease Diagnosis Uploads</h2>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", color: "#475569", fontWeight: 700 }}>
                          <th style={{ padding: 10 }}>Crop</th>
                          <th style={{ padding: 10 }}>Diagnosis Result</th>
                          <th style={{ padding: 10 }}>Confidence</th>
                          <th style={{ padding: 10 }}>Status</th>
                          <th style={{ padding: 10, textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {farmerReports.map((r) => (
                          <tr key={r.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                            <td style={{ padding: 10, fontWeight: 700 }}>{r.crop_name}</td>
                            <td style={{ padding: 10 }}>{r.diagnosis_result}</td>
                            <td style={{ padding: 10 }}>{Math.round((r.confidence_score || 0.92) * 100)}%</td>
                            <td style={{ padding: 10 }}>
                              <span style={{ padding: "3px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: r.status === "approved" ? "#DCFCE7" : r.status === "rejected" ? "#FEE2E2" : "#FEF3C7", color: r.status === "approved" ? "#15803D" : r.status === "rejected" ? "#991B1B" : "#B45309" }}>
                                {r.status || "resolved"}
                              </span>
                            </td>
                            <td style={{ padding: 10, textAlign: "right" }}>
                              <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                                <button onClick={() => handleUpdateReportStatus(r.id, "approved")} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #10B981", background: "#ECFDF5", color: "#047857", fontSize: 11, fontWeight: 700 }}>Approve</button>
                                <button onClick={() => handleUpdateReportStatus(r.id, "rejected")} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #EF4444", background: "#FEE2E2", color: "#991B1B", fontSize: 11, fontWeight: 700 }}>Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 7: ADMIN ACCOUNTS (SUPER ADMIN ONLY) */}
              {activeTab === "admins" && isSuperAdmin && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>System Administrators Directory</h2>
                    <button onClick={openCreateAdminModal} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}><UserPlus size={16} /> Add Administrator</button>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", color: "#475569", fontWeight: 700 }}>
                          <th style={{ padding: 10 }}>Name</th>
                          <th style={{ padding: 10 }}>Email</th>
                          <th style={{ padding: 10 }}>Role</th>
                          <th style={{ padding: 10, textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminAccounts.map((a) => (
                          <tr key={a.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                            <td style={{ padding: 10, fontWeight: 700 }}>{a.full_name}</td>
                            <td style={{ padding: 10 }}>{a.email}</td>
                            <td style={{ padding: 10 }}>
                              <span style={{ padding: "3px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: a.role === "super_admin" ? "#FEF3C7" : "#E0F2FE", color: a.role === "super_admin" ? "#B45309" : "#0369A1" }}>
                                {a.role === "super_admin" ? "👑 Super Admin" : "🛡️ Admin"}
                              </span>
                            </td>
                            <td style={{ padding: 10, textAlign: "right" }}>
                              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                <button onClick={() => openEditAdminModal(a)} style={{ padding: 6, borderRadius: 6, border: "1px solid #CBD5E1", background: "#FFF" }}><Edit size={14} /></button>
                                {a.id !== user?.id && (
                                  <button onClick={() => setAdminToDelete(a)} style={{ padding: 6, borderRadius: 6, border: "1px solid #EF4444", background: "#FEE2E2", color: "#991B1B" }}><Trash2 size={14} /></button>
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

              {/* MODULE 8: NOTIFICATIONS BROADCAST */}
              {activeTab === "notifications" && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>Broadcast System Notifications</h2>
                    <button onClick={() => setShowNoteModal(true)} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}><Send size={16} /> Broadcast Notification</button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {notifications.map((n) => (
                      <div key={n.id} style={{ background: "#F8FAFC", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <span style={{ fontWeight: 800, fontSize: 15, color: "#1B4D3E" }}>{n.title}</span>
                            <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{n.category}</span>
                            <span style={{ background: "#DCFCE7", color: "#15803D", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>Target: {n.target_type}</span>
                          </div>
                          <p style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>{n.message}</p>
                        </div>
                        <button onClick={() => handleDeleteNotification(n.id)} style={{ padding: 6, borderRadius: 6, border: "1px solid #EF4444", background: "#FEE2E2", color: "#991B1B" }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 9 & 10: WEATHER & ANALYTICS DATA EXPORTS */}
              {(activeTab === "weather" || activeTab === "analytics") && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", marginBottom: 16 }}>Reports &amp; One-Click CSV Exports</h2>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 20 }}>
                    <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/admin/export/users`} download className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                      <Download size={18} /> Export Users CSV
                    </a>
                    <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/admin/export/crops`} download className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                      <Download size={18} /> Export Crops CSV
                    </a>
                  </div>
                </div>
              )}

              {/* MODULE 11: USER FEEDBACK */}
              {activeTab === "feedback" && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", marginBottom: 20 }}>Farmer Feedback Inbox</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {feedbackItems.length > 0 ? (
                      feedbackItems.map((f) => (
                        <div key={f.id} style={{ background: "#F8FAFC", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>{f.name} ({f.email})</strong>
                            <span style={{ fontSize: 12, color: "#64748B" }}>{f.status}</span>
                          </div>
                          <div style={{ fontWeight: 700, marginTop: 4 }}>{f.subject}</div>
                          <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{f.message}</p>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "#64748B", textAlign: "center", padding: 24 }}>No user feedback items in inbox.</div>
                    )}
                  </div>
                </div>
              )}

              {/* MODULE 12: FAQ KNOWLEDGE BASE */}
              {activeTab === "faqs" && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>Agricultural FAQ Knowledge Base</h2>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {faqItems.map((f) => (
                      <div key={f.id} style={{ background: "#F8FAFC", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                        <div style={{ fontWeight: 700, color: "#1B4D3E" }}>Q: {f.question}</div>
                        <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>A: {f.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 13: SYSTEM SETTINGS (SUPER ADMIN ONLY) */}
              {activeTab === "settings" && isSuperAdmin && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", marginBottom: 20 }}>Platform System Settings</h2>
                  <form onSubmit={handleSaveSystemSettings}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                      <div>
                        <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Platform Name</label>
                        <input type="text" value={sysSettings.platform_name || "Valam Agricultural Platform"} onChange={(e) => setSysSettings({ ...sysSettings, platform_name: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Contact Email</label>
                        <input type="email" value={sysSettings.contact_email || "support@valam.lk"} onChange={(e) => setSysSettings({ ...sysSettings, contact_email: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}><Save size={16} /> Save Settings</button>
                  </form>
                </div>
              )}

              {/* MODULE 14: AUDIT ACTIVITY LOGS */}
              {activeTab === "logs" && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", marginBottom: 20 }}>Administrative Audit Activity Logs</h2>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", color: "#475569", fontWeight: 700 }}>
                          <th style={{ padding: 10 }}>Action</th>
                          <th style={{ padding: 10 }}>Performed By</th>
                          <th style={{ padding: 10 }}>Details</th>
                          <th style={{ padding: 10 }}>Date &amp; Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((l) => (
                          <tr key={l.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                            <td style={{ padding: 10 }}><span style={{ background: "#E0F2FE", color: "#0369A1", padding: "3px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{l.action}</span></td>
                            <td style={{ padding: 10, fontWeight: 700 }}>{l.performed_by}</td>
                            <td style={{ padding: 10, color: "#475569" }}>{l.details || "—"}</td>
                            <td style={{ padding: 10, color: "#64748B" }}>{l.created_at ? new Date(l.created_at).toLocaleString() : "Recent"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* --- MODALS --- */}
      {/* 1. Create/Edit User Modal */}
      {showUserModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 480, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>{editingUserId ? "Edit User Account" : "Create New User Account"}</h3>
              <button onClick={() => setShowUserModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Full Name</label>
                <input type="text" required value={uName} onChange={(e) => setUName(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Email</label>
                <input type="email" required value={uEmail} onChange={(e) => setUEmail(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>
              {!editingUserId && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Initial Password</label>
                  <input type="password" required value={uPassword} onChange={(e) => setUPassword(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-sun"><Save size={16} /> Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Reset Password Modal */}
      {userToResetPass && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 420, width: "100%" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: "0 0 12px" }}>Reset User Password</h3>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Enter new password for <strong>{userToResetPass.email}</strong>:</p>
            <form onSubmit={handleResetUserPasswordSubmit}>
              <input type="password" required minLength={6} placeholder="New password (min 6 chars)" value={newResetPassword} onChange={(e) => setNewResetPassword(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC", marginBottom: 16 }} />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setUserToResetPass(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-sun">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Broadcast Notification Modal */}
      {showNoteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 480, width: "100%" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: "0 0 16px" }}>Broadcast System Notification</h3>
            <form onSubmit={handleCreateNotification}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Title</label>
                <input type="text" required placeholder="e.g. Monsoon Rain Warning" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Message Content</label>
                <textarea rows={3} required placeholder="Notification text..." value={noteMsg} onChange={(e) => setNoteMsg(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowNoteModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-sun"><Send size={16} /> Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crop Add/Edit Modal */}
      {showAddCropModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 780, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>{editingGuideId ? "Edit Crop Lifecycle Config" : "Create New Crop Guide"}</h3>
              <button onClick={() => setShowAddCropModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCrop}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Crop Name</label><input type="text" required value={cropName} onChange={(e) => setCropName(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} /></div>
                <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Variety</label><input type="text" value={variety} onChange={(e) => setVariety(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} /></div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                <button type="button" onClick={() => setShowAddCropModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-sun"><Save size={16} /> Save Crop</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disease Entry Modal */}
      {showDiseaseModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 540, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>{editingDiseaseId ? "Edit Disease Entry" : "Add Disease to Catalog"}</h3>
              <button onClick={() => setShowDiseaseModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveDisease}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Disease Name</label><input type="text" required value={dName} onChange={(e) => setDName(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} /></div>
                <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Crop Name</label><input type="text" required value={dCrop} onChange={(e) => setDCrop(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} /></div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Symptoms</label>
                <textarea rows={2} required value={dSymptoms} onChange={(e) => setDSymptoms(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" onClick={() => setShowDiseaseModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-sun"><Save size={16} /> Save Disease</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Modal (Super Admin) */}
      {showAdminModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 480, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>{editingAdminId ? "Edit Admin Account" : "Create New Admin Account"}</h3>
              <button onClick={() => setShowAdminModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveAdmin}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Full Name</label>
                <input type="text" required value={adminName} onChange={(e) => setAdminName(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Email</label>
                <input type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Password</label>
                <input type="password" required={!editingAdminId} value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Role</label>
                <select value={adminRole} onChange={(e) => setAdminRole(e.target.value as any)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowAdminModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-sun"><Save size={16} /> Save Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AuthGuard>
  );
}
