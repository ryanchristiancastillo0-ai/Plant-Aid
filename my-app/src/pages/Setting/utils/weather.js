import { MdCloud, MdWbSunny, MdWbCloudy } from 'react-icons/md';
import { IoRainy, IoPartlySunny } from 'react-icons/io5';

export function weatherIcon(iconCode) {
  if (!iconCode) return MdWbCloudy;
  const id = iconCode.replace('d', '').replace('n', '');
  if (['01'].includes(id))               return MdWbSunny;
  if (['02', '03'].includes(id))         return IoPartlySunny;
  if (['04'].includes(id))               return MdCloud;
  if (['09', '10', '11'].includes(id))   return IoRainy;
  return MdWbCloudy;
}
