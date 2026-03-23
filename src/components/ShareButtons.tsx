import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
}

const ShareButtons = ({ title, description = "", url }: ShareButtonsProps) => {
  const { showToast } = useStore();
  const shareUrl = url || window.location.href;
  const text = `${title} - ${description}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: shareUrl });
      } catch {}
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    showToast("Registry link secured to clipboard", "success");
  };

  const channels = [
    { icon: "📘", label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { icon: "🐦", label: "X", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}` },
    { icon: "💬", label: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}` },
    { icon: "💼", label: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { icon: "✉️", label: "Email", url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + "\n\n" + shareUrl)}` },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-black uppercase tracking-widest text-mist mr-2">Disseminate:</span>
        {channels.map(ch => (
          <Tooltip key={ch.label}>
            <TooltipTrigger asChild>
              <a 
                href={ch.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-primary/20 hover:border-primary/30 transition-all hover:scale-110 active:scale-95 shadow-lg"
              >
                {ch.icon}
              </a>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-white/10 text-pearl text-[10px] font-black uppercase tracking-widest">
              Share via {ch.label}
            </TooltipContent>
          </Tooltip>
        ))}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={copyLink}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-primary/20 hover:border-primary/30 transition-all hover:scale-110 active:scale-95 shadow-lg"
            >
              🔗
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-zinc-900 border-white/10 text-pearl text-[10px] font-black uppercase tracking-widest">
            Copy Registry URL
          </TooltipContent>
        </Tooltip>

        {typeof navigator.share === "function" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={handleNativeShare}
                className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center text-lg hover:bg-primary/30 transition-all hover:scale-110 active:scale-95 shadow-lg"
              >
                📤
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-white/10 text-pearl text-[10px] font-black uppercase tracking-widest">
              System Share
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ShareButtons;
