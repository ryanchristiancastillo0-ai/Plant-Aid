import { IoLeaf } from "react-icons/io5";



export default function PlantPlaceholder({ size = 'md' }) {
  const dim = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';
  const iconSize = size === 'lg' ? 'text-4xl' : 'text-2xl';
  return (
    <div className={`${dim} rounded-2xl bg-emerald-50 border-2 border-dashed border-emerald-200 flex items-center justify-center flex-shrink-0`}>
      <IoLeaf className={`${iconSize} text-emerald-300`} />
    </div>
  );
}