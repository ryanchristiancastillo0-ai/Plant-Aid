export default function Avatar({ photoURL, initials }) {
  return (
    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-[#a6f2d1] flex items-center justify-center ring-4 ring-white shadow-lg flex-shrink-0">
      {photoURL ? (
        <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="text-3xl font-extrabold text-[#1b6b51]">{initials}</span>
      )}
    </div>
  );
}
