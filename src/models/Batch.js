const mongoose =
    require('mongoose');

const batchSchema =
    new mongoose.Schema(
        {
            batchId: {
                type: String,
                required: true,
                unique: true,
                index: true
            },

            totalOrders: {
                type: Number,
                default: 0
            },

            processedOrders: {
                type: Number,
                default: 0
            },

            successOrders: {
                type: Number,
                default: 0
            },

            failedOrders: {
                type: Number,
                default: 0
            },

            status: {
                type: String,
                enum: [
                    'PROCESSING',
                    'COMPLETED',
                    'FAILED'
                ],
                default:
                    'PROCESSING'
            },

            results: {
                type: Array,
                default: []
            }
        },
        {
            timestamps: true,
            versionKey: false
        }
    );

module.exports =
    mongoose.model(
        'Batch',
        batchSchema
    );