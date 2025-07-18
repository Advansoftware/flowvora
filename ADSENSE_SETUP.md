# LofiVora - Configuração do Google AdSense

## Como configurar o Google AdSense

### 1. Criar conta no AdSense
1. Acesse https://www.google.com/adsense/
2. Faça login com sua conta Google
3. Adicione seu domínio/site
4. Aguarde aprovação (pode levar alguns dias)

### 2. Configurar os anúncios

Após aprovação, crie 3 unidades de anúncio:

#### Anúncio 1: Sidebar Desktop
- Tipo: Display
- Tamanho: 160x600 (Wide Skyscraper)
- Nome: "LofiVora Sidebar"

#### Anúncio 2: Banner Mobile
- Tipo: Display  
- Tamanho: Responsivo
- Nome: "LofiVora Mobile Banner"

#### Anúncio 3: Banner Inferior
- Tipo: Display
- Tamanho: 728x90 (Leaderboard)
- Nome: "LofiVora Bottom Banner"

### 3. Atualizar configuração

Edite o arquivo `/src/config/adsense.js`:

```javascript
export const ADSENSE_CONFIG = {
  CLIENT_ID: 'ca-pub-SEU_ID_AQUI', // Substitua pelo seu ID
  
  SLOTS: {
    SIDEBAR: 'SEU_SLOT_SIDEBAR',
    MOBILE_BANNER: 'SEU_SLOT_MOBILE', 
    BOTTOM_BANNER: 'SEU_SLOT_BOTTOM',
  }
};
```

### 4. Posicionamento dos anúncios

Os anúncios estão posicionados de forma sutil:

- **Desktop**: Sidebar direita (só aparece em telas grandes)
- **Mobile**: Banner no final da lista de widgets
- **Banner inferior**: Só aparece quando o modal não está aberto

### 5. Características

- Design integrado ao tema lo-fi
- Transparência e blur effects
- Não interferem na experiência do usuário
- Responsivos para diferentes tamanhos de tela
- Carregamento assíncrono

### 6. Teste

Para testar se os anúncios estão funcionando:

1. Faça deploy do site
2. Aguarde algumas horas para propagação
3. Acesse o site em modo incógnito
4. Verifique se os anúncios aparecem

### Notas importantes

- Os anúncios só aparecerão após aprovação do AdSense
- Durante desenvolvimento, os espaços ficarão vazios
- O AdSense pode levar até 24h para começar a exibir anúncios
- Mantenha o design sutil para melhor experiência do usuário
