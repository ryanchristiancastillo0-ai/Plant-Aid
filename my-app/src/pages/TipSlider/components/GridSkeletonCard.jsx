export default function GridSkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-[#c8c5ca]/30 dark:border-zinc-700/50 rounded-3xl p-5 flex flex-col gap-3 animate-pulse h-52">
      <div className="flex justify-between">
        <div className="w-10 h-10 bg-[#e8f8f1] rounded-xl" />
        <div className="w-14 h-4 bg-[#e8f8f1] rounded-full" />
      </div>
      <div className="h-3.5 bg-[#e8f8f1] rounded-lg w-3/4" />
      <div className="h-3 bg-[#e8f8f1] rounded-lg w-full" />
      <div className="h-3 bg-[#e8f8f1] rounded-lg w-5/6" />
      <div className="h-3 bg-[#e8f8f1] rounded-lg w-4/6 mt-auto" />
    </div>
  );
}