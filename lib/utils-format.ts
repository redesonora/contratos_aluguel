import extenso from 'extenso';

export const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const numeroParaExtenso = (valor: number) => {
  if (!valor) return '';
  return extenso(valor.toString(), { mode: 'currency' });
};
