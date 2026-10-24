/**
 * Único ponto de acesso ao localStorage.
 * Se um dia os dados forem para a nuvem, só este arquivo muda.
 */
(function (raiz) {
  'use strict';

  var CHAVE = 'controle-leitura:livros:v1';

  function novoId() {
    if (raiz.crypto && typeof raiz.crypto.randomUUID === 'function') return raiz.crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  /** Lê a lista. Dado ausente ou corrompido vira lista vazia (sem derrubar a tela). */
  function listar() {
    try {
      var bruto = raiz.localStorage.getItem(CHAVE);
      if (!bruto) return [];
      var dados = JSON.parse(bruto);
      return Array.isArray(dados) ? dados : [];
    } catch (e) {
      return [];
    }
  }

  /** Grava a lista. Devolve true/false para a tela poder avisar em caso de falha. */
  function gravar(livros) {
    try {
      raiz.localStorage.setItem(CHAVE, JSON.stringify(livros));
      return true;
    } catch (e) {
      return false;
    }
  }

  function adicionar(livro) {
    var livros = listar();
    var novo = Object.assign({ id: novoId(), criadoEm: new Date().toISOString() }, livro);
    livros.push(novo);
    return gravar(livros) ? novo : null;
  }

  function atualizar(id, dados) {
    var livros = listar();
    var i = livros.findIndex(function (l) { return l.id === id; });
    if (i === -1) return null;
    livros[i] = Object.assign({}, livros[i], dados, { id: id });
    return gravar(livros) ? livros[i] : null;
  }

  function excluir(id) {
    var livros = listar();
    var restantes = livros.filter(function (l) { return l.id !== id; });
    if (restantes.length === livros.length) return false;
    return gravar(restantes);
  }

  function buscar(id) {
    return listar().find(function (l) { return l.id === id; }) || null;
  }

  raiz.Storage = { listar: listar, buscar: buscar, adicionar: adicionar, atualizar: atualizar, excluir: excluir };
})(window);
