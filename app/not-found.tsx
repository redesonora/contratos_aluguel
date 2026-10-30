import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-zinc-50 font-sans">
      <h2 className="text-2xl font-bold text-zinc-800 mb-2">Página não encontrada</h2>
      <p className="text-sm text-zinc-500 mb-6">A página solicitada não foi encontrada ou foi removida.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
