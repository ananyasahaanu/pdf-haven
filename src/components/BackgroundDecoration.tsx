export function BackgroundDecoration() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Top-left gradient orb */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/[0.04] dark:bg-primary/[0.06] blur-3xl animate-float" />
      
      {/* Top-right gradient orb */}
      <div className="absolute -top-20 -right-32 h-[400px] w-[400px] rounded-full bg-premium-glow/[0.04] dark:bg-premium-glow/[0.06] blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      
      {/* Bottom-left */}
      <div className="absolute bottom-0 left-1/4 h-[350px] w-[350px] rounded-full bg-premium-glow/[0.03] dark:bg-premium-glow/[0.05] blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      
      {/* Center-right */}
      <div className="absolute top-1/2 -right-20 h-[300px] w-[300px] rounded-full bg-primary/[0.03] dark:bg-primary/[0.05] blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      {/* Grid pattern - light mode only */}
      <div className="absolute inset-0 dark:opacity-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      {/* Subtle diagonal lines - light mode depth */}
      <div className="absolute inset-0 dark:opacity-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(135deg, hsl(var(--primary)) 0.5px, transparent 0.5px)`,
        backgroundSize: '60px 60px',
      }} />
    </div>
  );
}
