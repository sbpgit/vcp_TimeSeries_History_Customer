/* global QUnit */
// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

sap.ui.require([
	"vcpapp/vcp_time_series_history_v3/test/unit/AllTests"
], function (Controller) {
	"use strict";
	QUnit.start();
});