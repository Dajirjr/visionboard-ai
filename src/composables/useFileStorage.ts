import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export interface FileInfo {
  name: string
  publicUrl: string
  created_at?: string
  updated_at?: string
  size?: number
}

interface StorageProvider {
  name: 'supabase' | 'github'
  displayName: string
}

export function useFileStorage() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const providers: StorageProvider[] = [
    { name: 'supabase', displayName: 'Supabase Storage' },
    { name: 'github', displayName: 'GitHub Repository' }
  ]

  const uploadToSupabase = async (file: File, path: string): Promise<FileInfo> => {
    const { data, error: uploadError } = await supabase.storage
      .from('visionboard-docs')
      .upload(`${path}/${file.name}`, file)

    if (uploadError) throw uploadError

    const { data: publicUrl } = supabase.storage
      .from('visionboard-docs')
      .getPublicUrl(`${path}/${file.name}`)

    return {
      name: file.name,
      publicUrl: publicUrl.publicUrl,
      created_at: new Date().toISOString(),
      size: file.size
    }
  }

  const uploadToGitHub = async (file: File, path: string): Promise<FileInfo> => {
    const content = await file.text()
    const response = await fetch(
      `https://api.github.com/repos/your-username/visionboard-ai/contents/${path}/${file.name}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
          message: `📘 Add ${file.name}`,
          content: Buffer.from(content).toString('base64'),
          committer: {
            name: 'VisionBoard Bot',
            email: 'bot@visionboard.ai'
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to upload to GitHub')
    }

    const data = await response.json()
    return {
      name: file.name,
      publicUrl: data.html_url,
      updated_at: new Date().toISOString(),
      size: file.size
    }
  }

  const uploadFile = async (
    file: File,
    path: string,
    provider: 'supabase' | 'github' = 'supabase'
  ): Promise<FileInfo> => {
    loading.value = true
    error.value = null

    try {
      if (provider === 'supabase') {
        return await uploadToSupabase(file, path)
      } else {
        return await uploadToGitHub(file, path)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to upload file'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const deleteFromSupabase = async (path: string): Promise<void> => {
    const { error: deleteError } = await supabase.storage
      .from('visionboard-docs')
      .remove([path])

    if (deleteError) throw deleteError
  }

  const deleteFromGitHub = async (path: string): Promise<void> => {
    // First get the file's SHA
    const getResponse = await fetch(
      `https://api.github.com/repos/your-username/visionboard-ai/contents/${path}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
        }
      }
    )

    if (!getResponse.ok) {
      throw new Error('Failed to get file information from GitHub')
    }

    const fileData = await getResponse.json()

    // Delete the file using its SHA
    const deleteResponse = await fetch(
      `https://api.github.com/repos/your-username/visionboard-ai/contents/${path}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
          message: `🗑️ Delete ${path.split('/').pop()}`,
          sha: fileData.sha,
          committer: {
            name: 'VisionBoard Bot',
            email: 'bot@visionboard.ai'
          }
        })
      }
    )

    if (!deleteResponse.ok) {
      throw new Error('Failed to delete file from GitHub')
    }
  }

  const deleteFile = async (
    path: string,
    provider: 'supabase' | 'github' = 'supabase'
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      if (provider === 'supabase') {
        await deleteFromSupabase(path)
      } else {
        await deleteFromGitHub(path)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete file'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    providers,
    uploadFile,
    deleteFile
  }
} 