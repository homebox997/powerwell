(function () {
    'use strict';

    var url = 'https://cbbaejwbkenrutmgqikt.supabase.co';
    var anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYmFlandia2VucnV0bWdxaWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTc1NzQsImV4cCI6MjA5ODU3MzU3NH0.xQD6j_uqartlIZo0APxHYGzunJHjA_sZER93A4t49rE';

    function request(path, options) {
        var config = options || {};
        config.headers = Object.assign({
            apikey: anonKey,
            Authorization: 'Bearer ' + anonKey,
            'Content-Type': 'application/json'
        }, config.headers || {});

        return fetch(url + '/rest/v1/' + path, config).then(function (response) {
            if (!response.ok) {
                var error = new Error('Supabase request failed with status ' + response.status);
                error.status = response.status;
                throw error;
            }
            if (response.status === 204) return null;
            return response.text().then(function (body) {
                return body ? JSON.parse(body) : null;
            });
        });
    }

    window.PawWellSupabase = {
        url: url,
        anonKey: anonKey,
        rpc: function (name, params) {
            return request('rpc/' + encodeURIComponent(name), {
                method: 'POST',
                body: JSON.stringify(params || {})
            });
        },
        insert: function (table, record) {
            return request(encodeURIComponent(table), {
                method: 'POST',
                headers: { Prefer: 'return=minimal' },
                body: JSON.stringify(record)
            });
        }
    };
}());
