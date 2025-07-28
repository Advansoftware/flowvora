// Configuração do Google AdSense
// Substitua pelos seus IDs reais do AdSense

export const ADSENSE_CONFIG = {
  // Seu ID do cliente AdSense (ca-pub-xxxxxxxxxxxxxxxx)
  CLIENT_ID: 'ca-pub-9942287479317473', // ID real do AdSense
  
  // IDs dos slots de anúncio
  SLOTS: {
    SIDEBAR: '1234567890',      // Anúncio lateral na sidebar desktop
    MOBILE_BANNER: '0987654321', // Banner responsivo no mobile
    BOTTOM_BANNER: '1122334455', // Banner inferior no desktop
  }
};

// Exemplo de como obter seus IDs:
// 1. Acesse https://www.google.com/adsense/
// 2. Crie uma conta AdSense
// 3. Adicione seu site
// 4. Crie unidades de anúncio
// 5. Copie o CLIENT_ID e os SLOT_IDs gerados
