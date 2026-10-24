// Executar com: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../js/regras.js');

const base = { titulo: 'Princípios Milenares', autor: 'Tiago Brunet', inicio: '2026-10-01' };

test('aceita apenas os campos obrigatórios', () => {
  const r = R.validarLivro(base);
  assert.equal(r.valido, true);
  assert.equal(r.livro.termino, null);
  assert.equal(r.livro.paginas, null);
  assert.equal(r.livro.avaliacao, 0);
});

test('título, autor e início são obrigatórios', () => {
  const r = R.validarLivro({});
  assert.deepEqual(Object.keys(r.erros).sort(), ['autor', 'inicio', 'titulo']);
  assert.equal(R.validarLivro({ ...base, titulo: '   ' }).erros.titulo !== undefined, true);
});

test('páginas: inteiro maior que zero quando preenchido', () => {
  for (const ruim of ['0', '-5', '12.5', 'abc', '1e3']) {
    assert.ok(R.validarLivro({ ...base, paginas: ruim }).erros.paginas, 'deveria rejeitar ' + ruim);
  }
  assert.equal(R.validarLivro({ ...base, paginas: '320' }).livro.paginas, 320);
  assert.equal(R.validarLivro({ ...base, paginas: '' }).valido, true);
  assert.ok(R.validarLivro({ ...base, paginas: '100001' }).erros.paginas);
});

test('término não pode ser anterior ao início', () => {
  assert.ok(R.validarLivro({ ...base, termino: '2026-09-30' }).erros.termino);
  assert.equal(R.validarLivro({ ...base, termino: '2026-10-01' }).valido, true);
  assert.equal(R.validarLivro({ ...base, termino: '2026-10-20' }).valido, true);
});

test('datas inexistentes são rejeitadas', () => {
  assert.ok(R.validarLivro({ ...base, inicio: '2026-02-30' }).erros.inicio);
  assert.ok(R.validarLivro({ ...base, termino: '2026-13-01' }).erros.termino);
});

test('avaliação: 0 a 5, inteira', () => {
  assert.equal(R.validarLivro({ ...base, avaliacao: 5 }).livro.avaliacao, 5);
  assert.ok(R.validarLivro({ ...base, avaliacao: 6 }).erros.avaliacao);
  assert.ok(R.validarLivro({ ...base, avaliacao: 2.5 }).erros.avaliacao);
});

test('entrada inválida não gera livro (nada para gravar)', () => {
  assert.equal(R.validarLivro({ ...base, autor: '' }).livro, null);
});

test('status deriva da data de término', () => {
  assert.equal(R.status({ termino: null }), 'lendo');
  assert.equal(R.status({ termino: '2026-10-20' }), 'lido');
});

test('dias de leitura: inclusivo, e até hoje se em andamento', () => {
  assert.equal(R.diasDeLeitura({ inicio: '2026-10-01', termino: null }, '2026-10-24'), 24);
  assert.equal(R.diasDeLeitura({ inicio: '2026-10-01', termino: '2026-10-01' }), 1);
  assert.equal(R.diasDeLeitura({ inicio: '2026-10-01', termino: '2026-10-20' }), 20);
  assert.equal(R.diasDeLeitura({ inicio: '2026-12-30', termino: '2027-01-02' }), 4);
});

test('ordenação: lendo primeiro, depois lidos do mais recente ao mais antigo', () => {
  const lista = [
    { titulo: 'A', inicio: '2026-01-01', termino: '2026-02-01' },
    { titulo: 'B', inicio: '2026-03-01', termino: null },
    { titulo: 'C', inicio: '2026-02-01', termino: '2026-04-01' },
    { titulo: 'D', inicio: '2026-05-01', termino: null }
  ];
  assert.deepEqual(R.ordenar(lista).map(l => l.titulo), ['D', 'B', 'C', 'A']);
});

test('estatísticas contam só livros lidos (e lendo agora separado)', () => {
  const livros = [
    { inicio: '2026-01-01', termino: '2026-02-01', paginas: 200, avaliacao: 4 },
    { inicio: '2025-11-01', termino: '2025-12-01', paginas: 100, avaliacao: 5 },
    { inicio: '2026-03-01', termino: '2026-03-10', paginas: null, avaliacao: 0 },
    { inicio: '2026-10-01', termino: null, paginas: 500, avaliacao: 5 }
  ];
  const s = R.estatisticas(livros, '2026-10-24');
  assert.equal(s.lidosNoAno, 2);
  assert.equal(s.totalLidos, 3);
  assert.equal(s.paginasLidas, 300);
  assert.equal(s.notaMedia, 4.5);
  assert.equal(s.lendoAgora, 1);
});

test('estatísticas sem nenhum livro lido', () => {
  const s = R.estatisticas([{ inicio: '2026-10-01', termino: null, avaliacao: 5 }], '2026-10-24');
  assert.equal(s.notaMedia, null);
  assert.equal(s.totalLidos, 0);
  assert.equal(s.lendoAgora, 1);
});

test('formatarData', () => {
  assert.equal(R.formatarData('2026-10-01'), '01/10/2026');
  assert.equal(R.formatarData(''), '');
});
