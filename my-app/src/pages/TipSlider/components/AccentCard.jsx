

export default function AccentCard() {
  return (
    <div className="min-w-[260px] md:min-w-[360px] snap-start flex-shrink-0">
      <div className="relative overflow-hidden border border-[#c8c5ca]/30 rounded-3xl h-full min-h-[320px] flex flex-col justify-end group shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)]">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp-l5_0OdHfjjeHSDo-7qEyLy4RIsvgxlHGh5mCgCnPTQ0j4AR6jY069kult-ohT7DGQABMYooAw-F5oXzt6RyXHFtSTMeq6CuqgGSAjR1xNo0qo201qeENHV56JiJX0rU1HJKOE-HI5ehfPan4JkGx-I1B8EEqoyC9NL_MCZ83wWbMiilXILa0QaO9DynMLteEnvPk8wsLDA4AVkFvxNEF6xiTqmpJt_1N_LyfOoj92CfHJrfI8S6eOYrjIJIIKir0LzOmqg-3n0"
          alt="Monstera leaf"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="relative z-10 p-6">
          <h3 className="text-xl font-bold text-white tracking-tight mb-1">Join our Green Community</h3>
          <p className="text-sm text-white/80 mb-4">Access 500+ species-specific guides.</p>
          <button className="bg-white text-black w-full py-3 rounded-xl font-bold text-sm hover:bg-[#a6f2d1] transition-colors duration-200">
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
}
