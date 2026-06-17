import {
  MdLightbulb,
  MdSecurity

} from 'react-icons/md';


export default function BentoGridTips() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full mt-4 max-w-3xl mx-auto">
      <div className="bg-white border border-[#c8c5ca]/40 p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-start gap-4">
        <div className="bg-[#a6f2d1] p-3 rounded-xl text-[#237157] flex-shrink-0">
          <MdLightbulb className="text-xl" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-black dark:text-white mb-1">Optimisation Tip</h3>
          <p className="text-xs text-[#47464a] leading-relaxed">
            For highest accuracy, ensure the specimen is in natural indirect light and centred within the frame brackets.
          </p>
        </div>
      </div>
      <div className="bg-white border border-[#c8c5ca]/40 p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-start gap-4">
        <div className="bg-[#a6f2d1] p-3 rounded-xl text-[#237157] flex-shrink-0">
          <MdSecurity className="text-xl" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-black dark:text-white mb-1">Privacy Guard</h3>
          <p className="text-xs text-[#47464a] leading-relaxed">
            Scan results are saved to your personal history only. No images stored on our servers.
          </p>
        </div>
      </div>
    </section>
  );
}
