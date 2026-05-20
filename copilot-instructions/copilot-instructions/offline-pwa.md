# Offline PWA

## Objetivo

Garantir uso do app sem internet, com enfileiramento e sincronização automática ao reconectar.

## Componentes Obrigatórios

- OfflineService para gerenciar:
  - status de conexão (isOnline$, isOffline$)
  - fila de sincronização (syncQueue$)
  - último horário de sincronização (lastSyncTime$)
- OfflineSyncInterceptor para:
  - capturar falhas de rede/offline
  - enfileirar requisições para reprocessamento
- OfflineAlertComponent para:
  - exibir estado offline ao usuário
  - mostrar quantidade de ações pendentes

## Regras de Persistência

- Persistir fila offline em localStorage
- Chave padrão: offline_sync_queue
- Persistência deve sobreviver a refresh e fechamento do app

## Regras de Integração no App

- Registrar OfflineSyncInterceptor na cadeia de interceptors HTTP
- Disponibilizar OfflineService globalmente via configuração da aplicação
- Incluir OfflineAlertComponent no layout raiz

## Regras de Sincronização

- Ao ficar offline, requisições de escrita devem ser enfileiradas
- Ao voltar online, processar fila automaticamente
- Ao sincronizar, atualizar lastSyncTime$
- Em erros de rede (status 0), tratar como cenário de offline

## Regras de UX Offline

- Informar claramente quando o app estiver sem conexão
- Exibir quantidade de itens pendentes de sincronização
- Não perder ações do usuário; priorizar confirmação local + sincronização posterior

## Configuração PWA Mínima

- Service Worker ativo via provideServiceWorker
- Manifesto em public/manifest.webmanifest
- Página offline opcional em src/offline.html

## Testes Obrigatórios de Cenário Offline

- Simular offline no navegador (DevTools > Network > Offline)
- Validar exibição do alerta offline
- Validar enqueue de ações sem rede
- Validar sincronização automática ao voltar online

## Padrões Proibidos no Fluxo Offline

- Não descartar silenciosamente erro de rede
- Não perder dados de ações do usuário quando offline
- Não depender somente de memória em runtime para fila de sync
