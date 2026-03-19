export default function GalaxyBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(14,165,233,0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_60%,rgba(59,130,246,0.06)_0%,transparent_50%)]" />

      {/* Star layers — each uses a different size, count, and animation speed */}
      <div className="stars-small" />
      <div className="stars-medium" />
      <div className="stars-large" />
    </div>
  );
}
