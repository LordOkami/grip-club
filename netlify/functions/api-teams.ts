import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { supabase } from './utils/supabase';
import {
  getUserId,
  corsHeaders,
  unauthorizedResponse,
  errorResponse,
  successResponse
} from './utils/auth';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // Validate authentication
  const userId = getUserId(event);
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    switch (event.httpMethod) {
      case 'GET': {
        // Get team for current user with pilots and staff
        const { data, error } = await supabase
          .from('teams')
          .select(`
            *,
            pilots (*),
            team_staff (*)
          `)
          .eq('representative_user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned
          throw error;
        }

        return successResponse({ team: data || null });
      }

      case 'POST': {
        // Create new team
        const body = JSON.parse(event.body || '{}');

        // Check if user already has a team
        const { data: existing } = await supabase
          .from('teams')
          .select('id')
          .eq('representative_user_id', userId)
          .single();

        if (existing) {
          return errorResponse('Ya tienes un equipo registrado / You already have a registered team');
        }

        // Check registration settings
        const { data: settings } = await supabase
          .from('registration_settings')
          .select('registration_open, max_teams, registration_deadline')
          .single();

        if (!settings?.registration_open) {
          return errorResponse('Las inscripciones están cerradas / Registrations are closed');
        }

        // Check deadline
        if (settings.registration_deadline && new Date(settings.registration_deadline) < new Date()) {
          return errorResponse('El plazo de inscripción ha terminado / Registration deadline has passed');
        }

        // Check team limit
        const { count } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true });

        if (count !== null && settings.max_teams && count >= settings.max_teams) {
          return errorResponse('Se ha alcanzado el número máximo de equipos / Maximum number of teams reached');
        }

        // Validate required fields
        if (!body.name || !body.number_of_pilots) {
          return errorResponse('Nombre de equipo y número de pilotos son obligatorios / Team name and number of pilots are required');
        }

        if (body.number_of_pilots < 4 || body.number_of_pilots > 8) {
          return errorResponse('El número de pilotos debe ser entre 4 y 8 / Number of pilots must be between 4 and 8');
        }

        // Create team
        const { data, error } = await supabase
          .from('teams')
          .insert({
            representative_user_id: userId,
            name: body.name,
            number_of_pilots: body.number_of_pilots,
            representative_name: body.representative_name,
            representative_surname: body.representative_surname,
            representative_dni: body.representative_dni,
            representative_phone: body.representative_phone,
            representative_email: body.representative_email,
            address: body.address,
            municipality: body.municipality,
            postal_code: body.postal_code,
            province: body.province,
            motorcycle_brand: body.motorcycle_brand,
            motorcycle_model: body.motorcycle_model,
            engine_capacity: body.engine_capacity || '125cc_4t',
            registration_date: body.registration_date,
            modifications: body.modifications,
            comments: body.comments,
            gdpr_consent: body.gdpr_consent || false,
            gdpr_consent_date: body.gdpr_consent ? new Date().toISOString() : null,
            status: 'draft'
          })
          .select()
          .single();

        if (error) throw error;

        return successResponse({ team: data }, 201);
      }

      case 'PUT': {
        // Update team
        const body = JSON.parse(event.body || '{}');

        // Remove fields that shouldn't be updated
        delete body.id;
        delete body.representative_user_id;
        delete body.created_at;
        delete body.status; // Status changes should be separate

        const { data, error } = await supabase
          .from('teams')
          .update(body)
          .eq('representative_user_id', userId)
          .select()
          .single();

        if (error) throw error;

        if (!data) {
          return errorResponse('Equipo no encontrado / Team not found', 404);
        }

        return successResponse({ team: data });
      }

      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error: any) {
    console.error('API Teams Error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

export { handler };
