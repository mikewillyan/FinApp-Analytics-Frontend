# 📋 GUIA DE COMMITS - O QUE COMMITAR

## ✅ **ARQUIVOS QUE DEVEM SER COMMITADOS:**

### **Frontend (FinApp-Analytics-Frontend):**

#### 🔧 **Arquivos de Código (OBRIGATÓRIO):**
- ✅ `src/App.jsx` - Melhorias no tratamento de erros
- ✅ `src/config/api.js` - Nova configuração de API
- ✅ `vite.config.js` - Configuração simplificada

#### 📚 **Arquivos de Documentação (RECOMENDADO):**
- ✅ `DESENVOLVIMENTO-LOCAL.md` - Instruções para desenvolvimento local
- ✅ `README-DESENVOLVIMENTO.md` - Guia geral de desenvolvimento

#### 🚫 **Arquivos que NÃO devem ser commitados:**
- ❌ `start-backend.bat` - Script específico do Windows
- ❌ `CORS-RESOLVIDO.md` - Documentação temporária
- ❌ `DESENVOLVIMENTO-PRODUCAO.md` - Documentação temporária
- ❌ `SOLUCAO-ERRO-CONEXAO.md` - Documentação temporária

### **Backend (FinApp-Analytics-Backend):**

#### 🔧 **Arquivos de Código (OBRIGATÓRIO):**
- ✅ `backend/index.js` - Correção do CORS para porta 5174

#### 🚫 **Arquivos que NÃO devem ser commitados:**
- ❌ `FinApp-Analytics-Backend-Standalone/` - Pasta duplicada

## 🎯 **COMANDOS PARA COMMITAR:**

### **Frontend:**
```bash
cd "C:\Users\Mike Willyan\Desktop\FinApp-Analytics-Frontend"

# Adicionar arquivos importantes
git add src/App.jsx
git add src/config/api.js
git add vite.config.js
git add DESENVOLVIMENTO-LOCAL.md
git add README-DESENVOLVIMENTO.md

# Commit
git commit -m "feat: configuração para desenvolvimento local

- Adiciona configuração dinâmica de API (local/produção)
- Melhora tratamento de erros na autenticação
- Adiciona documentação para desenvolvimento local
- Simplifica configuração do Vite"
```

### **Backend:**
```bash
cd "C:\Users\Mike Willyan\Desktop\FinApp-Analytics-Backend\backend"

# Adicionar arquivo modificado
git add index.js

# Commit
git commit -m "fix: corrige CORS para aceitar porta 5174

- Adiciona localhost:5174 às origens permitidas
- Resolve problema de conexão em desenvolvimento local"
```

## 📝 **MENSAGENS DE COMMIT RECOMENDADAS:**

### **Para Frontend:**
```
feat: configuração para desenvolvimento local

- Adiciona configuração dinâmica de API (local/produção)
- Melhora tratamento de erros na autenticação
- Adiciona documentação para desenvolvimento local
- Simplifica configuração do Vite
```

### **Para Backend:**
```
fix: corrige CORS para aceitar porta 5174

- Adiciona localhost:5174 às origens permitidas
- Resolve problema de conexão em desenvolvimento local
```

## 🚀 **PRÓXIMOS PASSOS:**

1. **Execute os comandos** acima
2. **Faça push** para o GitHub:
   ```bash
   git push origin main
   ```
3. **Mantenha os arquivos temporários** localmente (não commitados)

## 💡 **DICAS:**

- ✅ **Sempre commite** melhorias de código e configurações
- ✅ **Documente** mudanças importantes
- ❌ **Não commite** arquivos temporários ou específicos do sistema
- ❌ **Não commite** pastas duplicadas ou desnecessárias

## 🔍 **VERIFICAÇÃO FINAL:**

Antes de fazer push, verifique:
- ✅ Código funciona em desenvolvimento local
- ✅ Código funciona em produção
- ✅ Documentação está clara
- ✅ Não há arquivos desnecessários no commit
