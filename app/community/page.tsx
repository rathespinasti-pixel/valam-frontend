"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ValamAPI } from "@/lib/api";
import type { CommunityPost } from "@/lib/types";
import { useNotification } from "@/context/NotificationContext";
import { MessageSquare, Plus, Search, User, MapPin, Send, MessageCircle } from "lucide-react";

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // New post modal
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postCategory, setPostCategory] = useState("Pest Control");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Selected post view & comments
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);

  async function fetchPosts() {
    try {
      setLoading(true);
      const res = await ValamAPI.getCommunityPosts({ category, search });
      setPosts(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, [category, search]);

  const { showSuccess, showError } = useNotification();

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      await ValamAPI.createCommunityPost({
        title,
        content,
        category: postCategory,
        image_url: imageUrl || undefined,
      });
      setShowNewPostModal(false);
      setTitle("");
      setContent("");
      setImageUrl("");
      fetchPosts();
      showSuccess("Community Discussion Posted!", "Your post has been published for local farmers to read and discuss.");
    } catch (err: any) {
      showError("Post Creation Failed", err.message || "Could not publish your post. Please check fields.");
    } finally {
      setSubmitting(false);
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

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPost) return;
    if (!ValamAPI.isLoggedIn()) {
      router.push("/login");
      return;
    }
    if (!commentText.trim()) return;

    setCommenting(true);
    try {
      await ValamAPI.addCommunityComment(selectedPost.id, commentText.trim());
      setCommentText("");
      handleOpenPost(selectedPost.id);
      showSuccess("Reply Posted", "Your comment has been added to the discussion.");
    } catch (err: any) {
      showError("Reply Failed", err.message || "Could not post your comment.");
    } finally {
      setCommenting(false);
    }
  }

  return (
    <>
      <Navbar active="community" />
      <section className="page-hero">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="crumb">Farmer Network / Community Forum</div>
            <h1>Vavuniya Farmers Community</h1>
            <p style={{ marginTop: 8, color: "#CFE3D5", maxWidth: 600 }}>
              Share field experiences, ask farming questions, and exchange agricultural solutions with local growers.
            </p>
          </div>
          <button onClick={() => setShowNewPostModal(true)} className="btn btn-sun" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={20} /> Ask / Start Discussion
          </button>
        </div>
      </section>

      <section className="section" style={{ background: "#F7F9F7" }}>
        <div className="container">

          {/* New Post Modal */}
          {showNewPostModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
              <div style={{ background: "#FFF", borderRadius: 16, padding: 28, maxWidth: 540, width: "100%" }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#1B4D3E" }}>Create Community Discussion Post</h2>
                <form onSubmit={handleCreatePost}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Discussion Title *</label>
                    <input type="text" required className="input" placeholder="e.g. Best organic remedy for chili thrips in Vavuniya?" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Category</label>
                    <select className="input" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={postCategory} onChange={(e) => setPostCategory(e.target.value)}>
                      <option value="Pest Control">Pest & Disease Control</option>
                      <option value="Equipment & Solar">Equipment & Solar Farming</option>
                      <option value="Soil & Fertilizer">Soil & Fertilizer</option>
                      <option value="General">General Discussion</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Question / Description *</label>
                    <textarea rows={4} required className="input" placeholder="Describe your field problem or question in detail..." style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={content} onChange={(e) => setContent(e.target.value)} />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Image URL (Optional)</label>
                    <input type="url" className="input" placeholder="https://example.com/photo.jpg" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #CCC" }} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                    <button type="button" onClick={() => setShowNewPostModal(false)} className="btn btn-outline" style={{ padding: "10px 18px" }}>Cancel</button>
                    <button type="submit" disabled={submitting} className="btn btn-sun" style={{ padding: "10px 24px" }}>
                      {submitting ? "Publishing..." : "Publish Post"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Search & Category Filter */}
          <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", border: "1px solid #E2E8F0" }}>
            <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 10, background: "#F8FAFC", padding: "8px 14px", borderRadius: 8, border: "1px solid #CBD5E1" }}>
              <Search size={18} color="#64748B" />
              <input
                type="text"
                placeholder="Search forum questions..."
                style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 14 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select
              style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, background: "#FFF" }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Pest Control">Pest Control</option>
              <option value="Equipment & Solar">Equipment & Solar</option>
              <option value="Soil & Fertilizer">Soil & Fertilizer</option>
              <option value="General">General</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: selectedPost ? "1fr 1fr" : "1fr", gap: 24 }}>
            
            {/* Post Feed */}
            <div>
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading discussion posts...</div>
              ) : posts.length === 0 ? (
                <div style={{ padding: 40, background: "#FFF", borderRadius: 16, textAlign: "center", color: "#64748B" }}>
                  No discussion posts found. Be the first to start a conversation!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handleOpenPost(post.id)}
                      style={{
                        background: "#FFFFFF",
                        borderRadius: 16,
                        padding: 20,
                        border: selectedPost?.id === post.id ? "2px solid #16A34A" : "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748B" }}>
                          <User size={14} /> <strong>{post.author_name}</strong> · <MapPin size={12} /> {post.author_location || "Vavuniya"}
                        </div>
                        <span style={{ background: "#DCFCE7", color: "#166534", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                          {post.category}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>{post.title}</h3>
                      <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.5, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {post.content}
                      </p>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#16A34A", fontWeight: 600 }}>
                        <MessageCircle size={16} /> {post.comment_count} Response{post.comment_count !== 1 ? "s" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Post Detail & Comments Pane */}
            {selectedPost && (
              <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 24, border: "1px solid #E2E8F0", height: "fit-content" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ background: "#DCFCE7", color: "#166534", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {selectedPost.category}
                  </span>
                  <button onClick={() => setSelectedPost(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", fontWeight: 600 }}>
                    ✕ Close
                  </button>
                </div>

                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1B4D3E", marginBottom: 8 }}>{selectedPost.title}</h2>
                <div style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>
                  Posted by <strong>{selectedPost.author_name}</strong> ({selectedPost.author_location})
                </div>

                <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, marginBottom: 20, background: "#F8FAFC", padding: 16, borderRadius: 10 }}>
                  {selectedPost.content}
                </div>

                {selectedPost.image_url && (
                  <img src={selectedPost.image_url} alt="Post attachment" style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 10, marginBottom: 20 }} />
                )}

                {/* Comments List */}
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 12 }}>
                  Comments & Answers ({selectedPost.comments?.length || 0})
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20, maxHeight: 260, overflowY: "auto" }}>
                  {(!selectedPost.comments || selectedPost.comments.length === 0) ? (
                    <div style={{ fontSize: 13, color: "#94A3B8" }}>No comments yet. Write a response below!</div>
                  ) : (
                    selectedPost.comments.map((c) => (
                      <div key={c.id} style={{ padding: 12, borderRadius: 8, background: "#F1F5F9" }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#1E293B", marginBottom: 2 }}>{c.author_name}</div>
                        <div style={{ fontSize: 13, color: "#475569" }}>{c.content}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    required
                    placeholder="Write a response..."
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14 }}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button type="submit" disabled={commenting} className="btn btn-sun" style={{ padding: "10px 16px" }}>
                    <Send size={16} />
                  </button>
                </form>

              </div>
            )}

          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
