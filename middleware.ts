// middleware.js
export function middleware(request) {
  const response = NextResponse.next()
  response.headers.set('X-Robots-Tag', 'all')
  return response
}