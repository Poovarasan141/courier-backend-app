const mongoose = require('mongoose');

const trackingHistorySchema =
  new mongoose.Schema(
    {
      internalOrderId: {
        type: String,
        required: true,
        index: true
      },

      courierPartner: {
        type: String,
        required: true,
        index: true
      },

      status: {
        type: String,
        required: true,
        index: true
      },

      rawPayload: {
        type: Object,
        default: {}
      },

      trackedAt: {
        type: Date,
        default: Date.now
      }
    },
    {
      timestamps: true
    }
  );

trackingHistorySchema.index({
  internalOrderId: 1,
  trackedAt: -1
});

module.exports = mongoose.model(
  'TrackingHistory',
  trackingHistorySchema,
  'tracking_history'
);