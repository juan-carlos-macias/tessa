module.exports = {
    port: undefined,
    environment: undefined,
    authorization: {
        username: undefined,
        password: undefined,
    },
    mongodb: {
        uri: undefined,
    },
    production: false,
    logger: {
        level: 'debug',
    },
    firebase: {
        firebaseConfig: {
            type: undefined,
            project_id: undefined,
            private_key_id: undefined,
            private_key: undefined,
            client_email: undefined,
            client_id: undefined,
            auth_uri: undefined,
            token_uri: undefined,
            auth_provider_x509_cert_url: undefined,
            client_x509_cert_url: undefined,
            universe_domain: undefined,
        },
    },
    openAI: {
        token: undefined,
    },    
};
