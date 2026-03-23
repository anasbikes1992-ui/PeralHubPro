import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import ShareButtons from "@/components/ShareButtons";
import LeafletMap from "@/components/LeafletMap";
import { timeAgo } from "@/lib/utils";

const VerifiedBadge = ({ label }: { label?: string }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald/15 text-emerald border border-emerald/20 backdrop-blur-sm">
    ✓ {label || "Verified"}
  </span>
);

const SocialPage = () => {
  const { 
    socialPosts, currentUser, users,
    addSocialPost, likeSocialPost, addNotification 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<"feed" | "explore">("feed");
  const [newPost, setNewPost] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  const tabs = [
    { id: "feed" as const, label: "Feed", icon: "📱" },
    { id: "explore" as const, label: "Explore", icon: "🔍" },
  ];

  const handlePost = () => {
    if (!newPost.trim() || !currentUser) {
      if (!currentUser) addNotification("Error", "Please login to post.");
      return;
    }
    addSocialPost({
      author_id: currentUser.id,
      content: newPost,
      images: selectedImages,
      tags: [],
      location: locationName || undefined,
      status: "active",
    });
    setNewPost("");
    setSelectedImages([]);
    setLocationName("");
    setCoords(null);
    setShowMap(false);
    addNotification("Success", "Status posted!");
  };

  const addPhoto = () => {
    if (selectedImages.length >= 3) {
      addNotification("Limit Reached", "Maximum 3 photos per post.");
      return;
    }
    // Mock upload: add a random travel/nature image
    const mockImages = [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1546768292-fb12f6c92568?auto=format&fit=crop&q=80&w=800"
    ];
    const newImg = mockImages[selectedImages.length % mockImages.length];
    setSelectedImages([...selectedImages, newImg]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-10" style={{ background: "linear-gradient(135deg, hsl(174 60% 35%), hsl(174 60% 18%))" }}>
        <div className="container">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-pearl text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">🌐 Community Hub</div>
          <h1 className="text-pearl text-3xl font-black">Explore Sri Lanka</h1>
          <p className="text-pearl/75 mt-1.5">Connect with travelers • Share experiences • Discover hidden gems</p>
        </div>
      </div>

      <div className="bg-card border-b border-border py-3 sticky top-16 z-30 backdrop-blur-md bg-card/80">
        <div className="container flex gap-2 flex-wrap items-center">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold border transition-all ${activeTab === t.id ? "text-pearl border-teal" : "bg-transparent text-muted-foreground border-input"}`}
              style={activeTab === t.id ? { background: "hsl(174 60% 35%)" } : {}}>
              {t.icon} {t.label}
            </button>
          ))}
          <div className="ml-auto text-xs text-muted-foreground font-medium hidden sm:block">
            {socialPosts.length} updates shared
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            {/* Post composer */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-xl flex-shrink-0 border border-teal/20 shadow-inner">
                  {currentUser?.avatar_url ? <img src={currentUser.avatar_url} className="w-full h-full rounded-full object-cover" /> : "👤"}
                </div>
                <div className="flex-1">
                  <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="What's happening in Sri Lanka? Share a discovery..."
                    className="w-full border-none outline-none text-sm bg-transparent resize-none py-2" rows={3} />
                  {selectedImages.length > 0 && (
                    <div className="flex gap-2 mb-4 mt-2">
                       {selectedImages.map((img, i) => (
                         <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group/img">
                            <img src={img} className="w-full h-full object-cover" />
                            <button onClick={() => setSelectedImages(selectedImages.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 w-6 h-6 bg-ruby rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">✕</button>
                         </div>
                       ))}
                    </div>
                  )}

                  {showMap && (
                    <div className="mb-4 mt-2 space-y-3">
                       <div className="flex gap-2 items-center">
                          <input 
                            placeholder="Enter location name (e.g. Mirissa Beach)" 
                            value={locationName}
                            onChange={e => setLocationName(e.target.value)}
                            className="flex-1 bg-white/5 border border-border rounded-xl px-4 py-2 text-xs outline-none focus:border-teal/50"
                          />
                          <button onClick={() => setShowMap(false)} className="text-[10px] font-black uppercase text-muted-foreground hover:text-ruby">Cancel</button>
                       </div>
                       <div className="h-[200px] rounded-2xl overflow-hidden border border-border shadow-inner relative">
                          <LeafletMap 
                            height="100%" 
                            zoom={12} 
                            center={coords ? [coords.lat, coords.lng] : [6.9271, 79.8612]}
                            onSelectLocation={(lat, lng) => {
                               setCoords({ lat, lng });
                               if (!locationName) setLocationName(`Location Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                            }}
                            markers={coords ? [{ lat: coords.lat, lng: coords.lng, title: locationName || "Pinned Location", location: locationName || "Pinned Coords", type: "event", emoji: "📍" }] : []}
                          />
                          {!coords && (
                            <div className="absolute inset-0 bg-teal/5 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                               <div className="px-4 py-2 bg-white/90 rounded-full shadow-lg text-[10px] font-black uppercase tracking-widest text-teal border border-teal/20 animate-bounce">Click Map to Pin Location</div>
                            </div>
                          )}
                       </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex gap-1">
                      <button onClick={addPhoto} className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${selectedImages.length >= 3 ? 'text-muted-foreground/30' : 'text-muted-foreground hover:text-teal hover:bg-teal/5'}`}>
                        <span>📸</span> Photo {selectedImages.length > 0 && `(${selectedImages.length}/3)`}
                      </button>
                      <button onClick={() => setShowMap(!showMap)} className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${showMap ? 'text-teal bg-teal/5' : 'text-muted-foreground hover:text-teal hover:bg-teal/5'}`}>
                        <span>📍</span> {locationName || "Location"}
                      </button>
                    </div>
                    <button onClick={handlePost} className="px-6 py-2 rounded-xl text-xs font-bold text-pearl shadow-lg shadow-teal/20 transition-all hover:scale-105" style={{ background: "hsl(174 60% 35%)" }}>Post Update</button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feed */}
            <div className="flex flex-col gap-6">
              <AnimatePresence>
                {socialPosts.map((post, i) => {
                  const author = users[post.author_id] || { name: "Community Member", avatar_url: "👤", role: "Member", verified: false };
                  return (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg hover:border-teal/20 transition-all group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-11 h-11 rounded-full bg-teal/5 flex items-center justify-center text-xl flex-shrink-0 border border-border group-hover:border-teal/30 transition-all overflow-hidden">
                          {author.avatar_url?.startsWith("http") ? <img src={author.avatar_url} className="w-full h-full object-cover" /> : author.avatar_url || "👤"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm tracking-tight">{author.name}</span>
                            {author.verified && <VerifiedBadge />}
                          </div>
                          <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                            <span className="capitalize">{author.role}</span> • <span>{timeAgo(post.created_at)}</span>
                            {post.location && <span className="flex items-center gap-1"> • 📍 {post.location}</span>}
                          </div>
                        </div>
                      </div>
                      <p className="text-[14px] leading-relaxed mb-5 text-card-foreground/90 whitespace-pre-wrap">{post.content}</p>
                      
                      {post.images && post.images.length > 0 && (
                        <div className={`grid gap-2 mb-5 rounded-2xl overflow-hidden border border-border ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {post.images.map((img, idx) => (
                            <img key={idx} src={img} alt={`Post ${idx}`} className={`w-full object-cover ${post.images.length === 3 && idx === 0 ? 'row-span-2 h-full' : 'h-[200px]'} ${post.images.length === 1 ? 'max-h-[500px]' : ''}`} />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-6 pt-4 border-t border-border/60">
                        <button onClick={() => likeSocialPost(post.id)} className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-ruby transition-all">
                          <span className="text-base group-hover:scale-110 transition-transform">❤️</span> {post.likes}
                        </button>
                        <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-teal transition-all">
                          <span className="text-base group-hover:scale-110 transition-transform">💬</span> {post.comments_count}
                        </button>
                        <div className="ml-auto flex gap-2">
                           <ShareButtons title={post.content.slice(0, 50)} description={post.content} />
                           {currentUser && post.author_id === currentUser.id && (
                             <button className="text-[10px] uppercase font-black text-muted-foreground/30 hover:text-ruby transition-all">Delete</button>
                           )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {socialPosts.length === 0 && (
                <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border/50">
                  <div className="text-5xl mb-4 opacity-20">🌍</div>
                  <h3 className="text-lg font-bold text-muted-foreground">No updates yet</h3>
                  <p className="text-xs text-muted-foreground">Be the first to share an experience!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sticky top-28 h-fit">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h4 className="font-black text-[13px] uppercase tracking-wider mb-4 text-teal">🔥 Trending Now</h4>
              <div className="space-y-4">
                {["#SriLankaTourism", "#Ella9Arches", "#Sigiriya", "#KandyPerahera", "#NegomboSeafood"].map((tag, i) => (
                  <div key={tag} className="flex items-center justify-between group cursor-pointer">
                    <div className="text-xs font-bold group-hover:text-teal transition-all">{tag}</div>
                    <div className="text-[10px] font-black text-muted-foreground/50">{Math.floor(Math.random() * 500 + 100)} posts</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal/10 to-transparent rounded-2xl p-6 border border-teal/10 border-dashed">
              <h4 className="font-bold text-sm mb-2">🛡️ Safety First</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">Report suspicious activity or fake listings to keep our community safe for everyone.</p>
              <button className="w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-teal text-pearl hover:bg-teal-dark transition-all shadow-md shadow-teal/20">Report Issue</button>
            </div>

            <div className="px-2">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                <a href="#" className="hover:text-teal transition-all">About</a>
                <a href="#" className="hover:text-teal transition-all">Privacy</a>
                <a href="#" className="hover:text-teal transition-all">Terms</a>
                <a href="#" className="hover:text-teal transition-all">Help</a>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground/20 mt-4 uppercase tracking-[0.2em]">© 2026 Pearl Hub Robust</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPage;
