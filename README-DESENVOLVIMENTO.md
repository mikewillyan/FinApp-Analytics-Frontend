# FinApp Analytics Frontend

## Configuração para Desenvolvimento Local

### Pré-requisitos
- Node.js (versão 16 ou superior)
- Backend local rodando na porta 3000

### Configuração do Backend Local

1. **Certifique-se de que seu backend está rodando localmente:**
   ```bash
   # Exemplo: se seu backend é Node.js/Express
   npm start
   # ou
   node server.js
   ```

2. **Verifique se o backend está acessível em:**
   ```
   http://localhost:3000
   ```

### Configuração do Frontend

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acesse a aplicação em:**
   ```
   http://localhost:5173
   ```

### Como Funciona a Configuração

- **Desenvolvimento Local**: O frontend detecta automaticamente quando está rodando em `localhost` e usa o proxy configurado no Vite (`/api`) que redireciona para `http://localhost:3000`
- **Produção**: Usa automaticamente a URL do Railway (`https://finapp-backend-production-b3e5.up.railway.app`)

### Estrutura da Configuração

- `src/config/api.js`: Gerencia as URLs da API baseadas no ambiente
- `vite.config.js`: Configura o proxy para desenvolvimento local

### Solução de Problemas

**Problema**: Frontend carrega mas não consegue buscar dados do backend

**Soluções**:
1. Verifique se o backend está rodando na porta 3000
2. Teste se o backend responde em `http://localhost:3000`
3. Verifique se não há erros de CORS no backend
4. Confirme se as rotas da API estão corretas

**Para testar a conexão**:
```bash
# Teste se o backend está respondendo
curl http://localhost:3000/health
# ou
curl http://localhost:3000/api/health
```
