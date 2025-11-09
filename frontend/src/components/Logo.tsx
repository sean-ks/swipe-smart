import logoImage from 'figma:asset/6d4ab762127092d43ebe8cb261110c38f19b87c2.png';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 60 }: LogoProps) {
  return (
    <div
      className="rounded-lg overflow-hidden border-4 border-white/40 backdrop-blur-sm shadow-lg"
      style={{ width: size, height: size }}
    >
      <img
        src={logoImage}
        alt="Swipe Smart Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
