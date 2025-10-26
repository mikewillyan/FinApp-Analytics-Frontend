# 🚀 CONFIGURAÇÃO PARA DESENVOLVIMENTO LOCAL

## ✅ Backend Local Configurado

Agora o frontend está configurado para usar o **backend local** na porta 10000 durante o desenvolvimento.

### 🔧 **Configuração Atual:**

- **Desenvolvimento**: Frontend local (porta 5174) + Backend local (porta 10000)
- **Produção**: Frontend + Backend ambos no Railway
- **CORS**: Configurado para aceitar `http://localhost:5174`

## 🎯 **Como Iniciar o Desenvolvimento:**

### Passo 1: Iniciar o Backend Local
```bash
# Opção 1: Use o script criado
start-backend.bat

# Opção 2: Manualmente
cd "C:\Users\Mike Willyan\Desktop\FinApp-Analytics-Backend\backend"
npm start
```

### Passo 2: Iniciar o Frontend
```bash
# No terminal do frontend
npm run dev
```

### Passo 3: Acessar
- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:10000

## 🔍 **Verificação:**

### Teste se o backend está rodando:
```bash
curl http://localhost:10000/usuario/login
# ou abra no navegador: http://localhost:10000
```

### Teste de login:
- Use suas credenciais do banco de dados local
- Ou crie uma nova conta no sistema

## ⚠️ **Pré-requisitos:**

1. **Banco de dados PostgreSQL** configurado
2. **Variáveis de ambiente** (.env) no backend:
   ```
   JWT_SECRET=sua_chave_secreta
   DATABASE_URL=sua_url_do_banco
   PORT=10000
   ```

3. **Dependências instaladas** no backend:
   ```bash
   cd "C:\Users\Mike Willyan\Desktop\FinApp-Analytics-Backend\backend"
   npm install
   ```

## 🆘 **Solução de Problemas:**

### Erro "ECONNREFUSED":
- ✅ Backend não está rodando
- ✅ Execute: `start-backend.bat`

### Erro de CORS:
- ✅ Backend já está configurado para aceitar localhost:5174
- ✅ Se mudar a porta do frontend, atualize o CORS no backend

### Erro 500:
- ✅ Verifique os logs do backend
- ✅ Confirme se o banco de dados está conectado
- ✅ Verifique as variáveis de ambiente

### Erro de banco de dados:
- ✅ Confirme se o PostgreSQL está rodando
- ✅ Verifique a DATABASE_URL no .env
- ✅ Teste a conexão com o banco

## 📋 **Estrutura do Projeto:**

```
FinApp-Analytics-Backend/
├── backend/           ← Use esta pasta
│   ├── index.js
│   ├── package.json
│   └── .env
└── FinApp-Analytics-Backend-Standalone/  ← Pasta alternativa
```

## 🎉 **Próximos Passos:**

1. **Execute `start-backend.bat`**
2. **Execute `npm run dev` no frontend**
3. **Teste o login**
4. **Desenvolva normalmente!**

Agora você tem um ambiente de desenvolvimento completo e funcional! 🚀
