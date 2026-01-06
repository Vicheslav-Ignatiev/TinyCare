export async function listChildren() {
    const res = await fetch("/api/children");
    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const msg = data?.error?.message || data?.message || `Request failed (${res.status})`;
        throw new Error(msg);
    }

    // ожидаем формат { ok: true, data: [...] }
    return data?.data ?? [];
}
