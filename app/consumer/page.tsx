"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { ProduceListing, BargainOffer, ValamUser } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedCropName, getLocalizedDistrict } from "@/lib/lifecycle";
import {
  ShoppingBag,
  Tag,
  Search,
  SlidersHorizontal,
  MessageSquare,
  Sprout,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  TrendingDown,
  X,
  ArrowRight,
  Phone,
  RefreshCcw,
} from "lucide-react";

function ConsumerPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();

  const [user, setUser] = useState<ValamUser | null>(null);
  const [activeTab, setActiveTab] = useState<"market" | "bargains">("market");
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [myOffers, setMyOffers] = useState<BargainOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search and Filter States
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [organicOnly, setOrganicOnly] = useState(false);

  // Bargain Modal States
  const [selectedListing, setSelectedListing] = useState<ProduceListing | null>(null);
  const [bargainQty, setBargainQty] = useState<number | "">(10);
  const [bargainPrice, setBargainPrice] = useState<number | "">(150);
  const [bargainNote, setBargainNote] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [bargainStatus, setBargainStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "bargains" || tabParam === "deals") {
      setActiveTab("bargains");
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      const u = await ValamAPI.me();
      setUser(u);

      const [listingsRes, offersRes] = await Promise.allSettled([
        ValamAPI.getProduceListings({
          search: search.trim() || undefined,
          district: selectedDistrict !== "All" ? selectedDistrict : undefined,
          is_organic: organicOnly ? true : undefined,
          status: "active",
        }),
        ValamAPI.getMyBargainOffers(),
      ]);

      if (listingsRes.status === "fulfilled") {
        setListings(listingsRes.value.items || []);
      }
      if (offersRes.status === "fulfilled") {
        setMyOffers(offersRes.value || []);
      }
    } catch (err) {
      console.error("Error loading consumer portal data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDistrict, organicOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openBargainModal = (listing: ProduceListing) => {
    setSelectedListing(listing);
    setBargainQty(Math.min(10, listing.available_quantity_kg));
    setBargainPrice(listing.asking_price_per_kg * 0.9);
    setBargainNote("");
    setBargainStatus(null);
  };

  const submitBargainOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !bargainQty || !bargainPrice) return;

    setSubmittingOffer(true);
    setBargainStatus(null);

    try {
      await ValamAPI.createBargainOffer(selectedListing.id, {
        quantity_kg: Number(bargainQty),
        offered_price_per_kg: Number(bargainPrice),
        buyer_message: bargainNote.trim() || undefined,
      });

      setBargainStatus({ type: "ok", text: "Bargain offer submitted to farmer!" });
      setTimeout(() => {
        setSelectedListing(null);
        setActiveTab("bargains");
        loadData();
      }, 1000);
    } catch (err) {
      setBargainStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to submit bargain offer.",
      });
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleAcceptCounter = async (offerId: number) => {
    try {
      await ValamAPI.acceptCounterOffer(offerId);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to accept counter offer.");
    }
  };

  const handleStartChat = (farmerId: number, listingId?: number) => {
    router.push(`/chat?partner_id=${farmerId}${listingId ? `&listing_id=${listingId}` : ""}`);
  };

  const totalCalculated = (typeof bargainQty === "number" && typeof bargainPrice === "number")
    ? (bargainQty * bargainPrice).toFixed(2)
    : "0.00";

  const originalTotal = (selectedListing && typeof bargainQty === "number")
    ? (bargainQty * selectedListing.asking_price_per_kg).toFixed(2)
    : "0.00";

  const savings = (selectedListing && typeof bargainQty === "number" && typeof bargainPrice === "number")
    ? ((selectedListing.asking_price_per_kg - bargainPrice) * bargainQty).toFixed(2)
    : "0.00";

  return (
    <AuthGuard>
      <Navbar active="marketplace" pageTitle={t("consumerPortalTitle")} />

      {/* Consumer Portal Hero Banner */}
      <section className="page-hero" style={{ padding: "32px 0", background: "linear-gradient(135deg, #0F766E 0%, #115E59 100%)" }}>
        <div className="container">
          <div className="crumb" style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)", color: "#99F6E4" }}>
            {t("consumerPortalSub")}
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", lineHeight: 1.2, marginTop: 4, color: "#FFFFFF" }}>
            {t("welcomeConsumer")}, {user?.full_name || "Buyer"}!
          </h1>
          <p style={{ marginTop: 8, color: "#CCFBF1", fontSize: "clamp(0.88rem, 2vw, 1rem)", lineHeight: 1.4 }}>
            📍 {getLocalizedDistrict(user?.district, language)} · {user?.delivery_address || "Northern Province"}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "#F8FAFC", paddingTop: 24, minHeight: "75vh" }}>
        <div className="container">

          {/* Navigation Tabs Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 24,
              borderBottom: "1px solid #E2E8F0",
              paddingBottom: 12,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setActiveTab("market")}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: activeTab === "market" ? "2px solid #0F766E" : "1px solid #CBD5E1",
                  background: activeTab === "market" ? "#F0FDFA" : "#FFFFFF",
                  color: activeTab === "market" ? "#0F766E" : "#475569",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.15s ease",
                }}
              >
                <ShoppingBag size={18} />
                {t("freshProduce")} ({listings.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("bargains")}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: activeTab === "bargains" ? "2px solid #0F766E" : "1px solid #CBD5E1",
                  background: activeTab === "bargains" ? "#F0FDFA" : "#FFFFFF",
                  color: activeTab === "bargains" ? "#0F766E" : "#475569",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.15s ease",
                }}
              >
                <Tag size={18} />
                {t("myBargains")} ({myOffers.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                loadData();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid #CBD5E1",
                background: "#FFFFFF",
                color: "#475569",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RefreshCcw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* TAB 1: FRESH PRODUCE CLOUD MARKET */}
          {activeTab === "market" && (
            <>
              {/* Search & Filter Bar */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 24,
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, flex: 1, minWidth: 260 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("filterByCrop")}
                      style={{
                        width: "100%",
                        padding: "10px 14px 10px 42px",
                        borderRadius: 10,
                        border: "1px solid #CBD5E1",
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      background: "#0F766E",
                      color: "#FFF",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {t("search")}
                  </button>
                </form>

                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={16} color="#0F766E" />
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      style={{
                        padding: "9px 14px",
                        borderRadius: 10,
                        border: "1px solid #CBD5E1",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      <option value="All">{t("allDistricts")}</option>
                      <option value="Vavuniya">Vavuniya</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Kilinochchi">Kilinochchi</option>
                      <option value="Mannar">Mannar</option>
                      <option value="Mullaitivu">Mullaitivu</option>
                      <option value="Anuradhapura">Anuradhapura</option>
                      <option value="Colombo">Colombo</option>
                    </select>
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={organicOnly}
                      onChange={(e) => setOrganicOnly(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: "#0F766E" }}
                    />
                    🌱 {t("organicOnly")}
                  </label>
                </div>
              </div>

              {/* Produce Listings Grid */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#0F766E", fontWeight: 600 }}>
                  Loading fresh farm produce...
                </div>
              ) : listings.length === 0 ? (
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 16,
                    padding: 40,
                    textAlign: "center",
                    border: "1px solid #E2E8F0",
                    color: "#64748B",
                  }}
                >
                  <Sprout size={48} style={{ margin: "0 auto 12px", opacity: 0.5, color: "#0F766E" }} />
                  <h3 style={{ fontSize: 18, color: "#1E293B", marginBottom: 6 }}>{t("noListingsFound")}</h3>
                  <p style={{ margin: 0, fontSize: 14 }}>Try searching for a different vegetable or selecting All Districts.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 20,
                  }}
                >
                  {listings.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "#FFFFFF",
                        borderRadius: 18,
                        overflow: "hidden",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      {/* Produce Image / Badge Header */}
                      <div style={{ position: "relative", height: 160, background: "#F1F5F9" }}>
                        <img
                          src={
                            item.image_url ||
                            "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80"
                          }
                          alt={item.crop_name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            background: "rgba(15, 118, 110, 0.9)",
                            color: "#FFFFFF",
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          📍 {getLocalizedDistrict(item.district, language)}
                        </div>

                        {item.is_organic && (
                          <div
                            style={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              background: "#DCFCE7",
                              color: "#166534",
                              border: "1px solid #86EFAC",
                              padding: "4px 10px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            🌱 {t("organicCertified")}
                          </div>
                        )}
                      </div>

                      {/* Produce Content */}
                      <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1E293B" }}>
                            {getLocalizedCropName(item.crop_name, language)}
                          </h3>
                          <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>
                            {item.variety}
                          </span>
                        </div>

                        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>
                          {t("sellerFarmer")}: <b>{item.farmer?.full_name || "Local Farmer"}</b>
                        </div>

                        {/* Quantity & Pricing Badges */}
                        <div
                          style={{
                            background: "#F0FDFA",
                            borderRadius: 12,
                            padding: "10px 14px",
                            border: "1px solid #CCFBF1",
                            marginBottom: 14,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 11, color: "#0F766E", fontWeight: 700 }}>
                              {t("availableKg")}
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#115E59" }}>
                              {item.available_quantity_kg} kg
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, color: "#0F766E", fontWeight: 700 }}>
                              {t("askingPricePerKg")}
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: "#0F766E" }}>
                              Rs. {item.asking_price_per_kg.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {item.description && (
                          <p style={{ margin: "0 0 14px", fontSize: 12, color: "#475569", lineHeight: 1.4, flex: 1 }}>
                            {item.description}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 8, marginTop: "auto" }}>
                          <button
                            type="button"
                            onClick={() => openBargainModal(item)}
                            style={{
                              background: "linear-gradient(135deg, #0F766E 0%, #115E59 100%)",
                              color: "#FFFFFF",
                              border: "none",
                              padding: "10px 12px",
                              borderRadius: 12,
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                            }}
                          >
                            <Tag size={15} />
                            {t("makeBargainOffer")}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartChat(item.farmer_id, item.id)}
                            style={{
                              background: "#FFFFFF",
                              color: "#0F766E",
                              border: "1.5px solid #0F766E",
                              padding: "10px 10px",
                              borderRadius: 12,
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                            }}
                          >
                            <MessageSquare size={15} />
                            Chat
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 2: MY BARGAINS & CONFIRMED DEALS */}
          {activeTab === "bargains" && (
            <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Tag size={22} color="#0F766E" /> {t("myBargains")} & {t("myDeals")}
              </h2>

              {myOffers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
                  <Tag size={40} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{t("noBargainsFound")}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {myOffers.map((offer) => {
                    const isAccepted = offer.status === "accepted";
                    const isCountered = offer.status === "countered";
                    const isPending = offer.status === "pending";
                    const isRejected = offer.status === "rejected";

                    return (
                      <div
                        key={offer.id}
                        style={{
                          borderRadius: 14,
                          padding: 18,
                          border: isAccepted
                            ? "2px solid #86EFAC"
                            : isCountered
                            ? "2px solid #93C5FD"
                            : "1px solid #E2E8F0",
                          background: isAccepted ? "#F0FDF4" : isCountered ? "#EFF6FF" : "#FFFFFF",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1E293B" }}>
                              {getLocalizedCropName(offer.listing?.crop_name, language) || "Produce"} · {offer.quantity_kg} kg
                            </h3>
                            <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                              {t("sellerFarmer")}: <b>{offer.farmer?.full_name || "Farmer"}</b> (📍 {getLocalizedDistrict(offer.farmer?.district, language)})
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isAccepted && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#DCFCE7", color: "#166534", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                                <CheckCircle2 size={14} /> {t("acceptedStatus")}
                              </span>
                            )}
                            {isCountered && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#DBEAFE", color: "#1E40AF", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                                <TrendingDown size={14} /> {t("counteredStatus")}
                              </span>
                            )}
                            {isPending && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FEF3C7", color: "#92400E", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                                <Clock size={14} /> {t("pendingOfferStatus")}
                              </span>
                            )}
                            {isRejected && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#F1F5F9", color: "#64748B", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                                <XCircle size={14} /> {t("rejectedStatus")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pricing Summary */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                            gap: 12,
                            marginTop: 14,
                            padding: "10px 14px",
                            background: "rgba(255,255,255,0.7)",
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.05)",
                          }}
                        >
                          <div>
                            <span style={{ fontSize: 11, color: "#64748B", display: "block" }}>{t("offeredPricePerKg")}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>
                              Rs. {offer.offered_price_per_kg.toFixed(2)}
                            </span>
                          </div>

                          <div>
                            <span style={{ fontSize: 11, color: "#64748B", display: "block" }}>{t("calculatedTotal")}</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: "#0F766E" }}>
                              Rs. {offer.total_amount.toFixed(2)}
                            </span>
                          </div>

                          {isCountered && offer.counter_price_per_kg && (
                            <div>
                              <span style={{ fontSize: 11, color: "#1E40AF", fontWeight: 700, display: "block" }}>{t("counterPricePerKg")}</span>
                              <span style={{ fontSize: 16, fontWeight: 800, color: "#1E40AF" }}>
                                Rs. {offer.counter_price_per_kg.toFixed(2)} (Rs. {(offer.counter_price_per_kg * offer.quantity_kg).toFixed(2)})
                              </span>
                            </div>
                          )}

                          {isAccepted && offer.agreed_price_per_kg && (
                            <div>
                              <span style={{ fontSize: 11, color: "#166534", fontWeight: 700, display: "block" }}>Agreed Price</span>
                              <span style={{ fontSize: 16, fontWeight: 800, color: "#166534" }}>
                                Rs. {offer.agreed_price_per_kg.toFixed(2)}/kg
                              </span>
                            </div>
                          )}
                        </div>

                        {offer.buyer_message && (
                          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#475569" }}>
                            <b>Your note:</b> "{offer.buyer_message}"
                          </p>
                        )}

                        {offer.counter_message && (
                          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#1E40AF", fontWeight: 600 }}>
                            <b>Farmer note:</b> "{offer.counter_message}"
                          </p>
                        )}

                        {/* Action Buttons for Offer */}
                        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
                          {isCountered && (
                            <button
                              type="button"
                              onClick={() => handleAcceptCounter(offer.id)}
                              style={{
                                background: "#10B981",
                                color: "#FFF",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: 10,
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: "pointer",
                              }}
                            >
                              ✓ {t("acceptCounter")} (Rs. {offer.counter_price_per_kg?.toFixed(2)}/kg)
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStartChat(offer.farmer_id, offer.listing_id)}
                            style={{
                              background: "#FFFFFF",
                              color: "#0F766E",
                              border: "1.5px solid #0F766E",
                              padding: "8px 14px",
                              borderRadius: 10,
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <MessageSquare size={14} />
                            {t("directChatWithFarmer")}
                          </button>

                          {isAccepted && offer.farmer?.phone && (
                            <a
                              href={`tel:${offer.farmer.phone}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                background: "#F0FDF4",
                                color: "#166534",
                                border: "1px solid #86EFAC",
                                padding: "8px 14px",
                                borderRadius: 10,
                                fontWeight: 700,
                                fontSize: 13,
                                textDecoration: "none",
                              }}
                            >
                              <Phone size={14} />
                              Call: {offer.farmer.phone}
                            </a>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* BARGAIN / MAKE OFFER MODAL */}
      {selectedListing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              padding: 24,
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid #E2E8F0",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedListing(null)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "#F1F5F9",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={18} color="#64748B" />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#CCFBF1", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F766E" }}>
                <Tag size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1E293B" }}>
                  {t("makeBargainOffer")}
                </h3>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  {getLocalizedCropName(selectedListing.crop_name, language)} ({selectedListing.variety})
                </div>
              </div>
            </div>

            {/* Seller price & availability banner */}
            <div
              style={{
                background: "#F8FAFC",
                borderRadius: 12,
                padding: "10px 14px",
                border: "1px solid #E2E8F0",
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              <div>
                <span style={{ color: "#64748B", display: "block" }}>{t("availableKg")}:</span>
                <span style={{ fontWeight: 800, color: "#1E293B" }}>{selectedListing.available_quantity_kg} kg</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ color: "#64748B", display: "block" }}>{t("askingPricePerKg")}:</span>
                <span style={{ fontWeight: 800, color: "#0F766E" }}>Rs. {selectedListing.asking_price_per_kg.toFixed(2)}/kg</span>
              </div>
            </div>

            <form onSubmit={submitBargainOffer}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    {t("desiredQuantityKg")} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedListing.available_quantity_kg}
                    step="0.5"
                    value={bargainQty}
                    onChange={(e) => setBargainQty(e.target.value ? parseFloat(e.target.value) : "")}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #CBD5E1",
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    {t("offeredPricePerKg")} *
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={bargainPrice}
                    onChange={(e) => setBargainPrice(e.target.value ? parseFloat(e.target.value) : "")}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #CBD5E1",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#0F766E",
                    }}
                    required
                  />
                </div>
              </div>

              {/* Total Calculation & Fair Savings Box */}
              <div
                style={{
                  background: "#F0FDFA",
                  borderRadius: 12,
                  padding: "12px 14px",
                  border: "1px solid #99F6E4",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: "#475569" }}>Original Price ({bargainQty || 0} kg):</span>
                  <span style={{ color: "#64748B", textDecoration: "line-through" }}>Rs. {originalTotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: "#0F766E" }}>
                  <span>{t("calculatedTotal")}:</span>
                  <span>Rs. {totalCalculated}</span>
                </div>
                {Number(savings) > 0 && (
                  <div style={{ fontSize: 12, color: "#166534", fontWeight: 700, marginTop: 4, textAlign: "right" }}>
                    🎉 {t("fairSavings")}: Rs. {savings}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  Note to Farmer
                </label>
                <input
                  type="text"
                  value={bargainNote}
                  onChange={(e) => setBargainNote(e.target.value)}
                  placeholder={t("offerNotePlaceholder")}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingOffer}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #0F766E 0%, #115E59 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "12px",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Tag size={18} />
                {t("submitBargain")}
              </button>

              {bargainStatus && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 8,
                    borderRadius: 8,
                    fontSize: 12,
                    textAlign: "center",
                    fontWeight: 600,
                    background: bargainStatus.type === "ok" ? "#DCFCE7" : "#FEE2E2",
                    color: bargainStatus.type === "ok" ? "#166534" : "#991B1B",
                  }}
                >
                  {bargainStatus.text}
                </div>
              )}
            </form>

          </div>
        </div>
      )}

      <Footer />
    </AuthGuard>
  );
}

export default function ConsumerPortalPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading portal...</div>}>
      <ConsumerPortalContent />
    </Suspense>
  );
}
