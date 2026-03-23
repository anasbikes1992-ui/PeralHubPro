import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2, User, Clock, CheckCircle, Shield, AlertCircle } from "lucide-react";
import { reviewSchema } from "@/lib/validation";

interface ReviewSectionProps {
  listingId: string;
  listingType: "stay" | "vehicle" | "event" | "property";
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
}

const ReviewSection = ({ listingId, listingType }: ReviewSectionProps) => {
  const { user } = useAuth();
  const { showToast } = useStore();

  const [reviews, setReviews]         = useState<Review[]>([]);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [rating, setRating]           = useState(5);
  const [comment, setComment]         = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [fieldError, setFieldError]   = useState("");
  const [hasVerifiedBooking, setHasVerifiedBooking] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // ── Load reviews ─────────────────────────────────────────
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("reviews" as any)
        .select("*")
        .eq("listing_id", listingId)
        .eq("listing_type", listingType)
        .order("created_at", { ascending: false });
      setReviews((data as Review[]) || []);
      setLoading(false);
    };
    fetchReviews();
  }, [listingId, listingType]);

  // ── Check if the current user can leave a review ─────────
  // Requirements: (1) must be signed in, (2) must have a completed booking
  // for this listing, (3) must not have already reviewed it.
  useEffect(() => {
    if (!user) { setHasVerifiedBooking(false); return; }
    const checkEligibility = async () => {
      setCheckingEligibility(true);
      const [bookingRes, reviewRes] = await Promise.all([
        // Check for a completed booking
        (supabase as any)
          .from("bookings")
          .select("id")
          .eq("user_id", user.id)
          .eq("listing_id", listingId)
          .eq("status", "completed")
          .limit(1),
        // Check if already reviewed
        (supabase as any)
          .from("reviews")
          .select("id")
          .eq("user_id", user.id)
          .eq("listing_id", listingId)
          .eq("listing_type", listingType)
          .limit(1),
      ]);
      setHasVerifiedBooking((bookingRes.data?.length ?? 0) > 0);
      setHasAlreadyReviewed((reviewRes.data?.length ?? 0) > 0);
      setCheckingEligibility(false);
    };
    checkEligibility();
  }, [user, listingId, listingType]);

  // ── Submit review ─────────────────────────────────────────
  const handleSubmit = async () => {
    setFieldError("");

    // Client-side validation via Zod
    const result = reviewSchema.safeParse({ rating, comment });
    if (!result.success) {
      setFieldError(result.error.errors[0]?.message ?? "Invalid review.");
      return;
    }

    if (!user) { showToast("You must be signed in to leave a review.", "error"); return; }
    if (!hasVerifiedBooking) { showToast("Only guests with a completed booking can leave a review.", "warning"); return; }
    if (hasAlreadyReviewed)  { showToast("You have already reviewed this listing.", "info"); return; }

    setSubmitting(true);
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("reviews" as any).insert({
      listing_id:   listingId,
      listing_type: listingType,
      user_id:      user.id,
      user_name:    profile?.full_name || "Verified Guest",
      rating,
      comment:      comment.trim(),
    });

    if (error) {
      // RLS will reject if no completed booking exists (double-enforced)
      if (error.code === "42501") {
        showToast("You need a completed booking to leave a review.", "warning");
      } else if (error.code === "23505") {
        showToast("You have already reviewed this listing.", "info");
      } else {
        showToast("Failed to submit review. Please try again.", "error");
        console.error("Review submit error:", error);
      }
    } else {
      showToast("Review submitted!", "success");
      setComment("");
      setRating(5);
      setHasAlreadyReviewed(true);
      // Re-fetch reviews
      const { data } = await supabase
        .from("reviews" as any)
        .select("*")
        .eq("listing_id", listingId)
        .eq("listing_type", listingType)
        .order("created_at", { ascending: false });
      setReviews((data as Review[]) || []);
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center gap-6 border-b border-white/5 pb-8">
        <div className="w-1.5 h-12 bg-primary rounded-full" />
        <div>
          <h3 className="text-2xl font-black text-pearl uppercase tracking-tight">
            Guest Reviews
          </h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} className={s <= Math.round(avgRating) ? "fill-primary text-primary" : "text-white/10"} />
                ))}
              </div>
              <span className="text-sm font-bold text-primary">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-mist/40">· {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Write a review */}
      <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CheckCircle size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-black text-pearl uppercase tracking-tight">Share Your Experience</p>
            <p className="text-[10px] text-mist/40 font-medium">Only guests with a completed booking may review.</p>
          </div>
        </div>

        {!user ? (
          <div className="flex items-center gap-3 p-4 bg-white/3 border border-white/5 rounded-2xl">
            <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
            <p className="text-xs text-mist/60">Sign in to leave a review.</p>
          </div>
        ) : checkingEligibility ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2 size={16} className="animate-spin text-primary" />
            <p className="text-xs text-mist/40">Checking booking status…</p>
          </div>
        ) : hasAlreadyReviewed ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
            <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-300">You have already reviewed this listing.</p>
          </div>
        ) : !hasVerifiedBooking ? (
          <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
            <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-300/80">You need a completed booking for this listing to leave a review.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Star selector */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-mist/60 mb-3 block">Your Rating</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star
                      size={28}
                      className={s <= (hoverRating || rating) ? "fill-primary text-primary" : "text-white/10"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-mist/60 mb-2 block">
                Your Review *
              </label>
              <textarea
                value={comment}
                onChange={e => { setComment(e.target.value); setFieldError(""); }}
                placeholder="Share your experience with other guests…"
                rows={4}
                maxLength={1000}
                className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm text-pearl placeholder:text-mist/20 outline-none focus:border-primary/50 transition-all resize-none ${fieldError ? "border-red-500/50" : "border-white/10"}`}
              />
              <div className="flex justify-between items-center mt-1">
                {fieldError
                  ? <p className="text-xs text-red-400">{fieldError}</p>
                  : <p className="text-[10px] text-mist/30">10–1,000 characters</p>
                }
                <p className="text-[10px] text-mist/30">{comment.length}/1000</p>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !comment.trim()}
              className="h-12 px-8 rounded-2xl bg-primary hover:bg-gold-light text-primary-foreground font-black uppercase text-[10px] tracking-widest"
            >
              {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {submitting ? "Submitting…" : "Submit Review"}
            </Button>
          </div>
        )}
      </div>

      {/* Reviews feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary/40" size={32} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-mist/20 italic">Loading reviews…</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.01] border border-dashed border-white/5 rounded-[3.5rem] flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-mist/10">
            <Shield size={40} />
          </div>
          <p className="text-mist text-xs font-black uppercase tracking-widest opacity-30">No reviews yet. Be the first verified guest to share your experience.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {reviews.map((r, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                key={r.id}
                className="bg-zinc-900 border border-white/5 rounded-[3rem] p-8 hover:border-primary/20 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= r.rating ? "fill-primary text-primary" : "text-white/5"} />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-400 bg-emerald-500/5">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-mist text-sm font-medium leading-relaxed italic opacity-80">
                    "{r.comment}"
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-zinc-800 flex items-center justify-center border border-primary/20">
                      <User size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-pearl uppercase tracking-tight">{r.user_name}</div>
                      <div className="text-[8px] font-black text-mist uppercase tracking-widest opacity-40">Verified Guest</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-mist/30">
                    <Clock size={10} />
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      {new Date(r.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
