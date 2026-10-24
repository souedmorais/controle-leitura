\# REQUIREMENTS.md — Controle de Leitura



\## Objetivo



Criar uma aplicação web que ajude uma pessoa a organizar seus livros

e acompanhar seu progresso de leitura.



\## Funcionalidades mínimas



1\. \*\*Cadastrar livro:\*\* título, autor e total de páginas.

2\. \*\*Listar livros:\*\* exibir livros registrados e seu progresso.

3\. \*\*Atualizar leitura:\*\* registrar a página atual.

4\. \*\*Exibir progresso:\*\* calcular percentual de páginas lidas.

5\. \*\*Concluir leitura:\*\* identificar livros finalizados.

6\. \*\*Editar e excluir:\*\* permitir corrigir ou remover registros, com confirmação na exclusão.

7\. \*\*Persistir dados:\*\* manter os registros após recarregar ou fechar e reabrir o navegador.

8\. \*\*Usar no celular:\*\* oferecer interface responsiva.



\## Dados obrigatórios

\- Nome do livro

\- Nome do autor

\- Início da leitura



\## Regras de negócio



\- Título e autor são obrigatórios.

\- Total de páginas deve ser um número inteiro maior que zero.

\- Página atual deve ser um número inteiro entre zero e o total de páginas.

\- Progresso (%) = página atual / total de páginas × 100.

\- Um livro chega a 100% quando a página atual é igual ao total de páginas.

\- Entradas inválidas devem exibir mensagens claras sem corromper os registros.



\## Fora do escopo inicial



\- Autenticação e contas de usuário.

\- Banco de dados ou API em servidor.

\- Sincronização entre dispositivos.

\- Integrações com serviços externos.



\## Critérios de conclusão



\- Todas as funcionalidades mínimas podem ser demonstradas no navegador.

\- As validações principais funcionam.

\- Os registros persistem no `localStorage` após recarregar a página.

\- A versão publicada no GitHub Pages funciona em celular.

\- As regras principais são verificadas com testes ou verificações reproduzíveis.



