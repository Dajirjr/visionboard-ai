import { H3Event, defineEventHandler, createError, readBody, getCookie } from 'h3'
import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'
import type { UserRole } from '@/types/auth'
import { ROLE_PERMISSIONS } from '@/types/auth'

// Validation schema for the request body
const SaveSummarySchema = z.object({
  filename: z.string().regex(/^summary-\d{4}-\d{2}-\d{2}\.md$/),
  text: z.string().min(1),
  storage: z.enum(['local', 'supabase', 'github']).default('local')
})

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// GitHub API helper
async function saveToGitHub(filename: string, content: string) {
  const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/docs/weekly-updates/${filename}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: '📘 Add weekly summary',
      content: Buffer.from(content).toString('base64'),
      committer: {
        name: 'VisionBoard Bot',
        email: 'bot@visionboard.dev',
      },
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to save to GitHub')
  }

  return response.json()
}

// Supabase storage helper
async function saveToSupabase(filename: string, content: string) {
  const { error } = await supabase.storage
    .from('visionboard-docs')
    .upload(`weekly-updates/${filename}`, content, {
      contentType: 'text/markdown',
      upsert: true,
    })

  if (error) throw error
}

// Local filesystem helper
async function saveToLocal(filename: string, content: string) {
  const filePath = join(process.cwd(), 'docs/weekly-updates', filename)
  await writeFile(filePath, content, 'utf-8')
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Get the session token from cookie
    const accessToken = getCookie(event, 'sb-access-token')
    if (!accessToken) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized: No access token'
      })
    }

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized: Invalid token'
      })
    }

    // Get user role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const userRole = (roleData?.role || user.user_metadata?.role || 'viewer') as UserRole
    const permissions = ROLE_PERMISSIONS[userRole]

    if (!permissions.canSaveSummary) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden: User does not have permission to save summaries'
      })
    }

    // Parse and validate request body
    const body = await readBody(event)
    const { filename, text, storage } = SaveSummarySchema.parse(body)

    // Save to the specified storage
    try {
      switch (storage) {
        case 'github':
          await saveToGitHub(filename, text)
          break
        case 'supabase':
          await saveToSupabase(filename, text)
          break
        case 'local':
        default:
          await saveToLocal(filename, text)
      }

      return {
        success: true,
        message: 'Summary saved successfully',
        storage,
        path: `/weekly-updates/${filename}`
      }
    } catch (storageError) {
      throw createError({
        statusCode: 500,
        message: `Failed to save to ${storage}: ${storageError instanceof Error ? storageError.message : 'Unknown error'}`
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Invalid request data',
        data: error.errors
      })
    }

    // Re-throw other errors with proper typing
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        message: `Server error: ${error.message}`
      })
    }

    throw createError({
      statusCode: 500,
      message: 'An unknown error occurred'
    })
  }
}) 