(function () {
  const config = window.PowerWellAdminConfig;
  const state = {
    collection: config.collections[0].table,
    protocol: config.protocol,
    country: config.defaultCountry,
    role: config.defaultRole,
    actor: '',
    records: [],
    selected: null,
    logs: [],
    supabaseClient: null,
    authUser: null
  };

  const els = {};

  const permissions = {
    can(action) {
      return (config.roles[state.role]?.permissions || []).includes(action);
    },
    assert(action) {
      if (!this.can(action)) {
        throw new Error(`Current role cannot ${action}.`);
      }
    }
  };

  const audit = {
    record(action, table, id, status, detail) {
      const entry = {
        at: new Date().toISOString(),
        actor: state.actor || 'local-admin',
        role: state.role,
        action,
        table,
        id: id || null,
        status,
        detail: detail || ''
      };
      state.logs.unshift(entry);
      state.logs = state.logs.slice(0, 80);
      renderLogs();
      try {
        localStorage.setItem('powerwell_admin_logs', JSON.stringify(state.logs));
      } catch (_) {}
    }
  };

  const adapters = {
    'supabase-rpc': {
      label: 'Supabase RPC',
      async client() {
        if (!window.supabase) {
          throw new Error('Supabase SDK is not loaded.');
        }
        if (!state.supabaseClient) {
          state.supabaseClient = window.supabase.createClient(config.supabase.url, config.supabase.anonKey);
          window.PowerWellAdminSupabase = state.supabaseClient;
        }
        return state.supabaseClient.schema(config.supabase.schema);
      },
      async list(table) {
        permissions.assert('read');
        const client = await this.client();
        const { data, error } = await client.rpc('admin_list_records', {
          p_table: table,
          p_country: state.country,
          p_limit: 100,
          p_offset: 0
        });
        if (error) throw error;
        return data || [];
      },
      async save(table, record) {
        permissions.assert('write');
        const client = await this.client();
        const { data, error } = await client.rpc('admin_upsert_record', {
          p_table: table,
          p_id: record.id || null,
          p_content: record.content || {},
          p_country: record.country || state.country
        });
        if (error) throw error;
        return data;
      },
      async remove(table, id) {
        permissions.assert('delete');
        const client = await this.client();
        const { error } = await client.rpc('admin_delete_record', {
          p_table: table,
          p_id: id
        });
        if (error) throw error;
      }
    },
    rest: {
      label: 'REST API',
      async request(path, options) {
        const res = await fetch(`${config.rest.baseURL}${path}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Role': state.role,
            'X-Admin-Actor': state.actor,
            ...(options?.headers || {})
          }
        });
        if (!res.ok) throw new Error(`REST request failed: ${res.status}`);
        return res.status === 204 ? null : res.json();
      },
      list(table) {
        permissions.assert('read');
        return this.request(`/records?table=${encodeURIComponent(table)}&country=${encodeURIComponent(state.country)}`);
      },
      save(table, record) {
        permissions.assert('write');
        return this.request('/records', {
          method: 'POST',
          body: JSON.stringify({ table, record })
        });
      },
      remove(table, id) {
        permissions.assert('delete');
        return this.request(`/records/${encodeURIComponent(id)}?table=${encodeURIComponent(table)}`, { method: 'DELETE' });
      }
    },
    postgrest: {
      label: 'PostgREST',
      async request(path, options) {
        const res = await fetch(`${config.postgrest.baseURL}${path}`, {
          ...options,
          headers: {
            apikey: config.postgrest.apiKey,
            Authorization: `Bearer ${config.postgrest.apiKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
            ...(options?.headers || {})
          }
        });
        if (!res.ok) throw new Error(`PostgREST request failed: ${res.status}`);
        return res.status === 204 ? null : res.json();
      },
      list(table) {
        permissions.assert('read');
        return this.request(`/${table}?select=*&country=eq.${encodeURIComponent(state.country)}&order=created_at.desc`);
      },
      save(table, record) {
        permissions.assert('write');
        const method = record.id ? 'PATCH' : 'POST';
        const path = record.id ? `/${table}?id=eq.${encodeURIComponent(record.id)}` : `/${table}`;
        return this.request(path, {
          method,
          body: JSON.stringify({
            content: record.content,
            country: record.country || state.country
          })
        });
      },
      remove(table, id) {
        permissions.assert('delete');
        return this.request(`/${table}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      }
    },
    mock: {
      label: 'Local Mock',
      list(table) {
        permissions.assert('read');
        const rows = JSON.parse(localStorage.getItem(`powerwell_${table}`) || '[]');
        return Promise.resolve(rows.filter((row) => row.country === state.country));
      },
      save(table, record) {
        permissions.assert('write');
        const rows = JSON.parse(localStorage.getItem(`powerwell_${table}`) || '[]');
        const now = new Date().toISOString();
        const row = {
          id: record.id || crypto.randomUUID(),
          content: record.content,
          country: record.country || state.country,
          created_at: record.created_at || now,
          updated_at: now
        };
        const next = rows.filter((item) => item.id !== row.id).concat(row);
        localStorage.setItem(`powerwell_${table}`, JSON.stringify(next));
        return Promise.resolve(row.id);
      },
      remove(table, id) {
        permissions.assert('delete');
        const rows = JSON.parse(localStorage.getItem(`powerwell_${table}`) || '[]');
        localStorage.setItem(`powerwell_${table}`, JSON.stringify(rows.filter((item) => item.id !== id)));
        return Promise.resolve();
      }
    }
  };

  function $(id) {
    return document.getElementById(id);
  }

  function getAdapter() {
    return adapters[state.protocol] || adapters.mock;
  }

  function safeJsonParse(value) {
    try {
      return [JSON.parse(value || '{}'), null];
    } catch (err) {
      return [null, err];
    }
  }

  function summarizeContent(content) {
    const text = typeof content === 'string' ? content : JSON.stringify(content || {});
    return text.length > 130 ? `${text.slice(0, 130)}...` : text;
  }

  function setStatus(text, type) {
    els.status.textContent = text;
    els.status.style.color = type === 'error' ? '#b42318' : '#66736d';
  }

  async function getSupabaseClient() {
    if (!window.supabase) {
      throw new Error('Supabase SDK is not loaded.');
    }
    if (!state.supabaseClient) {
      state.supabaseClient = window.supabase.createClient(config.supabase.url, config.supabase.anonKey);
      window.PowerWellAdminSupabase = state.supabaseClient;
    }
    return state.supabaseClient;
  }

  function hydrateLogs() {
    try {
      state.logs = JSON.parse(localStorage.getItem('powerwell_admin_logs') || '[]');
    } catch (_) {
      state.logs = [];
    }
  }

  function renderNav() {
    els.nav.innerHTML = config.collections.map((item) => (
      `<button class="nav-item ${item.table === state.collection ? 'active' : ''}" data-table="${item.table}">${item.label}</button>`
    )).join('');
  }

  function renderMetrics() {
    els.metricRecords.textContent = state.records.length;
    els.metricProtocol.textContent = getAdapter().label;
    els.metricRole.textContent = state.authUser ? (config.roles[state.role]?.label || state.role) : 'Signed out';
    els.metricCountry.textContent = state.country;
  }

  function renderTable() {
    const query = els.search.value.trim().toLowerCase();
    const rows = state.records.filter((row) => JSON.stringify(row).toLowerCase().includes(query));

    if (!rows.length) {
      els.tableBody.innerHTML = '<tr><td colspan="6" class="empty">No records found</td></tr>';
      return;
    }

    els.tableBody.innerHTML = rows.map((row) => `
      <tr>
        <td><span class="badge">${row.country || state.country}</span></td>
        <td>${row.id || ''}</td>
        <td>${summarizeContent(row.content)}</td>
        <td><small>${row.created_at || ''}</small></td>
        <td><small>${row.updated_at || ''}</small></td>
        <td>
          <div class="row-actions">
            <button class="btn" data-edit="${row.id}">Edit</button>
            <button class="btn danger" data-delete="${row.id}" ${permissions.can('delete') ? '' : 'disabled'}>Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderEditor(record) {
    state.selected = record || null;
    els.recordId.value = record?.id || '';
    els.recordCountry.value = record?.country || state.country;
    els.recordContent.value = JSON.stringify(record?.content || {}, null, 2);
    els.saveBtn.disabled = !permissions.can('write');
    els.deleteBtn.disabled = !record?.id || !permissions.can('delete');
  }

  function renderLogs() {
    if (!state.logs.length) {
      els.logs.innerHTML = '<div class="empty">No operation logs in this browser session</div>';
      return;
    }
    els.logs.innerHTML = state.logs.map((log) => `
      <div class="log-entry">
        <strong>${log.action}</strong> ${log.table || ''} ${log.id || ''}
        <br><span>${log.at} · ${log.actor} · ${log.role} · ${log.status}</span>
        ${log.detail ? `<br><span>${log.detail}</span>` : ''}
      </div>
    `).join('');
  }

  function renderAll() {
    renderNav();
    renderMetrics();
    renderTable();
    renderEditor(state.selected);
    renderLogs();
  }

  async function loadRecords() {
    setStatus('Loading records...', 'info');
    try {
      state.records = await getAdapter().list(state.collection);
      audit.record('read', state.collection, null, 'ok', `${state.records.length} records`);
      setStatus('Records loaded', 'ok');
    } catch (err) {
      state.records = [];
      audit.record('read', state.collection, null, 'failed', err.message);
      setStatus(err.message, 'error');
    }
    state.selected = null;
    renderAll();
  }

  async function signIn() {
    try {
      const client = await getSupabaseClient();
      const email = els.authEmail.value.trim();
      const password = els.authPassword.value;
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      state.authUser = data.user;
      state.actor = data.user.email || email;
      els.actor.value = state.actor;
      audit.record('auth.sign_in', 'admin', null, 'ok', state.actor);
      setStatus('Signed in', 'ok');
      renderMetrics();
      await loadRecords();
    } catch (err) {
      audit.record('auth.sign_in', 'admin', null, 'failed', err.message);
      setStatus(err.message, 'error');
    }
  }

  async function signOut() {
    try {
      const client = await getSupabaseClient();
      await client.auth.signOut();
      audit.record('auth.sign_out', 'admin', null, 'ok', state.actor);
      state.authUser = null;
      setStatus('Signed out', 'ok');
      renderMetrics();
    } catch (err) {
      setStatus(err.message, 'error');
    }
  }

  async function saveRecord() {
    const [content, err] = safeJsonParse(els.recordContent.value);
    if (err) {
      setStatus(`Invalid JSON: ${err.message}`, 'error');
      return;
    }

    const record = {
      id: els.recordId.value || null,
      content,
      country: els.recordCountry.value || state.country
    };

    try {
      const id = await getAdapter().save(state.collection, record);
      audit.record(record.id ? 'update' : 'create', state.collection, record.id || id, 'ok');
      setStatus('Record saved', 'ok');
      await loadRecords();
    } catch (err) {
      audit.record(record.id ? 'update' : 'create', state.collection, record.id, 'failed', err.message);
      setStatus(err.message, 'error');
    }
  }

  async function deleteRecord(id) {
    if (!id) return;
    if (!window.confirm('Delete this record? This action is logged and cannot be undone from this screen.')) return;
    try {
      await getAdapter().remove(state.collection, id);
      audit.record('delete', state.collection, id, 'ok');
      setStatus('Record deleted', 'ok');
      await loadRecords();
    } catch (err) {
      audit.record('delete', state.collection, id, 'failed', err.message);
      setStatus(err.message, 'error');
    }
  }

  function bindEvents() {
    els.nav.addEventListener('click', (event) => {
      const table = event.target.dataset.table;
      if (!table) return;
      state.collection = table;
      loadRecords();
    });

    els.protocol.addEventListener('change', () => {
      state.protocol = els.protocol.value;
      renderMetrics();
    });

    els.role.addEventListener('change', () => {
      state.role = els.role.value;
      renderAll();
    });

    els.country.addEventListener('input', () => {
      state.country = els.country.value || config.defaultCountry;
      renderMetrics();
    });

    els.actor.addEventListener('input', () => {
      state.actor = els.actor.value;
    });

    els.refreshBtn.addEventListener('click', loadRecords);
    els.newBtn.addEventListener('click', () => renderEditor(null));
    els.saveBtn.addEventListener('click', saveRecord);
    els.deleteBtn.addEventListener('click', () => deleteRecord(els.recordId.value));
    els.signInBtn.addEventListener('click', signIn);
    els.signOutBtn.addEventListener('click', signOut);
    els.search.addEventListener('input', renderTable);

    els.tableBody.addEventListener('click', (event) => {
      const editId = event.target.dataset.edit;
      const deleteId = event.target.dataset.delete;
      if (editId) {
        renderEditor(state.records.find((row) => row.id === editId));
      }
      if (deleteId) {
        deleteRecord(deleteId);
      }
    });
  }

  function boot() {
    [
      'nav', 'protocol', 'role', 'country', 'actor', 'refreshBtn', 'newBtn', 'saveBtn', 'deleteBtn',
      'authEmail', 'authPassword', 'signInBtn', 'signOutBtn',
      'search', 'tableBody', 'recordId', 'recordCountry', 'recordContent', 'logs', 'status',
      'metricRecords', 'metricProtocol', 'metricRole', 'metricCountry'
    ].forEach((id) => {
      els[id] = $(id);
    });

    els.protocol.innerHTML = Object.keys(adapters).map((key) => `<option value="${key}">${adapters[key].label}</option>`).join('');
    els.role.innerHTML = Object.keys(config.roles).map((key) => `<option value="${key}">${config.roles[key].label}</option>`).join('');
    els.protocol.value = state.protocol;
    els.role.value = state.role;
    els.country.value = state.country;

    hydrateLogs();
    bindEvents();
    renderAll();
    loadRecords();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
