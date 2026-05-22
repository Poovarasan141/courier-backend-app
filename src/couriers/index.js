const urbanebolt = require('./urbanebolt');

const ApiError = require('../utils/errorHandler');

const SUPPORTED_COURIERS = [
    'urbanebolt'
];

const getCourierPartner = (courierPartner) => {
    const partner = courierPartner?.toLowerCase();

    switch (partner) {
        case 'urbanebolt':
            return urbanebolt;

        default: {
            const error = new Error('Unsupported courier partner');

            error.statusCode = 400;

            error.errors = {
                supported_couriers: SUPPORTED_COURIERS
            };

            throw error;
        }
    }
};

module.exports = {
    getCourierPartner
};
