type Props = {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
};

const widths = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
};

export default function PageWrapper({ children, maxWidth = "md" }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${widths[maxWidth]} mx-auto p-6 space-y-4`}>
        {children}
      </div>
    </div>
  );
}
