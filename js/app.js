/**
 * Orquestra eventos: liga a interface (UI), as regras (Regras) e o armazenamento (Storage).
 */
(function () {
  'use strict';

  var MSG_FALHA_GRAVAR = 'Não foi possível salvar no navegador. Verifique se o armazenamento não está bloqueado ou cheio.';

  function atualizarTela() {
    UI.renderizar(Storage.listar());
  }

  function aoSalvar(evento) {
    evento.preventDefault();
    var resultado = Regras.validarLivro(UI.lerFormulario());
    if (!resultado.valido) {
      UI.mostrarErros(resultado.erros);
      return;
    }
    UI.limparErros();

    var id = UI.idEmEdicao();
    var salvo = id ? Storage.atualizar(id, resultado.livro) : Storage.adicionar(resultado.livro);
    if (!salvo) {
      UI.avisoErro(id ? MSG_FALHA_GRAVAR + ' (ou o livro não existe mais)' : MSG_FALHA_GRAVAR);
      return;
    }
    UI.fecharFormulario();
    atualizarTela();
    UI.avisoSucesso(id ? 'Livro atualizado!' : 'Livro registrado!');
  }

  function aoClicarNaLista(evento) {
    var botao = evento.target.closest('button[data-acao]');
    if (!botao) return;
    var cartao = botao.closest('[data-id]');
    var livro = Storage.buscar(cartao.dataset.id);
    if (!livro) { atualizarTela(); return; }

    if (botao.dataset.acao === 'editar') {
      UI.abrirFormulario(livro);
    } else if (botao.dataset.acao === 'excluir') {
      UI.confirmarExclusao(livro).then(function (confirmado) {
        if (!confirmado) return;
        if (!Storage.excluir(livro.id)) { UI.avisoErro('Não foi possível excluir o livro.'); return; }
        if (UI.idEmEdicao() === livro.id) UI.fecharFormulario();
        atualizarTela();
        UI.avisoSucesso('Livro excluído.');
      });
    }
  }

  function iniciar() {
    UI.montarEstrelasEntrada();

    document.getElementById('btn-registrar').addEventListener('click', function () {
      if (UI.formularioAberto() && !UI.idEmEdicao()) { UI.fecharFormulario(); return; }
      UI.abrirFormulario(null);
    });
    document.getElementById('btn-cancelar').addEventListener('click', UI.fecharFormulario);
    document.getElementById('form-livro').addEventListener('submit', aoSalvar);
    document.getElementById('lista').addEventListener('click', aoClicarNaLista);

    // Estrelas: clicar na estrela já marcada remove a nota.
    document.getElementById('estrelas').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-valor]');
      if (!b) return;
      var valor = Number(b.dataset.valor);
      UI.definirAvaliacao(valor === UI.obterAvaliacao() ? 0 : valor);
    });

    // O término não pode ser anterior ao início: reflete no seletor de data.
    document.getElementById('inicio').addEventListener('change', function (e) {
      document.getElementById('termino').min = e.target.value || '';
    });

    atualizarTela();
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
