export const prerender = false;
import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

function getUserFromHeader(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    try {
        // Decode JWT payload (without verification for now - relying on Netlify context in production or assuming local dev trust)
        // specific verification requires public key which is async
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload; // contains 'sub' (user id), 'email', 'app_metadata', 'user_metadata'
    } catch (e) {
        return null;
    }
}

export const GET: APIRoute = async ({ request, locals }) => {
    // Try to get user from Locals (Netlify Adapter)
    let user = (locals as any).netlify?.context?.clientContext?.user;

    // Fallback to manual decoding (useful for local dev or if context is missing)
    if (!user) {
        user = getUserFromHeader(request);
    }

    if (!user || !user.sub) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    try {
        const { data: team, error } = await supabase
            .from('teams')
            .select('*')
            .eq('representative_user_id', user.sub)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" -> null result, which is fine (no team)
            throw error;
        }

        return new Response(JSON.stringify({ team: team || null }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    let user = (locals as any).netlify?.context?.clientContext?.user;
    if (!user) user = getUserFromHeader(request);

    if (!user || !user.sub) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate required fields (basic validation)
        const required = ['name', 'number_of_pilots', 'representative_dni'];
        for (const field of required) {
            if (!body[field]) throw new Error(`Missing field: ${field}`);
        }

        const { data, error } = await supabase
            .from('teams')
            .insert({
                ...body,
                representative_user_id: user.sub,
                representative_email: user.email, // Ensure email matches auth user or allow body override? Better enforcing auth email or body?
                // Let's trust body but ensure representative_user_id is set
            })
            .select()
            .single();

        if (error) throw error;

        return new Response(JSON.stringify({ team: data }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const PUT: APIRoute = async ({ request, locals }) => {
    let user = (locals as any).netlify?.context?.clientContext?.user;
    if (!user) user = getUserFromHeader(request);

    if (!user || !user.sub) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    try {
        const body = await request.json();

        const { data, error } = await supabase
            .from('teams')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('representative_user_id', user.sub) // Ensure user owns the team
            .select()
            .single();

        if (error) throw error;

        return new Response(JSON.stringify({ team: data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
