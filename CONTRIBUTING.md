# Contribuindo para o Sem Desculpas

Obrigado por se interessar em contribuir! 🎉

## Como Contribuir

### Reportando Bugs

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/Thyanri/semdesculpasv1/issues)
2. Abra uma nova issue descrevendo:
   - O que aconteceu
   - O que era esperado
   - Passos para reproduzir
   - Screenshots (se aplicável)

### Sugerindo Funcionalidades

Abra uma issue com a tag `feature` descrevendo sua ideia e por que seria útil.

### Pull Requests

1. Fork o repositório
2. Crie uma branch para sua feature: `git checkout -b minha-feature`
3. Faça suas alterações
4. Commit com uma mensagem clara: `git commit -m "feat: descrição da mudança"`
5. Push para sua branch: `git push origin minha-feature`
6. Abra um Pull Request

### Convenção de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` alteração na documentação
- `style:` formatação, ponto e vírgula, etc.
- `refactor:` refatoração de código
- `test:` adição ou correção de testes
- `chore:` tarefas de manutenção

## Setup Local

```bash
npm install
cp .env.example .env.local
# Configure suas credenciais no .env.local
npm run dev
```

## Estrutura do Projeto

```
src/
├── components/     # Componentes React (UI)
├── data/           # Repositórios e persistência
├── domain/         # Modelos, ações e regras de negócio
├── hooks/          # Custom hooks
├── services/       # Serviços externos (Firebase sync)
└── utils/          # Utilitários
```

## Código de Conduta

Seja respeitoso e construtivo. Estamos aqui para aprender e construir juntos.
