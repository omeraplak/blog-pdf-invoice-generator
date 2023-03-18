'use strict';

/**
 * mission service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::mission.mission');
