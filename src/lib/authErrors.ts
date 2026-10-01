export function googleLoginError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  switch (code) {
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela do Google. Permita pop-ups para este site e tente novamente.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'O login não foi concluído. Clique em Entrar com o Google para tentar novamente.';
    case 'auth/unauthorized-domain':
      return 'Este endereço do site não está autorizado no Firebase. Adicione o domínio em Authentication → Settings → Authorized domains no console do projeto.';
    case 'auth/operation-not-allowed':
      return 'O login com Google não está habilitado no Firebase deste projeto.';
    case 'auth/network-request-failed':
      return 'Não foi possível conectar ao Google. Verifique sua conexão e tente novamente.';
    case 'auth/web-storage-unsupported':
      return 'O navegador está bloqueando o armazenamento necessário para entrar. Permita os dados deste site e tente novamente.';
    default:
      return `Não foi possível entrar com o Google. Tente novamente.${code.startsWith('auth/') ? ` Código: ${code}.` : ''}`;
  }
}
