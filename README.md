# Litrão · Reset Metabólico

SaaS de suporte para distribuidores do projeto de bebidas funcionais Herbalife (Litrão / Reset Metabólico).

**Mobile First:** todo o layout e CSS foram pensados primeiro para telas pequenas (celular). Os breakpoints usam `min-width` para progressive enhancement em tablet e desktop. Botões e CTAs têm área de toque mínima (~44px) em mobile.

## O que tem hoje

- **Landing page**: apresentação do projeto (a bebida + oportunidade de negócio)
- **Área de membros**: login e área exclusiva para distribuidores (estrutura pronta para você conectar autenticação real depois)

## Como rodar

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Build para produção

```bash
npm run build
npm run preview
```

## Próximos passos sugeridos

1. Conectar login a um backend (ex.: Supabase, Firebase ou sua API) para autenticação real.
2. Proteger a rota `/membros` para só usuários logados.
3. Adicionar conteúdo na área de membros: materiais, suporte, treinamentos.
4. Incluir imagens reais do produto (garrafa, embalagem) na seção da bebida.
