"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ValamAPI } from "@/lib/api";
import type { CommunityPost, ValamUser } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedDistrict } from "@/lib/lifecycle";
import { useNotification } from "@/context/NotificationContext";
import {
  MessageSquare,
  Plus,
  Search,
  User,
  MapPin,
  Send,
  MessageCircle,
  X,
  Sparkles,
  Tag,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";

import { communityPostSchema, communityCommentSchema, getFieldErrors } from "@/lib/validations";

export default function CommunityPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { showSuccess, showError } = useNotification();

  const [currentUser, setCurrentUser] = useState<ValamUser | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New post modal — ZERO default values
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [postErrors, setPostErrors] = useState<Record<string, string>>({});

  // Selected post view & comments
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    ValamAPI.me()
      .then((u) => setCurrentUser(u))
      .catch(() => {});
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      const res = await ValamAPI.getCommunityPosts({
        category: category || undefined,
        search: search.trim() || undefined,
      });
      setPosts(res.items || []);
    } catch (err) {
      console.error("Error fetching community posts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    setPostErrors({});

    const validationResult = communityPostSchema.safeParse({
      title,
      category: postCategory,
      content,
      image_url: imageUrl || undefined,
    });

    if (!validationResult.success) {
      const errors = getFieldErrors(validationResult);
      setPostErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await ValamAPI.createCommunityPost({
        title: title.trim(),
        content: content.trim(),
        category: postCategory,
        image_url: imageUrl.trim() || undefined,
      });

      setShowNewPostModal(false);
      setTitle("");
      setContent("");
      setPostCategory("");
      setImageUrl("");
      setPostErrors({});
      showSuccess("Discussion created successfully!");
      fetchPosts();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPost) return;

    setCommentError("");
    const validationResult = communityCommentSchema.safeParse({ content: commentText });
    if (!validationResult.success) {
      setCommentError(validationResult.error.issues[0]?.message || "Reply cannot be empty");
      return;
    }

    setCommenting(true);
    try {
      const newComment = await ValamAPI.addCommunityComment(selectedPost.id, commentText.trim());

      setSelectedPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...(prev.comments || []), newComment],
          comment_count: (prev.comment_count || 0) + 1,
        };
      });

      setCommentText("");
      setCommentError("");
      showSuccess("Comment added!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to add comment.");
    } finally {
      setCommenting(false);
    }
  }

  async function handleOpenPost(postId: number) {
    try {
      const fullPost = await ValamAPI.getCommunityPostDetail(postId);
      setSelectedPost(fullPost);
    } catch (err) {
      console.error(err);
    }
  }

  const isConsumer = currentUser?.role === "consumer";
  const heroGradient = isConsumer
    ? "linear-gradient(135deg, #0F766E 0%, #115E59 100%)"
    : "linear-gradient(135deg, #11382B 0%, #165B43 100%)";
  const accentColor = isConsumer ? "#0F766E" : "#10B981";

  const categories = [
    { value: "", label: t("allCategories") },
    { value: "Pest Control", label: t("pestControlCategory") },
    { value: "Equipment & Solar", label: t("equipmentSolarCategory") },
    { value: "Soil & Fertilizer", label: t("soilFertilizerCategory") },
    { value: "Market & Pricing", label: t("marketQACategory") },
    { value: "General", label: t("generalDiscussionCategory") },
  ];

  return (
    <AuthGuard>
      <Navbar active="community" pageTitle={t("communityHeroTitle")} />

      {/* Page Hero Header */}
      <section className="page-hero" style={{ padding: "32px 0", background: heroGradient }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="crumb" style={{ fontSize: "clamp(0.75rem, 1.8vw, 0.85rem)", color: isConsumer ? "#99F6E4" : "#A7F3D0" }}>
                {t("communityHeroSub")}
              </div>
              <h1 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", lineHeight: 1.2, marginTop: 4, color: "#FFFFFF" }}>
                {t("communityHeroTitle")}
              </h1>
              <p style={{ marginTop: 8, color: isConsumer ? "#CCFBF1" : "#CFE3D5", fontSize: "clamp(0.88rem, 2vw, 1rem)", maxWidth: 650, lineHeight: 1.4 }}>
                Exchange farming insights, ask agricultural and market questions, and discuss produce directly with growers and buyers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNewPostModal(true)}
              style={{
                background: isConsumer ? "#10B981" : "#10B981",
                color: "#FFFFFF",
                border: "none",
                padding: "12px 22px",
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
              }}
            >
              <Plus size={18} /> {t("startDiscussion")}
            </button>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#F8FAFC", paddingTop: 24, minHeight: "75vh" }}>
        <div className="container">

          {/* Search Bar & Category Pills */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 18,
              padding: 16,
              marginBottom: 24,
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, flex: 1, minWidth: 260 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("searchDiscussions")}
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
                    background: accentColor,
                    color: "#FFF",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {t("search")}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setRefreshing(true);
                  fetchPosts();
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 14px",
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

            {/* Category Filter Pills */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {categories.map((cat) => {
                const isActive = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: isActive ? `1.5px solid ${accentColor}` : "1px solid #E2E8F0",
                      background: isActive ? (isConsumer ? "#F0FDFA" : "#ECFDF5") : "#F8FAFC",
                      color: isActive ? accentColor : "#64748B",
                      fontSize: 12,
                      fontWeight: isActive ? 800 : 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Grid: Feed on left, active thread on right (or full-width) */}
          <div style={{ display: "grid", gridTemplateColumns: selectedPost ? "1.1fr 1fr" : "1fr", gap: 20 }}>

            {/* Post Feed */}
            <div>
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: accentColor, fontWeight: 700 }}>
                  Loading community discussions...
                </div>
              ) : posts.length === 0 ? (
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 18,
                    padding: 40,
                    textAlign: "center",
                    border: "1px solid #E2E8F0",
                    color: "#64748B",
                  }}
                >
                  <MessageSquare size={48} style={{ margin: "0 auto 12px", opacity: 0.4, color: accentColor }} />
                  <h3 style={{ fontSize: 18, color: "#1E293B", marginBottom: 6 }}>{t("noDiscussionsFound")}</h3>
                  <p style={{ margin: 0, fontSize: 14 }}>Click "Ask / Start Discussion" to share questions or field updates.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {posts.map((post) => {
                    const isSelected = selectedPost?.id === post.id;

                    return (
                      <div
                        key={post.id}
                        onClick={() => handleOpenPost(post.id)}
                        style={{
                          background: "#FFFFFF",
                          borderRadius: 18,
                          padding: 20,
                          border: isSelected ? `2px solid ${accentColor}` : "1px solid #E2E8F0",
                          boxShadow: isSelected ? "0 6px 20px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.02)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748B" }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: "#DCFCE7",
                                color: "#166534",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: 12,
                              }}
                            >
                              {post.author_name ? post.author_name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <span style={{ fontWeight: 700, color: "#1E293B" }}>{post.author_name}</span>
                            <span>·</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                              <MapPin size={12} /> {getLocalizedDistrict(post.author_location, language) || "Vavuniya"}
                            </span>
                          </div>

                          <span
                            style={{
                              background: "#F1F5F9",
                              color: "#475569",
                              padding: "3px 10px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {post.category}
                          </span>
                        </div>

                        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1E293B", margin: "0 0 6px" }}>
                          {post.title}
                        </h3>

                        <p
                          style={{
                            fontSize: 13,
                            color: "#475569",
                            lineHeight: 1.5,
                            margin: "0 0 12px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {post.content}
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #F1F5F9" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: accentColor, fontWeight: 700 }}>
                            <MessageCircle size={16} />
                            {post.comment_count || 0} {t("responsesCount")}{(post.comment_count || 0) !== 1 ? "s" : ""}
                          </div>

                          <span style={{ fontSize: 12, color: "#94A3B8" }}>
                            {post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Post Detail & Response Pane */}
            {selectedPost && (
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: 20,
                  padding: 24,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  height: "fit-content",
                  position: "sticky",
                  top: 20,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span
                    style={{
                      background: "#DCFCE7",
                      color: "#166534",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {selectedPost.category}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedPost(null)}
                    style={{
                      background: "#F1F5F9",
                      border: "none",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <X size={16} color="#64748B" />
                  </button>
                </div>

                <h2 style={{ fontSize: 19, fontWeight: 800, color: "#1E293B", marginBottom: 6, lineHeight: 1.3 }}>
                  {selectedPost.title}
                </h2>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 14 }}>
                  Posted by <b>{selectedPost.author_name}</b> ({getLocalizedDistrict(selectedPost.author_location, language) || "Vavuniya"})
                </div>

                <div
                  style={{
                    fontSize: 14,
                    color: "#334155",
                    lineHeight: 1.6,
                    marginBottom: 16,
                    background: "#F8FAFC",
                    padding: 14,
                    borderRadius: 12,
                    border: "1px solid #F1F5F9",
                  }}
                >
                  {selectedPost.content}
                </div>

                {selectedPost.image_url && (
                  <img
                    src={selectedPost.image_url}
                    alt="Attachment"
                    style={{
                      width: "100%",
                      maxHeight: 220,
                      objectFit: "cover",
                      borderRadius: 12,
                      marginBottom: 16,
                      border: "1px solid #E2E8F0",
                    }}
                  />
                )}

                {/* Responses List */}
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1E293B", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <MessageCircle size={16} color={accentColor} />
                  {t("commentsAndAnswers")} ({selectedPost.comments?.length || 0})
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, maxHeight: 260, overflowY: "auto", paddingRight: 4 }}>
                  {(!selectedPost.comments || selectedPost.comments.length === 0) ? (
                    <div style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", padding: "16px 0" }}>
                      No replies yet. Write the first response below!
                    </div>
                  ) : (
                    selectedPost.comments.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 12,
                          background: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#1E293B", marginBottom: 2 }}>
                          {c.author_name}
                        </div>
                        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.4 }}>{c.content}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleAddComment} noValidate style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      placeholder={t("writeResponse")}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: commentError ? "1px solid #EF4444" : "1px solid #CBD5E1",
                        background: commentError ? "#FEF2F2" : "#FFFFFF",
                        fontSize: 13,
                      }}
                      value={commentText}
                      onChange={(e) => {
                        setCommentText(e.target.value);
                        if (commentError) setCommentError("");
                      }}
                    />
                    <button
                      type="submit"
                      disabled={commenting}
                      style={{
                        background: accentColor,
                        color: "#FFFFFF",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  {commentError && <span className="field-error-text">{commentError}</span>}
                </form>

              </div>
            )}

          </div>
        </div>
      </section>

      {/* CREATE POST MODAL */}
      {showNewPostModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShowNewPostModal(false)}
        >
          <div
            className="modal-dialog-box"
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              padding: 24,
              maxWidth: 520,
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowNewPostModal(false)}
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
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: isConsumer ? "#CCFBF1" : "#DCFCE7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: accentColor,
                }}
              >
                <MessageSquare size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1E293B" }}>
                  {t("createDiscussionTitle")}
                </h3>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  Share with local farmers and buyers in the Valam community
                </div>
              </div>
            </div>

            <form onSubmit={handleCreatePost} noValidate>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#334155", marginBottom: 6 }}>
                  {t("discussionTitleLabel")} *
                </label>
                <input
                  type="text"
                  placeholder={t("discussionTitlePlaceholder")}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: postErrors.title ? "1px solid #EF4444" : "1px solid #CBD5E1",
                    background: postErrors.title ? "#FEF2F2" : "#FFFFFF",
                    fontSize: 14,
                  }}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (postErrors.title) setPostErrors((prev) => ({ ...prev, title: "" }));
                  }}
                />
                {postErrors.title && <span className="field-error-text">{postErrors.title}</span>}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#334155", marginBottom: 6 }}>
                  {t("discussionCategoryLabel")} *
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: postErrors.category ? "1px solid #EF4444" : "1px solid #CBD5E1",
                    background: postErrors.category ? "#FEF2F2" : "#FFFFFF",
                    fontSize: 14,
                  }}
                  value={postCategory}
                  onChange={(e) => {
                    setPostCategory(e.target.value);
                    if (postErrors.category) setPostErrors((prev) => ({ ...prev, category: "" }));
                  }}
                >
                  <option value="">-- Select Category --</option>
                  <option value="Pest Control">{t("pestControlCategory")}</option>
                  <option value="Equipment & Solar">{t("equipmentSolarCategory")}</option>
                  <option value="Soil & Fertilizer">{t("soilFertilizerCategory")}</option>
                  <option value="Market & Pricing">{t("marketQACategory")}</option>
                  <option value="General">{t("generalDiscussionCategory")}</option>
                </select>
                {postErrors.category && <span className="field-error-text">{postErrors.category}</span>}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#334155", marginBottom: 6 }}>
                  {t("discussionContentLabel")} *
                </label>
                <textarea
                  rows={4}
                  placeholder={t("discussionContentPlaceholder")}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: postErrors.content ? "1px solid #EF4444" : "1px solid #CBD5E1",
                    background: postErrors.content ? "#FEF2F2" : "#FFFFFF",
                    fontSize: 14,
                    fontFamily: "inherit",
                  }}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (postErrors.content) setPostErrors((prev) => ({ ...prev, content: "" }));
                  }}
                />
                {postErrors.content && <span className="field-error-text">{postErrors.content}</span>}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#334155", marginBottom: 6 }}>
                  {t("discussionImageOptional")}
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13 }}
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "1px solid #CBD5E1",
                    background: "#FFF",
                    color: "#475569",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: accentColor,
                    color: "#FFFFFF",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {submitting ? "Publishing..." : t("publishDiscussion")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </AuthGuard>
  );
}
