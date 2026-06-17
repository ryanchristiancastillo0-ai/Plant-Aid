import { IoLeaf } from "react-icons/io5";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#1a1a1a] w-full px-6 py-4 mt-auto border-t border-zinc-200/60 dark:border-zinc-700/60
      flex flex-col sm:flex-row sm:items-center sm:justify-between items-center gap-3 sm:gap-2">

      <div className="flex items-center gap-1.5">
        <IoLeaf className="text-emerald-700 text-[17px]" />
        <span className="text-[15px] font-medium tracking-tight text-zinc-900">PlantAid</span>
      </div>

      <div className="flex items-center gap-4 flex-wrap justify-center">
        <a className="text-xs text-zinc-400 hover:text-emerald-700 transition-colors duration-150" href="#">Sign up</a>
        <span className="text-zinc-300 text-xs">·</span>
        <a className="text-xs text-zinc-400 hover:text-emerald-700 transition-colors duration-150" href="#">Privacy Policy</a>
        <span className="text-zinc-300 text-xs">·</span>
        <a className="text-xs text-zinc-400 hover:text-emerald-700 transition-colors duration-150" href="#">Help Center</a>
      </div>

      <p className="text-[11px] text-zinc-400/50 sm:text-right">
        © {new Date().getFullYear()} PlantAid. Botanical Precision.
      </p>

    </footer>
  );
}