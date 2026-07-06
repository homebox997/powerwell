(function () {
  const config = window.PowerWellAdminConfig;
  const localLogKey = 'powerwell_permission_notion_logs';

  function $(id) {
    return document.getElementById(id);
  }

  function client() {
    if (!window.supabase) throw new Error('Supabase SDK is not loaded.');
    if (!window.PowerWellAdminSupabase) {
      window.PowerWellAdminSupabase = window.supabase.createClient(config.supabase.url, config.supabase.anonKey);
    }
    return window.PowerWellAdminSupabase.schema(config.supabase.schema);
  }

  function log(message, status) {
    const logs = JSON.parse(localStorage.getItem(localLogKey) || '[]');
    logs.unshift({ at: new Date().toISOString(), message, status });
    localStorage.setItem(localLogKey, JSON.stringify(logs.slice(0, 100)));
    renderLogs();
  }

  function renderLogs() {
    const box = $('workflowLogs');
    if (!box) return;
    const logs = JSON.parse(localStorage.getItem(localLogKey) || '[]');
    box.innerHTML = logs.length
      ? logs.map((item) => `<div class="log-entry"><strong>${item.status}</strong><br>${item.at}<br>${item.message}</div>`).join('')
      : '<div class="empty">No permission or Notion workflow logs yet</div>';
  }

  function renderReviewPool(rows) {
    const box = $('reviewPool');
    if (!box) return;
    if (!rows || !rows.length) {
      box.innerHTML = '<div class="empty">No pending Notion items</div>';
      return;
    }
    box.innerHTML = rows.map((row) => `
      <div class="review-item" data-id="${row.id}">
        <div>
          <strong>${row.content_title || 'Untitled'}</strong>
          <span class="badge">${row.status}</span>
        </div>
        <p>${(row.content_tag || []).join(', ')}</p>
        <div class="row-actions">
          <button class="btn primary" data-approve="${row.id}">Confirm Sync</button>
          <button class="btn danger" data-reject="${row.id}">Reject</button>
        </div>
      </div>
    `).join('');
  }

  async function rpc(name, params) {
    const { data, error } = await client().rpc(name, params || {});
    if (error) throw error;
    return data;
  }

  async function inviteEmployee() {
    try {
      const data = await rpc('admin_invite_employee', {
        p_name: $('inviteName').value.trim(),
        p_email: $('inviteEmail').value.trim(),
        p_role: $('inviteRole').value,
        p_permission_scopes: Array.from($('inviteScopes').selectedOptions).map((option) => option.value)
      });
      log(`Employee invitation created for ${$('inviteEmail').value}. Activation token: ${data}`, 'ok');
    } catch (err) {
      log(`Invitation failed: ${err.message}`, 'failed');
    }
  }

  async function requestPermissionChange() {
    try {
      await rpc('admin_request_permission_change', {
        p_employee_email: $('permissionEmail').value.trim(),
        p_requested_role: $('permissionRole').value,
        p_reason: $('permissionReason').value.trim()
      });
      log(`Permission change submitted for ${$('permissionEmail').value}`, 'ok');
    } catch (err) {
      log(`Permission request failed: ${err.message}`, 'failed');
    }
  }

  async function configureNotion() {
    try {
      await rpc('admin_configure_notion_connection', {
        p_workspace_name: $('notionWorkspace').value.trim(),
        p_data_source_id: $('notionDataSource').value.trim(),
        p_api_key_ciphertext: $('notionSecret').value.trim()
      });
      log('Notion connection saved. Keep the real key only in the server-side secret store.', 'ok');
      $('notionSecret').value = '';
    } catch (err) {
      log(`Notion configuration failed: ${err.message}`, 'failed');
    }
  }

  async function triggerNotionSync() {
    try {
      const data = await rpc('admin_enqueue_notion_sync', {
        p_trigger_type: 'manual'
      });
      log(`Notion sync queued: ${data}`, 'ok');
      await loadReviewPool();
    } catch (err) {
      log(`Notion sync queue failed: ${err.message}`, 'failed');
    }
  }

  async function loadReviewPool() {
    try {
      const rows = await rpc('admin_list_notion_review_pool', {
        p_status: 'pending_review',
        p_limit: 50
      });
      renderReviewPool(rows);
      log(`Loaded ${rows.length} pending Notion items`, 'ok');
    } catch (err) {
      renderReviewPool([]);
      log(`Review pool load failed: ${err.message}`, 'failed');
    }
  }

  async function approveNotionItem(id) {
    try {
      await rpc('admin_approve_notion_item', {
        p_item_id: id,
        p_target_table: $('reviewTargetTable').value
      });
      log(`Notion item approved and synced: ${id}`, 'ok');
      await loadReviewPool();
    } catch (err) {
      log(`Approval failed: ${err.message}`, 'failed');
    }
  }

  async function rejectNotionItem(id) {
    const reason = window.prompt('Rejection reason to send back to Notion:');
    if (!reason) return;
    try {
      await rpc('admin_reject_notion_item', {
        p_item_id: id,
        p_reason: reason
      });
      log(`Notion item rejected: ${id}`, 'ok');
      await loadReviewPool();
    } catch (err) {
      log(`Rejection failed: ${err.message}`, 'failed');
    }
  }

  function bind() {
    $('inviteBtn')?.addEventListener('click', inviteEmployee);
    $('permissionBtn')?.addEventListener('click', requestPermissionChange);
    $('notionSaveBtn')?.addEventListener('click', configureNotion);
    $('notionSyncBtn')?.addEventListener('click', triggerNotionSync);
    $('reviewRefreshBtn')?.addEventListener('click', loadReviewPool);
    $('reviewPool')?.addEventListener('click', (event) => {
      const approve = event.target.dataset.approve;
      const reject = event.target.dataset.reject;
      if (approve) approveNotionItem(approve);
      if (reject) rejectNotionItem(reject);
    });
    renderLogs();
  }

  document.addEventListener('DOMContentLoaded', bind);
})();

