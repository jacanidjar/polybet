# Instruções de Execução Manual

Como o assistente não conseguiu executar comandos no terminal, por favor siga estes passos:

1. **Abra um terminal na pasta `apps/api`**:
   ```bash
   cd apps/api
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Crie o banco de dados e as tabelas**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Inicie o servidor Backend**:
   ```bash
   npm run start:dev
   ```

5. **Em outro terminal, inicie o Frontend** (se já não estiver rodando):
   ```bash
   cd apps/web
   npm run dev
   ```

6. **Popule o banco de dados**:
   - Abra o navegador ou Postman.
   - Faça uma requisição POST para: `http://localhost:3001/markets/seed`.
   - Ou simplesmente visite a página web, se não houver mercados, ela exibirá uma mensagem sugerindo o seed.
