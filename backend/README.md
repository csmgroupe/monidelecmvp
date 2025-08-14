# Auth User

```json 
{"provider": "google", "redirect_uri": "http://localhost:3000/auth/sso/callback"}
```

## We use supabase but we put a abstraction layer over it, this way we can change the provider easily.
So we don't use supabase client in frontend, we use our wrapper.

## Supabase allow to do something like this:
```typescript
    const fetchProjects = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }
      
      setProjects(data || []);
    };
```

We want to use rest api for better control and also for different client (web, mobile, etc), it is always a bad idea to be vendor locked.
REST API are standard and well defined.
We want to use swagger doc to enforce the usage of the api and contract respect.

We use supabase for:
- Postgres (could be replaced with any other postgres provider or self hosted)
- Auth (could be replaced with auth0 or keycloack, FusionAuth or other SSO provider)
- Storage (could be replaced with cloudflare r2 or minIO)

# TODO
- CQRS pattern / check consistency
- Add tests
- usecase => use-case / split service ?
- Unification of the codebase and naming convention
- Supabase should be a adapter (see auth)
- Should controller be in application ?

Don't depend directly on baml in domain