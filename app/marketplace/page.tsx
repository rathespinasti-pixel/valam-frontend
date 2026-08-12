"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { ProduceListing, BargainOffer, ValamUser, Crop } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedCropName, getLocalizedDistrict } from "@/lib/lifecycle";
import {
  ShoppingBag,
  Plus,
  Tag,
  CheckCircle2,
  XCircle,
  TrendingDown,
  MessageSquare,
  Sprout,
  X,
  Phone,
  Layers,
  RefreshCcw,
  Clock,
  Send,
} from "lucide-react";

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();

  const [user, setUser] = useState<ValamUser | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [myListings, setMyListings] = useState<ProduceListing[]>([]);
  const [incomingOffers, setIncomingOffers] = useState<BargainOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"incoming" | "listings" | "deals">("incoming");

  // Post Produce Form Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [cropName, setCropName] = useState("Brinjal (Eggplant)");
  const [variety, setVariety] = useState("Padagoda");
  const [totalKg, setTotalKg] = useState<number | "">(50);
  const [askingPrice, setAskingPrice] = useState<number | "">(220);
  const [minPrice, setMinPrice] = useState<number | "">(190);
  const [harvestDate, setHarvestDate] = useState("Fresh Harvest (Today)");
  const [isOrganic, setIsOrganic] = useState(true);
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [description, setDescription] = useState("Naturally grown brinjal harvested fresh from field this morning.");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postStatus, setPostStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  // Counter Offer Modal
  const [counteringOffer, setCounteringOffer] = useState<BargainOffer | null>(null);
  const [counterPrice, setCounterPrice] = useState<number | "">(200);
  const [counterMessage, setCounterMessage] = useState("");
  const [submittingCounter, setSubmittingCounter] = useState(false);

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "listings") setActiveTab("listings");
    if (tabParam === "deals") setActiveTab("deals");
    if (tabParam === "incoming_offers") setActiveTab("incoming");
  }, [searchParams]);

  const loadData = async () => {
    try {
      const u = await ValamAPI.me();
      setUser(u);

      if (u.role === "consumer") {
        router.push("/consumer");
        return;
      }

      const [listingsRes, offersRes, cropsRes] = await Promise.allSettled([
        ValamAPI.getProduceListings({ farmer_id: Number(u.id), status: "all" }),
        ValamAPI.getIncomingBargainOffers(),
        ValamAPI.getCrops(),
      ]);

      if (listingsRes.status === "fulfilled") {
        setMyListings(listingsRes.value.items || []);
      }
      if (offersRes.status === "fulfilled") {
        setIncomingOffers(offersRes.value || []);
      }
      if (cropsRes.status === "fulfilled") {
        setCrops(cropsRes.value.items || []);
        if (cropsRes.value.items.length > 0) {
          const first = cropsRes.value.items[0];
          setCropName(first.crop_name);
          setVariety(first.variety || "Local");
        }
      }
    } catch (err) {
      console.error("Error loading marketplace data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || !totalKg || !askingPrice) return;

    setSubmittingPost(true);
    setPostStatus(null);

    try {
      await ValamAPI.createProduceListing({
        crop_name: cropName.trim(),
        variety: variety.trim(),
        total_quantity_kg: Number(totalKg),
        asking_price_per_kg: Number(askingPrice),
        min_acceptable_price_per_kg: typeof minPrice === "number" ? minPrice : undefined,
        district: user?.district || "Vavuniya",
        location: user?.farm_location || user?.ds_division,
        harvest_date: harvestDate.trim() || undefined,
        is_organic: isOrganic,
        is_negotiable: isNegotiable,
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      });

      setPostStatus({ type: "ok", text: "Produce posted and broadcast to all users in marketplace!" });
      setTimeout(() => {
        setShowPostModal(false);
        setActiveTab("listings");
        loadData();
      }, 1000);
    } catch (err) {
      setPostStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to post produce.",
      });
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleRespondOffer = async (offerId: number, action: "accept" | "reject") => {
    try {
      await ValamAPI.respondToBargainOffer(offerId, { action });
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to ${action} offer.`);
    }
  };

  const handleSendCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counteringOffer || !counterPrice) return;

    setSubmittingCounter(true);
    try {
      await ValamAPI.respondToBargainOffer(counteringOffer.id, {
        action: "counter",
        counter_price_per_kg: Number(counterPrice),
        counter_message: counterMessage.trim() || undefined,
      });
      setCounteringOffer(null);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send counter offer.");
    } finally {
      setSubmittingCounter(false);
    }
  };

  const handleStartChat = (buyerId: number, listingId?: number) => {
    router.push(`/chat?partner_id=${buyerId}${listingId ? `&listing_id=${listingId}` : ""}`);
  };

  const pendingOffers = incomingOffers.filter((o) => o.status === "pending");
  const confirmedDeals = incomingOffers.filter((o) => o.status === "accepted");

  return (
    <AuthGuard>
      <Navbar active="marketplace" pageTitle={t("cloudMarketTitle")} />

      {/* Hero Header */}
      <section className="page-hero" style={{ padding: "32px 0" }}>
        <div className="container">
          <div className="crumb" style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)" }}>
            {t("cloudMarketSub")}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
            <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", lineHeight: 1.2, margin: 0 }}>
              {t("cloudMarketTitle")}
            </h1>

            <button
              type="button"
              onClick={() => setShowPostModal(true)}
              style={{
                background: "#10B981",
                color: "#FFF",
                border: "none",
                padding: "10px 20px",
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(16,185,129,0.25)",
              }}
            >
              <Plus size={18} /> {t("postProduce")}
            </button>
          </div>
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
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setActiveTab("incoming")}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  border: activeTab === "incoming" ? "2px solid #10B981" : "1px solid #CBD5E1",
                  background: activeTab === "incoming" ? "#ECFDF5" : "#FFFFFF",
                  color: activeTab === "incoming" ? "#065F46" : "#475569",
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
                {t("incomingOffers")} ({pendingOffers.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("listings")}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  border: activeTab === "listings" ? "2px solid #10B981" : "1px solid #CBD5E1",
                  background: activeTab === "listings" ? "#ECFDF5" : "#FFFFFF",
                  color: activeTab === "listings" ? "#065F46" : "#475569",
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
                {t("activeBargains")} ({myListings.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("deals")}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  border: activeTab === "deals" ? "2px solid #10B981" : "1px solid #CBD5E1",
                  background: activeTab === "deals" ? "#ECFDF5" : "#FFFFFF",
                  color: activeTab === "deals" ? "#065F46" : "#475569",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.15s ease",
                }}
              >
                <CheckCircle2 size={18} />
                {t("myDeals")} ({confirmedDeals.length})
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

          {/* TAB 1: INCOMING BUYER OFFERS */}
          {activeTab === "incoming" && (
            <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Tag size={22} color="#10B981" /> {t("incomingOffers")}
              </h2>

              {incomingOffers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
                  <Tag size={40} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
                  <p style={{ fontSize: 14, fontWeight: 600 }}>No buyer offers received yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {incomingOffers.map((offer) => {
                    const isPending = offer.status === "pending";
                    const isAccepted = offer.status === "accepted";
                    const isCountered = offer.status === "countered";
                    const isRejected = offer.status === "rejected";

                    return (
                      <div
                        key={offer.id}
                        style={{
                          borderRadius: 14,
                          padding: 18,
                          border: isPending ? "2px solid #FDE68A" : "1px solid #E2E8F0",
                          background: isPending ? "#FFFBEB" : isAccepted ? "#F0FDF4" : "#FFFFFF",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1E293B" }}>
                              {getLocalizedCropName(offer.listing?.crop_name, language) || "Produce"} · {offer.quantity_kg} kg
                            </h3>
                            <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                              {t("buyerConsumer")}: <b>{offer.buyer?.full_name || "Buyer"}</b> (📍 {getLocalizedDistrict(offer.buyer?.district, language)})
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
                                <TrendingDown size={14} /> Counter Sent (Rs. {offer.counter_price_per_kg?.toFixed(2)}/kg)
                              </span>
                            )}
                            {isPending && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FEF3C7", color: "#92400E", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                                <Clock size={14} /> New Offer
                              </span>
                            )}
                            {isRejected && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#F1F5F9", color: "#64748B", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                                <XCircle size={14} /> {t("rejectedStatus")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pricing details */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                            gap: 12,
                            marginTop: 14,
                            padding: "10px 14px",
                            background: "rgba(255,255,255,0.8)",
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          <div>
                            <span style={{ fontSize: 11, color: "#64748B", display: "block" }}>{t("offeredPricePerKg")}</span>
                            <span style={{ fontSize: 16, fontWeight: 800, color: "#1E293B" }}>
                              Rs. {offer.offered_price_per_kg.toFixed(2)}
                            </span>
                          </div>

                          <div>
                            <span style={{ fontSize: 11, color: "#64748B", display: "block" }}>{t("calculatedTotal")}</span>
                            <span style={{ fontSize: 16, fontWeight: 800, color: "#10B981" }}>
                              Rs. {offer.total_amount.toFixed(2)}
                            </span>
                          </div>

                          <div>
                            <span style={{ fontSize: 11, color: "#64748B", display: "block" }}>Your Listed Price</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#64748B" }}>
                              Rs. {offer.listing?.asking_price_per_kg?.toFixed(2) || "N/A"}/kg
                            </span>
                          </div>
                        </div>

                        {offer.buyer_message && (
                          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#334155" }}>
                            <b>Buyer Note:</b> "{offer.buyer_message}"
                          </p>
                        )}

                        {/* Quick Actions */}
                        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRespondOffer(offer.id, "accept")}
                                style={{
                                  background: "#10B981",
                                  color: "#FFF",
                                  border: "none",
                                  padding: "8px 16px",
                                  borderRadius: 10,
                                  fontWeight: 800,
                                  fontSize: 13,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <CheckCircle2 size={15} /> {t("acceptOffer")}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setCounteringOffer(offer);
                                  setCounterPrice(Math.round((offer.offered_price_per_kg + (offer.listing?.asking_price_per_kg || offer.offered_price_per_kg)) / 2));
                                  setCounterMessage("");
                                }}
                                style={{
                                  background: "#0284C7",
                                  color: "#FFF",
                                  border: "none",
                                  padding: "8px 14px",
                                  borderRadius: 10,
                                  fontWeight: 700,
                                  fontSize: 13,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <TrendingDown size={15} /> {t("counterOffer")}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRespondOffer(offer.id, "reject")}
                                style={{
                                  background: "#FFFFFF",
                                  color: "#EF4444",
                                  border: "1px solid #FCA5A5",
                                  padding: "8px 14px",
                                  borderRadius: 10,
                                  fontWeight: 700,
                                  fontSize: 13,
                                  cursor: "pointer",
                                }}
                              >
                                {t("rejectOffer")}
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStartChat(offer.buyer_id, offer.listing_id)}
                            style={{
                              background: "#FFFFFF",
                              color: "#10B981",
                              border: "1.5px solid #10B981",
                              padding: "8px 14px",
                              borderRadius: 10,
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <MessageSquare size={14} />
                            {t("directChatWithBuyer")}
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY ACTIVE PRODUCE LISTINGS */}
          {activeTab === "listings" && (
            <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Layers size={22} color="#10B981" /> {t("activeBargains")}
                </h2>

                <button
                  type="button"
                  onClick={() => setShowPostModal(true)}
                  style={{
                    background: "#10B981",
                    color: "#FFF",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Plus size={16} /> {t("postProduce")}
                </button>
              </div>

              {myListings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
                  <ShoppingBag size={40} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
                  <p style={{ fontSize: 14, fontWeight: 600 }}>You have not posted any produce yet.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {myListings.map((listing) => (
                    <div
                      key={listing.id}
                      style={{
                        borderRadius: 14,
                        padding: 16,
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1E293B" }}>
                            {getLocalizedCropName(listing.crop_name, language)}
                          </h3>
                          <span style={{ fontSize: 12, color: "#64748B" }}>{listing.variety}</span>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 12,
                            background: listing.status === "active" ? "#DCFCE7" : "#F1F5F9",
                            color: listing.status === "active" ? "#166534" : "#64748B",
                          }}
                        >
                          {listing.status}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, background: "#FFF", padding: "8px 12px", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                        <span>Available: <b>{listing.available_quantity_kg} / {listing.total_quantity_kg} kg</b></span>
                        <span style={{ color: "#10B981", fontWeight: 800 }}>Rs. {listing.asking_price_per_kg}/kg</span>
                      </div>

                      {listing.description && (
                        <p style={{ margin: 0, fontSize: 12, color: "#475569" }}>{listing.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONFIRMED DEALS */}
          {activeTab === "deals" && (
            <div style={{ background: "#FFFFFF", borderRadius: 18, padding: 24, border: "1px solid #E2E8F0" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={22} color="#10B981" /> {t("myDeals")}
              </h2>

              {confirmedDeals.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
                  <CheckCircle2 size={40} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
                  <p style={{ fontSize: 14, fontWeight: 600 }}>No confirmed deals yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {confirmedDeals.map((deal) => (
                    <div
                      key={deal.id}
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        background: "#F0FDF4",
                        border: "1.5px solid #86EFAC",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#166534" }}>
                          {getLocalizedCropName(deal.listing?.crop_name, language)} · {deal.quantity_kg} kg
                        </h4>
                        <div style={{ fontSize: 13, color: "#334155", marginTop: 2 }}>
                          Buyer: <b>{deal.buyer?.full_name}</b> (📍 {getLocalizedDistrict(deal.buyer?.district, language)})
                        </div>
                        <div style={{ fontSize: 13, color: "#166534", fontWeight: 700, marginTop: 4 }}>
                          Agreed Total: Rs. {deal.agreed_total_amount || deal.total_amount} (Rs. {deal.agreed_price_per_kg || deal.offered_price_per_kg}/kg)
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleStartChat(deal.buyer_id, deal.listing_id)}
                          style={{
                            background: "#10B981",
                            color: "#FFF",
                            border: "none",
                            padding: "8px 14px",
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <MessageSquare size={14} />
                          Chat
                        </button>

                        {deal.buyer?.phone && (
                          <a
                            href={`tel:${deal.buyer.phone}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              background: "#FFFFFF",
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
                            Call: {deal.buyer.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* POST PRODUCE MODAL */}
      {showPostModal && (
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
              maxWidth: 520,
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid #E2E8F0",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              type="button"
              onClick={() => setShowPostModal(false)}
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
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
                <Sprout size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1E293B" }}>
                  {t("postProduce")}
                </h3>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  {t("postProduceDesc")}
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateListing}>
              {/* Crop selection or input */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  {t("produceName")} *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="e.g. Brinjal (Eggplant), Tomato"
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14 }}
                    required
                  />
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="Variety (e.g. Padagoda)"
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14 }}
                  />
                </div>
              </div>

              {/* Quantity & Asking Price */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    {t("totalKg")} (kg) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={totalKg}
                    onChange={(e) => setTotalKg(e.target.value ? parseFloat(e.target.value) : "")}
                    placeholder="e.g. 50"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, fontWeight: 700 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    {t("askingPricePerKg")} (Rs./kg) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="5"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value ? parseFloat(e.target.value) : "")}
                    placeholder="e.g. 220"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, fontWeight: 700, color: "#10B981" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    {t("minFairPrice")} (Rs./kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="5"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : "")}
                    placeholder="e.g. 190"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    {t("harvestDate")}
                  </label>
                  <input
                    type="text"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    placeholder="e.g. Fresh today"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  Description / Quality Notes
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Naturally grown organic brinjal, fresh and tender"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isOrganic}
                    onChange={(e) => setIsOrganic(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#10B981" }}
                  />
                  🌱 {t("organicCertified")}
                </label>
              </div>

              <button
                type="submit"
                disabled={submittingPost}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
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
                <Plus size={18} />
                {t("postProduce")}
              </button>

              {postStatus && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 8,
                    borderRadius: 8,
                    fontSize: 12,
                    textAlign: "center",
                    fontWeight: 600,
                    background: postStatus.type === "ok" ? "#DCFCE7" : "#FEE2E2",
                    color: postStatus.type === "ok" ? "#166534" : "#991B1B",
                  }}
                >
                  {postStatus.text}
                </div>
              )}
            </form>

          </div>
        </div>
      )}

      {/* COUNTER OFFER MODAL */}
      {counteringOffer && (
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
              maxWidth: 440,
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid #E2E8F0",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setCounteringOffer(null)}
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

            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1E293B" }}>
              {t("counterOffer")}
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748B" }}>
              Buyer offered Rs. {counteringOffer.offered_price_per_kg}/kg for {counteringOffer.quantity_kg} kg of {counteringOffer.listing?.crop_name}.
            </p>

            <form onSubmit={handleSendCounter}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  {t("counterPricePerKg")} *
                </label>
                <input
                  type="number"
                  min="1"
                  step="5"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value ? parseFloat(e.target.value) : "")}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 16, fontWeight: 800, color: "#0284C7" }}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                  Counter Message
                </label>
                <input
                  type="text"
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder={t("counterMessagePlaceholder")}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13 }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingCounter}
                style={{
                  width: "100%",
                  background: "#0284C7",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "12px",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Send size={16} />
                {t("sendCounterOffer")}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </AuthGuard>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
