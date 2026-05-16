/**
 * Converte um valor numérico para extenso (Português Brasil)
 * @param valor - O valor em reais
 * @returns O valor por extenso
 */
export function numeroParaExtenso(valor: number): string {
  if (typeof valor !== 'number' || isNaN(valor)) return "";
  
  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const dezenas = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const centenas = ["", "cem", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  if (valor === 0) return "zero reais";

  const formatarCentena = (n: number): string => {
    if (n === 0) return "";
    if (n === 100) return "cem";
    
    let result = "";
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) result += (c === 1 ? "cento" : centenas[c]);
    
    if (d > 0 || u > 0) {
      if (result !== "") result += " e ";
      
      if (d === 1) {
        result += especiais[u];
      } else {
        if (d > 0) result += dezenas[d];
        if (d > 0 && u > 0) result += " e ";
        if (u > 0) result += unidades[u];
      }
    }
    
    return result;
  };

  const partes = valor.toFixed(2).split(".");
  const reais = parseInt(partes[0]);
  const centavos = parseInt(partes[1]);

  let extensoReais = "";
  
  if (reais > 0) {
    if (reais < 1000) {
      extensoReais = formatarCentena(reais);
    } else if (reais < 1000000) {
      const milhar = Math.floor(reais / 1000);
      const resto = reais % 1000;
      extensoReais = (milhar === 1 ? "" : formatarCentena(milhar)) + " mil";
      if (resto > 0) extensoReais += (resto < 100 ? " e " : " ") + formatarCentena(resto);
    }
    extensoReais += (reais === 1 ? " real" : " reais");
  }

  let extensoCentavos = "";
  if (centavos > 0) {
    extensoCentavos = formatarCentena(centavos) + (centavos === 1 ? " centavo" : " centavos");
  }

  if (extensoReais && extensoCentavos) return `${extensoReais} e ${extensoCentavos}`;
  return extensoReais || extensoCentavos;
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}
