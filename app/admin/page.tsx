
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { API_BASE_URL, ValamAPI } from "@/lib/api";
import type {
  ValamUser,
  CropGuide,
  CropStageAdvice,
  StageCompostAdvice,
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
  Info,
  Droplets,
  Calendar,
  Sparkles,
  Wand2,
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

const DEFAULT_STAGE_COMPOSTS: StageCompostAdvice[] = [
  {
    stage_name: "1. Basal / Land Preparation",
    days_range: "Days 0 - 15",
    compost_type: "Organic",
    recommended_compost: "Decomposed Cow Dung / Farmyard Manure (8-10 tons/acre) + 50kg Neem Cake",
    dosage: "8-10 tons / acre",
    application_method: "Incorporate into topsoil during primary ploughing and raised bed formation",
    water_tips: "Moisten soil lightly 2 days prior to direct seeding",
  },
  {
    stage_name: "2. Seedling / Vegetative Stage",
    days_range: "Days 16 - 35",
    compost_type: "Organic",
    recommended_compost: "Vermicompost top dressing + Jeevamrutham 3% foliar spray",
    dosage: "500 kg / acre vermicompost",
    application_method: "Side dressing along plant rows followed by light earthing up",
    water_tips: "Drip irrigation every 2 days (3.0 - 3.5 L/m²)",
  },
  {
    stage_name: "3. Flowering Stage",
    days_range: "Days 36 - 55",
    compost_type: "Organic",
    recommended_compost: "Sterilized Bone Meal + Wood Ash (rich in Phosphorus & Potassium)",
    dosage: "100 kg / acre",
    application_method: "Ring placement 10cm away from base stem",
    water_tips: "Consistent moisture; avoid water stress to prevent flower drop",
  },
  {
    stage_name: "4. Fruiting / Pod Development",
    days_range: "Days 56 - 80",
    compost_type: "Organic",
    recommended_compost: "Potassium-rich organic compost tea / Fermented fruit juice (FFJ)",
    dosage: "200 L liquid tea / acre",
    application_method: "Applied via drip fertigation or soil root drenching",
    water_tips: "Peak watering: 4.5 - 5.0 L/m² daily in dry season",
  },
  {
    stage_name: "5. Harvesting & Maturity",
    days_range: "Days 81 - 100+",
    compost_type: "Organic",
    recommended_compost: "Dry organic mulch maintenance (paddy straw / dried grass)",
    dosage: "2-3 inch mulch layer",
    application_method: "Surface spread across furrows",
    water_tips: "Reduce irrigation 3-4 days before picking for higher flavor concentration",
  },
];

const PRESET_BAN_REASONS = [
  "Spam, unauthorized advertisements, or fraudulent marketplace items",
  "Violation of platform agricultural community guidelines",
  "Repeated non-delivery or complaints on tools lending service",
  "Abusive language or harassment towards other community members",
  "Inaccurate or unsafe chemical/pesticide dosage postings",
  "Suspicious account activity or unverified credentials",
];

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<ValamUser | null>(null);
  const [activeTab, setActiveTab] = useState<ControlPanelTab>("overview");
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    const tabParam = searchParams?.get("tab") as ControlPanelTab | null;
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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

  // User Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | string | null>(null);
  const [userToDelete, setUserToDelete] = useState<ValamUser | null>(null);
  const [userToResetPass, setUserToResetPass] = useState<ValamUser | null>(null);
  const [newResetPassword, setNewResetPassword] = useState("");

  // Ban Modal
  const [userToBan, setUserToBan] = useState<ValamUser | null>(null);
  const [banReasonText, setBanReasonText] = useState("");

  // User Form fields
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPhone, setUPhone] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uCategory, setUCategory] = useState("Farmer");
  const [uDistrict, setUDistrict] = useState("Vavuniya");
  const [uDSDivision, setUDSDivision] = useState("Vavuniya Town");
  const [uGNDivision, setUGNDivision] = useState("");
  const [uLandSize, setULandSize] = useState("1.0");
  const [uLandUnit, setULandUnit] = useState("Acres");
  const [uIrrigation, setUIrrigation] = useState("Drip Irrigation");
  const [uFertilizer, setUFertilizer] = useState("Organic");
  const [uLanguage, setULanguage] = useState("en");
  const [uStatus, setUStatus] = useState("active");
  const [uBanReason, setUBanReason] = useState("");

  // 2. Crop & Lifecycle State
  const [guides, setGuides] = useState<CropGuide[]>([]);
  const [cropSearch, setCropSearch] = useState("");
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [editingGuideId, setEditingGuideId] = useState<number | null>(null);
  const [cropToDelete, setCropToDelete] = useState<CropGuide | null>(null);
  const [isSuggestingAgronomy, setIsSuggestingAgronomy] = useState(false);

  // Crop Form fields
  const [cropName, setCropName] = useState("Tomato");
  const [variety, setVariety] = useState("Thilina");
  const [season, setSeason] = useState("Yala & Maha");
  const [plantingMethod, setPlantingMethod] = useState("Direct Seeding");
  const [fertilizerType, setFertilizerType] = useState("Organic");
  const [waterReq, setWaterReq] = useState("3.5 - 4.5 L/m² daily");
  const [fertGuidance, setFertGuidance] = useState("Basal compost + Top dressing at vegetative and flowering stages");
  const [commonProblems, setCommonProblems] = useState("Bacterial Wilt, Early Blight, Whiteflies");
  const [basicSolutions, setBasicSolutions] = useState("Resistant varieties, 5% neem seed extract, balanced drip fertigation");
  const [stages, setStages] = useState<CropStageAdvice[]>([]);
  const [stageComposts, setStageComposts] = useState<StageCompostAdvice[]>(DEFAULT_STAGE_COMPOSTS);

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

  // 8. FAQ State
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);

  // 9. System Settings State (Super Admin Only)
  const [sysSettings, setSysSettings] = useState<Record<string, string>>({});

  // 10. Audit Activity Logs State
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [logPage, setLogPage] = useState(1);

  async function loadData() {
    try {
      setLoading(true);
      const u = await ValamAPI.me();
      setUser(u);

      if (u.role !== "admin" && u.role !== "super_admin") {
        router.replace("/dashboard");
        return;
      }

      const [statsRes, usersRes, guidesRes, diseasesRes, reportsRes, notesRes, feedbackRes, faqsRes, logsRes] =
        await Promise.allSettled([
          ValamAPI.getAdminStats(),
          ValamAPI.getAdminUsers({
            search: userSearch,
            category: userCategoryFilter,
            district: userDistrictFilter,
            status: userStatusFilter,
            page: userPage,
          }),
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
    setUDSDivision("Vavuniya Town");
    setUGNDivision("");
    setULandSize("1.0");
    setULandUnit("Acres");
    setUIrrigation("Drip Irrigation");
    setUFertilizer("Organic");
    setULanguage("en");
    setUStatus("active");
    setUBanReason("");
    setShowUserModal(true);
  }

  function openEditUserForm(u: ValamUser) {
    setEditingUserId(u.id);
    setUName(u.full_name || "");
    setUEmail(u.email || "");
    setUPhone(u.phone || "");
    setUPassword("");
    setUCategory(u.farming_category || "Farmer");
    setUDistrict(u.district || "Vavuniya");
    setUDSDivision(u.ds_division || "Vavuniya Town");
    setUGNDivision(u.gn_division || "");
    setULandSize(u.land_size ? String(u.land_size) : "1.0");
    setULandUnit(u.land_size_unit || "Acres");
    setUIrrigation(u.irrigation_preference || "Drip Irrigation");
    setUFertilizer(u.fertilizer_preference || "Organic");
    setULanguage(u.preferred_language || "en");
    setUStatus(u.status || "active");
    setUBanReason(u.ban_reason || "");
    setShowUserModal(true);
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingUserId) {
        await ValamAPI.updateAdminUserProfile(editingUserId, {
          full_name: uName,
          email: uEmail,
          phone: uPhone,
          farming_category: uCategory as any,
          district: uDistrict,
          ds_division: uDSDivision,
          gn_division: uGNDivision,
          land_size: parseFloat(uLandSize) || 1.0,
          land_size_unit: uLandUnit,
          irrigation_preference: uIrrigation,
          fertilizer_preference: uFertilizer,
          preferred_language: uLanguage,
          status: uStatus,
          ban_reason: uStatus === "banned" ? uBanReason : undefined,
          password: uPassword.trim() ? uPassword : undefined,
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

  function openBanUserModal(u: ValamUser) {
    setUserToBan(u);
    setBanReasonText(u.ban_reason || "");
  }

  async function handleConfirmBanUser(e: React.FormEvent) {
    e.preventDefault();
    if (!userToBan) return;
    try {
      const reason = banReasonText.trim() || "Account suspended by administrator for policy violations.";
      await ValamAPI.banUser(userToBan.id, "banned", reason);
      setStatusMsg({ type: "ok", text: `User ${userToBan.email} has been banned.` });
      setUsersList((prev) =>
        prev.map((item) => (item.id === userToBan.id ? { ...item, status: "banned", ban_reason: reason } : item))
      );
      setUserToBan(null);
      setBanReasonText("");
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to ban user." });
    }
  }

  async function handleUnbanUser(u: ValamUser) {
    try {
      await ValamAPI.banUser(u.id, "active");
      setStatusMsg({ type: "ok", text: `User ${u.email} unbanned & account reactivated!` });
      setUsersList((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, status: "active", ban_reason: undefined } : item))
      );
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to unban user." });
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

  // --- CROP & AGRONOMIC SUGGESTION HANDLERS ---
  function openCreateCropForm() {
    setEditingGuideId(null);
    setCropName("Tomato");
    setVariety("Thilina");
    setSeason("Yala & Maha");
    setPlantingMethod("Direct Seeding");
    setFertilizerType("Organic");
    setWaterReq("3.5 - 4.5 L/m² daily");
    setFertGuidance("Basal compost + Top dressing at vegetative and flowering stages");
    setCommonProblems("Bacterial Wilt, Early Blight, Whiteflies");
    setBasicSolutions("Resistant varieties, 5% neem seed extract, balanced drip fertigation");
    setStages(getDefaultStagesForCrop("Tomato"));
    setStageComposts(DEFAULT_STAGE_COMPOSTS);
    setShowAddCropModal(true);
  }

  function openEditCropForm(g: CropGuide) {
    setEditingGuideId(g.id);
    setCropName(g.crop_name);
    setVariety(g.variety || "");
    setSeason(g.recommended_season || "Yala & Maha");
    setPlantingMethod(g.planting_method || "Direct Seeding");
    setFertilizerType(g.fertilizer_type || "Organic");
    setWaterReq(g.water_requirements || "");
    setFertGuidance(g.fertilizer_guidance || "");
    setCommonProblems(g.common_problems || "");
    setBasicSolutions(g.basic_solutions || "");

    const existingStages =
      g.growth_stages && g.growth_stages.length > 0 ? g.growth_stages : getDefaultStagesForCrop(g.crop_name);
    setStages(existingStages);

    const existingComposts =
      g.stage_composts && g.stage_composts.length > 0 ? g.stage_composts : DEFAULT_STAGE_COMPOSTS;
    setStageComposts(existingComposts);

    setShowAddCropModal(true);
  }

  async function handleAutoFillAgronomyPlan() {
    if (!cropName.trim()) {
      setStatusMsg({ type: "error", text: "Please enter a Crop Name before auto-generating." });
      return;
    }
    setIsSuggestingAgronomy(true);
    try {
      const suggested = await ValamAPI.suggestAgronomyPlan({
        crop_name: cropName.trim(),
        variety: variety.trim() || "Standard",
        planting_method: plantingMethod,
        fertilizer_type: fertilizerType,
        season,
        district: "Vavuniya",
      });

      if (suggested) {
        if (suggested.water_requirements) setWaterReq(suggested.water_requirements);
        if (suggested.fertilizer_guidance) setFertGuidance(suggested.fertilizer_guidance);
        if (suggested.common_problems) setCommonProblems(suggested.common_problems);
        if (suggested.basic_solutions) setBasicSolutions(suggested.basic_solutions);
        if (suggested.growth_stages && suggested.growth_stages.length > 0) setStages(suggested.growth_stages);
        if (suggested.stage_composts && suggested.stage_composts.length > 0) setStageComposts(suggested.stage_composts);

        setStatusMsg({
          type: "ok",
          text: `✨ Auto-filled agronomy plan & 5-stage composts for ${cropName} (${plantingMethod}, ${fertilizerType})!`,
        });
      }
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to suggest agronomic plan.",
      });
    } finally {
      setIsSuggestingAgronomy(false);
    }
  }

  function handleStageCompostChange(index: number, field: keyof StageCompostAdvice, value: string) {
    setStageComposts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function handleAddCompostStage() {
    setStageComposts((prev) => [
      ...prev,
      {
        stage_name: `Stage ${prev.length + 1}`,
        days_range: "Days X - Y",
        compost_type: fertilizerType,
        recommended_compost: "Compost formulation",
        dosage: "Dosage per acre",
        application_method: "Soil incorporation or foliar spray",
        water_tips: "Standard watering schedule",
      },
    ]);
  }

  function handleRemoveCompostStage(index: number) {
    if (stageComposts.length <= 1) return;
    setStageComposts((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveCrop(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: Partial<CropGuide> = {
        crop_name: cropName,
        variety,
        recommended_season: season,
        planting_method: plantingMethod,
        fertilizer_type: fertilizerType,
        water_requirements: waterReq,
        fertilizer_guidance: fertGuidance,
        common_problems: commonProblems,
        basic_solutions: basicSolutions,
        growth_stages: stages,
        stage_composts: stageComposts,
      };

      if (editingGuideId) {
        await ValamAPI.updateCropGuide(editingGuideId, payload);
        setStatusMsg({ type: "ok", text: `Crop ${cropName} updated!` });
      } else {
        await ValamAPI.createCropGuide(payload);
        setStatusMsg({ type: "ok", text: `Crop ${cropName} created with stage compost guidance!` });
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
      setStatusMsg({ type: "ok", text: `Notification '${noteTitle}' broadcasted!` });
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

  // --- ADMIN ACCOUNTS (SUPER ADMIN) ---
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

  // --- SYSTEM SETTINGS ---
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
  const isAdminOrSuper = user?.role === "admin" || user?.role === "super_admin";

  return (
    <AuthGuard>
      <Navbar active="admin" pageTitle="Admin Portal" />

      {/* Admin Hero Section */}
      <section className="page-hero">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="crumb" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Valam Administration / Central Control Panel</span>
            </div>
            <h1>System Administration &amp; Control Dashboard</h1>
            <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 640 }}>
              Manage users, crop guides, disease reports, notifications, user feedback, audit activity, and system settings.
            </p>
          </div>
          <span
            style={{
              background: isSuperAdmin ? "#F59E0B" : "#10B981",
              color: "#FFF",
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {isSuperAdmin ? "👑 Super Admin" : "🛡️ Administrator"}: {user?.full_name}
          </span>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7", minHeight: "75vh", padding: "24px 0" }}>
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
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {statusMsg.type === "ok" ? <CheckCircle2 size={20} color="#166534" /> : <AlertTriangle size={20} color="#991B1B" />}
                <span>{statusMsg.text}</span>
              </div>
              <button
                onClick={() => setStatusMsg(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Main Active Module Container */}
          <main style={{ minHeight: 500 }}>
              {/* MODULE 1: REAL-TIME OVERVIEW DASHBOARD */}
              {activeTab === "overview" && stats && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>System Overview &amp; Live Metrics</h2>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    <div className="stat-box">
                      <div className="stat-num">{stats.users.total}</div>
                      <div className="stat-label">Total Users</div>
                      <div className="stat-sub">{stats.users.new_today} registered today</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-num" style={{ color: "#10B981" }}>
                        {stats.users.active}
                      </div>
                      <div className="stat-label">Active Users</div>
                      <div className="stat-sub">{stats.users.farmers} Farmers</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-num" style={{ color: "#EF4444" }}>
                        {stats.users.banned}
                      </div>
                      <div className="stat-label">Banned Users</div>
                      <div className="stat-sub">Suspended accounts</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-num" style={{ color: "#F59E0B" }}>
                        {stats.crops.total_supported}
                      </div>
                      <div className="stat-label">Supported Crops</div>
                      <div className="stat-sub">Most: {stats.crops.most_cultivated}</div>
                    </div>
                  </div>

                  <div className="grid-2col-responsive">
                    <div style={{ background: "#FFF", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1B4D3E", marginBottom: 12 }}>User Category Breakdown</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Farmers:</span>
                          <strong>{stats.users.farmers}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Home Gardeners:</span>
                          <strong>{stats.users.home_gardeners}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Terrace Gardeners:</span>
                          <strong>{stats.users.terrace_gardeners}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Beginners:</span>
                          <strong>{stats.users.beginners}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: "#FFF", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1B4D3E", marginBottom: 12 }}>Disease Reports Summary</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Total Reports:</span>
                          <strong>{stats.diseases.total}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Pending Review:</span>
                          <strong style={{ color: "#F59E0B" }}>{stats.diseases.pending}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Resolved:</span>
                          <strong style={{ color: "#10B981" }}>{stats.diseases.resolved}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Notifications Sent:</span>
                          <strong>{stats.system.total_notifications_sent}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 2: USER MANAGEMENT (FULL ACTION BUTTONS + BAN REASON) */}
              {activeTab === "users" && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>Farmer Directory &amp; Account Control</h2>
                      <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>Manage accounts, edit profile details, or ban suspended users with reasons.</p>
                    </div>
                    {isAdminOrSuper && (
                      <button onClick={openCreateUserForm} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <UserPlus size={16} /> Create User Account
                      </button>
                    )}
                  </div>

                  {/* Filters & Search */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
                      <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                      <input
                        type="text"
                        placeholder="Search name, email, phone..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                      />
                    </div>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                    >
                      <option value="All">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="banned">Banned Only</option>
                    </select>
                  </div>

                  {/* Users Table with Dedicated Action Buttons */}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", color: "#475569", fontWeight: 700 }}>
                          <th style={{ padding: "12px 10px" }}>Farmer / User</th>
                          <th style={{ padding: "12px 10px" }}>Contact</th>
                          <th style={{ padding: "12px 10px" }}>Category</th>
                          <th style={{ padding: "12px 10px" }}>Location</th>
                          <th style={{ padding: "12px 10px" }}>Status &amp; Ban Reason</th>
                          <th style={{ padding: "12px 10px", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.length > 0 ? (
                          usersList.map((u) => (
                            <tr key={u.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                              <td style={{ padding: "12px 10px" }}>
                                <div style={{ fontWeight: 700, color: "#1E293B" }}>{u.full_name}</div>
                                <div style={{ fontSize: 11, color: "#64748B" }}>ID: #{u.id} • {u.role}</div>
                              </td>
                              <td style={{ padding: "12px 10px" }}>
                                <div style={{ color: "#334155" }}>{u.email}</div>
                                <div style={{ fontSize: 11, color: "#64748B" }}>{u.phone || "No phone"}</div>
                              </td>
                              <td style={{ padding: "12px 10px" }}>
                                <span style={{ background: "#F1F5F9", padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#475569" }}>
                                  {u.farming_category || "Farmer"}
                                </span>
                              </td>
                              <td style={{ padding: "12px 10px" }}>
                                <div>{u.district || "Vavuniya"}</div>
                                <div style={{ fontSize: 11, color: "#64748B" }}>{u.ds_division || "—"}</div>
                              </td>
                              <td style={{ padding: "12px 10px" }}>
                                {u.status === "banned" ? (
                                  <div>
                                    <span
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "3px 8px",
                                        borderRadius: 10,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        background: "#FEE2E2",
                                        color: "#991B1B",
                                      }}
                                    >
                                      <Ban size={12} /> Banned
                                    </span>
                                    {u.ban_reason && (
                                      <div style={{ fontSize: 11, color: "#DC2626", marginTop: 4, maxWidth: 200, fontStyle: "italic" }}>
                                        Reason: {u.ban_reason}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      padding: "3px 8px",
                                      borderRadius: 10,
                                      fontSize: 11,
                                      fontWeight: 700,
                                      background: "#DCFCE7",
                                      color: "#15803D",
                                    }}
                                  >
                                    <UserCheck size={12} /> Active
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: "12px 10px", textAlign: "right" }}>
                                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                                  {/* Edit Button */}
                                  <button
                                    type="button"
                                    onClick={() => openEditUserForm(u)}
                                    title="Edit User Details"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      padding: "5px 9px",
                                      borderRadius: 6,
                                      border: "1px solid #CBD5E1",
                                      background: "#FFF",
                                      fontSize: 12,
                                      fontWeight: 600,
                                      color: "#1E293B",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Edit size={13} color="#0284C7" /> Edit
                                  </button>

                                  {/* Ban / Unban Button */}
                                  {u.role !== "super_admin" && (
                                    u.status === "banned" ? (
                                      <button
                                        type="button"
                                        onClick={() => handleUnbanUser(u)}
                                        title="Unban this user"
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 4,
                                          padding: "5px 9px",
                                          borderRadius: 6,
                                          border: "1px solid #10B981",
                                          background: "#ECFDF5",
                                          color: "#047857",
                                          fontSize: 12,
                                          fontWeight: 700,
                                          cursor: "pointer",
                                        }}
                                      >
                                        <UserCheck size={13} /> Unban
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => openBanUserModal(u)}
                                        title="Ban user with reason"
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 4,
                                          padding: "5px 9px",
                                          borderRadius: 6,
                                          border: "1px solid #F59E0B",
                                          background: "#FEF3C7",
                                          color: "#B45309",
                                          fontSize: 12,
                                          fontWeight: 700,
                                          cursor: "pointer",
                                        }}
                                      >
                                        <Ban size={13} /> Ban
                                      </button>
                                    )
                                  )}

                                  {/* Reset Password Button */}
                                  <button
                                    type="button"
                                    onClick={() => setUserToResetPass(u)}
                                    title="Reset Password"
                                    style={{
                                      padding: "5px 8px",
                                      borderRadius: 6,
                                      border: "1px solid #CBD5E1",
                                      background: "#F8FAFC",
                                      color: "#64748B",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Key size={13} />
                                  </button>

                                  {/* Delete Button */}
                                  {u.id !== user?.id && u.role !== "super_admin" && (
                                    <button
                                      type="button"
                                      onClick={() => setUserToDelete(u)}
                                      title="Permanently Delete User"
                                      style={{
                                        padding: "5px 8px",
                                        borderRadius: 6,
                                        border: "1px solid #FCA5A5",
                                        background: "#FEE2E2",
                                        color: "#991B1B",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#64748B" }}>
                              No users match the search criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 3 & 4: CROP MANAGEMENT & STAGE-BY-STAGE COMPOST CONFIGURATOR */}
              {(activeTab === "crops" || activeTab === "lifecycles") && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>Crop Database &amp; Stage-by-Stage Compost Advisory</h2>
                      <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>Configure planting methods (Direct Seeding/Transplanting) and organic/non-organic compost per growth stage.</p>
                    </div>
                    <button onClick={openCreateCropForm} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Plus size={16} /> Add New Crop Guide
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
                    {guides.map((g) => (
                      <div
                        key={g.id}
                        style={{
                          background: "#F8FAFC",
                          borderRadius: 14,
                          padding: 18,
                          border: "1px solid #E2E8F0",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>{g.crop_name}</h3>
                              <div style={{ fontSize: 12, color: "#64748B", fontStyle: "italic", marginBottom: 6 }}>Variety: {g.variety || "Local standard"}</div>
                            </div>
                            <span
                              style={{
                                background: g.fertilizer_type === "Organic" ? "#DCFCE7" : "#FEF3C7",
                                color: g.fertilizer_type === "Organic" ? "#15803D" : "#B45309",
                                padding: "2px 8px",
                                borderRadius: 10,
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              🌱 {g.fertilizer_type || "Organic"}
                            </span>
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" }}>
                            <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                              Method: {g.planting_method || "Direct Seeding"}
                            </span>
                            <span style={{ background: "#F1F5F9", color: "#475569", padding: "2px 8px", borderRadius: 8, fontSize: 11 }}>
                              Season: {g.recommended_season || "Yala & Maha"}
                            </span>
                          </div>

                          <div style={{ fontSize: 13, color: "#475569", margin: "6px 0" }}>
                            <Droplets size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4, color: "#0284C7" }} />
                            Watering: {g.water_requirements || "3.5 - 4.5 L/m²"}
                          </div>

                          {g.stage_composts && g.stage_composts.length > 0 && (
                            <div style={{ background: "#FFFFFF", borderRadius: 8, padding: 8, border: "1px solid #E2E8F0", marginTop: 8, fontSize: 12 }}>
                              <strong style={{ color: "#1B4D3E" }}>Stage Compost Guidance ({g.stage_composts.length} stages):</strong>
                              <ul style={{ margin: "4px 0 0", paddingLeft: 16, color: "#475569", fontSize: 11 }}>
                                {g.stage_composts.slice(0, 3).map((sc, i) => (
                                  <li key={i}>
                                    <strong>{sc.stage_name}:</strong> {sc.recommended_compost}
                                  </li>
                                ))}
                                {g.stage_composts.length > 3 && <li>+{g.stage_composts.length - 3} more stages...</li>}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                          <button
                            type="button"
                            onClick={() => openEditCropForm(g)}
                            className="btn btn-outline"
                            style={{ flex: 1, padding: "6px 10px", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                          >
                            <Edit size={14} /> Edit Stages &amp; Compost
                          </button>
                          <button
                            type="button"
                            onClick={() => setCropToDelete(g)}
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #EF4444", background: "#FEE2E2", color: "#991B1B", cursor: "pointer" }}
                          >
                            <Trash2 size={14} />
                          </button>
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
                    <button onClick={openCreateDiseaseForm} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Plus size={16} /> Add Disease Entry
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                    {diseaseCatalog.map((d) => (
                      <div key={d.id} style={{ background: "#F8FAFC", borderRadius: 14, padding: 18, border: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#991B1B", margin: 0 }}>{d.disease_name}</h3>
                          <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                            {d.crop_name}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: "#475569", marginTop: 8, lineHeight: 1.4 }}>{d.symptoms}</p>
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button onClick={() => openEditDiseaseForm(d)} className="btn btn-outline" style={{ flex: 1, padding: 6, fontSize: 12 }}>
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDisease(d.id)}
                            style={{ padding: 6, borderRadius: 8, border: "1px solid #EF4444", background: "#FEE2E2", color: "#991B1B", cursor: "pointer" }}
                          >
                            <Trash2 size={14} />
                          </button>
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
                              <span
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: 10,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: r.status === "approved" ? "#DCFCE7" : r.status === "rejected" ? "#FEE2E2" : "#FEF3C7",
                                  color: r.status === "approved" ? "#15803D" : r.status === "rejected" ? "#991B1B" : "#B45309",
                                }}
                              >
                                {r.status || "resolved"}
                              </span>
                            </td>
                            <td style={{ padding: 10, textAlign: "right" }}>
                              <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                                <button
                                  onClick={() => ValamAPI.updateFarmerDiseaseReport(r.id, { status: "approved" }).then(loadData)}
                                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #10B981", background: "#ECFDF5", color: "#047857", fontSize: 11, fontWeight: 700 }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => ValamAPI.updateFarmerDiseaseReport(r.id, { status: "rejected" }).then(loadData)}
                                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #EF4444", background: "#FEE2E2", color: "#991B1B", fontSize: 11, fontWeight: 700 }}
                                >
                                  Reject
                                </button>
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
                    <button onClick={openCreateAdminModal} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <UserPlus size={16} /> Add Administrator
                    </button>
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
                              <span
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: 10,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: a.role === "super_admin" ? "#FEF3C7" : "#E0F2FE",
                                  color: a.role === "super_admin" ? "#B45309" : "#0369A1",
                                }}
                              >
                                {a.role === "super_admin" ? "👑 Super Admin" : "🛡️ Admin"}
                              </span>
                            </td>
                            <td style={{ padding: 10, textAlign: "right" }}>
                              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                <button onClick={() => openEditAdminModal(a)} style={{ padding: 6, borderRadius: 6, border: "1px solid #CBD5E1", background: "#FFF" }}>
                                  <Edit size={14} />
                                </button>
                                {a.id !== user?.id && (
                                  <button onClick={() => setAdminToDelete(a)} style={{ padding: 6, borderRadius: 6, border: "1px solid #EF4444", background: "#FEE2E2", color: "#991B1B" }}>
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

              {/* MODULE 8: NOTIFICATIONS BROADCAST */}
              {activeTab === "notifications" && (
                <div style={{ background: "#FFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: 0 }}>Broadcast System Notifications</h2>
                    <button onClick={() => setShowNoteModal(true)} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Send size={16} /> Broadcast Notification
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          background: "#F8FAFC",
                          padding: 16,
                          borderRadius: 12,
                          border: "1px solid #E2E8F0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 800, fontSize: 15, color: "#1B4D3E" }}>{n.title}</span>
                            <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{n.category}</span>
                            <span style={{ background: "#DCFCE7", color: "#15803D", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                              Target: {n.target_type}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>{n.message}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteNotification(n.id)}
                          style={{ padding: 6, borderRadius: 6, border: "1px solid #EF4444", background: "#FEE2E2", color: "#991B1B", cursor: "pointer" }}
                        >
                          <Trash2 size={14} />
                        </button>
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
                    <a
                      href={`${API_BASE_URL}/admin/export/users`}
                      download
                      className="btn btn-sun"
                      style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                    >
                      <Download size={18} /> Export Users CSV
                    </a>
                    <a
                      href={`${API_BASE_URL}/admin/export/crops`}
                      download
                      className="btn btn-outline"
                      style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                    >
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
                            <strong>
                              {f.name} ({f.email})
                            </strong>
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
                        <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#334155", marginBottom: 4 }}>Platform Name</label>
                        <input
                          type="text"
                          value={sysSettings.platform_name || "Valam Agricultural Platform"}
                          onChange={(e) => setSysSettings({ ...sysSettings, platform_name: e.target.value })}
                          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#334155", marginBottom: 4 }}>Contact Email</label>
                        <input
                          type="email"
                          value={sysSettings.contact_email || "support@valam.lk"}
                          onChange={(e) => setSysSettings({ ...sysSettings, contact_email: e.target.value })}
                          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Save size={16} /> Save Settings
                    </button>
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
                            <td style={{ padding: 10 }}>
                              <span style={{ background: "#E0F2FE", color: "#0369A1", padding: "3px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{l.action}</span>
                            </td>
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
            </main>
        </div>
      </section>
      <Footer />

      {/* ========================================================= */}
      {/* MODALS SECTION */}
      {/* ========================================================= */}

      {/* 1. Ban User Confirmation Modal with Reason */}
      {userToBan && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 520, width: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "#FEE2E2", color: "#DC2626", padding: 10, borderRadius: 12 }}>
                  <Ban size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#991B1B", margin: 0 }}>Suspend / Ban User Account</h3>
                  <div style={{ fontSize: 13, color: "#64748B" }}>{userToBan.full_name} ({userToBan.email})</div>
                </div>
              </div>
              <button type="button" onClick={() => setUserToBan(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, marginBottom: 14 }}>
              When this farmer attempts to log in, their access will be blocked and they will see the <strong>exact suspension reason</strong> provided below:
            </p>

            {/* Quick preset reason pills */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                💡 Select or Click a Common Reason:
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {PRESET_BAN_REASONS.map((pr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBanReasonText(pr)}
                    style={{
                      background: banReasonText === pr ? "#FEE2E2" : "#F1F5F9",
                      border: banReasonText === pr ? "1px solid #DC2626" : "1px solid #E2E8F0",
                      color: banReasonText === pr ? "#991B1B" : "#475569",
                      borderRadius: 14,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleConfirmBanUser} noValidate>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Ban Reason Details (Required)
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this account is being suspended..."
                  value={banReasonText}
                  onChange={(e) => setBanReasonText(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setUserToBan(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "none",
                    background: "#DC2626",
                    color: "#FFF",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Ban size={16} /> Confirm &amp; Ban User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Create / Edit User Modal */}
      {showUserModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 640, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>
                {editingUserId ? "Edit Farmer Account Profile" : "Create New Farmer Account"}
              </h3>
              <button type="button" onClick={() => setShowUserModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} noValidate>
              <div className="grid-2col-responsive" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Full Name *</label>
                  <input type="text" value={uName} onChange={(e) => setUName(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Email Address *</label>
                  <input type="email" value={uEmail} onChange={(e) => setUEmail(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
                </div>
              </div>

              <div className="grid-2col-responsive" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Phone Number</label>
                  <input type="text" value={uPhone} onChange={(e) => setUPhone(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Farming Category</label>
                  <select value={uCategory} onChange={(e) => setUCategory(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }}>
                    <option value="Farmer">Farmer (Commercial / Smallholder)</option>
                    <option value="Home Gardener">Home Gardener</option>
                    <option value="Terrace Gardener">Terrace Gardener</option>
                    <option value="Beginner">Beginner</option>
                  </select>
                </div>
              </div>

              <div className="grid-2col-responsive" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>District</label>
                  <input type="text" value={uDistrict} onChange={(e) => setUDistrict(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>DS Division / ASC</label>
                  <input type="text" value={uDSDivision} onChange={(e) => setUDSDivision(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
                </div>
              </div>

              <div className="grid-2col-responsive" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Land Size &amp; Unit</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input type="number" step="0.1" value={uLandSize} onChange={(e) => setULandSize(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
                    <select value={uLandUnit} onChange={(e) => setULandUnit(e.target.value)} style={{ width: 110, padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }}>
                      <option value="Acres">Acres</option>
                      <option value="Perches">Perches</option>
                      <option value="Hectares">Hectares</option>
                      <option value="Square Feet">Sq Ft</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Irrigation &amp; Fertilizer</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <select value={uIrrigation} onChange={(e) => setUIrrigation(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }}>
                      <option value="Drip Irrigation">Drip</option>
                      <option value="Sprinkler Irrigation">Sprinkler</option>
                      <option value="Manual Watering">Manual</option>
                    </select>
                    <select value={uFertilizer} onChange={(e) => setUFertilizer(e.target.value)} style={{ width: 110, padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }}>
                      <option value="Organic">Organic</option>
                      <option value="Chemical">Chemical</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid-2col-responsive" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Account Status</label>
                  <select value={uStatus} onChange={(e) => setUStatus(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }}>
                    <option value="active">Active</option>
                    <option value="banned">Banned / Suspended</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                    {editingUserId ? "Set New Password (optional)" : "Initial Password *"}
                  </label>
                  <input
                    type="password"
                    placeholder={editingUserId ? "Leave empty to keep current" : "Min 6 characters"}
                    value={uPassword}
                    onChange={(e) => setUPassword(e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }}
                  />
                </div>
              </div>

              {uStatus === "banned" && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#DC2626", marginBottom: 4 }}>
                    Ban Reason (Shown to farmer on login)
                  </label>
                  <input
                    type="text"
                    placeholder="Reason for suspension..."
                    value={uBanReason}
                    onChange={(e) => setUBanReason(e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #F87171", fontSize: 13 }}
                  />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-sun">
                  <Save size={16} /> {editingUserId ? "Update Profile" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Reset Password Modal */}
      {userToResetPass && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 420, width: "100%" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: "0 0 12px" }}>Reset User Password</h3>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>
              Enter new password for <strong>{userToResetPass.email}</strong>:
            </p>
            <form onSubmit={handleResetUserPasswordSubmit} noValidate>
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newResetPassword}
                onChange={(e) => setNewResetPassword(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, marginBottom: 16 }}
              />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setUserToResetPass(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-sun">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Modal */}
      {userToDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 440, width: "100%" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#991B1B", margin: "0 0 12px" }}>Permanently Delete User?</h3>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>
              Are you sure you want to delete <strong>{userToDelete.full_name}</strong> ({userToDelete.email})? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setUserToDelete(null)} className="btn btn-outline">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#DC2626", color: "#FFF", fontWeight: 700, cursor: "pointer" }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add / Edit Crop Modal with Harmonious Consistent Fonts & Styling */}
      {showAddCropModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 880, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>
                  {editingGuideId ? "Edit Crop & Stage Compost Advisory" : "Add New Crop Guide with Stage Compost"}
                </h3>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                  Define planting method, fertilizer type, and detailed compost guidance for every growth stage.
                </div>
              </div>
              <button type="button" onClick={() => setShowAddCropModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCrop}>
              {/* Section 1: Basic Plant & Cultivation Info (Styled exactly identical to Section 2) */}
              <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, border: "1px solid #CBD5E1", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>
                      🌱 1. Plant &amp; Cultivation Specifications
                    </h4>
                    <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>
                      Specify crop botanical name, variety, planting method, and seasonal water requirements.
                    </p>
                  </div>

                  {/* AI & Agricultural API Auto-Fill Button */}
                  <button
                    type="button"
                    disabled={isSuggestingAgronomy}
                    onClick={handleAutoFillAgronomyPlan}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 10,
                      border: "1px solid #10B981",
                      background: "linear-gradient(135deg, #10B981, #059669)",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: isSuggestingAgronomy ? "not-allowed" : "pointer",
                      boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
                    }}
                  >
                    {isSuggestingAgronomy ? (
                      <>
                        <RefreshCw size={14} className="spin" /> Generating Scientific Plan...
                      </>
                    ) : (
                      <>
                        <Wand2 size={14} /> ✨ Auto-Fill with Agri-API &amp; AI
                      </>
                    )}
                  </button>
                </div>

                <div
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 10,
                    padding: 12,
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                        Plant / Crop Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tomato, Chilli, Maize, Paddy, Brinjal"
                        value={cropName}
                        onChange={(e) => setCropName(e.target.value)}
                        style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #CCC", fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                        Variety
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Thilina, MI-2, Badulla Red, Ruwan"
                        value={variety}
                        onChange={(e) => setVariety(e.target.value)}
                        style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #CCC", fontSize: 12 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                        Planting Method *
                      </label>
                      <select
                        value={plantingMethod}
                        onChange={(e) => setPlantingMethod(e.target.value)}
                        style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #CCC", fontSize: 12, background: "#FFF" }}
                      >
                        <option value="Direct Seeding">Direct Seeding</option>
                        <option value="Transplanting">Transplanting (Nursery Raised)</option>
                        <option value="Broadcasting">Broadcasting</option>
                        <option value="Stem Cuttings">Stem Cuttings / Sets</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                        Compost / Fertilizer Type *
                      </label>
                      <select
                        value={fertilizerType}
                        onChange={(e) => setFertilizerType(e.target.value)}
                        style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #CCC", fontSize: 12, background: "#FFF" }}
                      >
                        <option value="Organic">Organic (Cow Dung, Vermicompost, Neem)</option>
                        <option value="Non-Organic / Chemical">Non-Organic / Chemical (NPK, Urea, TSP)</option>
                        <option value="Integrated">Integrated / Combined</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                        Recommended Season
                      </label>
                      <select
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #CCC", fontSize: 12, background: "#FFF" }}
                      >
                        <option value="Yala & Maha">Yala &amp; Maha (Both)</option>
                        <option value="Yala (Dry Season)">Yala (Dry Season)</option>
                        <option value="Maha (Wet Season)">Maha (Wet Season)</option>
                        <option value="Year-round">Year-round</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                        Water Requirements
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 3.5 - 4.5 L/m² daily"
                        value={waterReq}
                        onChange={(e) => setWaterReq(e.target.value)}
                        style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #CCC", fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                        General Fertilizer Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Basal compost + Top dressing at vegetative stage"
                        value={fertGuidance}
                        onChange={(e) => setFertGuidance(e.target.value)}
                        style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #CCC", fontSize: 12 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Stage-by-Stage Compost Advisory Configurator */}
              <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, border: "1px solid #CBD5E1", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>
                      📋 2. Stage-by-Stage Compost &amp; Nutrient Dosing
                    </h4>
                    <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>
                      Provide exact compost recipe, dosage (kg/acre), and application method for each crop stage.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCompostStage}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #10B981",
                      background: "#ECFDF5",
                      color: "#047857",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={14} /> Add Stage
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {stageComposts.map((sc, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#F8FAFC",
                        borderRadius: 10,
                        padding: 12,
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 200 }}>
                          <span style={{ background: "#1B4D3E", color: "#FFF", width: 22, height: 22, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={sc.stage_name}
                            onChange={(e) => handleStageCompostChange(index, "stage_name", e.target.value)}
                            style={{ fontWeight: 700, fontSize: 12, border: "1px solid #CBD5E1", borderRadius: 6, padding: "4px 8px", flex: 2, minWidth: 120 }}
                          />
                          <input
                            type="text"
                            placeholder="e.g. Days 0-15"
                            value={sc.days_range || ""}
                            onChange={(e) => handleStageCompostChange(index, "days_range", e.target.value)}
                            style={{ fontSize: 12, border: "1px solid #CBD5E1", borderRadius: 6, padding: "4px 8px", flex: 1, minWidth: 90 }}
                          />
                        </div>
                        {stageComposts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCompostStage(index)}
                            style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 12 }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8, marginBottom: 8 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                            Recommended Compost / Fertilizer Formulation
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Decomposed Farmyard Manure + Neem Cake"
                            value={sc.recommended_compost}
                            onChange={(e) => handleStageCompostChange(index, "recommended_compost", e.target.value)}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #CCC", fontSize: 12 }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                            Dosage (Rate / Acre)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 8-10 tons / acre"
                            value={sc.dosage}
                            onChange={(e) => handleStageCompostChange(index, "dosage", e.target.value)}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #CCC", fontSize: 12 }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                            Application Method
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Broadcast & incorporate into soil / side dress"
                            value={sc.application_method}
                            onChange={(e) => handleStageCompostChange(index, "application_method", e.target.value)}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #CCC", fontSize: 12 }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
                            Water &amp; Moisture Advice
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Light watering right after application"
                            value={sc.water_tips || ""}
                            onChange={(e) => handleStageCompostChange(index, "water_tips", e.target.value)}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #CCC", fontSize: 12 }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                <button type="button" onClick={() => setShowAddCropModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-sun">
                  <Save size={16} /> Save Crop Guide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Broadcast Notification Modal */}
      {showNoteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 480, width: "100%" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: "0 0 16px" }}>Broadcast System Notification</h3>
            <form onSubmit={handleCreateNotification} noValidate>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Title</label>
                <input
                  type="text"
                  placeholder="e.g. Monsoon Rain Warning"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Message Content</label>
                <textarea
                  rows={3}
                  placeholder="Notification text..."
                  value={noteMsg}
                  onChange={(e) => setNoteMsg(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowNoteModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-sun">
                  <Send size={16} /> Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Disease Entry Modal */}
      {showDiseaseModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 540, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>
                {editingDiseaseId ? "Edit Disease Entry" : "Add Disease to Catalog"}
              </h3>
              <button type="button" onClick={() => setShowDiseaseModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveDisease}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Disease Name</label>
                  <input type="text" required value={dName} onChange={(e) => setDName(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Crop Name</label>
                  <input type="text" required value={dCrop} onChange={(e) => setDCrop(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Symptoms</label>
                <textarea rows={2} required value={dSymptoms} onChange={(e) => setDSymptoms(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" onClick={() => setShowDiseaseModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-sun">
                  <Save size={16} /> Save Disease
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Admin Account Modal (Super Admin) */}
      {showAdminModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFF", borderRadius: 20, padding: 28, maxWidth: 480, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1B4D3E", margin: 0 }}>
                {editingAdminId ? "Edit Admin Account" : "Create New Admin Account"}
              </h3>
              <button type="button" onClick={() => setShowAdminModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAdmin}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Full Name</label>
                <input type="text" required value={adminName} onChange={(e) => setAdminName(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Email</label>
                <input type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Password</label>
                <input
                  type="password"
                  required={!editingAdminId}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Role</label>
                <select value={adminRole} onChange={(e) => setAdminRole(e.target.value as any)} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 13 }}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowAdminModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-sun">
                  <Save size={16} /> Save Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#F1F5F9" }}>
          <div style={{ color: "#475569", fontWeight: 600 }}>Loading Valam Administration System...</div>
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
