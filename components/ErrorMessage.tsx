type Props = { message: string };

export default function ErrorMessage({ message }: Props) {
  if (!message) return null;
  return (
    <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
      {message}
    </p>
  );
}
