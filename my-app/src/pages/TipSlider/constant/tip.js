import { IoLeaf } from 'react-icons/io5';
import {MdWaterDrop,MdWbSunny,MdEco,MdBugReport,MdLocalFlorist,
  MdYard,MdThermostat,
} from 'react-icons/md'
export const CATEGORY_ICONS = {
  Watering:    MdWaterDrop,
  Sunlight:    MdWbSunny,
  Soil:        MdEco,
  Pests:       MdBugReport,
  Fertilizer:  MdLocalFlorist,
  Pruning:     MdYard,
  Temperature: MdThermostat,
  General:     IoLeaf,
};


export const DIFFICULTY_CONFIG = {
  Beginner:     { bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200' },
  Intermediate: { bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border-amber-200'   },
  Advanced:     { bg: 'bg-red-50',      text: 'text-red-700',      border: 'border-red-200'     },
};


export const CAROUSEL_CATEGORIES = ['All', 'Watering', 'Sunlight', 'Soil', 'Pests', 'Fertilizer', 'Pruning'];
export const GRID_CATEGORIES     = ['All', 'Watering', 'Sunlight', 'Soil', 'Pests', 'Fertilizer', 'Pruning', 'Temperature', 'General'];