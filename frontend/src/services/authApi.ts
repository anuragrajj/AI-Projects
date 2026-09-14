import type { AuthUser } from '../store/slices/AuthSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user_details: AuthUser;
        token: string;
    };
}

export async function loginRequest(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const result: LoginResponse & { detail?: string } = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.detail || result.message || 'Login failed');
    }

    return { user: result.data.user_details, token: result.data.token };
}
