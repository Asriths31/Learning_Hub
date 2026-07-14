const SkeletonCard = () => {
  return (
    <div className="bg-surface-card rounded-card shadow-card overflow-hidden">
      {/* Thumbnail skeleton */}
      <div className="aspect-video skeleton"></div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton w-3/4"></div>
        <div className="h-3 skeleton w-full"></div>
        <div className="h-3 skeleton w-2/3"></div>
        <div className="h-1.5 skeleton w-full mt-2"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
