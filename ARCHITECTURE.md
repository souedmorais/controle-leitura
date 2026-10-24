\# ARCHITECTURE.md — Arquitetura Inicial



\## Objetivo



Criar uma aplicação web simples e responsiva para controle de leitura,

utilizável no navegador de computadores e celulares.



\## Decisões desta demonstração



\- \*\*Frontend:\*\* aplicação estática, sem backend nesta versão. Quero um foco em responsividade, pois vou utilizar principalmente no celular.

\- \*\*Tecnologia:\*\* Quero que seja HTML, CSS e Javascript utilizando o estilo Bootstrap 5, ícone da biblioteca Fontawesome e alertas e confirmações Sweet Alert 2.

\- \*\*Persistência:\*\* `localStorage` do navegador.

\- \*\*Versionamento:\*\* Git, com repositório próprio no GitHub.

\- \*\*Publicação:\*\* GitHub Pages, preferencialmente com build/deploy via GitHub Actions se necessário.

\- \*\*Interface:\*\* responsiva e utilizável em telas pequenas.



\## Organização do código



\- Separar componentes de interface, regras de negócio e acesso ao `localStorage`.

\- Centralizar operações de leitura e gravação dos dados para facilitar evolução futura.

\- Evitar bibliotecas e abstrações desnecessárias.

\- Garantir que caminhos e recursos estáticos funcionem sob a URL de projeto do GitHub Pages.



\## Limitações conhecidas



\- Os dados ficam salvos \*\*no navegador e dispositivo utilizados\*\*, não no GitHub.

\- Não há login nem sincronização entre dispositivos nesta versão.

\- Limpar os dados do navegador pode apagar os registros.

\- GitHub Pages hospeda arquivos estáticos; não executa servidor ou banco de dados tradicional.



\## Evolução



Esta é uma prova de conceito didática. Mudanças futuras de arquitetura,

como autenticação ou persistência em nuvem, devem ser discutidas e aprovadas antes da implementação.



