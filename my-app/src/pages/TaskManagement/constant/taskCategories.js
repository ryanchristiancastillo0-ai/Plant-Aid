import {MdWaterDrop,MdEco,MdContentCut,MdLayers} from 'react-icons/md'

export const CATEGORIES = [
  { id: 'water',     label: 'Water',     icon: MdWaterDrop  },
  { id: 'fertilize', label: 'Fertilize', icon: MdEco        },
  { id: 'prune',     label: 'Prune',     icon: MdContentCut },
  { id: 'repot',     label: 'Repot',     icon: MdLayers     },
];

export const CATEGORY_COLORS = {
  water:     { bg: 'bg-sky-50',    text: 'text-sky-600',    border: 'border-sky-200',    active: 'bg-sky-500'    },
  fertilize: { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200',  active: 'bg-amber-500'  },
  prune:     { bg: 'bg-lime-50',   text: 'text-lime-600',   border: 'border-lime-200',   active: 'bg-lime-500'   },
  repot:     { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', active: 'bg-purple-500' },
};

// Map Firestore type → category id for colour lookup
export const TYPE_TO_CAT = { WATER: 'water', FERTILIZE: 'fertilize', REPOT: 'repot', CUSTOM: 'prune' };
