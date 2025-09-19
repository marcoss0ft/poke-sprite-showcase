# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/114c9d3a-63b1-4497-8836-8dcf656fa148

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/114c9d3a-63b1-4497-8836-8dcf656fa148) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

### Backend API

- Express.js
- PostgreSQL (via `pg`)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/114c9d3a-63b1-4497-8836-8dcf656fa148) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Conectando ao PostgreSQL externo

1. Copie o arquivo `.env.example` para `.env` e ajuste as variáveis de acordo com o seu ambiente:

   ```sh
   cp .env.example .env
   ```

   - Atualize `DATABASE_URL` com o IP ou DNS público da instância (por exemplo `postgresql://admin:cloudq@192.169.0.189/meubanco`).
   - Caso altere a porta da API, lembre-se de refletir o valor em `VITE_API_URL`.

2. Instale as dependências (se ainda não instaladas):

   ```sh
   npm install
   ```

3. Em um terminal, suba o backend Express que faz a ponte com o Postgres:

   ```sh
   npm run server
   ```

   A API inicializa automaticamente a tabela `captured_pokemon` se ela ainda não existir.

4. Em outro terminal, rode a aplicação web normalmente:

   ```sh
   npm run dev
   ```

5. Acesse `http://localhost:5173`, capture um Pokémon e o backend irá persistir o payload completo retornado pela PokéAPI no banco externo.

### Troubleshooting

- **Erro de conexão com o banco**: confirme que o host/IP está acessível da máquina local e que a porta padrão (`5432`) está liberada.
- **TLS/SSL obrigatório**: se a instância exigir SSL, adapte a `DATABASE_URL` para incluir `?sslmode=require`.
- **Limpar capturas**: use `DELETE /api/captured/:id` para remover um registro específico.
