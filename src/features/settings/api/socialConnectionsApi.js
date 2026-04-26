import api from '@/api/config/axiosInstance';

function mapConfigToBackend(channelKey, config = {}) {
  if (channelKey === 'facebook') {
    return {
      app_id: config.appId ?? '',
      app_secret: config.appSecret ?? '',
      graph_api_version: config.graphApiVersion ?? '',
      page_id: config.pageId ?? '',
      page_name: config.pageName ?? '',
      webhook_verify_token: config.webhookVerifyToken ?? '',
      page_access_token: config.pageAccessToken ?? '',
    };
  }

  if (channelKey === 'whatsapp') {
    return {
      app_id: config.appId ?? '',
      app_secret: config.appSecret ?? '',
      graph_api_version: config.graphApiVersion ?? '',
      business_account_id: config.businessAccountId ?? '',
      phone_number_id: config.phoneNumberId ?? '',
      display_phone_number: config.displayPhoneNumber ?? '',
      access_token: config.accessToken ?? '',
      webhook_verify_token: config.webhookVerifyToken ?? '',
    };
  }

  return {
    provider_label: config.providerLabel ?? '',
    email_address: config.emailAddress ?? '',
    imap_host: config.imapHost ?? '',
    imap_port: config.imapPort ?? '',
    imap_username: config.imapUsername ?? '',
    imap_password: config.imapPassword ?? '',
    encryption: config.encryption ?? '',
    mailbox: config.mailbox ?? '',
    polling_interval_seconds: config.pollingIntervalSeconds ?? '',
  };
}

function mapRowToFrontend(row = {}) {
  return {
    ...row,
    config: row.config ?? {},
  };
}

export async function fetchSocialConnections(channelKey) {
  const response = await api.get('/system/social-connections', {
    params: { channel_key: channelKey },
  });

  return response.data?.data?.map(mapRowToFrontend) ?? [];
}

export async function saveSocialConnection({ channelKey, payload }) {
  const response = await api.post('/system/social-connections', {
    business_entity_id: payload.businessEntity,
    channel_key: channelKey,
    connection_name: payload.connectionName,
    is_active: payload.isActive,
    config: mapConfigToBackend(channelKey, payload.config),
  });

  return mapRowToFrontend(response.data?.data);
}

export async function activateSocialConnection(connectionId) {
  const response = await api.patch(`/system/social-connections/${connectionId}/activate`);
  return mapRowToFrontend(response.data?.data);
}

export async function deactivateSocialConnection(connectionId) {
  const response = await api.patch(`/system/social-connections/${connectionId}/deactivate`);
  return mapRowToFrontend(response.data?.data);
}

export async function deleteSocialConnection(connectionId) {
  const response = await api.delete(`/system/social-connections/${connectionId}`);
  return response.data?.message;
}
