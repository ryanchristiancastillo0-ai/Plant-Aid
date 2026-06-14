
import {deriveBotanicalSpecs, sunlightLabel,} from '../services/PlantDetailService';

export default function BotanicalSpecsView({ masterPlant }) {
  const specs = deriveBotanicalSpecs(masterPlant);

  const sections = [
    {
      title: 'Botanical Classification',
      rows: [
        { label: 'Family',   value: specs.family   },
        { label: 'Genus',    value: specs.genus     },
        { label: 'Origin',   value: specs.origin    },
        { label: 'Toxicity', value: specs.toxicity  },
      ],
    },
    {
      title: 'Care Requirements',
      rows: masterPlant ? [
        { label: 'Sunlight',    value: sunlightLabel(masterPlant.sunlight ?? '') },
        { label: 'Water Every', value: masterPlant.wateringFrequency   ? `${masterPlant.wateringFrequency} days`   : '—' },
        { label: 'Fertilize',   value: masterPlant.fertilizerFrequency ? `${masterPlant.fertilizerFrequency} days` : '—' },
        { label: 'Growth Days', value: masterPlant.growthDays          ? `${masterPlant.growthDays} days`          : '—' },
      ] : [],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">Botanical Specs</h3>
        <p className="text-xs text-zinc-400 font-medium mt-0.5">Classification and care reference data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div key={section.title} className="bg-white border border-zinc-200 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-100">
            <p className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-4">{section.title}</p>
            <dl className="space-y-0">
              {section.rows.map(({ label, value }, i) => (
                <div key={label}
                  className={`flex items-center justify-between py-3 ${
                    i < section.rows.length - 1 ? 'border-b border-zinc-100' : ''
                  }`}>
                  <dt className="text-sm text-zinc-400 font-medium">{label}</dt>
                  <dd className="text-sm font-bold text-zinc-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {masterPlant && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-100">
          <p className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-4">Health Threats</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Common Pests',    value: masterPlant.pests    },
              { label: 'Common Diseases', value: masterPlant.diseases  },
            ].map(({ label, value }) => (
              <div key={label} className="bg-red-50 border border-red-100 rounded-2xl p-4">
                <p className="text-[11px] font-extrabold text-red-400 uppercase tracking-widest mb-2">{label}</p>
                <p className="text-sm font-bold text-red-900">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}