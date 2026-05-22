const urbanebolt = require('./urbanebolt');
const mockCourier = require('./mockCourier');

const ApiError = require('../utils/errorHandler');

const SUPPORTED_COURIERS = [
    'urbanebolt',
    'mockCourier',
];

const getCourierPartner = (courierPartner) => {
    const partner = courierPartner?.toLowerCase();

    switch (partner) {
        case 'urbanebolt':
            return urbanebolt;
        
        case 'mockCourier':
            return mockCourier;

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
