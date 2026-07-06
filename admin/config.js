window.PowerWellAdminConfig = {
  defaultCountry: 'Australia',
  defaultRole: 'employee_viewer',
  protocol: 'supabase-rpc',
  supabase: {
    url: 'https://cbbaejwbkenrutmgqikt.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYmFlandia2VucnV0bWdxaWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTc1NzQsImV4cCI6MjA5ODU3MzU3NH0.xQD6j_uqartlIZo0APxHYGzunJHjA_sZER93A4t49rE',
    schema: 'public'
  },
  rest: {
    baseURL: '/api/admin'
  },
  postgrest: {
    baseURL: 'https://cbbaejwbkenrutmgqikt.supabase.co/rest/v1',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYmFlandia2VucnV0bWdxaWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTc1NzQsImV4cCI6MjA5ODU3MzU3NH0.xQD6j_uqartlIZo0APxHYGzunJHjA_sZER93A4t49rE'
  },
  collections: [
    { table: 'blog_articles', label: 'Blog Articles' },
    { table: 'disease_articles', label: 'Disease Articles' },
    { table: 'assessment_submissions', label: 'Assessment Submissions' },
    { table: 'community_posts', label: 'Community Posts' },
    { table: 'community_comments', label: 'Community Comments' },
    { table: 'interface_events', label: 'Interface Events' }
  ],
  roles: {
    super_admin: {
      label: 'Super Admin',
      permissions: ['read', 'write', 'delete', 'audit', 'system_config', 'permission_admin', 'schema_admin', 'notion_config', 'employee_invite', 'review']
    },
    editor: {
      label: 'Legacy Editor',
      permissions: ['read', 'write']
    },
    admin: {
      label: 'Admin',
      permissions: ['read', 'write', 'export', 'employee_invite', 'permission_review', 'review', 'audit']
    },
    employee_viewer: {
      label: 'Employee: View Only',
      permissions: ['read']
    },
    employee_reviewer: {
      label: 'Employee: Reviewer',
      permissions: ['read', 'review']
    },
    employee_editor: {
      label: 'Employee: Non-core Editor',
      permissions: ['read', 'write']
    }
  }
};
