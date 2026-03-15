export default function LogoMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0d1b3a] shadow-lg">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 7.5A2.5 2.5 0 1 1 8 12.5A2.5 2.5 0 0 1 8 7.5Z"
          fill="currentColor"
          opacity="0.95"
        />
        <path
          d="M16 11.5A2.5 2.5 0 1 1 16 16.5A2.5 2.5 0 0 1 16 11.5Z"
          fill="currentColor"
          opacity="0.75"
        />
        <path
          d="M14.5 5A2.5 2.5 0 1 1 14.5 10A2.5 2.5 0 0 1 14.5 5Z"
          fill="currentColor"
          opacity="0.55"
        />
        <path
          d="M10.2 9.1L12.4 7.9M10.3 10.9L13.7 13.2M14.9 10L15.4 11.6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}