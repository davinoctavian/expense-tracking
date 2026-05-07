type Props = {
  children: React.ReactNode;
  title?: string;
};

export default function FormCard({ children, title }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      {title && (
        <h2 className="text-sm font-semibold text-gray-700 mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
}
