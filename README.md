# Sistema de Geração de Testes com IA

Este projeto é um sistema frontend desenvolvido em React para facilitar a criação automatizada de questionários a partir de uma IA. A aplicação se comunica com uma API backend para gerar, exibir e avaliar questões, integrando inteligência artificial ao processo educacional.

## 🎯 Objetivo

Facilitar a criação de questionários personalizados com o apoio de IA, otimizando o tempo de professores e profissionais da educação, e promovendo experiências de aprendizagem adaptativas e modernas.

---

## 🛠️ Tecnologias Utilizadas

- **React** (Frontend)
- **JavaScript**
- **Docker**
- **CSS**
- **OpenAI API** (Integração com IA)
- **Node Package Manager (npm)**

---

## 📁 Estrutura do Projeto

```
SistemaTestesIA-frontend
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── App.js
│   ├── index.js
│   └── ...
├── Dockerfile
├── package.json
└── README.md
```

---

## 🚀 Como Executar o Projeto com Docker Compose

### 1. Preparação da Estrutura

Crie uma pasta localmente e insira nela:

- Os arquivos `docker-compose.yml` e `.env` (fornecidos na entrega do projeto através da plataforma da faculdade).
- Clone este repositório (`SistemaTestesIA-frontend`) dentro da pasta.
- Clone também o repositório do backend (ex: `SistemaTestesIA-backend`).

```
meu-projeto/
├── docker-compose.yml
├── .env
├── SistemaTestesIA-frontend/
└── SistemaTestesIA-backend/
```

### 2. Executar com Docker Compose

No terminal, dentro da pasta raiz (`meu-projeto`):

```bash
docker-compose up --build
```

A aplicação estará disponível em:

```
Frontend: http://localhost:3000
Backend: http://localhost:8000 (ou a porta definida)
```

---

## 🔄 Principais Endpoints (Frontend)

> A aplicação frontend consome os seguintes endpoints disponibilizados pela API backend:

| Método | Rota                  | Descrição                                |
|--------|-----------------------|-------------------------------------------|
| GET    | `/quizzes`            | Lista todos os questionários              |
| POST   | `/quizzes`            | Cria um novo questionário com base na IA  |
| PUT    | `/quizzes/:id`        | Atualiza um questionário existente        |
| DELETE | `/quizzes/:id`        | Remove um questionário                    |

---

## 🌐 Integração com API Externa (OpenAI)

A aplicação se integra com a API da OpenAI para gerar as perguntas com base em temas definidos pelo usuário.

### 📌 Informações da API

- **Provedor:** OpenAI
- **Licença:** Proprietária, uso sob assinatura. Forneci a chave com créditos da minha assinatura.
- **Cadastro:** Necessário possuir uma conta em [https://platform.openai.com/](https://platform.openai.com/)
- **Endpoint Utilizado:** `https://api.openai.com/v1/chat/completions`
- **Modelo:** `gpt-4` ou `gpt-3.5-turbo`

---

## 📦 Instalação Local sem Docker (alternativa)

```bash
npm install
npm start
```

A aplicação estará disponível em: [http://localhost:3000](http://localhost:3000)

---

## 👨‍🏫 Autoria

Este projeto foi desenvolvido como parte da avaliação da pós-graduação em Desenvolvimento de Sistemas com Inteligência Artificial.

**Autor:** Ricardo Mitrano  
**Data:** Abril de 2025
