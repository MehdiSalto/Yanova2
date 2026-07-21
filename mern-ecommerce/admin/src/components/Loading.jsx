const Loading = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/70">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
