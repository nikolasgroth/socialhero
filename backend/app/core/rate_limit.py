from slowapi import Limiter


def get_client_ip(request):
    """IP für Rate Limiting – berücksichtigt X-Forwarded-For hinter Proxy."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "127.0.0.1"


limiter = Limiter(key_func=get_client_ip)
