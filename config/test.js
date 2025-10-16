require('dotenv').config();

module.exports = {
    port: 3000,
    environment: 'test',
    authorization: {
        username: '',
        password: '',
    },
    mongodb: {
        uri: 'mongodb://localhost:27017',
    },
    firebase: {
        firebaseConfig: {
            type: '',
            project_id: '',
            private_key_id: '',
            privateKey: '',
            client_email: '',
            client_id: '',
            auth_uri: '',
            token_uri: '',
            auth_provider_x509_cert_url: '',
            client_x509_cert_url: '',
            universe_domain: '',
        },
    },
};
