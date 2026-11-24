//the CourseTrack logo. a graduation cap (studying) inside a ring that is part filled (tracking progress)
//the colours are written here on purpose, because the navbar it sits in is always dark blue in both the dark and the light theme
export default function Logo({ className = "brand-logo" }) {
  return (
    //aria-hidden because the name CourseTrack is already written next to the logo, so a screen reader does not need to read the picture as well
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {/*the light blue rounded square the logo sits on*/}
      <rect width="48" height="48" rx="12" fill="#B8E0FF" />

      {/*the ring. the lighter circle is the full ring and the dark arc on top of it is the part that is filled, like progress*/}
      <circle cx="24" cy="24" r="18" fill="none" stroke="#8DBDE8" strokeWidth="3.6" />
      <path d="M24 6A18 18 0 1 1 6 24" fill="none" stroke="#0B2557" strokeWidth="3.6" strokeLinecap="round" />

      {/*the graduation cap: the flat top, the round part under it and the tassel hanging on the right*/}
      <path d="M24 14.5 35.5 20 24 25.5 12.5 20Z" fill="#0B2557" stroke="#0B2557" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M17.5 24.2V28.6C17.5 30.6 20.4 32 24 32S30.5 30.6 30.5 28.6V24.2L24 27.2Z" fill="#0B2557" />
      <path d="M35.5 20V27.5" stroke="#0B2557" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="35.5" cy="28.6" r="1.7" fill="#0B2557" />
    </svg>
  );
}
