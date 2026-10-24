/**
 * Regras de negócio do Diário de Leitura.
 * Não acessa DOM nem localStorage: só recebe dados e devolve resultados.
 *
 * Datas são sempre strings "AAAA-MM-DD" (mesmo formato do <input type="date">).
 */
(function (raiz) {
  'use strict';

  var LIMITES = {
    titulo: 200,
    autor: 150,
    editora: 150,
    paginasMax: 100000,
    comentarios: 2000
  };

  var REGEX_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

  /** Converte "AAAA-MM-DD" em número de dias (UTC), ou null se a data não existir. */
  function dataParaDias(texto) {
    var m = REGEX_DATA.exec(texto || '');
    if (!m) return null;
    var ano = +m[1], mes = +m[2], dia = +m[3];
    var d = new Date(Date.UTC(ano, mes - 1, dia));
    if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) {
      return null;
    }
    return Math.round(d.getTime() / 86400000);
  }

  function formatarData(texto) {
    var m = REGEX_DATA.exec(texto || '');
    return m ? m[3] + '/' + m[2] + '/' + m[1] : '';
  }

  /** Data de hoje no fuso local, como "AAAA-MM-DD". */
  function hojeISO() {
    var d = new Date();
    var mes = String(d.getMonth() + 1).padStart(2, '0');
    var dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mes + '-' + dia;
  }

  function texto(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
  }

  /**
   * Valida e normaliza os dados vindos do formulário.
   * Devolve { valido, erros: {campo: mensagem}, livro }.
   */
  function validarLivro(dados) {
    dados = dados || {};
    var erros = {};

    var titulo = texto(dados.titulo);
    var autor = texto(dados.autor);
    var editora = texto(dados.editora);
    var comentarios = texto(dados.comentarios);
    var inicio = texto(dados.inicio);
    var termino = texto(dados.termino);

    if (!titulo) erros.titulo = 'Informe o nome do livro.';
    else if (titulo.length > LIMITES.titulo) erros.titulo = 'O nome deve ter no máximo ' + LIMITES.titulo + ' caracteres.';

    if (!autor) erros.autor = 'Informe o autor.';
    else if (autor.length > LIMITES.autor) erros.autor = 'O autor deve ter no máximo ' + LIMITES.autor + ' caracteres.';

    if (editora.length > LIMITES.editora) erros.editora = 'A editora deve ter no máximo ' + LIMITES.editora + ' caracteres.';

    // Páginas: opcional; se preenchida, inteiro maior que zero.
    var paginas = null;
    var paginasTexto = dados.paginas === null || dados.paginas === undefined ? '' : String(dados.paginas).trim();
    if (paginasTexto !== '') {
      if (!/^\d+$/.test(paginasTexto) || Number(paginasTexto) < 1) {
        erros.paginas = 'A quantidade de páginas deve ser um número inteiro maior que zero.';
      } else if (Number(paginasTexto) > LIMITES.paginasMax) {
        erros.paginas = 'A quantidade de páginas deve ser no máximo ' + LIMITES.paginasMax + '.';
      } else {
        paginas = Number(paginasTexto);
      }
    }

    // Datas
    var diasInicio = null;
    if (!inicio) erros.inicio = 'Informe a data de início da leitura.';
    else {
      diasInicio = dataParaDias(inicio);
      if (diasInicio === null) erros.inicio = 'Data de início inválida.';
    }

    if (termino) {
      var diasTermino = dataParaDias(termino);
      if (diasTermino === null) erros.termino = 'Data de término inválida.';
      else if (diasInicio !== null && diasTermino < diasInicio) {
        erros.termino = 'O término não pode ser anterior ao início.';
      }
    }

    // Avaliação: 0 (sem nota) a 5, inteiro.
    var avaliacao = 0;
    if (dados.avaliacao !== undefined && dados.avaliacao !== null && dados.avaliacao !== '') {
      var n = Number(dados.avaliacao);
      if (!Number.isInteger(n) || n < 0 || n > 5) erros.avaliacao = 'A avaliação deve ser de 1 a 5 estrelas.';
      else avaliacao = n;
    }

    if (comentarios.length > LIMITES.comentarios) {
      erros.comentarios = 'Os comentários devem ter no máximo ' + LIMITES.comentarios + ' caracteres.';
    }

    var valido = Object.keys(erros).length === 0;
    return {
      valido: valido,
      erros: erros,
      livro: valido ? {
        titulo: titulo,
        autor: autor,
        editora: editora,
        paginas: paginas,
        inicio: inicio,
        termino: termino || null,
        avaliacao: avaliacao,
        comentarios: comentarios
      } : null
    };
  }

  /** 'lido' se tem data de término; senão 'lendo'. */
  function status(livro) {
    return livro && livro.termino ? 'lido' : 'lendo';
  }

  /**
   * Dias de leitura (contagem inclusiva: começar e terminar no mesmo dia = 1 dia).
   * Para livros em andamento, conta até "hoje".
   */
  function diasDeLeitura(livro, hoje) {
    var ini = dataParaDias(livro.inicio);
    var fim = dataParaDias(livro.termino || hoje || hojeISO());
    if (ini === null || fim === null) return 0;
    return Math.max(1, fim - ini + 1);
  }

  /** Lendo primeiro (início mais recente antes); depois lidos (término mais recente antes). */
  function ordenar(livros) {
    return livros.slice().sort(function (a, b) {
      var sa = status(a), sb = status(b);
      if (sa !== sb) return sa === 'lendo' ? -1 : 1;
      var chaveA = sa === 'lendo' ? a.inicio : a.termino;
      var chaveB = sb === 'lendo' ? b.inicio : b.termino;
      if (chaveA !== chaveB) return chaveA < chaveB ? 1 : -1;
      return String(a.titulo).localeCompare(String(b.titulo), 'pt-BR');
    });
  }

  /** Indicadores do topo da tela. Só livros lidos entram nos totais e na média. */
  function estatisticas(livros, hoje) {
    var ano = String(hoje || hojeISO()).slice(0, 4);
    var lidos = livros.filter(function (l) { return status(l) === 'lido'; });
    var avaliados = lidos.filter(function (l) { return l.avaliacao > 0; });
    var soma = avaliados.reduce(function (t, l) { return t + l.avaliacao; }, 0);
    return {
      lidosNoAno: lidos.filter(function (l) { return l.termino.slice(0, 4) === ano; }).length,
      totalLidos: lidos.length,
      paginasLidas: lidos.reduce(function (t, l) { return t + (l.paginas || 0); }, 0),
      notaMedia: avaliados.length ? soma / avaliados.length : null,
      lendoAgora: livros.length - lidos.length
    };
  }

  var Regras = {
    LIMITES: LIMITES,
    validarLivro: validarLivro,
    status: status,
    diasDeLeitura: diasDeLeitura,
    ordenar: ordenar,
    estatisticas: estatisticas,
    formatarData: formatarData,
    hojeISO: hojeISO,
    dataParaDias: dataParaDias
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Regras;
  else raiz.Regras = Regras;
})(typeof window !== 'undefined' ? window : this);
