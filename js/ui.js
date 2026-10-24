/**
 * Camada de interface: só mexe no DOM. Regras vêm de Regras, dados de Storage.
 */
(function (raiz) {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var CAMPOS = ['titulo', 'autor', 'editora', 'paginas', 'inicio', 'termino', 'comentarios'];

  var avaliacaoAtual = 0;

  function escapar(texto) {
    return String(texto == null ? '' : texto)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ---------- Estrelas ----------

  function montarEstrelasEntrada() {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<button type="button" data-valor="' + i + '" aria-label="' + i + (i === 1 ? ' estrela' : ' estrelas') + '" aria-pressed="false">' +
        '<i class="fa-solid fa-star" aria-hidden="true"></i></button>';
    }
    $('estrelas').innerHTML = html;
  }

  function definirAvaliacao(valor) {
    avaliacaoAtual = valor;
    $('estrelas').querySelectorAll('button').forEach(function (b) {
      var ativa = Number(b.dataset.valor) <= valor;
      b.classList.toggle('ativa', ativa);
      b.setAttribute('aria-pressed', String(Number(b.dataset.valor) === valor));
    });
  }

  function estrelasLeitura(nota) {
    if (!nota) return '';
    var s = '';
    for (var i = 1; i <= 5; i++) {
      s += '<i class="fa-solid fa-star' + (i <= nota ? '' : ' vazia') + '" aria-hidden="true"></i>';
    }
    return '<div class="livro-estrelas" role="img" aria-label="Nota ' + nota + ' de 5">' + s + '</div>';
  }

  // ---------- Formulário ----------

  function limparErros() {
    CAMPOS.forEach(function (c) { $(c).classList.remove('is-invalid'); });
    $('erro-avaliacao').hidden = true;
  }

  function mostrarErros(erros) {
    limparErros();
    var primeiro = null;
    CAMPOS.concat(['avaliacao']).forEach(function (campo) {
      if (!erros[campo]) return;
      if (campo === 'avaliacao') {
        $('erro-avaliacao').textContent = erros[campo];
        $('erro-avaliacao').hidden = false;
        primeiro = primeiro || $('estrelas').querySelector('button');
        return;
      }
      var el = $(campo);
      el.classList.add('is-invalid');
      el.parentNode.querySelector('.invalid-feedback').textContent = erros[campo];
      primeiro = primeiro || el;
    });
    if (primeiro) primeiro.focus();
  }

  function lerFormulario() {
    return {
      titulo: $('titulo').value,
      autor: $('autor').value,
      editora: $('editora').value,
      paginas: $('paginas').value,
      inicio: $('inicio').value,
      termino: $('termino').value,
      avaliacao: avaliacaoAtual,
      comentarios: $('comentarios').value
    };
  }

  function abrirFormulario(livro) {
    limparErros();
    $('form-livro').reset();
    $('livro-id').value = livro ? livro.id : '';
    $('titulo-form').textContent = livro ? 'Editar livro' : 'Registrar livro';
    if (livro) {
      $('titulo').value = livro.titulo;
      $('autor').value = livro.autor;
      $('editora').value = livro.editora || '';
      $('paginas').value = livro.paginas || '';
      $('inicio').value = livro.inicio;
      $('termino').value = livro.termino || '';
      $('comentarios').value = livro.comentarios || '';
    } else {
      $('inicio').value = Regras.hojeISO();
    }
    $('termino').min = $('inicio').value || '';
    definirAvaliacao(livro ? livro.avaliacao || 0 : 0);
    $('secao-form').hidden = false;
    $('secao-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('titulo').focus({ preventScroll: true });
  }

  function fecharFormulario() {
    $('secao-form').hidden = true;
    limparErros();
    $('form-livro').reset();
    $('livro-id').value = '';
    definirAvaliacao(0);
  }

  // ---------- Indicadores e lista ----------

  function renderizarIndicadores(livros) {
    var hoje = Regras.hojeISO();
    var s = Regras.estatisticas(livros, hoje);
    $('rotulo-ano').textContent = 'Lidos em ' + hoje.slice(0, 4);
    $('ind-lidos-ano').textContent = s.lidosNoAno;
    $('ind-total').textContent = s.totalLidos;
    $('ind-paginas').textContent = s.paginasLidas.toLocaleString('pt-BR');
    $('ind-nota').textContent = s.notaMedia === null ? '–' : s.notaMedia.toFixed(1).replace('.', ',');
    $('ind-lendo').textContent = s.lendoAgora;
  }

  function cartaoLivro(livro, hoje) {
    var lido = Regras.status(livro) === 'lido';
    var dias = Regras.diasDeLeitura(livro, hoje);
    var rotuloDias = dias + (dias === 1 ? ' dia' : ' dias');
    var periodo = lido
      ? Regras.formatarData(livro.inicio) + ' a ' + Regras.formatarData(livro.termino) + ' (' + rotuloDias + ')'
      : 'Desde ' + Regras.formatarData(livro.inicio) + ' (' + rotuloDias + ')';

    var detalhes = [];
    if (livro.editora) detalhes.push(escapar(livro.editora));
    if (livro.paginas) detalhes.push(livro.paginas.toLocaleString('pt-BR') + ' páginas');

    return '<article class="livro" data-id="' + escapar(livro.id) + '">' +
      '<div class="livro-cabecalho">' +
        '<h3 class="livro-titulo">' + escapar(livro.titulo) + '</h3>' +
        '<span class="selo ' + (lido ? 'selo-lido' : 'selo-lendo') + '">' + (lido ? 'Lido' : 'Lendo') + '</span>' +
      '</div>' +
      '<div class="livro-autor">' + escapar(livro.autor) + '</div>' +
      (detalhes.length ? '<div class="livro-meta">' + detalhes.join(' · ') + '</div>' : '') +
      '<div class="livro-meta">' + periodo + '</div>' +
      estrelasLeitura(livro.avaliacao) +
      (livro.comentarios ? '<p class="livro-comentarios">' + escapar(livro.comentarios) + '</p>' : '') +
      '<div class="livro-acoes">' +
        '<button type="button" class="btn" data-acao="editar"><i class="fa-solid fa-pen" aria-hidden="true"></i> Editar</button>' +
        '<button type="button" class="btn" data-acao="excluir"><i class="fa-regular fa-trash-can" aria-hidden="true"></i> Excluir</button>' +
      '</div>' +
    '</article>';
  }

  function renderizar(livros) {
    renderizarIndicadores(livros);
    var hoje = Regras.hojeISO();
    if (!livros.length) {
      $('lista').innerHTML = '<div class="vazio"><i class="fa-regular fa-book" aria-hidden="true"></i>' +
        'Nenhum livro registrado ainda.<br>Toque em <strong>Registrar livro</strong> para começar.</div>';
      return;
    }
    $('lista').innerHTML = Regras.ordenar(livros).map(function (l) { return cartaoLivro(l, hoje); }).join('');
  }

  // ---------- Alertas (SweetAlert2) ----------

  function avisoSucesso(mensagem) {
    return Swal.fire({ toast: true, position: 'top', icon: 'success', title: mensagem, showConfirmButton: false, timer: 2200, timerProgressBar: true });
  }

  function avisoErro(mensagem) {
    return Swal.fire({ icon: 'error', title: 'Ops', text: mensagem, confirmButtonText: 'Ok', confirmButtonColor: '#1f5bbf' });
  }

  function confirmarExclusao(livro) {
    return Swal.fire({
      icon: 'warning',
      title: 'Excluir este livro?',
      text: '"' + livro.titulo + '" será removido do seu diário. Essa ação não pode ser desfeita.',
      showCancelButton: true,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#c0392b',
      focusCancel: true
    }).then(function (r) { return r.isConfirmed; });
  }

  raiz.UI = {
    montarEstrelasEntrada: montarEstrelasEntrada,
    definirAvaliacao: definirAvaliacao,
    obterAvaliacao: function () { return avaliacaoAtual; },
    lerFormulario: lerFormulario,
    mostrarErros: mostrarErros,
    limparErros: limparErros,
    abrirFormulario: abrirFormulario,
    fecharFormulario: fecharFormulario,
    formularioAberto: function () { return !$('secao-form').hidden; },
    idEmEdicao: function () { return $('livro-id').value; },
    renderizar: renderizar,
    avisoSucesso: avisoSucesso,
    avisoErro: avisoErro,
    confirmarExclusao: confirmarExclusao
  };
})(window);
