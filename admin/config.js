window.PowerWellAdminConfig = {
  defaultCountry: 'Australia',
  defaultRole: 'viewer',
  protocol: 'supabase-rpc',
  supabase: {
    url: 'https://YOUR_PROJECT.supabase.co',
    anonKey: 'YOUR_ANON_KEY',
    schema: 'app_api'
  },
  rest: {
    baseURL: '/api/admin'
  },
  postgrest: {
    baseURL: 'https://YOUR_PROJECT.supabase.co/rest/v1',
    apiKey: 'YOUR_ANON_KEY'
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
    viewer: {
      label: 'Viewer',
      permissions: ['read']
    },
    editor: {
      label: 'Editor',
      permissions: ['read', 'write']
    },
    admin: {
      label: 'Admin',
      permissions: ['read', 'write', 'delete', 'audit']
    }
  }
};

