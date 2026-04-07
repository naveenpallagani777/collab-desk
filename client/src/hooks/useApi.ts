/* Custom Hook Example - useApi */

import { useState, useCallback } from 'react'
import apiClient from '@services/api'

interface UseApiState<T> {
    data: T | null
    loading: boolean
    error: unknown
}

export const useApi = <T,>(url: string) => {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null,
    })

    const fetchData = useCallback(async () => {
        setState({ data: null, loading: true, error: null })
        try {
            const response = await apiClient.get<T>(url)
            setState({ data: response.data, loading: false, error: null })
        } catch (err) {
            setState({ data: null, loading: false, error: err })
        }
    }, [url])

    return { ...state, fetchData }
}
