module.exports = {
    port: 'PORT',
    environment: 'ENVIRONMENT',
    authorization: {
        username: 'AUTH_API_USERNAME',
        password: 'AUTH_API_PASSWORD',
    },
    mongodb: {
        uri: 'MONGODB_URI',
    },
    logger: {
        level: 'LOGGER_LEVEL',
    },
    firebase: {
        firebaseConfig: {
            type: 'FIRE_BASE_TYPE',
            project_id: 'FIRE_BASE_PROJECT_ID',
            private_key_id: 'FIRE_BASE_PRIVATE_KEY_ID',
            private_key: 'FIRE_BASE_PRIVATE_KEY',
            client_email: 'FIRE_BASE_CLIENT_EMAIL',
            client_id: 'FIRE_BASE_CLIENT_ID',
            auth_uri: 'FIRE_BASE_AUTH_URI',
            token_uri: 'FIRE_BASE_TOKEN_URI',
            auth_provider_x509_cert_url:
                'FIRE_BASE_AUTH_PROVIDER_X509_CERT_URL',
            client_x509_cert_url: 'FIRE_BASE_CLIENT_X509_CERT_URL',
            universe_domain: 'FIRE_BASE_UNIVERSE_DOMAIN',
        },
    },
    openAI: {
        token: 'OPENAI_TOKEN',
    },
};
