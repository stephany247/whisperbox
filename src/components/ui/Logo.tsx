function Logo() {
  return (
    <div className="text-center mb-10">
      <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_var(--accent-glow)]">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
            fill="var(--accent)"
            opacity="0.15"
          />
          <path
            d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
            stroke="var(--accent)"
            strokeWidth="1.5"
          />
          <circle cx="20" cy="18" r="4" fill="var(--accent)" />
          <path
            d="M14 26c0-3.3 2.7-6 6-6s6 2.7 6 6"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-[-0.5px]">
        WhisperBox
      </h1>

      <p className="text-gray-400 text-xs font-mono mt-1 tracking-wider">
        End-to-end encrypted. Zero knowledge.
      </p>
    </div>
  );
}

export default Logo;
