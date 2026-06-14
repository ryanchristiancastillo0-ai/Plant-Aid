import {MdOutlineWaterDrop,MdOutlineEco,MdOutlineBuild,MdOutlineEdit} from 'react-icons/md'
export const TYPE_ICONS = {
  WATER:     <MdOutlineWaterDrop />,
  FERTILIZE: <MdOutlineEco />,
  REPOT:     <MdOutlineBuild />,
  CUSTOM:    <MdOutlineEdit />,
};

export const TYPE_STYLES = {
  WATER:     { color: 'text-sky-600',     bg: 'bg-sky-50',     border: 'border-sky-100'     },
  FERTILIZE: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  REPOT:     { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100'   },
  CUSTOM:    { color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100'  },
};